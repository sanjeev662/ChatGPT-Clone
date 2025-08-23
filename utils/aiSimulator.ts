import { Message } from '@/types'

const responses = [
  "I'm a simulated AI assistant. I can help you with various tasks like answering questions, writing code, explaining concepts, and more. What would you like to know?",
  "That's an interesting question! Let me think about that for a moment...",
  "I'd be happy to help you with that. Here's what I think:",
  "Based on what you've shared, I can provide some insights:",
  "Let me break this down for you step by step:",
  "That's a great point! Here's my perspective on that:",
  "I understand what you're asking. Let me explain:",
  "Here's a comprehensive answer to your question:",
  "I can definitely help you with that. Consider this approach:",
  "That's something I can assist with. Here's my suggestion:"
]

const getRandomResponse = (): string => {
  return responses[Math.floor(Math.random() * responses.length)]
}

const simulateTyping = async (
  text: string,
  onChunk: (chunk: string) => void,
  onComplete: () => void
): Promise<void> => {
  const words = text.split(' ')
  
  for (let i = 0; i < words.length; i++) {
    const word = words[i]
    const chunk = i === 0 ? word : ` ${word}`
    
    onChunk(chunk)
    
    // Random delay between 50-150ms to simulate typing
    const delay = Math.random() * 100 + 50
    await new Promise(resolve => setTimeout(resolve, delay))
  }
  
  onComplete()
}

export const generateAIResponse = async (
  messages: Message[],
  onChunk: (chunk: string) => void,
  onComplete: () => void
): Promise<void> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const lastMessage = messages[messages.length - 1]
  let response = getRandomResponse()
  
  // Simple context-aware responses
  if (lastMessage.content.toLowerCase().includes('code')) {
    response = "Here's a simple example:\n\n```javascript\nfunction greet(name) {\n  return `Hello, ${name}!`;\n}\n\nconsole.log(greet('World'));\n```\n\nThis function takes a name parameter and returns a greeting message."
  } else if (lastMessage.content.toLowerCase().includes('help')) {
    response = "I'm here to help! I can assist you with:\n\n• Answering questions\n• Writing and explaining code\n• Creative writing\n• Problem solving\n• General conversation\n\nWhat specific topic would you like help with?"
  } else if (lastMessage.content.toLowerCase().includes('hello') || lastMessage.content.toLowerCase().includes('hi')) {
    response = "Hello! It's great to meet you. I'm an AI assistant ready to help with any questions or tasks you might have. How can I assist you today?"
  }
  
  await simulateTyping(response, onChunk, onComplete)
}
