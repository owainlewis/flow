import { Platform } from './content';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  quickActionId?: string;
}

export interface ChatHistory {
  postId: string;
  messages: ChatMessage[];
}

export interface QuickAction {
  id: string;
  label: string;
  prompt: string;
}

export interface Playbook {
  platform: Platform | 'general';
  name: string;
  systemPrompt: string;
  quickActions: QuickAction[];
}

export interface ChatAPIRequest {
  messages: { role: 'user' | 'assistant'; content: string }[];
  systemPrompt: string;
  currentContent: string;
  currentTitle?: string;
  currentDescription?: string;
  platform: Platform | null;
  apiKey: string;
}

export const CHAT_STORAGE_PREFIX = 'contentflow-chat-';
export const API_KEY_STORAGE_KEY = 'contentflow-api-key';
