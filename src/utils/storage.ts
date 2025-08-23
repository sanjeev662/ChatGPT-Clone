import { Conversation } from '../types';

const STORAGE_KEY = 'chatgpt-clone-conversations';

export const saveConversations = (conversations: Conversation[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
};

export const loadConversations = (): Conversation[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  
  try {
    const parsed = JSON.parse(stored);
    return parsed.map((conv: any) => ({
      ...conv,
      createdAt: new Date(conv.createdAt),
      updatedAt: new Date(conv.updatedAt),
      messages: conv.messages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }))
    }));
  } catch {
    return [];
  }
};

export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};