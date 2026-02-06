import { Platform } from './content';

export type ChatMessageRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: ChatMessageRole;
  content: string;
  timestamp: number;
  quickActionId?: string;
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
