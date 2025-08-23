'use client'

import { useState, useCallback, useEffect } from 'react'
import { Message, Conversation, ChatState } from '@/types'
import { saveConversations, loadConversations, generateId } from '@/utils/storage'
import { generateAIResponse } from '@/utils/aiSimulator'

export const useChat = () => {
  const [state, setState] = useState<ChatState>({
    conversations: [],
    currentConversationId: null,
    isLoading: false,
    isStreaming: false,
    theme: 'light'
  })

  // Load conversations on mount
  useEffect(() => {
    const conversations = loadConversations()
    setState(prev => ({ ...prev, conversations }))
  }, [])

  // Save conversations whenever they change
  useEffect(() => {
    if (state.conversations.length > 0) {
      saveConversations(state.conversations)
    }
  }, [state.conversations])

  const getCurrentConversation = useCallback(() => {
    return state.conversations.find(conv => conv.id === state.currentConversationId)
  }, [state.conversations, state.currentConversationId])

  const createNewConversation = useCallback(() => {
    const newConv: Conversation = {
      id: generateId(),
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    setState(prev => ({
      ...prev,
      conversations: [newConv, ...prev.conversations],
      currentConversationId: newConv.id
    }))
    
    return newConv.id
  }, [])

  const selectConversation = useCallback((id: string) => {
    setState(prev => ({ ...prev, currentConversationId: id }))
  }, [])

  const sendMessage = useCallback(async (content: string, attachments?: any[]) => {
    if (!content.trim() && (!attachments || attachments.length === 0)) return

    let conversationId = state.currentConversationId
    
    if (!conversationId) {
      conversationId = createNewConversation()
    }

    const userMessage: Message = {
      id: generateId(),
      content,
      role: 'user',
      timestamp: new Date(),
      attachments
    }

    const assistantMessage: Message = {
      id: generateId(),
      content: '',
      role: 'assistant',
      timestamp: new Date()
    }

    // Add user message and empty assistant message
    setState(prev => ({
      ...prev,
      isStreaming: true,
      conversations: prev.conversations.map(conv =>
        conv.id === conversationId
          ? {
              ...conv,
              messages: [...conv.messages, userMessage, assistantMessage],
              title: conv.messages.length === 0 ? content.slice(0, 50) : conv.title,
              updatedAt: new Date()
            }
          : conv
      )
    }))

    // Generate AI response with streaming
    try {
      const currentConv = state.conversations.find(conv => conv.id === conversationId)
      const allMessages = currentConv ? [...currentConv.messages, userMessage] : [userMessage]
      
      await generateAIResponse(
        allMessages,
        (chunk: string) => {
          setState(prev => ({
            ...prev,
            conversations: prev.conversations.map(conv =>
              conv.id === conversationId
                ? {
                    ...conv,
                    messages: conv.messages.map(msg =>
                      msg.id === assistantMessage.id
                        ? { ...msg, content: msg.content + chunk }
                        : msg
                    )
                  }
                : conv
            )
          }))
        },
        () => {
          setState(prev => ({ ...prev, isStreaming: false }))
        }
      )
    } catch (error) {
      console.error('Error generating response:', error)
      setState(prev => ({ ...prev, isStreaming: false }))
    }
  }, [state.currentConversationId, state.conversations, createNewConversation])

  const editMessage = useCallback((messageId: string, newContent: string) => {
    setState(prev => ({
      ...prev,
      conversations: prev.conversations.map(conv =>
        conv.id === prev.currentConversationId
          ? {
              ...conv,
              messages: conv.messages.map(msg =>
                msg.id === messageId
                  ? { ...msg, content: newContent, isEditing: false }
                  : msg
              )
            }
          : conv
      )
    }))
  }, [])

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

  const deleteConversation = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      conversations: prev.conversations.filter(conv => conv.id !== id),
      currentConversationId: prev.currentConversationId === id ? null : prev.currentConversationId
    }))
  }, [])

  const toggleTheme = useCallback(() => {
    setState(prev => ({ ...prev, theme: prev.theme === 'light' ? 'dark' : 'light' }))
  }, [])

  return {
    ...state,
    getCurrentConversation,
    createNewConversation,
    selectConversation,
    sendMessage,
    editMessage,
    toggleMessageEdit,
    deleteConversation,
    toggleTheme
  }
}
