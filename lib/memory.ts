import { getDatabase } from './mongodb'
import { ConversationMemory } from './models/conversation'
import { Db } from 'mongodb'

export class MemoryService {
  private db: Db | null = null

  constructor() {
    this.initializeDB()
  }

  private async initializeDB() {
    if (!this.db) {
      this.db = await getDatabase()
    }
  }

  async createMemory(conversationId: string, messages: any[], userId?: string): Promise<ConversationMemory> {
    if (!this.db) await this.initializeDB()
    
    const collection = this.db!.collection<ConversationMemory>('memories')
    
    // Extract key information from messages
    const summary = this.generateSummary(messages)
    const keyPoints = this.extractKeyPoints(messages)
    const entities = this.extractEntities(messages)
    
    const memory: ConversationMemory = {
      conversationId,
      userId,
      summary,
      keyPoints,
      entities,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    await collection.insertOne(memory)
    return memory
  }

  async updateMemory(conversationId: string, messages: any[]): Promise<void> {
    if (!this.db) await this.initializeDB()
    
    const collection = this.db!.collection<ConversationMemory>('memories')
    
    const summary = this.generateSummary(messages)
    const keyPoints = this.extractKeyPoints(messages)
    const entities = this.extractEntities(messages)
    
    await collection.updateOne(
      { conversationId },
      {
        $set: {
          summary,
          keyPoints,
          entities,
          updatedAt: new Date()
        }
      },
      { upsert: true }
    )
  }

  async getMemory(conversationId: string): Promise<ConversationMemory | null> {
    if (!this.db) await this.initializeDB()
    
    const collection = this.db!.collection<ConversationMemory>('memories')
    return await collection.findOne({ conversationId })
  }

  async getRelevantContext(query: string, userId?: string): Promise<ConversationMemory[]> {
    if (!this.db) await this.initializeDB()
    
    const collection = this.db!.collection<ConversationMemory>('memories')
    
    // Simple text search - in production, you'd use vector search
    const memories = await collection.find({
      ...(userId && { userId }),
      $or: [
        { summary: { $regex: query, $options: 'i' } },
        { keyPoints: { $in: [new RegExp(query, 'i')] } },
        { entities: { $in: [new RegExp(query, 'i')] } }
      ]
    }).limit(5).toArray()
    
    return memories
  }

  private generateSummary(messages: any[]): string {
    // Simple summary generation - extract first user message and key topics
    const userMessages = messages.filter(m => m.role === 'user')
    const assistantMessages = messages.filter(m => m.role === 'assistant')
    
    if (userMessages.length === 0) return 'No user messages'
    
    const firstUserMessage = userMessages[0].content
    const topics = this.extractTopics(messages)
    
    return `Conversation started with: "${firstUserMessage.slice(0, 100)}${firstUserMessage.length > 100 ? '...' : ''}". Topics discussed: ${topics.join(', ')}.`
  }

  private extractKeyPoints(messages: any[]): string[] {
    const keyPoints: string[] = []
    
    // Extract questions asked by user
    const questions = messages
      .filter(m => m.role === 'user' && m.content.includes('?'))
      .map(m => m.content.split('?')[0] + '?')
      .slice(0, 5)
    
    keyPoints.push(...questions)
    
    // Extract code snippets mentioned
    const codeSnippets = messages
      .filter(m => m.content.includes('```'))
      .map(m => 'Code discussion: ' + this.extractCodeLanguage(m.content))
      .slice(0, 3)
    
    keyPoints.push(...codeSnippets)
    
    return keyPoints.filter(Boolean)
  }

  private extractEntities(messages: any[]): string[] {
    const entities: string[] = []
    const text = messages.map(m => m.content).join(' ')
    
    // Simple entity extraction - look for common patterns
    const patterns = [
      /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g, // Proper nouns
      /\b\w+\.(js|ts|py|java|cpp|html|css)\b/g, // File extensions
      /\b(?:React|Vue|Angular|Node|Python|JavaScript|TypeScript|Java|C\+\+)\b/g, // Technologies
      /\bhttps?:\/\/[^\s]+/g, // URLs
    ]
    
    patterns.forEach(pattern => {
      const matches = text.match(pattern)
      if (matches) {
        entities.push(...matches.slice(0, 10))
      }
    })
    
    return Array.from(new Set(entities)) // Remove duplicates
  }

  private extractTopics(messages: any[]): string[] {
    const text = messages.map(m => m.content).join(' ').toLowerCase()
    
    const commonTopics = [
      'programming', 'coding', 'development', 'web development', 'mobile development',
      'database', 'api', 'frontend', 'backend', 'fullstack',
      'javascript', 'typescript', 'python', 'java', 'react', 'vue', 'angular',
      'machine learning', 'ai', 'data science', 'algorithms',
      'design', 'ui', 'ux', 'css', 'html',
      'deployment', 'devops', 'cloud', 'aws', 'azure', 'gcp'
    ]
    
    return commonTopics.filter(topic => text.includes(topic))
  }

  private extractCodeLanguage(content: string): string {
    const codeBlockMatch = content.match(/```(\w+)/)
    return codeBlockMatch ? codeBlockMatch[1] : 'code'
  }

  async deleteMemory(conversationId: string): Promise<void> {
    if (!this.db) await this.initializeDB()
    
    const collection = this.db!.collection<ConversationMemory>('memories')
    await collection.deleteOne({ conversationId })
  }

  async searchMemories(query: string, userId?: string, limit: number = 10): Promise<ConversationMemory[]> {
    if (!this.db) await this.initializeDB()
    
    const collection = this.db!.collection<ConversationMemory>('memories')
    
    const searchQuery: any = {
      $text: { $search: query }
    }
    
    if (userId) {
      searchQuery.userId = userId
    }
    
    return await collection
      .find(searchQuery)
      .sort({ score: { $meta: 'textScore' } })
      .limit(limit)
      .toArray()
  }
}

export const memoryService = new MemoryService()
