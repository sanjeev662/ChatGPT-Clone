import { Conversation } from '@/types'
import { v4 as uuidv4 } from 'uuid'

const STORAGE_KEY = 'chatgpt-conversations'

export const generateId = (): string => {
  return uuidv4()
}

export const saveConversations = (conversations: Conversation[]): void => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations))
    } catch (error) {
      console.error('Failed to save conversations:', error)
    }
  }
}

export const loadConversations = (): Conversation[] => {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const conversations = JSON.parse(stored)
      // Convert date strings back to Date objects
      return conversations.map((conv: any) => ({
        ...conv,
        createdAt: new Date(conv.createdAt),
        updatedAt: new Date(conv.updatedAt),
        messages: conv.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      }))
    }
  } catch (error) {
    console.error('Failed to load conversations:', error)
  }
  
  return []
}
