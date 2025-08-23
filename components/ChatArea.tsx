'use client'

import React, { useEffect, useRef } from 'react'
import { MessageBubble } from './MessageBubble'
import { Message } from '@/types'

interface ChatAreaProps {
  messages: Message[]
  onEditMessage: (messageId: string, newContent: string) => void
  onToggleEdit: (messageId: string) => void
  theme?: 'light' | 'dark'
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  onEditMessage,
  onToggleEdit,
  theme = 'light'
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  if (messages.length === 0) {
    return (
      <div className={`flex-1 flex items-center justify-center p-8 ${theme === 'dark' ? 'bg-chat-dark' : 'bg-white'}`}>
        <div className="text-center max-w-2xl mx-auto">
          <h1 className={`text-4xl font-normal mb-8 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
            Where should we begin?
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
            <button className={`p-4 border rounded-2xl hover:bg-opacity-80 transition-colors text-left ${
              theme === 'dark' 
                ? 'border-chat-border bg-chat-gray hover:bg-chat-border text-white' 
                : 'border-gray-200 bg-chat-light-gray hover:bg-gray-100 text-gray-800'
            }`}>
              <div className="text-sm font-medium mb-1">
                Create a content calendar
              </div>
              <div className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                for a TikTok account
              </div>
            </button>
            
            <button className={`p-4 border rounded-2xl hover:bg-opacity-80 transition-colors text-left ${
              theme === 'dark' 
                ? 'border-chat-border bg-chat-gray hover:bg-chat-border text-white' 
                : 'border-gray-200 bg-chat-light-gray hover:bg-gray-100 text-gray-800'
            }`}>
              <div className="text-sm font-medium mb-1">
                Help me study
              </div>
              <div className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                vocabulary for a college entrance exam
              </div>
            </button>
            
            <button className={`p-4 border rounded-2xl hover:bg-opacity-80 transition-colors text-left ${
              theme === 'dark' 
                ? 'border-chat-border bg-chat-gray hover:bg-chat-border text-white' 
                : 'border-gray-200 bg-chat-light-gray hover:bg-gray-100 text-gray-800'
            }`}>
              <div className="text-sm font-medium mb-1">
                Show me a code snippet
              </div>
              <div className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                of a website&apos;s sticky header
              </div>
            </button>
            
            <button className={`p-4 border rounded-2xl hover:bg-opacity-80 transition-colors text-left ${
              theme === 'dark' 
                ? 'border-chat-border bg-chat-gray hover:bg-chat-border text-white' 
                : 'border-gray-200 bg-chat-light-gray hover:bg-gray-100 text-gray-800'
            }`}>
              <div className="text-sm font-medium mb-1">
                Help me pick
              </div>
              <div className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                an outfit that will look good on camera
              </div>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex-1 overflow-y-auto chat-scroll ${theme === 'dark' ? 'bg-chat-dark' : 'bg-white'}`}>
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          onEdit={onEditMessage}
          onToggleEdit={onToggleEdit}
          theme={theme}
        />
      ))}     
      <div ref={messagesEndRef} />
    </div>
  )
}
