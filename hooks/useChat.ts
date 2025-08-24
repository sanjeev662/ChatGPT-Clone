'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useChat as useVercelChat } from 'ai/react'
import { Message, Conversation, ChatState } from '@/types'
import { saveConversations, loadConversations, generateId } from '@/utils/storage'

export const useChat = () => {
  const [state, setState] = useState<ChatState>({
    conversations: [],
    currentConversationId: null,
    isLoading: false,
    isStreaming: false,
    theme: 'light',
    model: 'gpt-3.5-turbo'
  })

  const syncTimeoutRef = useRef<NodeJS.Timeout>()
  const lastSyncRef = useRef<number>(0)

  // Helper function to sort conversations consistently
  const sortConversations = useCallback((conversations: Conversation[]): Conversation[] => {
    return [...conversations].sort((a, b) => {
      // Sort by updatedAt in descending order (newest first)
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    })
  }, [])

  const {
    messages: aiMessages,
    input,
    handleInputChange,
    handleSubmit: handleAISubmit,
    isLoading: aiIsLoading,
    setMessages: setAIMessages,
  } = useVercelChat({
    api: '/api/chat',
    onResponse: (response) => {
      setState(prev => ({ ...prev, isStreaming: false }))
    },
    onFinish: (message) => {
      updateConversationWithAIResponse(message.content)
    },
  })

  // Load conversations from server on mount (always prioritize server data)
  useEffect(() => {
    const loadConversationsFromServer = async () => {
      setState(prev => ({ ...prev, isLoading: true }))
      
      try {
        console.log('Loading conversations from server...')
        const response = await fetch('/api/conversations')
        
        if (response.ok) {
          const dbConversations = await response.json()
          console.log('Loaded conversations from server:', dbConversations.length)
          
          // Convert database format to client format
          const clientConversations = dbConversations.map((conv: any) => ({
            ...conv,
            createdAt: new Date(conv.createdAt),
            updatedAt: new Date(conv.updatedAt),
            messages: conv.messages?.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp)
            })) || []
          }))
          
          // Sort conversations consistently
          const sortedConversations = sortConversations(clientConversations)
          
          setState(prev => ({ 
            ...prev, 
            conversations: sortedConversations,
            isLoading: false 
          }))
          
          // Update localStorage as cache
          saveConversations(sortedConversations)
          lastSyncRef.current = Date.now()
        } else {
          console.error('Failed to fetch conversations from server')
          // Fallback to localStorage only if server fails
          const localConversations = loadConversations()
          const sortedLocal = sortConversations(localConversations)
          setState(prev => ({ 
            ...prev, 
            conversations: sortedLocal,
            isLoading: false 
          }))
        }
      } catch (error) {
        console.error('Error loading conversations:', error)
        // Fallback to localStorage on error
        const localConversations = loadConversations()
        const sortedLocal = sortConversations(localConversations)
        setState(prev => ({ 
          ...prev, 
          conversations: sortedLocal,
          isLoading: false 
        }))
      }
    }
    
    loadConversationsFromServer()
  }, [sortConversations])

  // Sync with server periodically and on focus
  useEffect(() => {
    const syncWithServer = async () => {
      try {
        const response = await fetch('/api/conversations')
        if (response.ok) {
          const dbConversations = await response.json()
          const clientConversations = dbConversations.map((conv: any) => ({
            ...conv,
            createdAt: new Date(conv.createdAt),
            updatedAt: new Date(conv.updatedAt),
            messages: conv.messages?.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp)
            })) || []
          }))
          
          // Sort conversations consistently
          const sortedConversations = sortConversations(clientConversations)
          
          setState(prev => ({ 
            ...prev, 
            conversations: sortedConversations
          }))
          
          saveConversations(sortedConversations)
          lastSyncRef.current = Date.now()
          console.log('Synced with server:', sortedConversations.length, 'conversations')
        }
      } catch (error) {
        console.error('Error syncing with server:', error)
      }
    }

    // Sync on window focus (when user switches back to tab)
    const handleFocus = () => {
      const timeSinceLastSync = Date.now() - lastSyncRef.current
      if (timeSinceLastSync > 5000) { // Only sync if more than 5 seconds since last sync
        syncWithServer()
      }
    }

    // Sync on storage events (when other tabs make changes)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'chatgpt-conversations' && e.newValue) {
        // Another tab updated localStorage, sync with server to get latest
        syncWithServer()
      }
    }

    window.addEventListener('focus', handleFocus)
    window.addEventListener('storage', handleStorageChange)

    // Periodic sync every 30 seconds
    const intervalId = setInterval(syncWithServer, 30000)

    return () => {
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(intervalId)
    }
  }, [sortConversations])

  // Immediate sync to server when conversations change
  useEffect(() => {
    if (state.conversations.length > 0) {
      // Update localStorage immediately for quick access
      saveConversations(state.conversations)
      
      // Clear previous timeout
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current)
      }
      
      // Debounce server sync to avoid too many requests
      syncTimeoutRef.current = setTimeout(async () => {
        for (const conv of state.conversations) {
          if (conv.messages.length > 0) {
            try {
              const cleanConv = {
                id: conv.id,
                title: conv.title,
                messages: conv.messages,
                createdAt: conv.createdAt,
                updatedAt: conv.updatedAt,
                userId: conv.userId,
                totalTokens: conv.totalTokens,
                model: conv.model,
                memoryId: conv.memoryId
              }
              
              const response = await fetch('/api/conversations', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(cleanConv)
              })
              
              if (!response.ok) {
                console.error('Failed to sync conversation to server:', conv.id)
              }
            } catch (error) {
              console.error('Error syncing conversation to server:', error)
            }
          }
        }
        lastSyncRef.current = Date.now()
      }, 1000)
    }

    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current)
      }
    }
  }, [state.conversations])

  const updateConversationWithAIResponse = useCallback((content: string) => {
    if (!state.currentConversationId) return
    
    const assistantMessage: Message = {
      id: generateId(),
      content,
      role: 'assistant',
      timestamp: new Date(),
      model: state.model
    }

    setState(prev => {
      const updatedConversations = prev.conversations.map(conv =>
        conv.id === state.currentConversationId
          ? {
              ...conv,
              messages: [...conv.messages, assistantMessage],
              updatedAt: new Date()
            }
          : conv
      )
      
      // Sort conversations after update
      return {
        ...prev,
        conversations: sortConversations(updatedConversations)
      }
    })
  }, [state.currentConversationId, state.model, sortConversations])

  const getCurrentConversation = useCallback(() => {
    return state.conversations.find(conv => conv.id === state.currentConversationId)
  }, [state.conversations, state.currentConversationId])

  const createNewConversation = useCallback(async () => {
    const newConv: Conversation = {
      id: generateId(),
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    setState(prev => {
      // Add new conversation and sort
      const updatedConversations = [newConv, ...prev.conversations]
      return {
        ...prev,
        conversations: sortConversations(updatedConversations),
        currentConversationId: newConv.id
      }
    })
    
    // Immediately sync to server
    try {
      await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConv)
      })
    } catch (error) {
      console.error('Error creating conversation on server:', error)
    }
    
    return newConv.id
  }, [sortConversations])

  const selectConversation = useCallback((id: string) => {
    setState(prev => ({ ...prev, currentConversationId: id }))
  }, [])

  const sendMessage = useCallback(async (content: string, attachments?: any[]) => {
    if (!content.trim() && (!attachments || attachments.length === 0)) return

    let conversationId = state.currentConversationId
    
    if (!conversationId) {
      conversationId = await createNewConversation()
    }

    const userMessage: Message = {
      id: generateId(),
      content,
      role: 'user',
      timestamp: new Date(),
      attachments
    }

    // Add user message to conversation
    setState(prev => {
      const updatedConversations = prev.conversations.map(conv =>
        conv.id === conversationId
          ? {
              ...conv,
              messages: [...conv.messages, userMessage],
              title: conv.messages.length === 0 ? content.slice(0, 50) : conv.title,
              updatedAt: new Date()
            }
          : conv
      )
      
      return {
        ...prev,
        isStreaming: true,
        conversations: sortConversations(updatedConversations)
      }
    })

    // Prepare messages for AI
    const currentConv = state.conversations.find(conv => conv.id === conversationId)
    const allMessages = currentConv ? [...currentConv.messages, userMessage] : [userMessage]
    
    // Convert to format expected by Vercel AI SDK
    const formattedMessages = allMessages.map(msg => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      attachments: msg.attachments
    }))

    try {
      const assistantMessage: Message = {
        id: generateId(),
        content: '',
        role: 'assistant',
        timestamp: new Date(),
        model: state.model
      }

      // Add empty assistant message
      setState(prev => {
        const updatedConversations = prev.conversations.map(conv =>
          conv.id === conversationId
            ? {
                ...conv,
                messages: [...conv.messages, assistantMessage]
              }
            : conv
        )
        
        return {
          ...prev,
          conversations: sortConversations(updatedConversations)
        }
      })

      // Send to AI API with streaming
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: formattedMessages,
          conversationId,
          model: state.model,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get AI response')
      }

      // Handle streaming response
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) throw new Error('No response body')

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        
        // Update the assistant message with the new chunk
        setState(prev => {
          const updatedConversations = prev.conversations.map(conv =>
            conv.id === conversationId
              ? {
                  ...conv,
                  messages: conv.messages.map(msg =>
                    msg.id === assistantMessage.id
                      ? { ...msg, content: msg.content + chunk }
                      : msg
                  ),
                  updatedAt: new Date()
                }
              : conv
          )
          
          return {
            ...prev,
            conversations: sortConversations(updatedConversations)
          }
        })
      }
    } catch (error) {
      console.error('Error generating response:', error)
    } finally {
      setState(prev => ({ ...prev, isStreaming: false }))
    }
  }, [state.currentConversationId, state.conversations, state.model, createNewConversation, sortConversations])

  const editMessage = useCallback((messageId: string, newContent: string) => {
    setState(prev => {
      const updatedConversations = prev.conversations.map(conv =>
        conv.id === prev.currentConversationId
          ? {
              ...conv,
              messages: conv.messages.map(msg =>
                msg.id === messageId
                  ? { ...msg, content: newContent, isEditing: false }
                  : msg
              ),
              updatedAt: new Date()
            }
          : conv
      )
      
      return {
        ...prev,
        conversations: sortConversations(updatedConversations)
      }
    })
  }, [sortConversations])

  const toggleMessageEdit = useCallback((messageId: string) => {
    setState(prev => ({
      ...prev,
      conversations: prev.conversations.map(conv =>
        conv.id === prev.currentConversationId
          ? {
              ...conv,
              messages: conv.messages.map(msg =>
                msg.id === messageId
                  ? { ...msg, isEditing: !msg.isEditing }
                  : msg
              )
            }
          : conv
      )
    }))
  }, [])

  const deleteConversation = useCallback(async (id: string) => {
    try {
      console.log('Deleting conversation:', id)
      
      // Delete from server first
      const response = await fetch(`/api/conversations?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        console.log('Successfully deleted from server')
      } else {
        const errorData = await response.json()
        console.error('Failed to delete conversation from server:', errorData)
      }
      
      // Delete from local state
      setState(prev => {
        const updatedConversations = prev.conversations.filter(conv => conv.id !== id)
        const newCurrentId = prev.currentConversationId === id ? null : prev.currentConversationId
        
        // Update localStorage immediately
        saveConversations(updatedConversations)
        
        return {
          ...prev,
          conversations: updatedConversations, // Already filtered, no need to sort
          currentConversationId: newCurrentId
        }
      })
      
      console.log('Conversation deleted successfully:', id)
      lastSyncRef.current = Date.now()
    } catch (error) {
      console.error('Error deleting conversation:', error)
    }
  }, [])

  const regenerateResponse = useCallback(async (messageId: string) => {
    if (!state.currentConversationId) return

    const conversation = getCurrentConversation()
    if (!conversation) return

    // Find the message and get all messages up to that point
    const messageIndex = conversation.messages.findIndex(msg => msg.id === messageId)
    if (messageIndex === -1) return

    // Remove all messages after the edited message
    const messagesUpToEdit = conversation.messages.slice(0, messageIndex + 1)
    
    setState(prev => {
      const updatedConversations = prev.conversations.map(conv =>
        conv.id === state.currentConversationId
          ? { 
              ...conv, 
              messages: messagesUpToEdit,
              updatedAt: new Date()
            }
          : conv
      )
      
      return {
        ...prev,
        conversations: sortConversations(updatedConversations)
      }
    })

    // Get the last user message to regenerate from
    const lastUserMessage = messagesUpToEdit[messagesUpToEdit.length - 1]
    if (lastUserMessage && lastUserMessage.role === 'user') {
      // Trigger a new AI response
      await sendMessage(lastUserMessage.content, lastUserMessage.attachments)
    }
  }, [state.currentConversationId, getCurrentConversation, sendMessage, sortConversations])

  const toggleTheme = useCallback(() => {
    setState(prev => ({ ...prev, theme: prev.theme === 'light' ? 'dark' : 'light' }))
  }, [])

  // Manual refresh function
  const refreshFromServer = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }))
    
    try {
      const response = await fetch('/api/conversations')
      if (response.ok) {
        const dbConversations = await response.json()
        const clientConversations = dbConversations.map((conv: any) => ({
          ...conv,
          createdAt: new Date(conv.createdAt),
          updatedAt: new Date(conv.updatedAt),
          messages: conv.messages?.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          })) || []
        }))
        
        // Sort conversations consistently
        const sortedConversations = sortConversations(clientConversations)
        
        setState(prev => ({ 
          ...prev, 
          conversations: sortedConversations,
          isLoading: false 
        }))
        
        saveConversations(sortedConversations)
        lastSyncRef.current = Date.now()
        console.log('Manual refresh completed:', sortedConversations.length, 'conversations')
      }
    } catch (error) {
      console.error('Error refreshing from server:', error)
      setState(prev => ({ ...prev, isLoading: false }))
    }
  }, [sortConversations])

  return {
    ...state,
    getCurrentConversation,
    createNewConversation,
    selectConversation,
    sendMessage,
    editMessage,
    toggleMessageEdit,
    deleteConversation,
    regenerateResponse,
    toggleTheme,
    refreshFromServer
  }
}

