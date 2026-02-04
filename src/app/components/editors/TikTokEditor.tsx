'use client';

import { PlatformEditorProps } from './types';
import { CharCount } from './CharCount';
import MediaUpload from '../MediaUpload';
import { MediaAttachment } from '../../types/content';

const CAPTION_LIMIT = 2200;

export default function TikTokEditor({ post, onBodyChange, onFieldChange }: PlatformEditorProps) {
  const hashtags = post.hashtags || [];

  return (
    <div className="max-w-[700px] mx-auto p-8 space-y-6">
      {/* Hook — prominently displayed */}
      <div>
        <label className="block text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider mb-2">
          Hook (first 1-3 seconds)
        </label>
        <textarea
          value={post.hook || ''}
          onChange={(e) => onFieldChange({ hook: e.target.value })}
          placeholder="What stops the scroll? The first thing your viewer hears..."
          rows={2}
          className="w-full text-lg font-medium bg-transparent border-none outline-none placeholder:text-[var(--placeholder-color)] text-[var(--foreground)] resize-none leading-relaxed"
        />
      </div>

      {/* Script body */}
      <div>
        <label className="block text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider mb-2">
          Script
        </label>
        <textarea
          value={post.body?.replace(/<[^>]*>/g, '') || ''}
          onChange={(e) => onBodyChange(e.target.value)}
          placeholder="Write your script in a conversational tone..."
          rows={10}
          className="w-full text-base bg-transparent border-none outline-none placeholder:text-[var(--placeholder-color)] text-[var(--foreground)] resize-y leading-relaxed"
        />
      </div>

      {/* Caption */}
      <div>
        <label className="block text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider mb-2">
          Caption
        </label>
        <textarea
          value={post.description || ''}
          onChange={(e) => onFieldChange({ description: e.target.value })}
          placeholder="Caption for your TikTok..."
          rows={3}
          className="w-full text-sm bg-transparent border border-[var(--toolbar-border)] rounded-lg p-3 outline-none placeholder:text-[var(--placeholder-color)] text-[var(--foreground)] resize-y"
        />
        <div className="mt-1 text-right">
          <CharCount current={post.description?.length || 0} limit={CAPTION_LIMIT} />
        </div>
      </div>

      {/* Hashtags */}
      <div>
        <label className="block text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider mb-2">
          Hashtags
        </label>
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

      {/* Cover image */}
      <MediaUpload
        mode="single"
        media={post.media || []}
        onChange={(media: MediaAttachment[]) => onFieldChange({ media })}
        label="Cover image"
      />
    </div>
  );
}
