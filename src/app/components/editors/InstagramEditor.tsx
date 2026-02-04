'use client';

import { useState, useCallback } from 'react';
import { PlatformEditorProps } from './types';
import { CharCount } from './CharCount';
import MediaUpload from '../MediaUpload';
import { MediaAttachment } from '../../types/content';

const CAPTION_LIMIT = 2200;

export default function InstagramEditor({ post, onBodyChange, onFieldChange }: PlatformEditorProps) {
  const [isCarouselMode, setIsCarouselMode] = useState(false);
  // Carousel slide captions stored as a JSON array in the description field for now
  const [slides, setSlides] = useState<string[]>(() => {
    try {
      return post.description ? JSON.parse(post.description) : [];
    } catch {
      return [];
    }
  });

  const hashtags = post.hashtags || [];
  const hashtagCount = hashtags.length;

  const updateSlides = useCallback((updated: string[]) => {
    setSlides(updated);
    onFieldChange({ description: JSON.stringify(updated) });
  }, [onFieldChange]);

  const addSlide = useCallback(() => {
    updateSlides([...slides, '']);
  }, [slides, updateSlides]);

  const updateSlide = useCallback((index: number, value: string) => {
    updateSlides(slides.map((s, i) => (i === index ? value : s)));
  }, [slides, updateSlides]);

  const removeSlide = useCallback((index: number) => {
    updateSlides(slides.filter((_, i) => i !== index));
  }, [slides, updateSlides]);

  const moveSlide = useCallback((index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= slides.length) return;
    const updated = [...slides];
    [updated[index], updated[target]] = [updated[target], updated[index]];
    updateSlides(updated);
  }, [slides, updateSlides]);

  return (
    <div className="max-w-[700px] mx-auto p-8 space-y-6">
      {/* Caption */}
      <div>
        <label className="block text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider mb-2">
          Caption
        </label>
        <textarea
          value={post.body?.replace(/<[^>]*>/g, '') || ''}
          onChange={(e) => onBodyChange(e.target.value)}
          placeholder="Write your caption..."
          rows={6}
          className="w-full text-base bg-transparent border-none outline-none placeholder:text-[var(--placeholder-color)] text-[var(--foreground)] resize-y leading-relaxed"
        />
        <div className="text-right">
          <CharCount current={(post.body?.replace(/<[^>]*>/g, '') || '').length} limit={CAPTION_LIMIT} />
        </div>
      </div>

      {/* Post image (single mode) */}
      {!isCarouselMode && (
        <MediaUpload
          mode="single"
          media={post.media || []}
          onChange={(media: MediaAttachment[]) => onFieldChange({ media })}
          label="Post image"
        />
      )}

      {/* Hashtags */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
            Hashtags
          </label>
          <span className={`text-xs ${
            hashtagCount >= 5 && hashtagCount <= 15
              ? 'text-green-600 dark:text-green-400'
              : hashtagCount > 15
                ? 'text-red-500'
                : 'text-[var(--muted-foreground)]'
          }`}>
            {hashtagCount} tags {hashtagCount > 0 && `(target: 5-15)`}
          </span>
        </div>
        <input
          type="text"
          value={hashtags.join(', ')}
          onChange={(e) => {
            const tags = e.target.value.split(',').map((t) => t.trim()).filter(Boolean);
            onFieldChange({ hashtags: tags });
          }}
          placeholder="#hashtag1, #hashtag2, #hashtag3"
          className="w-full text-sm bg-transparent border border-[var(--toolbar-border)] rounded-lg px-3 py-2 outline-none placeholder:text-[var(--placeholder-color)] text-[var(--foreground)]"
        />
      </div>

      {/* Carousel toggle */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
          {isCarouselMode ? `Carousel (${slides.length} slides)` : 'Single post'}
        </span>
        <button
          onClick={() => {
            setIsCarouselMode(!isCarouselMode);
            if (!isCarouselMode && slides.length === 0) {
              updateSlides(['']);
            }
          }}
          className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
            isCarouselMode
              ? 'bg-[var(--foreground)] text-[var(--background)]'
              : 'border border-[var(--toolbar-border)] text-[var(--muted-foreground)] hover:bg-[var(--button-hover)]'
          }`}
        >
          {isCarouselMode ? 'Carousel on' : 'Carousel off'}
        </button>
      </div>

      {/* Carousel slides */}
      {isCarouselMode && (
        <div className="space-y-3">
          {slides.map((slide, i) => (
            <div key={i} className="border border-[var(--toolbar-border)] rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[var(--muted-foreground)]">
                  Slide {i + 1}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => moveSlide(i, -1)}
                    disabled={i === 0}
                    className="p-1 rounded text-[var(--muted-foreground)] hover:text-[var(--foreground)] disabled:opacity-30 transition-colors"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="18 15 12 9 6 15" />
                    </svg>
                  </button>
                  <button
                    onClick={() => moveSlide(i, 1)}
                    disabled={i === slides.length - 1}
                    className="p-1 rounded text-[var(--muted-foreground)] hover:text-[var(--foreground)] disabled:opacity-30 transition-colors"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                  <button
                    onClick={() => removeSlide(i)}
                    className="p-1 rounded text-[var(--muted-foreground)] hover:text-red-500 transition-colors"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              </div>
              {/* Slide image */}
              <div className="mb-2">
                <MediaUpload
                  mode="single"
                  media={(post.media || []).filter((m: MediaAttachment) => m.caption === `slide-${i}`)}
                  onChange={(media: MediaAttachment[]) => {
                    const other = (post.media || []).filter((m: MediaAttachment) => m.caption !== `slide-${i}`);
                    onFieldChange({ media: [...other, ...media.map((m: MediaAttachment) => ({ ...m, caption: `slide-${i}` }))] });
                  }}
                />
              </div>
              <input
                type="text"
                value={slide}
                onChange={(e) => updateSlide(i, e.target.value)}
                placeholder="Slide caption (optional)"
                className="w-full text-sm bg-transparent border-none outline-none placeholder:text-[var(--placeholder-color)] text-[var(--foreground)]"
              />
            </div>
          ))}
          <button
            onClick={addSlide}
            className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
          >
            + Add slide
          </button>
        </div>
      )}
    </div>
  );
}
