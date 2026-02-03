'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Editor } from '@tiptap/react';
import { Feed, Post, ContentStatus, Platform, PLATFORM_CHAR_LIMITS, PLATFORM_LABELS, getContentLabel } from '../../types/content';
import { loadFeed, saveFeed, countChars, formatDate, stripHtml, htmlToMarkdown, countPinnedForPlatform } from '../../utils/feed';
import AppLayout from '../../components/AppLayout';
import StatusSelector from '../../components/StatusSelector';
import ContentTypeSelector from '../../components/ContentTypeSelector';
import ChatPanel from '../../components/ChatPanel';
import { useChat } from '../../hooks/useChat';
import { DocEditor, YouTubeEditor, NewsletterEditor, TwitterEditor, InstagramEditor, TikTokEditor } from '../../components/editors';
import { marked } from 'marked';

const THEME_KEY = 'contentflow-theme';
const DEBOUNCE_MS = 500;

export default function PostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;

  const [post, setPost] = useState<Post | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const saveStatusTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const copyStatusTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const metaSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const feedRef = useRef<Feed | null>(null);
  const editorRef = useRef<Editor | null>(null);
  const postRef = useRef<Post | null>(null);

  const getEditorContent = useCallback(() => {
    return editorRef.current?.getHTML() || '';
  }, []);

  const getTitle = useCallback(() => {
    return postRef.current?.title || '';
  }, []);

  const getDescription = useCallback(() => {
    return postRef.current?.description || '';
  }, []);

  const chat = useChat({
    postId,
    platform: post?.platform ?? null,
    getEditorContent,
    getTitle,
    getDescription,
  });

  const handleInsertContent = useCallback((content: string) => {
    if (!editorRef.current) return;
    const html = marked.parse(content, { async: false }) as string;
    editorRef.current.chain().focus('end').insertContent(html).run();
  }, []);

  const handleReplaceContent = useCallback((content: string) => {
    if (!editorRef.current) return;
    const html = marked.parse(content, { async: false }) as string;
    editorRef.current.commands.setContent(html);
  }, []);

  // Called by the editor component when TipTap is ready
  const handleEditorReady = useCallback((editor: Editor | null) => {
    editorRef.current = editor;
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    }

    const feed = loadFeed();
    feedRef.current = feed;

    const foundPost = feed.items.find(
      (item) => item.id === postId && item.type === 'post'
    ) as Post | undefined;

    if (foundPost) {
      setPost(foundPost);
      postRef.current = foundPost;
    } else {
      setNotFound(true);
    }

    setIsLoaded(true);
  }, [postId]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      if (saveStatusTimeoutRef.current) clearTimeout(saveStatusTimeoutRef.current);
      if (copyStatusTimeoutRef.current) clearTimeout(copyStatusTimeoutRef.current);
      if (metaSaveTimeoutRef.current) clearTimeout(metaSaveTimeoutRef.current);
    };
  }, []);

  const saveMetadata = useCallback((updates: Partial<Post>) => {
    const feed = loadFeed();
    const updatedItems = feed.items.map((item) =>
      item.id === postId && item.type === 'post'
        ? { ...item, ...updates, updatedAt: Date.now() }
        : item
    );
    const newFeed = { items: updatedItems };
    saveFeed(newFeed);
    feedRef.current = newFeed;
    setPost((prev) => {
      const updated = prev ? { ...prev, ...updates } : prev;
      postRef.current = updated;
      return updated;
    });
  }, [postId]);

  const saveMetadataDebounced = useCallback((updates: Partial<Post>) => {
    if (metaSaveTimeoutRef.current) {
      clearTimeout(metaSaveTimeoutRef.current);
    }
    setPost((prev) => {
      const updated = prev ? { ...prev, ...updates } : prev;
      postRef.current = updated;
      return updated;
    });

    metaSaveTimeoutRef.current = setTimeout(() => {
      const feed = loadFeed();
      const updatedItems = feed.items.map((item) =>
        item.id === postId && item.type === 'post'
          ? { ...item, ...updates, updatedAt: Date.now() }
          : item
      );
      const newFeed = { items: updatedItems };
      saveFeed(newFeed);
      feedRef.current = newFeed;
    }, DEBOUNCE_MS);
  }, [postId]);

  // Called by editor components when body content changes
  const handleBodyChange = useCallback((content: string) => {
    if (!feedRef.current || !postId) return;

    setCharCount(countChars(content));

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    if (saveStatusTimeoutRef.current) clearTimeout(saveStatusTimeoutRef.current);

    setSaveStatus('saving');

    saveTimeoutRef.current = setTimeout(() => {
      const feed = loadFeed();
      const updatedItems = feed.items.map((item) =>
        item.id === postId && item.type === 'post'
          ? { ...item, body: content, updatedAt: Date.now() }
          : item
      );
      const newFeed = { items: updatedItems };
      saveFeed(newFeed);
      feedRef.current = newFeed;
      setSaveStatus('saved');

      saveStatusTimeoutRef.current = setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
    }, DEBOUNCE_MS);
  }, [postId]);

  const handleStatusChange = useCallback((status: ContentStatus) => {
    saveMetadata({ status });
  }, [saveMetadata]);

  const handlePlatformChange = useCallback((platform: Platform | null) => {
    saveMetadata({ platform });
  }, [saveMetadata]);

  const handleDelete = useCallback(() => {
    setShowDeleteDialog(true);
  }, []);

  const confirmDelete = useCallback(() => {
    const feed = loadFeed();
    const updatedItems = feed.items.filter((item) => item.id !== postId);
    saveFeed({ items: updatedItems });
    router.push('/posts');
  }, [postId, router]);

  const cancelDelete = useCallback(() => {
    setShowDeleteDialog(false);
  }, []);

  const handleCopyPlaintext = useCallback(async () => {
    const editor = editorRef.current;
    if (!editor) return;

    const plainText = stripHtml(editor.getHTML());

    try {
      await navigator.clipboard.writeText(plainText);
      setCopyStatus('copied');

      if (copyStatusTimeoutRef.current) clearTimeout(copyStatusTimeoutRef.current);

      copyStatusTimeoutRef.current = setTimeout(() => {
        setCopyStatus('idle');
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, []);

  const handleExport = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const markdown = htmlToMarkdown(editor.getHTML());
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);

    const plainText = stripHtml(editor.getHTML()).trim();
    const slug = plainText.length > 0
      ? plainText.slice(0, 30).replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase() || postId
      : postId;
    const filename = `${slug}.md`;

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [postId]);

  if (!isLoaded) {
    return null;
  }

  if (notFound) {
    return (
      <AppLayout>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-xl font-semibold mb-2">Not found</h1>
            <p className="text-[var(--muted-foreground)] mb-4">
              This content may have been deleted or the link is invalid.
            </p>
            <button
              onClick={() => router.push('/posts')}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium border border-[var(--toolbar-border)] rounded-lg hover:bg-[var(--button-hover)] transition-colors"
            >
              Return to content
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Char counter display
  const charLimits = post?.platform ? PLATFORM_CHAR_LIMITS[post.platform] : undefined;
  const bodyLimit = charLimits?.body;
  const charCountDisplay = bodyLimit ? `${charCount}/${bodyLimit}` : `${charCount} chars`;
  const isOverLimit = bodyLimit ? charCount > bodyLimit : false;
  const isNearLimit = bodyLimit ? charCount > bodyLimit * 0.9 : false;
  const charCountClass = isOverLimit
    ? 'text-red-500'
    : isNearLimit
      ? 'text-yellow-500'
      : 'text-[var(--muted-foreground)]';

  // Render the platform-specific editor
  function renderEditor() {
    if (!post) return null;

    const editorProps = {
      post,
      onBodyChange: handleBodyChange,
      onFieldChange: saveMetadataDebounced,
      onEditorReady: handleEditorReady,
      initialBody: post.body,
    };

    switch (post.platform) {
      case 'youtube': return <YouTubeEditor {...editorProps} />;
      case 'newsletter': return <NewsletterEditor {...editorProps} />;
      case 'twitter': return <TwitterEditor {...editorProps} />;
      case 'instagram': return <InstagramEditor {...editorProps} />;
      case 'tiktok': return <TikTokEditor {...editorProps} />;
      default:
        return <DocEditor {...editorProps} />;
    }
  }

  return (
    <AppLayout>
      <div className="h-full flex flex-col">
        {/* Top toolbar */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-[var(--toolbar-border)] shrink-0">
          <div className="flex items-center gap-3">
            {post && (
              <>
                <StatusSelector
                  value={post.status}
                  onChange={handleStatusChange}
                  size="sm"
                />
                <ContentTypeSelector
                  platform={post.platform}
                  onPlatformChange={handlePlatformChange}
                />
              </>
            )}
            <span className="text-xs text-[var(--muted-foreground)]">
              {post ? formatDate(post.createdAt) : ''}
            </span>
            <span className={`text-xs ${charCountClass}`}>
              {charCountDisplay}
            </span>
            {saveStatus !== 'idle' && (
              <span className={`text-xs ${saveStatus === 'saved' ? 'text-green-600 dark:text-green-400' : 'text-[var(--muted-foreground)]'}`}>
                {saveStatus === 'saving' ? 'Saving...' : 'Saved'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {post && (() => {
              const pinnedCount = countPinnedForPlatform(feedRef.current?.items || [], post.platform);
              const atCap = pinnedCount >= 5 && !post.pinned;
              return (
                <button
                  onClick={() => !atCap && saveMetadata({ pinned: !post.pinned })}
                  disabled={atCap}
                  className={`p-2 rounded-lg transition-colors ${atCap ? 'opacity-40 cursor-not-allowed' : 'hover:bg-[var(--button-hover)]'} ${post.pinned ? 'text-amber-500' : ''}`}
                  title={atCap ? `Max 5 pinned examples for ${post.platform ? PLATFORM_LABELS[post.platform] : 'untagged posts'}` : post.pinned ? 'Unpin as style example' : 'Pin as style example'}
                >
                  {post.pinned ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1">
                      <path d="M12 2C9.2 2 7 4.2 7 7c0 1.5.7 2.9 1.7 3.9L12 22l3.3-11.1C16.3 9.9 17 8.5 17 7c0-2.8-2.2-5-5-5z" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2C9.2 2 7 4.2 7 7c0 1.5.7 2.9 1.7 3.9L12 22l3.3-11.1C16.3 9.9 17 8.5 17 7c0-2.8-2.2-5-5-5z" />
                    </svg>
                  )}
                </button>
              );
            })()}
            <button
              onClick={() => setIsChatOpen((prev) => !prev)}
              className={`p-2 rounded-lg hover:bg-[var(--button-hover)] transition-colors ${isChatOpen ? 'bg-[var(--button-hover)]' : ''}`}
              title="AI Assistant"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </button>
            <button
              onClick={handleCopyPlaintext}
              className="p-2 rounded-lg hover:bg-[var(--button-hover)] transition-colors"
              title="Copy as plain text"
            >
              {copyStatus === 'copied' ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-600 dark:text-green-400">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              )}
            </button>
            <button
              onClick={handleExport}
              className="p-2 rounded-lg hover:bg-[var(--button-hover)] transition-colors"
              title="Export as Markdown"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </button>
            <button
              onClick={handleDelete}
              className="p-2 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors"
              title={`Delete ${getContentLabel(post?.platform ?? null).toLowerCase()}`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content area with optional chat panel */}
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-auto">
            {renderEditor()}
          </div>

          {isChatOpen && (
            <ChatPanel
              postId={postId}
              platform={post?.platform ?? null}
              messages={chat.messages}
              isStreaming={chat.isStreaming}
              error={chat.error}
              onSendMessage={chat.sendMessage}
              onClearHistory={chat.clearHistory}
              onStopStreaming={chat.stopStreaming}
              onClose={() => setIsChatOpen(false)}
              onInsertContent={handleInsertContent}
              onReplaceContent={handleReplaceContent}
            />
          )}
        </div>
      </div>

      {/* Delete dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--background)] border border-[var(--toolbar-border)] rounded-lg p-6 max-w-sm mx-4 shadow-lg">
            <h2 className="text-lg font-semibold mb-2">Delete {getContentLabel(post?.platform ?? null).toLowerCase()}?</h2>
            <p className="text-[var(--muted-foreground)] text-sm mb-4">
              This action cannot be undone. This {getContentLabel(post?.platform ?? null).toLowerCase()} will be permanently deleted.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 text-sm font-medium border border-[var(--toolbar-border)] rounded-lg hover:bg-[var(--button-hover)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
