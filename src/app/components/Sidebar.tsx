'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { PLATFORM_CONTENT_LABELS, Platform } from '../types/content';

interface SidebarProps {
  onNewPost?: () => void;
}

function SidebarContent({ onNewPost }: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activePlatform = pathname === '/posts' ? searchParams.get('platform')?.toLowerCase() ?? null : null;

  const isActive = (path: string) => {
    if (path === '/posts') {
      // "All Posts" is active when on /posts with no platform filter, or on /posts/[id]
      return (pathname === '/posts' && !activePlatform) || pathname.startsWith('/posts/');
    }
    return pathname === path;
  };

  const isPlatformActive = (platform: string) => {
    return activePlatform === platform;
  };

  return (
    <aside className="w-64 h-screen border-r border-[var(--toolbar-border)] bg-[var(--sidebar-bg)] flex flex-col shrink-0">
      {/* Logo */}
      <div className="h-14 px-4 flex items-center border-b border-[var(--toolbar-border)]">
        <Link href="/" className="font-semibold text-lg hover:opacity-80 transition-opacity">
          ContentFlow
        </Link>
      </div>

      {/* New Post Button */}
      <div className="p-3">
        <button
          onClick={onNewPost}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-[var(--toolbar-border)] hover:bg-[var(--button-hover)] transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          New
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1">
        <Link
          href="/posts"
          className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
            isActive('/posts')
              ? 'bg-[var(--muted)] text-[var(--foreground)]'
              : 'text-[var(--muted-foreground)] hover:bg-[var(--button-hover)] hover:text-[var(--foreground)]'
          }`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          All Content
        </Link>

        <Link
          href="/weekly"
          className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
            isActive('/weekly')
              ? 'bg-[var(--muted)] text-[var(--foreground)]'
              : 'text-[var(--muted-foreground)] hover:bg-[var(--button-hover)] hover:text-[var(--foreground)]'
          }`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          Weekly
        </Link>

        <Link
          href="/settings"
          className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
            isActive('/settings')
              ? 'bg-[var(--muted)] text-[var(--foreground)]'
              : 'text-[var(--muted-foreground)] hover:bg-[var(--button-hover)] hover:text-[var(--foreground)]'
          }`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
          Settings
        </Link>

        <Link
          href="/posts?platform=doc"
          className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
            isPlatformActive('doc')
              ? 'bg-[var(--muted)] text-[var(--foreground)]'
              : 'text-[var(--muted-foreground)] hover:bg-[var(--button-hover)] hover:text-[var(--foreground)]'
          }`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
          Docs
        </Link>

        {/* Divider */}
        <div className="my-4 border-t border-[var(--toolbar-border)]" />

        {/* Platform Filters Section */}
        <div className="px-3 py-2">
          <span className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
            Platforms
          </span>
        </div>

        {([
          { platform: 'linkedin' as Platform, label: `LinkedIn ${PLATFORM_CONTENT_LABELS.linkedin.plural}`, icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
            </svg>
          )},
          { platform: 'youtube' as Platform, label: `YouTube ${PLATFORM_CONTENT_LABELS.youtube.plural}`, icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 19c-4.19 0-6.8-.16-7.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83.25-.9.83-1.48 1.73-1.73.47-.13 1.33-.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 5c4.19 0 6.8.16 7.83.44.9.25 1.48.83 1.73 1.73z" />
            </svg>
          )},
          { platform: 'newsletter' as Platform, label: `Newsletter ${PLATFORM_CONTENT_LABELS.newsletter.plural}`, icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          )},
          { platform: 'twitter' as Platform, label: `${PLATFORM_CONTENT_LABELS.twitter.plural}`, icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          )},
          { platform: 'instagram' as Platform, label: `Instagram ${PLATFORM_CONTENT_LABELS.instagram.plural}`, icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <circle cx="12" cy="12" r="5" />
              <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
            </svg>
          )},
          { platform: 'tiktok' as Platform, label: `TikTok ${PLATFORM_CONTENT_LABELS.tiktok.plural}`, icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16.6 5.82s.51.5 0 0A4.278 4.278 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6 0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64 0 3.13 2.56 5.67 5.7 5.67 3.14 0 5.68-2.55 5.68-5.68V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48z" />
            </svg>
          )},
        ]).map(({ platform, label, icon }) => (
          <Link
            key={platform}
            href={`/posts?platform=${platform}`}
            className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
              isPlatformActive(platform)
                ? 'bg-[var(--muted)] text-[var(--foreground)]'
                : 'text-[var(--muted-foreground)] hover:bg-[var(--button-hover)] hover:text-[var(--foreground)]'
            }`}
          >
            {icon}
            {label}
          </Link>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="p-3 border-t border-[var(--toolbar-border)]">
        <ThemeToggle />
      </div>
    </aside>
  );
}

export default function Sidebar({ onNewPost }: SidebarProps) {
  return (
    <Suspense fallback={
      <aside className="w-64 h-screen border-r border-[var(--toolbar-border)] bg-[var(--sidebar-bg)] flex flex-col shrink-0" />
    }>
      <SidebarContent onNewPost={onNewPost} />
    </Suspense>
  );
}

function ThemeToggle() {
  const handleToggle = () => {
    const isDark = document.documentElement.classList.contains('dark');
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('contentflow-theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('contentflow-theme', 'dark');
    }
  };

  return (
    <button
      onClick={handleToggle}
      className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg text-[var(--muted-foreground)] hover:bg-[var(--button-hover)] hover:text-[var(--foreground)] transition-colors"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="dark:hidden">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="hidden dark:block">
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
      <span className="dark:hidden">Dark mode</span>
      <span className="hidden dark:block">Light mode</span>
    </button>
  );
}
