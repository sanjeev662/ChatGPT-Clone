import { ObjectId } from 'mongodb'

export interface DBMessage {
  _id?: ObjectId
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
  isEditing?: boolean
  attachments?: FileAttachment[]
  tokens?: number
  model?: string
}

export interface FileAttachment {
  id: string
  name: string
  size: number
  type: string
  url: string
  preview?: string
  cloudinaryId?: string
}

export interface DBConversation {
  _id?: ObjectId
  id: string
  title: string
  messages: DBMessage[]
  createdAt: Date
  updatedAt: Date
  userId?: string
  totalTokens?: number
  model?: string
  memoryId?: string
}

export interface ConversationMemory {
  _id?: ObjectId
  conversationId: string
  userId?: string
  summary: string
  keyPoints: string[]
  entities: string[]
  createdAt: Date
  updatedAt: Date
}
