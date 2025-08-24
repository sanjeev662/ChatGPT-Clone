'use client'

import React from 'react'
import { Search, MessageSquare, Trash2, Sun, Moon, LogOut, Edit3, Library, Zap, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { Conversation } from '@/types'

interface SidebarProps {
  conversations: Conversation[]
  currentConversationId: string | null
  onSelectConversation: (id: string) => void
  onNewConversation: () => void
  onDeleteConversation: (id: string) => void
  theme: 'light' | 'dark'
  onToggleTheme: () => void
  isOpen: boolean
  isCollapsed: boolean
  onClose: () => void  
  onToggleCollapse: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  theme,
  onToggleTheme,
  isOpen,
  isCollapsed,
  onClose,
  onToggleCollapse
}) => {
  // Debug logging
  React.useEffect(() => {
    console.log('Sidebar conversations updated:', conversations.length)
    console.log('Conversations:', conversations.map(c => ({ id: c.id, title: c.title, messageCount: c.messages?.length || 0 })))
  }, [conversations])

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}
      
      <div className={`
        fixed left-0 top-0 h-full bg-chat-darker border-r border-chat-border transform transition-all duration-300 z-50
        md:relative
        ${isOpen 
          ? 'translate-x-0' 
          : '-translate-x-full'
        }
        ${isOpen 
          ? (isCollapsed ? 'w-16' : 'w-64')
          : 'w-0'
        }
        ${!isOpen ? 'overflow-hidden' : ''}
      `}>
        {isOpen && (
          <div className="flex flex-col h-full">
            <div className="p-3">
            <div className="h-10 flex items-center justify-between">
              {!isCollapsed ? (
                <>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-sm flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"/>
                      </svg>
                    </div>
                    <span className="text-white font-medium">ChatGPT</span>
                  </div>
                  <div className="w-8 h-8 flex items-center justify-center">
                    <button
                      onClick={onToggleCollapse}
                      className="group p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                      title="Collapse sidebar"
                    >
                      <PanelLeftClose className="w-4 h-4 text-gray-400 group-hover:text-white" />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-8 h-8 flex items-center justify-center">
                    <button
                      onClick={onToggleCollapse}
                      className="group w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors"
                      title="Expand sidebar"
                    >
                      <div className="w-8 h-8 rounded-sm flex items-center justify-center group-hover:hidden">
                        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"/>
                        </svg>
                      </div>
                      <PanelLeftOpen className="w-4 h-4 text-gray-400 hidden group-hover:block" />
                    </button>
                  </div>
                  <div className="w-8 h-8"></div> 
                </>
              )}
            </div>
          </div>
            
            <div className="px-3 py-2 space-y-1">
              <button 
                onClick={onNewConversation}
                className={`w-full flex items-center p-2.5 hover:bg-white/10 rounded-lg transition-colors text-sm text-white ${
                  isCollapsed ? 'justify-center' : 'gap-2'
                }`} 
                title={isCollapsed ? "New chat" : undefined}
              >
                <Edit3 className="w-4 h-4" />
                {!isCollapsed && "New chat"}
              </button>
              
              <button className={`w-full flex items-center p-2.5 hover:bg-white/10 rounded-lg transition-colors text-sm text-white ${
                isCollapsed ? 'justify-center' : 'gap-2'
              }`} title={isCollapsed ? "Search chats" : undefined}>
                <Search className="w-4 h-4" />
                {!isCollapsed && "Search chats"}
              </button>
              
              <button className={`w-full flex items-center p-2.5 hover:bg-white/10 rounded-lg transition-colors text-sm text-white ${
                isCollapsed ? 'justify-center' : 'gap-2'
              }`} title={isCollapsed ? "Library" : undefined}>
                <Library className="w-4 h-4" />
                {!isCollapsed && "Library"}
              </button>
              
              <button className={`w-full flex items-center p-2.5 hover:bg-white/10 rounded-lg transition-colors text-sm text-white ${
                isCollapsed ? 'justify-center' : 'gap-2'
              }`} title={isCollapsed ? "Sora" : undefined}>
                <Zap className="w-4 h-4" />
                {!isCollapsed && "Sora"}
              </button>
              
              <button className={`w-full flex items-center p-2.5 hover:bg-white/10 rounded-lg transition-colors text-sm text-white ${
                isCollapsed ? 'justify-center' : 'gap-2'
              }`} title={isCollapsed ? "GPTs" : undefined}>
                <MessageSquare className="w-4 h-4" />
                {!isCollapsed && "GPTs"}
              </button>
            </div>
            
            {!isCollapsed && (
              <div className="flex-1 overflow-y-auto px-3 sidebar-scroll">
                <div className="space-y-1">
                  <div className="text-xs text-gray-400 font-medium mb-2 px-2 mt-4">
                    Chats ({conversations.length})
                  </div>
                  {conversations.length === 0 ? (
                    <div className="text-xs text-gray-500 px-2 py-4 text-center">
                      No conversations yet
                    </div>
                  ) : (
                    conversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        className={`
                          group flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors relative
                          ${currentConversationId === conversation.id
                            ? 'bg-chat-dark'
                            : 'hover:bg-white/10'
                          }
                        `}
                        onClick={() => onSelectConversation(conversation.id)}
                      >
                        <MessageSquare className="w-4 h-4 flex-shrink-0 text-gray-400" />
                        <span className="flex-1 truncate text-sm text-white">
                          {conversation.title || 'Untitled Chat'}
                        </span>
                        <span className="text-xs text-gray-500 mr-1">
                          {conversation.messages?.length || 0}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            console.log('Delete button clicked for conversation:', conversation.id)
                            onDeleteConversation(conversation.id)
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded transition-opacity"
                          title="Delete conversation"
                        >
                          <Trash2 className="w-3 h-3 text-gray-400 hover:text-red-400" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
            
            <div className="p-3 mt-auto">
              {isCollapsed ? (
                <div className="flex flex-col items-center p-2 gap-2">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                    S
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-2 hover:bg-white/10 rounded-lg cursor-pointer transition-colors">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                    S
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">
                      Sanjeev Singh
                    </div>
                    <div className="text-xs text-gray-400">
                      Free
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={onToggleTheme}
                      className="p-1 hover:bg-white/10 rounded transition-colors"
                      title={theme === 'dark' ? 'Change to light mode' : 'Change to dark mode'}
                    >
                      {theme === 'dark' ? (
                        <Sun className="w-4 h-4 text-gray-400" />
                      ) : (
                        <Moon className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                    <button className="p-1 hover:bg-white/10 rounded transition-colors">
                      <LogOut className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
