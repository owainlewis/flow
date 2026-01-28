'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Feed, Note, Platform, PLATFORM_LABELS, STATUS_LABELS } from '../types/content';
import { loadFeed, getNotesForWeek, getWeekStart, formatWeekRange, groupByPlatform } from '../utils/feed';
import { StatusBadge } from '../components/StatusSelector';

const THEME_KEY = 'contentflow-theme';

const PLATFORM_ICONS: Record<Platform, React.ReactNode> = {
  linkedin: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
    </svg>
  ),
  youtube: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 19c-4.19 0-6.8-.16-7.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83.25-.9.83-1.48 1.73-1.73.47-.13 1.33-.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 5c4.19 0 6.8.16 7.83.44.9.25 1.48.83 1.73 1.73z" />
    </svg>
  ),
  newsletter: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  ),
  twitter: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  other: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  ),
};

function stripHtml(html: string): string {
  if (typeof document === 'undefined') return html.replace(/<[^>]*>/g, '');
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
}

function truncateText(text: string, maxLength: number = 80): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return trimmed.slice(0, maxLength).trim() + '...';
}

export default function WeeklyPage() {
  const router = useRouter();
  const [feed, setFeed] = useState<Feed>({ items: [] });
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(getWeekStart());

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

  const handlePrevWeek = useCallback(() => {
    setCurrentWeekStart((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() - 7);
      return newDate;
    });
  }, []);

  const handleNextWeek = useCallback(() => {
    setCurrentWeekStart((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + 7);
      return newDate;
    });
  }, []);

  const handleNoteClick = useCallback((noteId: string) => {
    router.push(`/notes/${noteId}`);
  }, [router]);

  if (!isLoaded) {
    return null;
  }

  const weeklyNotes = getNotesForWeek(feed.items, currentWeekStart);
  const groupedNotes = groupByPlatform(weeklyNotes);
  const platformsWithContent = (Object.keys(groupedNotes) as Platform[]).filter(
    (p) => groupedNotes[p].length > 0
  );

  const isCurrentWeek = getWeekStart().getTime() === currentWeekStart.getTime();

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <nav className="toolbar h-14 px-4 flex items-center justify-between shrink-0">
        <Link href="/" className="font-semibold text-lg hover:opacity-80 transition-opacity">
          ContentFlow
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/notes" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
            Notes
          </Link>
          <Link href="/notes/new" className="toolbar-button text-sm font-medium flex items-center gap-1.5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
            New
          </Link>
          <button
            onClick={handleToggleDarkMode}
            className="toolbar-button text-sm font-medium"
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      <div className="flex-1 overflow-auto">
        <div className="max-w-[900px] mx-auto p-8">
          {/* Week header with navigation */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-2xl font-semibold">This Week&apos;s Content</h1>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevWeek}
                  className="p-2 rounded-lg hover:bg-[var(--muted)]/50 transition-colors"
                  aria-label="Previous week"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>
                <button
                  onClick={handleNextWeek}
                  className="p-2 rounded-lg hover:bg-[var(--muted)]/50 transition-colors"
                  aria-label="Next week"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              </div>
            </div>
            <p className="text-[var(--muted-foreground)]">
              {formatWeekRange(currentWeekStart)}
              {isCurrentWeek && (
                <span className="ml-2 text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full">
                  Current
                </span>
              )}
            </p>
          </div>

          {platformsWithContent.length === 0 ? (
            <div className="text-center py-16 text-[var(--muted-foreground)]">
              <p className="mb-4">No content planned for this week.</p>
              <Link
                href="/notes/new"
                className="toolbar-button text-sm font-medium inline-flex items-center gap-1.5 border border-[var(--toolbar-border)]"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Create content
              </Link>
            </div>
          ) : (
            <div className="space-y-8">
              {platformsWithContent.map((platform) => {
                const notes = groupedNotes[platform];
                return (
                  <div key={platform}>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-[var(--muted-foreground)]">
                        {PLATFORM_ICONS[platform]}
                      </span>
                      <h2 className="font-medium">{PLATFORM_LABELS[platform]}</h2>
                      <span className="text-sm text-[var(--muted-foreground)]">
                        ({notes.length})
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {notes.map((note) => (
                        <div
                          key={note.id}
                          onClick={() => handleNoteClick(note.id)}
                          className="cursor-pointer p-4 rounded-lg border border-[var(--toolbar-border)] hover:bg-[var(--button-hover)] transition-colors"
                        >
                          <div className="flex items-center justify-between mb-2">
                            {note.format && (
                              <span className="text-xs text-[var(--muted-foreground)]">
                                {note.format}
                              </span>
                            )}
                            <StatusBadge status={note.status} size="sm" />
                          </div>
                          <p className="text-sm text-[var(--foreground)] leading-relaxed">
                            {truncateText(stripHtml(note.body)) || (
                              <span className="text-[var(--muted-foreground)]">Empty note</span>
                            )}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
