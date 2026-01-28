'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Toolbar from '../components/Toolbar';
import NoteCard from '../components/NoteCard';
import { Feed, Note, Platform, ContentStatus, PLATFORM_LABELS, STATUS_LABELS } from '../types/content';
import { loadFeed, sortByNewest, deleteNote, filterByPlatform, filterByStatus } from '../utils/feed';

const THEME_KEY = 'contentflow-theme';

const PLATFORMS: (Platform | 'all')[] = ['all', 'linkedin', 'youtube', 'newsletter', 'twitter', 'other'];
const STATUSES: (ContentStatus | 'all')[] = ['all', 'idea', 'draft', 'ready', 'published'];

const PLATFORM_ICONS: Record<Platform, React.ReactNode> = {
  linkedin: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
    </svg>
  ),
  youtube: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 19c-4.19 0-6.8-.16-7.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83.25-.9.83-1.48 1.73-1.73.47-.13 1.33-.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 5c4.19 0 6.8.16 7.83.44.9.25 1.48.83 1.73 1.73z" />
    </svg>
  ),
  newsletter: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  ),
  twitter: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  other: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  ),
};

export default function NotesPage() {
  const router = useRouter();
  const [feed, setFeed] = useState<Feed>({ items: [] });
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [platformFilter, setPlatformFilter] = useState<Platform | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<ContentStatus | 'all'>('all');

  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }

    const loadedFeed = loadFeed();
    setFeed(loadedFeed);
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(THEME_KEY, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(THEME_KEY, 'light');
    }
  }, [isDarkMode, isLoaded]);

  const handleNewNote = useCallback(() => {
    router.push('/notes/new');
  }, [router]);

  const handleNoteClick = useCallback((noteId: string) => {
    router.push(`/notes/${noteId}`);
  }, [router]);

  const handleToggleDarkMode = useCallback(() => {
    setIsDarkMode((prev) => !prev);
  }, []);

  const handleDelete = useCallback((noteId: string) => {
    deleteNote(noteId);
    setFeed((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== noteId),
    }));
  }, []);

  if (!isLoaded) {
    return null;
  }

  // Apply filters
  let filteredItems = feed.items;
  if (platformFilter !== 'all') {
    filteredItems = filterByPlatform(filteredItems, platformFilter);
  }
  if (statusFilter !== 'all') {
    filteredItems = filterByStatus(filteredItems, statusFilter);
  }
  const sortedItems = sortByNewest(filteredItems);

  return (
    <div className="h-screen flex flex-col">
      <Toolbar
        isDarkMode={isDarkMode}
        onNewNote={handleNewNote}
        onToggleDarkMode={handleToggleDarkMode}
      />

      <div className="flex-1 overflow-auto">
        <div className="max-w-[700px] mx-auto p-8">
          {/* Filter bars */}
          <div className="mb-6 space-y-3">
            {/* Platform filter */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-[var(--muted-foreground)] mr-2">Platform:</span>
              {PLATFORMS.map((p) => (
                <button
                  key={p}
                  onClick={() => setPlatformFilter(p)}
                  className={`flex items-center gap-1.5 px-3 py-1 text-sm rounded-full transition-colors ${
                    platformFilter === p
                      ? 'bg-[var(--foreground)] text-[var(--background)]'
                      : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)]/50'
                  }`}
                >
                  {p !== 'all' && PLATFORM_ICONS[p]}
                  <span>{p === 'all' ? 'All' : PLATFORM_LABELS[p]}</span>
                </button>
              ))}
            </div>

            {/* Status filter */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-[var(--muted-foreground)] mr-2">Status:</span>
              {STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${
                    statusFilter === s
                      ? 'bg-[var(--foreground)] text-[var(--background)]'
                      : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)]/50'
                  }`}
                >
                  {s === 'all' ? 'All' : STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </div>

          {/* Weekly view link */}
          <div className="mb-6">
            <Link
              href="/weekly"
              className="inline-flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              View weekly content plan
            </Link>
          </div>

          {sortedItems.length === 0 ? (
            <div className="text-center py-16 text-[var(--muted-foreground)]">
              <p className="mb-4">
                {platformFilter !== 'all' || statusFilter !== 'all'
                  ? 'No notes match your filters.'
                  : 'No notes yet.'}
              </p>
              <button
                onClick={handleNewNote}
                className="toolbar-button text-sm font-medium inline-flex items-center gap-1.5 border border-[var(--toolbar-border)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-2 focus:ring-offset-[var(--background)]"
                aria-label="Create your first note"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Create your first note
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedItems.map((item) => {
                if (item.type === 'note') {
                  const note = item as Note;
                  return (
                    <NoteCard
                      key={note.id}
                      note={note}
                      onClick={() => handleNoteClick(note.id)}
                      onDelete={handleDelete}
                    />
                  );
                }
                return null;
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
