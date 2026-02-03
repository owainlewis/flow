'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Feed, Post, Platform, PLATFORM_LABELS, WeeklyCadence, DEFAULT_CADENCE, DAY_LABELS } from '../types/content';
import { loadFeed, saveFeed, getWeekStart, formatWeekRange, loadCadence, createPostWithMeta, getScheduledPostsForPlatformDay } from '../utils/feed';
import AppLayout from '../components/AppLayout';
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
  instagram: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  ),
  tiktok: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16.6 5.82s.51.5 0 0A4.278 4.278 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6 0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64 0 3.13 2.56 5.67 5.7 5.67 3.14 0 5.68-2.55 5.68-5.68V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48z" />
    </svg>
  ),
};

function stripHtml(html: string): string {
  if (typeof document === 'undefined') return html.replace(/<[^>]*>/g, '');
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
}

function truncateText(text: string, maxLength: number = 60): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return trimmed.slice(0, maxLength).trim() + '...';
}

function getDayDates(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    d.setHours(0, 0, 0, 0);
    return d;
  });
}

function isToday(date: Date): boolean {
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

export default function WeeklyPage() {
  const router = useRouter();
  const [feed, setFeed] = useState<Feed>({ items: [] });
  const [cadence, setCadence] = useState<WeeklyCadence>(DEFAULT_CADENCE);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(getWeekStart());

  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    }

    setFeed(loadFeed());
    setCadence(loadCadence());
    setIsLoaded(true);
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

  const handlePostClick = useCallback((postId: string) => {
    router.push(`/posts/${postId}`);
  }, [router]);

  const handleEmptySlotClick = useCallback((platform: Platform, dayTimestamp: number) => {
    const post = createPostWithMeta({ platform, scheduledFor: dayTimestamp });
    const currentFeed = loadFeed();
    currentFeed.items.push(post);
    saveFeed(currentFeed);
    setFeed(currentFeed);
    router.push(`/posts/${post.id}`);
  }, [router]);

  if (!isLoaded) {
    return null;
  }

  const dayDates = getDayDates(currentWeekStart);
  const activePlatforms = (Object.keys(cadence) as Platform[]).filter(
    (p) => cadence[p].some(Boolean)
  );
  const hasCadence = activePlatforms.length > 0;
  const isCurrentWeek = getWeekStart().getTime() === currentWeekStart.getTime();

  return (
    <AppLayout>
      <div className="max-w-[1100px] mx-auto p-8">
        {/* Week header with navigation */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-semibold">Weekly Content</h1>
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

        {!hasCadence ? (
          <div className="text-center py-16 text-[var(--muted-foreground)]">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-4 opacity-40">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            <p className="mb-4">No weekly cadence configured yet.</p>
            <Link
              href="/settings"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium border border-[var(--toolbar-border)] rounded-lg hover:bg-[var(--button-hover)] transition-colors"
            >
              Configure cadence
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="grid min-w-[700px]" style={{ gridTemplateColumns: 'minmax(140px, auto) repeat(7, 1fr)' }}>
              {/* Column headers: empty corner + day labels */}
              <div className="sticky left-0 bg-[var(--background)] z-10" />
              {dayDates.map((date, i) => (
                <div
                  key={i}
                  className={`text-center py-3 px-2 text-sm font-medium border-b border-[var(--toolbar-border)] ${
                    isToday(date)
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                      : 'text-[var(--muted-foreground)]'
                  }`}
                >
                  <div>{DAY_LABELS[i]}</div>
                  <div className="text-xs mt-0.5">{date.getDate()}</div>
                </div>
              ))}

              {/* Platform rows */}
              {activePlatforms.map((platform) => {
                const weeklyFilled = dayDates.reduce((count, date) => {
                  const posts = getScheduledPostsForPlatformDay(feed.items, platform, date);
                  return count + (posts.length > 0 ? 1 : 0);
                }, 0);
                const weeklyTotal = cadence[platform].filter(Boolean).length;

                return (
                  <div key={platform} className="contents">
                    {/* Row header: platform label */}
                    <div className="sticky left-0 bg-[var(--background)] z-10 flex items-start gap-2 py-3 px-3 border-b border-[var(--toolbar-border)]">
                      <span className="text-[var(--muted-foreground)] mt-0.5">
                        {PLATFORM_ICONS[platform]}
                      </span>
                      <div>
                        <div className="font-medium text-sm">{PLATFORM_LABELS[platform]}</div>
                        <div className="text-xs text-[var(--muted-foreground)]">
                          {weeklyFilled}/{weeklyTotal}
                        </div>
                      </div>
                    </div>

                    {/* Day cells */}
                    {dayDates.map((date, dayIndex) => {
                      const post = getScheduledPostsForPlatformDay(feed.items, platform, date)[0] ?? null;
                      const isActive = cadence[platform][dayIndex];
                      const today = isToday(date);

                      return (
                        <div
                          key={dayIndex}
                          className={`border-b border-l border-[var(--toolbar-border)] p-1.5 min-h-[80px] ${
                            today ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                          }`}
                        >
                          {post ? (
                            <button
                              onClick={() => handlePostClick(post.id)}
                              className="w-full h-full text-left p-2 rounded border border-[var(--toolbar-border)] hover:bg-[var(--button-hover)] transition-colors"
                            >
                              <div className="flex items-center gap-1 mb-1">
                                <StatusBadge status={post.status} size="sm" />
                              </div>
                              <p className="text-xs leading-snug text-[var(--foreground)]">
                                {truncateText(stripHtml(post.body)) || (
                                  <span className="text-[var(--muted-foreground)]">Empty</span>
                                )}
                              </p>
                            </button>
                          ) : isActive ? (
                            <button
                              onClick={() => handleEmptySlotClick(platform, date.getTime())}
                              className="w-full h-full min-h-[60px] rounded border-2 border-dashed border-[var(--toolbar-border)] hover:border-[var(--muted-foreground)] hover:bg-[var(--button-hover)] transition-colors flex items-center justify-center group"
                            >
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                className="text-[var(--toolbar-border)] group-hover:text-[var(--muted-foreground)] transition-colors"
                              >
                                <path d="M12 5v14M5 12h14" />
                              </svg>
                            </button>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
