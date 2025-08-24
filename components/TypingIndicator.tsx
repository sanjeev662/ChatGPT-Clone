'use client'

import React from 'react'

interface TypingIndicatorProps {
  theme?: 'light' | 'dark'
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  theme = 'light'
}) => {
  return (
    <div className={`px-4 py-3 message-bubble ${theme === 'dark' ? 'bg-chat-dark' : 'bg-white'}`}>
      <div className="max-w-4xl mx-auto">
        <div className="flex gap-3 justify-start">
          <div className="max-w-2xl order-last">
            <div className={`rounded-2xl px-4 py-3 ${
              theme === 'dark' 
                ? 'bg-transparent text-white' 
                : 'bg-white text-gray-800'
            }`}>
              <div className="flex items-center space-x-1">
                <div className="flex space-x-1">
                  <div className={`w-2 h-2 rounded-full animate-pulse ${
                    theme === 'dark' ? 'bg-gray-400' : 'bg-gray-500'
                  }`} style={{ animationDelay: '0ms' }}></div>
                  <div className={`w-2 h-2 rounded-full animate-pulse ${
                    theme === 'dark' ? 'bg-gray-400' : 'bg-gray-500'
                  }`} style={{ animationDelay: '150ms' }}></div>
                  <div className={`w-2 h-2 rounded-full animate-pulse ${
                    theme === 'dark' ? 'bg-gray-400' : 'bg-gray-500'
                  }`} style={{ animationDelay: '300ms' }}></div>
                </div>
                <span className={`text-sm ml-2 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  ChatGPT is typing...
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
