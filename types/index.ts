export interface Message {
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
  textContent?: string  // Add this line
}

export interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
  userId?: string
  totalTokens?: number
  model?: string
  memoryId?: string
}

export interface ChatState {
  conversations: Conversation[]
  currentConversationId: string | null
  isLoading: boolean
  isStreaming: boolean
  theme: 'light' | 'dark'
  model: string
}

export interface ChatSettings {
  model: string
  temperature: number
  maxTokens: number
  enableMemory: boolean
}

export interface UploadProgress {
  fileId: string
  progress: number
  status: 'uploading' | 'completed' | 'error'
  error?: string
}
