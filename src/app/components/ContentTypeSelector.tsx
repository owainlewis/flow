'use client';

import { useState, useEffect, useRef } from 'react';
import { Platform, PLATFORM_LABELS } from '../types/content';
import { getPlatformIcons } from '../utils/platform-icons';

interface ContentTypeSelectorProps {
  platform: Platform | null;
  onPlatformChange: (platform: Platform | null) => void;
}

const PLATFORMS: Platform[] = ['linkedin', 'youtube', 'newsletter', 'twitter', 'instagram', 'tiktok'];

const PLATFORM_ICONS = getPlatformIcons(16);

export default function ContentTypeSelector({
  platform,
  onPlatformChange,
}: ContentTypeSelectorProps) {
  const [showPlatformDropdown, setShowPlatformDropdown] = useState(false);
  const platformRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (platformRef.current && !platformRef.current.contains(event.target as Node)) {
        setShowPlatformDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
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
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--muted-foreground)]">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            <span>Doc</span>
          </>
        )}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--muted-foreground)]">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {showPlatformDropdown && (
        <div className="absolute top-full left-0 mt-1 bg-[var(--background)] border border-[var(--toolbar-border)] rounded-lg shadow-lg z-50 min-w-[160px]">
          <button
            onClick={() => {
              onPlatformChange(null);
              setShowPlatformDropdown(false);
            }}
            className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-[var(--muted)]/50 rounded-t-lg ${
              platform === null ? 'bg-[var(--muted)]/30' : ''
            }`}
          >
            <span className="text-[var(--muted-foreground)]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </span>
            <span>Doc</span>
          </button>
          {PLATFORMS.map((p) => (
            <button
              key={p}
              onClick={() => {
                onPlatformChange(p);
                setShowPlatformDropdown(false);
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-[var(--muted)]/50 last:rounded-b-lg ${
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
  );
}

