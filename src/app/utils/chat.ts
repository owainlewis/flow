import { ChatMessage, CHAT_STORAGE_PREFIX, API_KEY_STORAGE_KEY } from '../types/chat';

export function generateMessageId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export function createChatMessage(role: 'user' | 'assistant', content: string, quickActionId?: string): ChatMessage {
  return {
    id: generateMessageId(),
    role,
    content,
    timestamp: Date.now(),
    quickActionId,
  };
}

export function loadChatHistory(postId: string): ChatMessage[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(`${CHAT_STORAGE_PREFIX}${postId}`);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function saveChatHistory(postId: string, messages: ChatMessage[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`${CHAT_STORAGE_PREFIX}${postId}`, JSON.stringify(messages));
}

export function clearChatHistory(postId: string): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(`${CHAT_STORAGE_PREFIX}${postId}`);
}

export function loadApiKey(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(API_KEY_STORAGE_KEY) || '';
}

export function saveApiKey(key: string): void {
  if (typeof window === 'undefined') return;
  if (key) {
    localStorage.setItem(API_KEY_STORAGE_KEY, key);
  } else {
    localStorage.removeItem(API_KEY_STORAGE_KEY);
  }
}
