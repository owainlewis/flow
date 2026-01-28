'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const THEME_KEY = 'contentflow-theme';

export default function LandingPage() {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
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

  const handleStartWriting = useCallback(() => {
    router.push('/notes/new');
  }, [router]);

  const handleViewNotes = useCallback(() => {
    router.push('/notes');
  }, [router]);

  if (!isLoaded) {
    return null;
  }

  return (
    <div className="h-screen flex flex-col relative overflow-hidden">
      {/* Video background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover -z-20"
      >
        <source src="https://pixabay.com/videos/download/video-306155_medium.mp4" type="video/mp4" />
      </video>
      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-[var(--background)]/80 -z-10" />

      <nav className="h-14 px-4 flex items-center justify-between shrink-0">
        <Link href="/" className="font-semibold text-lg hover:opacity-80 transition-opacity">
          ContentFlow
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/notes" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
            Notes
          </Link>
          <Link href="/weekly" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
            Weekly
          </Link>
          <button
            onClick={handleToggleDarkMode}
            className="toolbar-button text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-2 focus:ring-offset-[var(--background)]"
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

      <main className="flex-1 flex items-center justify-center">
        <div className="max-w-[700px] mx-auto px-8 text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-semibold mb-6">
            Write. Organize. Publish.
          </h1>
          <p className="text-lg md:text-xl text-[var(--muted-foreground)] mb-2">
            A writing-first content creation tool for content creators.
          </p>
          <p className="text-sm text-[var(--muted-foreground)] mb-12">
            Track ideas from draft to published. Plan your content week.
          </p>

          <div className="flex flex-col items-center gap-4">
            <button
              onClick={handleStartWriting}
              className="toolbar-button text-base font-medium px-6 py-3 border border-[var(--toolbar-border)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-2 focus:ring-offset-[var(--background)]"
            >
              Start writing
            </button>
            <button
              onClick={handleViewNotes}
              className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            >
              Your notes &rarr;
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
