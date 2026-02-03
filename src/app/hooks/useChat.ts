import { useState, useCallback, useRef, useEffect } from 'react';
import { Platform } from '../types/content';
import { ChatMessage } from '../types/chat';
import { loadChatHistory, saveChatHistory, clearChatHistory as clearStorage, createChatMessage, loadApiKey } from '../utils/chat';
import { getPlaybook } from '../utils/playbooks';
import { stripHtml, getPinnedPosts } from '../utils/feed';

interface UseChatOptions {
  postId: string;
  platform: Platform | null;
  getEditorContent: () => string;
  getTitle?: () => string;
  getDescription?: () => string;
}

interface UseChatReturn {
  messages: ChatMessage[];
  isStreaming: boolean;
  error: string | null;
  sendMessage: (content: string, quickActionId?: string) => void;
  clearHistory: () => void;
  stopStreaming: () => void;
}

export function useChat({ postId, platform, getEditorContent, getTitle, getDescription }: UseChatOptions): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const initializedRef = useRef(false);

  // Load history on mount / postId change
  useEffect(() => {
    if (!postId) return;
    const history = loadChatHistory(postId);
    setMessages(history);
    initializedRef.current = true;
  }, [postId]);

  const sendMessage = useCallback(async (content: string, quickActionId?: string) => {
    const apiKey = loadApiKey();
    if (!apiKey) {
      setError('No API key configured. Add your Anthropic API key in Settings.');
      return;
    }

    setError(null);

    const userMessage = createChatMessage('user', content, quickActionId);
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    const playbook = getPlaybook(platform);
    const editorContent = stripHtml(getEditorContent());
    const title = getTitle?.() || '';
    const description = getDescription?.() || '';

    const apiMessages = updatedMessages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    // Load pinned example posts for the current platform
    const pinnedPosts = getPinnedPosts(platform);
    const examplePosts = pinnedPosts.map((p) => ({ body: stripHtml(p.body), title: p.title }));

    const abortController = new AbortController();
    abortRef.current = abortController;
    setIsStreaming(true);

    // Create placeholder assistant message
    const assistantMessage = createChatMessage('assistant', '');
    const withAssistant = [...updatedMessages, assistantMessage];
    setMessages(withAssistant);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          systemPrompt: playbook.systemPrompt,
          currentContent: editorContent,
          currentTitle: title || undefined,
          currentDescription: description || undefined,
          apiKey,
          examplePosts: examplePosts.length > 0 ? examplePosts : undefined,
        }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let accumulated = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split('\n');
        // Keep the last potentially incomplete line in the buffer
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;

          const data = trimmed.slice(6);
          if (data === '[DONE]') break;

          try {
            const parsed = JSON.parse(data);
            if (parsed.error) {
              throw new Error(parsed.error);
            }
            if (parsed.text) {
              accumulated += parsed.text;
              // Update the assistant message in place
              setMessages((prev) => {
                const updated = [...prev];
                const lastIdx = updated.length - 1;
                if (lastIdx >= 0 && updated[lastIdx].role === 'assistant') {
                  updated[lastIdx] = { ...updated[lastIdx], content: accumulated };
                }
                return updated;
              });
            }
          } catch (e) {
            if (e instanceof SyntaxError) continue; // skip malformed chunks
            throw e;
          }
        }
      }

      // Save final state
      setMessages((prev) => {
        saveChatHistory(postId, prev);
        return prev;
      });
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        // Save partial response on abort
        setMessages((prev) => {
          saveChatHistory(postId, prev);
          return prev;
        });
      } else {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        setError(msg);
        // Remove the empty assistant message on error
        setMessages((prev) => {
          const lastMsg = prev[prev.length - 1];
          if (lastMsg?.role === 'assistant' && !lastMsg.content) {
            const without = prev.slice(0, -1);
            saveChatHistory(postId, without);
            return without;
          }
          saveChatHistory(postId, prev);
          return prev;
        });
      }
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  }, [messages, platform, postId, getEditorContent, getTitle, getDescription]);

  const clearHistory = useCallback(() => {
    setMessages([]);
    clearStorage(postId);
    setError(null);
  }, [postId]);

  const stopStreaming = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
  }, []);

  return { messages, isStreaming, error, sendMessage, clearHistory, stopStreaming };
}
