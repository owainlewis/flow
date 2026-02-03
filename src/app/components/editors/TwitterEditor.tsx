'use client';

import { useState, useCallback } from 'react';
import { PlatformEditorProps } from './types';
import { CharCount } from './CharCount';

const TWEET_LIMIT = 280;

export default function TwitterEditor({ post, onBodyChange, onFieldChange }: PlatformEditorProps) {
  const [isThreadMode, setIsThreadMode] = useState(() => (post.threadSegments?.length || 0) > 0);

  const segments = post.threadSegments || [''];

  const toggleThreadMode = useCallback(() => {
    if (isThreadMode) {
      // Switching to single mode — merge segments into body
      const merged = segments.join('\n\n');
      onBodyChange(merged);
      onFieldChange({ threadSegments: undefined });
      setIsThreadMode(false);
    } else {
      // Switching to thread mode — move body to first segment
      const bodyText = post.body?.replace(/<[^>]*>/g, '') || '';
      onFieldChange({ threadSegments: [bodyText] });
      setIsThreadMode(true);
    }
  }, [isThreadMode, segments, post.body, onBodyChange, onFieldChange]);

  const updateSegment = useCallback((index: number, value: string) => {
    const updated = segments.map((s, i) => (i === index ? value : s));
    onFieldChange({ threadSegments: updated });
  }, [segments, onFieldChange]);

  const addSegment = useCallback(() => {
    onFieldChange({ threadSegments: [...segments, ''] });
  }, [segments, onFieldChange]);

  const removeSegment = useCallback((index: number) => {
    if (segments.length <= 1) return;
    onFieldChange({ threadSegments: segments.filter((_, i) => i !== index) });
  }, [segments, onFieldChange]);

  const moveSegment = useCallback((index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= segments.length) return;
    const updated = [...segments];
    [updated[index], updated[target]] = [updated[target], updated[index]];
    onFieldChange({ threadSegments: updated });
  }, [segments, onFieldChange]);

  return (
    <div className="max-w-[700px] mx-auto p-8 space-y-4">
      {/* Thread mode toggle */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
          {isThreadMode ? `Thread (${segments.length} tweets)` : 'Single tweet'}
        </span>
        <button
          onClick={toggleThreadMode}
          className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
            isThreadMode
              ? 'bg-[var(--foreground)] text-[var(--background)]'
              : 'border border-[var(--toolbar-border)] text-[var(--muted-foreground)] hover:bg-[var(--button-hover)]'
          }`}
        >
          {isThreadMode ? 'Thread on' : 'Thread off'}
        </button>
      </div>

      {isThreadMode ? (
        /* Thread mode */
        <div className="space-y-3">
          {segments.map((segment, i) => (
            <div key={i} className="border border-[var(--toolbar-border)] rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[var(--muted-foreground)]">
                  {i + 1}/{segments.length}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => moveSegment(i, -1)}
                    disabled={i === 0}
                    className="p-1 rounded text-[var(--muted-foreground)] hover:text-[var(--foreground)] disabled:opacity-30 transition-colors"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="18 15 12 9 6 15" />
                    </svg>
                  </button>
                  <button
                    onClick={() => moveSegment(i, 1)}
                    disabled={i === segments.length - 1}
                    className="p-1 rounded text-[var(--muted-foreground)] hover:text-[var(--foreground)] disabled:opacity-30 transition-colors"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                  {segments.length > 1 && (
                    <button
                      onClick={() => removeSegment(i)}
                      className="p-1 rounded text-[var(--muted-foreground)] hover:text-red-500 transition-colors"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              <textarea
                value={segment}
                onChange={(e) => updateSegment(i, e.target.value)}
                placeholder={i === 0 ? 'Start your thread...' : 'Continue...'}
                rows={3}
                className="w-full text-sm bg-transparent border-none outline-none placeholder:text-[var(--placeholder-color)] text-[var(--foreground)] resize-none"
              />
              <div className="text-right">
                <CharCount current={segment.length} limit={TWEET_LIMIT} />
              </div>
            </div>
          ))}
          <button
            onClick={addSegment}
            className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
          >
            + Add tweet
          </button>
        </div>
      ) : (
        /* Single tweet mode */
        <div>
          <textarea
            value={post.body?.replace(/<[^>]*>/g, '') || ''}
            onChange={(e) => onBodyChange(e.target.value)}
            placeholder="What's happening?"
            rows={6}
            className="w-full text-base bg-transparent border-none outline-none placeholder:text-[var(--placeholder-color)] text-[var(--foreground)] resize-none leading-relaxed"
          />
          <div className="text-right">
            <CharCount current={(post.body?.replace(/<[^>]*>/g, '') || '').length} limit={TWEET_LIMIT} />
          </div>
        </div>
      )}
    </div>
  );
}
