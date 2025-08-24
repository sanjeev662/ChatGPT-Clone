import { NextRequest, NextResponse } from 'next/server'
import { OpenAIStream, StreamingTextResponse } from 'ai'
import OpenAI from 'openai'
import { getDatabase } from '@/lib/mongodb'
import { DBConversation, DBMessage } from '@/lib/models/conversation'
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
            .map(file => {
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
    const stream = OpenAIStream(response, {
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
    'gpt-3.5-turbo-16k': 16384,
    'gpt-4': 8192,
    'gpt-4-32k': 32768,
    'gpt-4-turbo': 128000,
    'gpt-4-turbo-preview': 128000,
  }
  return tokenLimits[model] || 4096
}

async function truncateMessages(messages: any[], maxTokens: number, memoryContext: string = ''): Promise<any[]> {
  // Simple token estimation (roughly 4 characters per token)
  const estimateTokens = (text: string) => Math.ceil(text.length / 4)
  
  let totalTokens = estimateTokens(memoryContext)
  const truncatedMessages = []
  
  // Add memory context as system message if available
  if (memoryContext) {
    truncatedMessages.push({
      role: 'system',
      content: memoryContext + 'Use this context to provide more relevant and personalized responses.'
    })
  }
  
  // Always keep the original system message if it exists
  if (messages[0]?.role === 'system') {
    truncatedMessages.push(messages[0])
    totalTokens += estimateTokens(messages[0].content)
  }
  
  // Add messages from the end, keeping within token limit
  for (let i = messages.length - 1; i >= (messages[0]?.role === 'system' ? 1 : 0); i--) {
    const messageTokens = estimateTokens(messages[i].content)
    if (totalTokens + messageTokens > maxTokens * 0.7) { // Use 70% of limit for safety with memory
      break
    }
    truncatedMessages.push(messages[i])
    totalTokens += messageTokens
  }
  
  // Reverse to maintain chronological order (except for system messages at the beginning)
  const systemMessages = truncatedMessages.filter(m => m.role === 'system')
  const otherMessages = truncatedMessages.filter(m => m.role !== 'system').reverse()
  
  return [...systemMessages, ...otherMessages]
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
