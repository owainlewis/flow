'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Post, PLATFORM_LABELS, getContentLabel } from '../types/content';
import { stripHtml, truncateText } from '../utils/feed';
import { StatusBadge } from './StatusSelector';

interface SourcePanelProps {
  source: Post;
}

export default function SourcePanel({ source }: SourcePanelProps) {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);

  const bodyPreview = truncateText(stripHtml(source.body || ''), 300);

  return (
    <div className="border border-[var(--toolbar-border)] rounded-lg mb-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-[var(--button-hover)] transition-colors rounded-lg"
      >
        <div className="flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--muted-foreground)]">
            <polyline points="17 1 21 5 17 9" />
            <path d="M3 11V9a4 4 0 0 1 4-4h14" />
          </svg>
          <span className="text-[var(--muted-foreground)]">Derived from</span>
          <span className="font-medium text-[var(--foreground)]">
            {source.title || truncateText(stripHtml(source.body || ''), 40) || `Untitled ${getContentLabel(source.platform)}`}
          </span>
          {source.platform && (
            <span className="text-xs text-[var(--muted-foreground)]">
              {PLATFORM_LABELS[source.platform]}
            </span>
          )}
        </div>
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          className={`text-[var(--muted-foreground)] transition-transform ${isExpanded ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-3">
          <div className="flex items-center gap-2">
            <StatusBadge status={source.status} size="sm" />
            {source.platform && (
              <span className="text-xs text-[var(--muted-foreground)]">
                {PLATFORM_LABELS[source.platform]} {getContentLabel(source.platform)}
              </span>
            )}
          </div>

          {source.title && (
            <p className="font-medium text-sm text-[var(--foreground)]">{source.title}</p>
          )}

          {source.hook && (
            <div>
              <span className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider">Hook</span>
              <p className="text-sm text-[var(--foreground)] mt-0.5">{source.hook}</p>
            </div>
          )}

          {bodyPreview && (
            <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">{bodyPreview}</p>
          )}

          {source.description && (
            <div>
              <span className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider">Description</span>
              <p className="text-sm text-[var(--muted-foreground)] mt-0.5">{truncateText(source.description, 200)}</p>
            </div>
          )}

          <button
            onClick={() => router.push(`/posts/${source.id}`)}
            className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors underline"
          >
            View source
          </button>
        </div>
      )}
    </div>
  );
}
