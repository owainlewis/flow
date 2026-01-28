'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Feed, Note, ContentStatus, Platform } from '../../types/content';
import { loadFeed, saveFeed, countChars, formatDate, stripHtml, htmlToMarkdown } from '../../utils/feed';
import StatusSelector from '../../components/StatusSelector';
import ContentTypeSelector from '../../components/ContentTypeSelector';

const THEME_KEY = 'contentflow-theme';
const DEBOUNCE_MS = 500;

export default function NotePage() {
  const router = useRouter();
  const params = useParams();
  const noteId = params.id as string;

  const [note, setNote] = useState<Note | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');
  const [showMetadata, setShowMetadata] = useState(true);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const saveStatusTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const copyStatusTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const feedRef = useRef<Feed | null>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        codeBlock: false,
        code: false,
        horizontalRule: false,
        dropcursor: false,
        gapcursor: false,
      }),
      Placeholder.configure({
        placeholder: 'Start writing...',
      }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'editor-content outline-none min-h-[200px]',
      },
    },
    onUpdate: ({ editor }) => {
      if (!feedRef.current || !noteId) return;

      const content = editor.getHTML();

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (saveStatusTimeoutRef.current) {
        clearTimeout(saveStatusTimeoutRef.current);
      }

      setSaveStatus('saving');

      saveTimeoutRef.current = setTimeout(() => {
        const feed = loadFeed();
        const updatedItems = feed.items.map((item) =>
          item.id === noteId && item.type === 'note'
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
    },
  });

  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }

    const feed = loadFeed();
    feedRef.current = feed;

    const foundNote = feed.items.find(
      (item) => item.id === noteId && item.type === 'note'
    ) as Note | undefined;

    if (foundNote) {
      setNote(foundNote);
    } else {
      setNotFound(true);
    }

    setIsLoaded(true);
  }, [noteId]);

  useEffect(() => {
    if (editor && note && isLoaded) {
      editor.commands.setContent(note.body || '');
      editor.commands.focus('end');
    }
  }, [editor, note, isLoaded]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (saveStatusTimeoutRef.current) {
        clearTimeout(saveStatusTimeoutRef.current);
      }
      if (copyStatusTimeoutRef.current) {
        clearTimeout(copyStatusTimeoutRef.current);
      }
    };
  }, []);

  const saveMetadata = useCallback((updates: Partial<Note>) => {
    const feed = loadFeed();
    const updatedItems = feed.items.map((item) =>
      item.id === noteId && item.type === 'note'
        ? { ...item, ...updates, updatedAt: Date.now() }
        : item
    );
    const newFeed = { items: updatedItems };
    saveFeed(newFeed);
    feedRef.current = newFeed;

    // Update local state
    setNote((prev) => prev ? { ...prev, ...updates } : prev);
  }, [noteId]);

  const handleStatusChange = useCallback((status: ContentStatus) => {
    saveMetadata({ status });
  }, [saveMetadata]);

  const handlePlatformChange = useCallback((platform: Platform | null) => {
    saveMetadata({ platform, format: null });
  }, [saveMetadata]);

  const handleFormatChange = useCallback((format: string | null) => {
    saveMetadata({ format });
  }, [saveMetadata]);

  const handleBack = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      if (editor && feedRef.current) {
        const content = editor.getHTML();
        const feed = loadFeed();
        const updatedItems = feed.items.map((item) =>
          item.id === noteId && item.type === 'note'
            ? { ...item, body: content, updatedAt: Date.now() }
            : item
        );
        saveFeed({ items: updatedItems });
      }
    }
    router.push('/notes');
  }, [editor, noteId, router]);

  const handleDelete = useCallback(() => {
    setShowDeleteDialog(true);
  }, []);

  const confirmDelete = useCallback(() => {
    const feed = loadFeed();
    const updatedItems = feed.items.filter((item) => item.id !== noteId);
    saveFeed({ items: updatedItems });
    router.push('/notes');
  }, [noteId, router]);

  const cancelDelete = useCallback(() => {
    setShowDeleteDialog(false);
  }, []);

  const handleToggleDarkMode = useCallback(() => {
    setIsDarkMode((prev) => {
      const newValue = !prev;
      if (newValue) {
        document.documentElement.classList.add('dark');
        localStorage.setItem(THEME_KEY, 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem(THEME_KEY, 'light');
      }
      return newValue;
    });
  }, []);

  const handleCopyPlaintext = useCallback(async () => {
    if (!editor) return;

    const plainText = stripHtml(editor.getHTML());

    try {
      await navigator.clipboard.writeText(plainText);
      setCopyStatus('copied');

      if (copyStatusTimeoutRef.current) {
        clearTimeout(copyStatusTimeoutRef.current);
      }

      copyStatusTimeoutRef.current = setTimeout(() => {
        setCopyStatus('idle');
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [editor]);

  const handleExport = useCallback(() => {
    if (!editor) return;

    const markdown = htmlToMarkdown(editor.getHTML());
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);

    // Generate filename: first 30 chars of content or note ID
    const plainText = stripHtml(editor.getHTML()).trim();
    const slug = plainText.length > 0
      ? plainText.slice(0, 30).replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase() || noteId
      : noteId;
    const filename = `${slug}.md`;

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [editor, noteId]);

  if (!isLoaded) {
    return null;
  }

  if (notFound) {
    return (
      <div className="h-screen flex flex-col">
        <nav className="toolbar h-14 px-4 flex items-center justify-between shrink-0" role="navigation" aria-label="Note navigation">
          <button
            onClick={handleBack}
            className="toolbar-button text-sm font-medium flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-2 focus:ring-offset-[var(--toolbar-bg)]"
            aria-label="Back to notes"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <button
            onClick={handleToggleDarkMode}
            className="toolbar-button text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-2 focus:ring-offset-[var(--toolbar-bg)]"
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-pressed={isDarkMode}
          >
            {isDarkMode ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
        </nav>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-xl font-semibold mb-2">Note not found</h1>
            <p className="text-[var(--muted-foreground)] mb-4">
              This note may have been deleted or the link is invalid.
            </p>
            <button
              onClick={handleBack}
              className="toolbar-button text-sm font-medium inline-flex items-center gap-1.5 border border-[var(--toolbar-border)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-2 focus:ring-offset-[var(--background)]"
            >
              Return to notes
            </button>
          </div>
        </div>
      </div>
    );
  }

  const charCount = editor ? countChars(editor.getHTML()) : 0;

  return (
    <div className="h-screen flex flex-col">
      <nav className="toolbar h-14 px-4 flex items-center justify-between shrink-0" role="navigation" aria-label="Note navigation">
        <button
          onClick={handleBack}
          className="toolbar-button text-sm font-medium flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-2 focus:ring-offset-[var(--toolbar-bg)]"
          aria-label="Back to notes"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowMetadata(!showMetadata)}
            className={`toolbar-button text-sm font-medium flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-2 focus:ring-offset-[var(--toolbar-bg)] ${showMetadata ? 'text-[var(--foreground)]' : 'text-[var(--muted-foreground)]'}`}
            aria-label={showMetadata ? 'Hide metadata' : 'Show metadata'}
            aria-pressed={showMetadata}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7m0-18H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h7m0-18v18" />
            </svg>
            Details
          </button>
          <button
            onClick={handleCopyPlaintext}
            className="toolbar-button text-sm font-medium flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-2 focus:ring-offset-[var(--toolbar-bg)]"
            aria-label="Copy as plain text"
          >
            {copyStatus === 'copied' ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="text-green-600 dark:text-green-400">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            )}
            {copyStatus === 'copied' ? 'Copied' : 'Copy'}
          </button>
          <button
            onClick={handleExport}
            className="toolbar-button text-sm font-medium flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-2 focus:ring-offset-[var(--toolbar-bg)]"
            aria-label="Export as Markdown"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export
          </button>
          <button
            onClick={handleDelete}
            className="toolbar-button text-sm font-medium flex items-center gap-1.5 text-red-500 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-[var(--toolbar-bg)]"
            aria-label="Delete note"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            Delete
          </button>
          <button
            onClick={handleToggleDarkMode}
            className="toolbar-button text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-2 focus:ring-offset-[var(--toolbar-bg)]"
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-pressed={isDarkMode}
          >
            {isDarkMode ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      <div className="flex-1 overflow-auto">
        <div className="max-w-[700px] mx-auto p-8">
          {/* Metadata panel */}
          {showMetadata && note && (
            <div className="mb-6 p-4 rounded-lg border border-[var(--toolbar-border)] bg-[var(--muted)]/20">
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-[var(--muted-foreground)] mb-2 block">Status</label>
                  <StatusSelector
                    value={note.status}
                    onChange={handleStatusChange}
                    size="sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-[var(--muted-foreground)] mb-2 block">Platform & Format</label>
                  <ContentTypeSelector
                    platform={note.platform}
                    format={note.format}
                    onPlatformChange={handlePlatformChange}
                    onFormatChange={handleFormatChange}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mb-4 text-xs text-[var(--muted-foreground)]">
            <span>{note ? formatDate(note.createdAt) : ''}</span>
            <div className="flex items-center gap-3">
              {saveStatus !== 'idle' && (
                <span className={saveStatus === 'saved' ? 'text-green-600 dark:text-green-400' : ''}>
                  {saveStatus === 'saving' ? 'Saving...' : 'Saved'}
                </span>
              )}
              <span>{charCount} chars</span>
            </div>
          </div>
          <EditorContent editor={editor} />
        </div>
      </div>

      {showDeleteDialog && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
          aria-describedby="delete-dialog-description"
        >
          <div className="bg-[var(--background)] border border-[var(--toolbar-border)] rounded-lg p-6 max-w-sm mx-4 shadow-lg">
            <h2 id="delete-dialog-title" className="text-lg font-semibold mb-2">Delete note?</h2>
            <p id="delete-dialog-description" className="text-[var(--muted-foreground)] text-sm mb-4">
              This action cannot be undone. The note will be permanently deleted.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={cancelDelete}
                className="toolbar-button text-sm font-medium px-4 py-2 border border-[var(--toolbar-border)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-2 focus:ring-offset-[var(--background)]"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="toolbar-button text-sm font-medium px-4 py-2 bg-red-500 text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-[var(--background)]"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
