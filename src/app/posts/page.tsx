'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AppLayout from '../components/AppLayout';
import PostCard from '../components/PostCard';
import { Feed, Post, Platform, ContentStatus, STATUS_LABELS, PLATFORM_LABELS, PLATFORM_CONTENT_LABELS, getContentLabel } from '../types/content';
import { loadFeed, saveFeed, createPost, sortByNewest, deletePost, filterByPlatform, filterByStatus } from '../utils/feed';

const THEME_KEY = 'contentflow-theme';

const STATUSES: (ContentStatus | 'all')[] = ['all', 'idea', 'draft', 'ready', 'published'];

function PostsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [feed, setFeed] = useState<Feed>({ items: [] });
  const [isLoaded, setIsLoaded] = useState(false);
  const [statusFilter, setStatusFilter] = useState<ContentStatus | 'all'>('all');

  // Get platform filter from URL (normalize to lowercase to match stored values)
  const rawPlatform = searchParams.get('platform');
  const isDocFilter = rawPlatform?.toLowerCase() === 'doc';
  const platformFromUrl = rawPlatform && !isDocFilter ? (rawPlatform.toLowerCase() as Platform) : null;

  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    }

    const loadedFeed = loadFeed();
    setFeed(loadedFeed);
    setIsLoaded(true);
  }, []);

  const handlePostClick = useCallback((postId: string) => {
    router.push(`/posts/${postId}`);
  }, [router]);

  const handleDelete = useCallback((postId: string) => {
    deletePost(postId);
    setFeed((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== postId),
    }));
  }, []);

  if (!isLoaded) {
    return null;
  }

  // Apply filters
  let filteredItems = feed.items;
  if (isDocFilter) {
    filteredItems = filteredItems.filter((item) => item.type === 'post' && (item as Post).platform === null);
  } else if (platformFromUrl) {
    filteredItems = filterByPlatform(filteredItems, platformFromUrl);
  }
  if (statusFilter !== 'all') {
    filteredItems = filterByStatus(filteredItems, statusFilter);
  }
  const sortedItems = sortByNewest(filteredItems);

  const pageTitle = isDocFilter
    ? PLATFORM_CONTENT_LABELS.doc.plural
    : platformFromUrl
      ? `${PLATFORM_LABELS[platformFromUrl] ?? platformFromUrl} ${getContentLabel(platformFromUrl, true)}`
      : 'All Content';

  return (
    <div className="max-w-[800px] mx-auto p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-4">{pageTitle}</h1>

        {/* Status filter */}
        <div className="flex items-center gap-2 flex-wrap">
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

      {sortedItems.length === 0 ? (
        <div className="text-center py-16 text-[var(--muted-foreground)]">
          <p className="mb-4">
            {isDocFilter || platformFromUrl || statusFilter !== 'all'
              ? `No ${isDocFilter ? 'docs' : platformFromUrl ? getContentLabel(platformFromUrl, true).toLowerCase() : 'content'} match your filters.`
              : 'No content yet.'}
          </p>
          <button
            onClick={() => {
              const post = createPost();
              const feed = loadFeed();
              feed.items.unshift(post);
              saveFeed(feed);
              router.push(`/posts/${post.id}`);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium border border-[var(--toolbar-border)] rounded-lg hover:bg-[var(--button-hover)] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Create your first {isDocFilter ? 'doc' : platformFromUrl ? getContentLabel(platformFromUrl).toLowerCase() : 'post'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedItems.map((item) => {
            if (item.type === 'post') {
              const post = item as Post;
              return (
                <PostCard
                  key={post.id}
                  post={post}
                  onClick={() => handlePostClick(post.id)}
                  onDelete={handleDelete}
                />
              );
            }
            return null;
          })}
        </div>
      )}
    </div>
  );
}

export default function PostsPage() {
  return (
    <AppLayout>
      <Suspense fallback={<div className="p-8">Loading...</div>}>
        <PostsContent />
      </Suspense>
    </AppLayout>
  );
}
