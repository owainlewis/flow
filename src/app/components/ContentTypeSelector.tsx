'use client';

import { useState, useEffect, useRef } from 'react';
import { Platform, PLATFORM_LABELS, UserFormats } from '../types/content';
import { loadUserFormats, addUserFormat } from '../utils/feed';

interface ContentTypeSelectorProps {
  platform: Platform | null;
  format: string | null;
  onPlatformChange: (platform: Platform | null) => void;
  onFormatChange: (format: string | null) => void;
}

const PLATFORMS: Platform[] = ['linkedin', 'youtube', 'newsletter', 'twitter', 'other'];

const PLATFORM_ICONS: Record<Platform, React.ReactNode> = {
  linkedin: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
    </svg>
  ),
  youtube: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 19c-4.19 0-6.8-.16-7.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83.25-.9.83-1.48 1.73-1.73.47-.13 1.33-.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 5c4.19 0 6.8.16 7.83.44.9.25 1.48.83 1.73 1.73z" />
    </svg>
  ),
  newsletter: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  ),
  twitter: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  other: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  ),
};

export default function ContentTypeSelector({
  platform,
  format,
  onPlatformChange,
  onFormatChange,
}: ContentTypeSelectorProps) {
  const [userFormats, setUserFormats] = useState<UserFormats | null>(null);
  const [showPlatformDropdown, setShowPlatformDropdown] = useState(false);
  const [showFormatDropdown, setShowFormatDropdown] = useState(false);
  const [newFormatInput, setNewFormatInput] = useState('');
  const [showNewFormatInput, setShowNewFormatInput] = useState(false);
  const platformRef = useRef<HTMLDivElement>(null);
  const formatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUserFormats(loadUserFormats());
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (platformRef.current && !platformRef.current.contains(event.target as Node)) {
        setShowPlatformDropdown(false);
      }
      if (formatRef.current && !formatRef.current.contains(event.target as Node)) {
        setShowFormatDropdown(false);
        setShowNewFormatInput(false);
        setNewFormatInput('');
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddNewFormat = () => {
    if (!newFormatInput.trim() || !platform) return;
    const updatedFormats = addUserFormat(platform, newFormatInput.trim());
    setUserFormats(updatedFormats);
    onFormatChange(newFormatInput.trim());
    setNewFormatInput('');
    setShowNewFormatInput(false);
    setShowFormatDropdown(false);
  };

  const availableFormats = platform && userFormats ? userFormats[platform] : [];

  return (
    <div className="flex items-center gap-3">
      {/* Platform selector */}
      <div className="relative" ref={platformRef}>
        <button
          onClick={() => setShowPlatformDropdown(!showPlatformDropdown)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm border border-[var(--toolbar-border)] rounded-lg hover:bg-[var(--muted)]/50 transition-colors"
        >
          {platform ? (
            <>
              <span className="text-[var(--muted-foreground)]">{PLATFORM_ICONS[platform]}</span>
              <span>{PLATFORM_LABELS[platform]}</span>
            </>
          ) : (
            <span className="text-[var(--muted-foreground)]">Select platform</span>
          )}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--muted-foreground)]">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>

        {showPlatformDropdown && (
          <div className="absolute top-full left-0 mt-1 bg-[var(--background)] border border-[var(--toolbar-border)] rounded-lg shadow-lg z-50 min-w-[160px]">
            {PLATFORMS.map((p) => (
              <button
                key={p}
                onClick={() => {
                  onPlatformChange(p);
                  if (platform !== p) onFormatChange(null);
                  setShowPlatformDropdown(false);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-[var(--muted)]/50 first:rounded-t-lg last:rounded-b-lg ${
                  platform === p ? 'bg-[var(--muted)]/30' : ''
                }`}
              >
                <span className="text-[var(--muted-foreground)]">{PLATFORM_ICONS[p]}</span>
                <span>{PLATFORM_LABELS[p]}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Format selector (only shown when platform is selected) */}
      {platform && (
        <div className="relative" ref={formatRef}>
          <button
            onClick={() => setShowFormatDropdown(!showFormatDropdown)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm border border-[var(--toolbar-border)] rounded-lg hover:bg-[var(--muted)]/50 transition-colors"
          >
            <span className={format ? '' : 'text-[var(--muted-foreground)]'}>
              {format || 'Select format'}
            </span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--muted-foreground)]">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>

          {showFormatDropdown && (
            <div className="absolute top-full left-0 mt-1 bg-[var(--background)] border border-[var(--toolbar-border)] rounded-lg shadow-lg z-50 min-w-[160px]">
              {availableFormats.map((f) => (
                <button
                  key={f}
                  onClick={() => {
                    onFormatChange(f);
                    setShowFormatDropdown(false);
                  }}
                  className={`w-full px-3 py-2 text-sm text-left hover:bg-[var(--muted)]/50 first:rounded-t-lg ${
                    format === f ? 'bg-[var(--muted)]/30' : ''
                  }`}
                >
                  {f}
                </button>
              ))}

              {showNewFormatInput ? (
                <div className="px-2 py-2 border-t border-[var(--toolbar-border)]">
                  <input
                    type="text"
                    value={newFormatInput}
                    onChange={(e) => setNewFormatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddNewFormat();
                      if (e.key === 'Escape') {
                        setShowNewFormatInput(false);
                        setNewFormatInput('');
                      }
                    }}
                    placeholder="Format name..."
                    className="w-full px-2 py-1 text-sm border border-[var(--toolbar-border)] rounded bg-transparent focus:outline-none focus:ring-1 focus:ring-[var(--ring)]"
                    autoFocus
                  />
                </div>
              ) : (
                <button
                  onClick={() => setShowNewFormatInput(true)}
                  className="w-full px-3 py-2 text-sm text-left text-[var(--muted-foreground)] hover:bg-[var(--muted)]/50 border-t border-[var(--toolbar-border)] rounded-b-lg flex items-center gap-1"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  Add new format
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function PlatformBadge({ platform }: { platform: Platform }) {
  return (
    <span className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
      {PLATFORM_ICONS[platform]}
      <span>{PLATFORM_LABELS[platform]}</span>
    </span>
  );
}
