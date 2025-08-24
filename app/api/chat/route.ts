import { NextRequest, NextResponse } from 'next/server'
import { OpenAI } from 'openai'
import { OpenAIStream, StreamingTextResponse } from 'ai'
import { getDatabase } from '@/lib/mongodb'
import { DBConversation, DBMessage } from '@/lib/models/conversation'
import { FileAttachment } from '@/types'
import { memoryService } from '@/lib/memory'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const { messages, conversationId, model = 'gpt-3.5-turbo' } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages are required' }, { status: 400 })
    }

    // Get relevant memory context
    let memoryContext = ''
    if (conversationId) {
      try {
        const memory = await memoryService.getMemory(conversationId)
        if (memory) {
          memoryContext = `Previous conversation context: ${memory.summary}\nKey points: ${memory.keyPoints.join(', ')}\nEntities: ${memory.entities.join(', ')}\n\n`
        }
      } catch (error) {
        console.error('Error retrieving memory:', error)
      }
    }

    // Context window management
    const maxTokens = getMaxTokensForModel(model)
    const truncatedMessages = await truncateMessages(messages, maxTokens, memoryContext)

    // Create OpenAI chat completion with streaming
    const response = await openai.chat.completions.create({
      model,
      messages: truncatedMessages.map(msg => {
        let content = msg.content
        
        // Add file content to the message if attachments exist
        if (msg.attachments && msg.attachments.length > 0) {
          const fileContents = msg.attachments
            .map((file: FileAttachment) => {
              if (file.textContent) {
                return `\n\n--- File: ${file.name} ---\n${file.textContent}\n--- End of ${file.name} ---`
              } else if (file.type.startsWith('image/')) {
                return `\n\n[Image attached: ${file.name} - Please analyze this image]`
              } else {
                return `\n\n[File attached: ${file.name} (${file.type}) - Please help me with this file]`
              }
            })
            .join('')
          
          content = content + fileContents
        }
        
        return {
          role: msg.role,
          content: content,
        }
      }),
      stream: true,
      temperature: 0.7,
      max_tokens: 2000,
    })

    // Convert the response to a stream
    const stream = OpenAIStream(response as any, {
      onStart: async () => {
        // Save conversation start to database
        if (conversationId) {
          await saveConversationStart(conversationId, messages)
        }
      },
      onCompletion: async (completion) => {
        // Save the complete response to database
        if (conversationId) {
          await saveConversationCompletion(conversationId, completion, model)
          
          // Update memory with the new conversation
          try {
            const updatedMessages = [...messages, { role: 'assistant', content: completion }]
            await memoryService.updateMemory(conversationId, updatedMessages)
          } catch (error) {
            console.error('Error updating memory:', error)
          }
        }
      },
    })

    return new StreamingTextResponse(stream)
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function getMaxTokensForModel(model: string): number {
  const tokenLimits: Record<string, number> = {
    'gpt-3.5-turbo': 4096,
    'gpt-4': 8192,
    'gpt-4-turbo': 128000,
    'gpt-4o': 128000,
  }
  return tokenLimits[model] || 4096
}

async function truncateMessages(messages: any[], maxTokens: number, memoryContext: string = ''): Promise<any[]> {
  // Simple token estimation (rough approximation)
  const estimateTokens = (text: string): number => {
    return Math.ceil(text.length / 4)
  }

  const contextTokens = estimateTokens(memoryContext)
  const availableTokens = Math.floor(maxTokens * 0.7) - contextTokens // Reserve 30% for response

  let totalTokens = 0
  const truncatedMessages = []
  
  // Always include system messages and memory context
  const systemMessages = messages.filter(msg => msg.role === 'system')
  const otherMessages = messages.filter(msg => msg.role !== 'system').reverse() // Start from most recent
  
  // Add system messages
  for (const msg of systemMessages) {
    const tokens = estimateTokens(msg.content)
    totalTokens += tokens
    truncatedMessages.push(msg)
  }
  
  // Add memory context if available
  if (memoryContext) {
    truncatedMessages.push({
      role: 'system',
      content: memoryContext
    })
  }
  
  // Add other messages from most recent, respecting token limit
  for (const msg of otherMessages) {
    let messageContent = msg.content
    
    // Include attachment content in token calculation
    if (msg.attachments && msg.attachments.length > 0) {
      const attachmentContent = msg.attachments
        .map((file: FileAttachment) => file.textContent || `[${file.name}]`)
        .join(' ')
      messageContent += ' ' + attachmentContent
    }
    
    const tokens = estimateTokens(messageContent)
    
    if (totalTokens + tokens > availableTokens) {
      break
    }
    
    totalTokens += tokens
    truncatedMessages.push(msg)
  }

  // Reverse to get chronological order
  const systemMsgs = truncatedMessages.filter(msg => msg.role === 'system')
  const otherMsgs = truncatedMessages.filter(msg => msg.role !== 'system').reverse()
  
  return [...systemMsgs, ...otherMsgs]
}

async function saveConversationStart(conversationId: string, messages: any[]) {
  try {
    const db = await getDatabase()
    const collection = db.collection<DBConversation>('conversations')
    
    const userMessage = messages[messages.length - 1]
    if (userMessage?.role === 'user') {
      // First check if conversation exists
      const existingConv = await collection.findOne({ id: conversationId })
      
      if (!existingConv) {
        // Create new conversation
        const newConversation: DBConversation = {
          id: conversationId,
          title: userMessage.content.slice(0, 50) || 'New Chat',
          messages: [{
            id: userMessage.id,
            content: userMessage.content,
            role: userMessage.role,
            timestamp: new Date(userMessage.timestamp),
            attachments: userMessage.attachments || [],
          }],
          createdAt: new Date(),
          updatedAt: new Date()
        }
        
        await collection.insertOne(newConversation)
      } else {
        // Update existing conversation
        await collection.updateOne(
          { id: conversationId },
          {
            $push: {
              messages: {
                id: userMessage.id,
                content: userMessage.content,
                role: userMessage.role,
                timestamp: new Date(userMessage.timestamp),
                attachments: userMessage.attachments || [],
              }
            },
            $set: { updatedAt: new Date() }
          }
        )
      }
    }
  } catch (error) {
    console.error('Error saving conversation start:', error)
  }
}

async function saveConversationCompletion(conversationId: string, completion: string, model: string) {
  try {
    const db = await getDatabase()
    const collection = db.collection<DBConversation>('conversations')
    
    const assistantMessage: DBMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content: completion,
      role: 'assistant',
      timestamp: new Date(),
      model,
    }
    
    await collection.updateOne(
      { id: conversationId },
      {
        $push: { messages: assistantMessage },
        $set: { updatedAt: new Date() }
      }
    )
  } catch (error) {
    console.error('Error saving conversation completion:', error)
  }
}
