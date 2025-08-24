import { Conversation } from '@/types'
import { v4 as uuidv4 } from 'uuid'

const STORAGE_KEY = 'chatgpt-conversations'
const MAX_STORAGE_SIZE = 5 * 1024 * 1024 // 5MB limit for localStorage

export const generateId = (): string => {
  return uuidv4()
}

export const saveConversations = (conversations: Conversation[]): void => {
  if (typeof window !== 'undefined') {
    try {
      // Create a copy with potentially truncated attachments for localStorage
      const conversationsForStorage = conversations.map(conv => ({
        ...conv,
        messages: conv.messages.map(msg => ({
          ...msg,
          attachments: msg.attachments?.map(att => {
            // For large text content (like PDFs), store only metadata in localStorage
            if (att.textContent && att.textContent.length > 50000) {
              return {
                ...att,
                textContent: `[Large content truncated - ${att.textContent.length} characters]`,
                originalSize: att.textContent.length
              }
            }
            return att
          })
        }))
      }))
      
      const dataString = JSON.stringify(conversationsForStorage)
      
      // Check if data is too large for localStorage
      if (dataString.length > MAX_STORAGE_SIZE) {
        console.warn('Conversations data too large for localStorage, keeping only recent conversations')
        // Keep only the 10 most recent conversations
        const recentConversations = conversationsForStorage
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
          .slice(0, 10)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(recentConversations))
      } else {
        localStorage.setItem(STORAGE_KEY, dataString)
      }
    } catch (error) {
      console.error('Failed to save conversations:', error)
      // If localStorage is full, try to save only the most recent conversation
      try {
        const mostRecent = conversations
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0]
        if (mostRecent) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify([mostRecent]))
        }
      } catch (fallbackError) {
        console.error('Failed to save even single conversation:', fallbackError)
      }
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

export const syncConversationToDatabase = async (conversation: Conversation): Promise<void> => {
  try {
    const response = await fetch('/api/conversations', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(conversation)
    })
    
    if (!response.ok) {
      throw new Error('Failed to sync conversation')
    }
  } catch (error) {
    console.error('Error syncing conversation to database:', error)
  }
}

export const loadConversationsFromDatabase = async (): Promise<Conversation[]> => {
  try {
    const response = await fetch('/api/conversations')
    if (response.ok) {
      const dbConversations = await response.json()
      return dbConversations.map((conv: any) => ({
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
    console.error('Error loading conversations from database:', error)
  }
  return []
}
