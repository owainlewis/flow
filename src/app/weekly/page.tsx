'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Feed, Post, Platform, PLATFORM_LABELS, WeeklyCadence, DEFAULT_CADENCE, DAY_LABELS } from '../types/content';
import { loadFeed, saveFeed, getWeekStart, formatWeekRange, loadCadence, createPostWithMeta, getScheduledPostsForPlatformDay, stripHtml, truncateText, getDerivedPosts, reschedulePost } from '../utils/feed';
import { getPlatformIcons } from '../utils/platform-icons';
import AppLayout from '../components/AppLayout';
import { StatusBadge } from '../components/StatusSelector';

const THEME_KEY = 'contentflow-theme';

const PLATFORM_ICONS = getPlatformIcons(18);

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
  const [dragSource, setDragSource] = useState<{ postId: string; platform: Platform } | null>(null);
  const [dragOverCell, setDragOverCell] = useState<string | null>(null);

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

  const handleDragStart = useCallback((e: React.DragEvent, postId: string, platform: Platform) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/json', JSON.stringify({ postId, platform }));
    setDragSource({ postId, platform });
  }, []);

  const handleDragEnd = useCallback(() => {
    setDragSource(null);
    setDragOverCell(null);
  }, []);

  const handleCellDragOver = useCallback((e: React.DragEvent, platform: Platform, cellKey: string) => {
    if (!dragSource || dragSource.platform !== platform) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverCell(cellKey);
  }, [dragSource]);

  const handleCellDragLeave = useCallback(() => {
    setDragOverCell(null);
  }, []);

  const handleCellDrop = useCallback((e: React.DragEvent, platform: Platform, dayTimestamp: number) => {
    e.preventDefault();
    setDragOverCell(null);
    setDragSource(null);

    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      if (data.platform !== platform) return;
      reschedulePost(data.postId, dayTimestamp);
      setFeed(loadFeed());
    } catch {
      // Invalid data — ignore
    }
  }, []);

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
                      const cellKey = `${platform}-${dayIndex}`;
                      const isDragOver = dragOverCell === cellKey;

                      return (
                        <div
                          key={dayIndex}
                          className={`border-b border-l border-[var(--toolbar-border)] p-1.5 min-h-[80px] transition-colors ${
                            today ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                          } ${isDragOver ? 'bg-blue-100/60 dark:bg-blue-800/30' : ''}`}
                          onDragOver={(e) => handleCellDragOver(e, platform, cellKey)}
                          onDragLeave={handleCellDragLeave}
                          onDrop={(e) => handleCellDrop(e, platform, date.getTime())}
                        >
                          {post ? (() => {
                            const derivatives = getDerivedPosts(post.id);
                            const pendingDerivatives = derivatives.filter((d) => d.status !== 'published');
                            const isDragging = dragSource?.postId === post.id;
                            return (
                              <button
                                draggable
                                onDragStart={(e) => handleDragStart(e, post.id, platform)}
                                onDragEnd={handleDragEnd}
                                onClick={() => handlePostClick(post.id)}
                                className={`w-full h-full text-left p-2 rounded border border-[var(--toolbar-border)] hover:bg-[var(--button-hover)] transition-colors cursor-grab active:cursor-grabbing ${
                                  isDragging ? 'opacity-40' : ''
                                }`}
                              >
                                <div className="flex items-center gap-1 mb-1">
                                  <StatusBadge status={post.status} size="sm" />
                                  {derivatives.length > 0 && (
                                    <span
                                      className={`inline-flex items-center gap-0.5 text-xs ${
                                        post.status === 'published' && pendingDerivatives.length > 0
                                          ? 'text-amber-600 dark:text-amber-400'
                                          : 'text-[var(--muted-foreground)]'
                                      }`}
                                      title={`${derivatives.length} derived${pendingDerivatives.length > 0 ? ` (${pendingDerivatives.length} pending)` : ''}`}
                                    >
                                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <polyline points="17 1 21 5 17 9" />
                                        <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                                      </svg>
                                      {derivatives.length}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs leading-snug text-[var(--foreground)]">
                                  {truncateText(stripHtml(post.body), 60) || (
                                    <span className="text-[var(--muted-foreground)]">Empty</span>
                                  )}
                                </p>
                              </button>
                            );
                          })() : isActive ? (
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
