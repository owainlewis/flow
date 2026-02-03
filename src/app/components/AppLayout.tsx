'use client';

import { useRouter } from 'next/navigation';
import { useCallback, ReactNode } from 'react';
import Sidebar from './Sidebar';
import { createPost, loadFeed, saveFeed } from '../utils/feed';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const router = useRouter();

  const handleNewPost = useCallback(() => {
    const post = createPost();
    const feed = loadFeed();
    feed.items.unshift(post);
    saveFeed(feed);
    router.push(`/posts/${post.id}`);
  }, [router]);

  return (
    <div className="flex h-screen">
      <Sidebar onNewPost={handleNewPost} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
