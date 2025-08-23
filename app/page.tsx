'use client'

import { useState, useEffect } from 'react'
import { Menu, X, ChevronDown } from 'lucide-react'
import { useChat } from '@/hooks/useChat'
import { Sidebar } from '@/components/Sidebar'
import { ChatArea } from '@/components/ChatArea'
import { MessageInput } from '@/components/MessageInput'

const useResponsiveSidebar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768
      
      if (mobile) {
        setSidebarOpen(false)
      } else {
        setSidebarOpen(true)
      }
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const closeSidebar = () => {
    setSidebarOpen(false)
  }

  const toggleCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  return {
    sidebarOpen,
    sidebarCollapsed,   
    toggleSidebar,
    closeSidebar,
    toggleCollapse
  }
}

export default function Home() {
  const {
    sidebarOpen,
    sidebarCollapsed,
    toggleSidebar,
    closeSidebar,
    toggleCollapse
  } = useResponsiveSidebar()

  const {
    conversations,
    currentConversationId,
    theme,
    getCurrentConversation,
    createNewConversation,
    selectConversation,
    sendMessage,
    editMessage,
    toggleMessageEdit,
    deleteConversation,
    toggleTheme
  } = useChat()

  const currentConversation = getCurrentConversation()

  return (
    <div className={`h-screen flex ${theme === 'dark' ? 'bg-chat-dark' : 'bg-white'}`}>
      <Sidebar
        conversations={conversations}
        currentConversationId={currentConversationId}
        onSelectConversation={selectConversation}
        onNewConversation={createNewConversation}
        onDeleteConversation={deleteConversation}
        theme={theme}
        onToggleTheme={toggleTheme}
        isOpen={sidebarOpen}
        isCollapsed={sidebarCollapsed}
        onClose={closeSidebar}
        onToggleCollapse={toggleCollapse}
      />

      <div className="flex-1 flex flex-col relative">
        <div className={`md:hidden ${theme === 'dark' ? 'bg-chat-dark border-chat-border' : 'bg-white border-gray-200'} border-b px-4 py-3 flex items-center gap-3`}>
          <button
            onClick={toggleSidebar}
            className={`p-2 ${theme === 'dark' ? 'hover:bg-chat-border text-white' : 'hover:bg-gray-100 text-gray-700'} rounded-lg transition-colors`}
            title="Toggle sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex-1 text-center">
            <button className={`flex items-center gap-1 text-lg font-medium mx-auto ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
              ChatGPT
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
          
          {sidebarOpen && (
          <div className="flex items-center gap-2">
            <button 
              onClick={createNewConversation}
              className={`p-2 ${theme === 'dark' ? 'hover:bg-chat-border text-white' : 'hover:bg-gray-100 text-gray-700'} rounded-lg transition-colors`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          )}
        </div>

        <ChatArea
          messages={currentConversation?.messages || []}
          onEditMessage={editMessage}
          onToggleEdit={toggleMessageEdit}
          theme={theme}
        />

        <MessageInput
          onSendMessage={sendMessage}
          theme={theme}
        />
      </div>
    </div>
  )
}
