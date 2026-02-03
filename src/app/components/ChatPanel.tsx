'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import Markdown from 'react-markdown';
import { Platform } from '../types/content';
import { ChatMessage } from '../types/chat';
import { Playbook } from '../types/chat';
import { getPlaybook } from '../utils/playbooks';
import { loadApiKey } from '../utils/chat';

interface ChatPanelProps {
  postId: string;
  platform: Platform | null;
  messages: ChatMessage[];
  isStreaming: boolean;
  error: string | null;
  onSendMessage: (content: string, quickActionId?: string) => void;
  onClearHistory: () => void;
  onStopStreaming: () => void;
  onClose: () => void;
  onInsertContent: (content: string) => void;
  onReplaceContent: (content: string) => void;
}

export default function ChatPanel({
  platform,
  messages,
  isStreaming,
  error,
  onSendMessage,
  onClearHistory,
  onStopStreaming,
  onClose,
  onInsertContent,
  onReplaceContent,
}: ChatPanelProps) {
  const [input, setInput] = useState('');
  const [hasApiKey, setHasApiKey] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const playbook: Playbook = getPlaybook(platform);

  useEffect(() => {
    setHasApiKey(!!loadApiKey());
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;
    onSendMessage(trimmed);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickAction = (actionId: string, prompt: string) => {
    if (isStreaming) return;
    onSendMessage(prompt, actionId);
  };

  const handleTextareaInput = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  };

  if (!hasApiKey) {
    return (
      <div className="w-[380px] border-l border-[var(--toolbar-border)] bg-[var(--background)] flex flex-col shrink-0">
        <div className="h-14 px-4 flex items-center justify-between border-b border-[var(--toolbar-border)] shrink-0">
          <span className="text-sm font-medium">AI Assistant</span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[var(--button-hover)] transition-colors"
            title="Close chat"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-3 text-[var(--muted-foreground)]">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <p className="text-sm font-medium mb-1">API key required</p>
            <p className="text-xs text-[var(--muted-foreground)] mb-4">
              Add your Anthropic API key in Settings to use the AI assistant.
            </p>
            <a
              href="/settings"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-[var(--toolbar-border)] rounded-lg hover:bg-[var(--button-hover)] transition-colors"
            >
              Go to Settings
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[380px] border-l border-[var(--toolbar-border)] bg-[var(--background)] flex flex-col shrink-0">
      {/* Header */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-[var(--toolbar-border)] shrink-0">
        <span className="text-sm font-medium">{playbook.name}</span>
        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <button
              onClick={onClearHistory}
              className="p-1.5 rounded-lg hover:bg-[var(--button-hover)] transition-colors text-[var(--muted-foreground)]"
              title="Clear chat"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[var(--button-hover)] transition-colors"
            title="Close chat"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm text-[var(--muted-foreground)]">
              Ask me anything about your post, or use a quick action below.
            </p>
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                msg.role === 'user'
                  ? 'bg-[var(--foreground)] text-[var(--background)]'
                  : 'bg-[var(--muted)] text-[var(--foreground)]'
              }`}
            >
              {msg.role === 'assistant' ? (
                <div className="chat-markdown break-words"><Markdown>{msg.content}</Markdown></div>
              ) : (
                <div className="whitespace-pre-wrap break-words">{msg.content}</div>
              )}
              {msg.role === 'assistant' && msg.content && (
                <div className="flex gap-1 mt-2 pt-2 border-t border-[var(--toolbar-border)]">
                  <button
                    onClick={() => onInsertContent(msg.content)}
                    className="text-xs px-2 py-1 rounded hover:bg-[var(--button-hover)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                  >
                    Insert
                  </button>
                  <button
                    onClick={() => onReplaceContent(msg.content)}
                    className="text-xs px-2 py-1 rounded hover:bg-[var(--button-hover)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                  >
                    Replace
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {error && (
          <div className="text-xs text-red-500 bg-red-500/10 rounded-lg px-3 py-2">
            {error}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick actions */}
      <div className="px-4 py-2 border-t border-[var(--toolbar-border)]">
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          {playbook.quickActions.map((action) => (
            <button
              key={action.id}
              onClick={() => handleQuickAction(action.id, action.prompt)}
              disabled={isStreaming}
              className="shrink-0 text-xs px-2.5 py-1.5 rounded-full border border-[var(--toolbar-border)] hover:bg-[var(--button-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="p-3 border-t border-[var(--toolbar-border)]">
        <div className="flex gap-2 items-end">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onInput={handleTextareaInput}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your post..."
            rows={1}
            className="flex-1 resize-none text-sm bg-[var(--muted)] rounded-lg px-3 py-2 outline-none placeholder:text-[var(--placeholder-color)] text-[var(--foreground)]"
          />
          {isStreaming ? (
            <button
              onClick={onStopStreaming}
              className="shrink-0 p-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
              title="Stop"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="shrink-0 p-2 rounded-lg bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
              title="Send"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
