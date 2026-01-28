'use client';

import Link from 'next/link';

interface ToolbarProps {
  isDarkMode: boolean;
  onNewNote: () => void;
  onToggleDarkMode: () => void;
}

export default function Toolbar({
  isDarkMode,
  onNewNote,
  onToggleDarkMode,
}: ToolbarProps) {
  return (
    <nav className="toolbar h-14 px-4 flex items-center justify-between shrink-0" role="navigation" aria-label="Main navigation">
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
          onClick={onNewNote}
          className="toolbar-button text-sm font-medium flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-2 focus:ring-offset-[var(--toolbar-bg)]"
          aria-label="Create new note"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M12 5v14M5 12h14" />
          </svg>
          New
        </button>
        <button
          onClick={onToggleDarkMode}
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
  );
}
