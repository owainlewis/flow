'use client';

import { useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { PlatformEditorProps } from './types';
import { CharCount } from './CharCount';
import MediaUpload from '../MediaUpload';
import { MediaAttachment } from '../../types/content';

export default function YouTubeEditor({ post, onBodyChange, onFieldChange, onEditorReady, initialBody }: PlatformEditorProps) {
  const initializedRef = useRef(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        codeBlock: false,
        code: false,
        horizontalRule: false,
        dropcursor: false,
        gapcursor: false,
      }),
      Placeholder.configure({
        placeholder: 'Write your script...',
      }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'editor-content outline-none min-h-[200px]',
      },
    },
    onUpdate: ({ editor }) => {
      onBodyChange(editor.getHTML());
    },
  });

  useEffect(() => {
    onEditorReady?.(editor ?? null);
    return () => onEditorReady?.(null);
  }, [editor, onEditorReady]);

  useEffect(() => {
    if (editor && !initializedRef.current && initialBody !== undefined) {
      initializedRef.current = true;
      editor.commands.setContent(initialBody || '');
      editor.commands.focus('end');
    }
  }, [editor, initialBody]);

  return (
    <div className="max-w-[700px] mx-auto p-8 space-y-6">
      {/* Video title */}
      <div>
        <input
          type="text"
          value={post.title || ''}
          onChange={(e) => onFieldChange({ title: e.target.value })}
          placeholder="Video title"
          className="w-full text-2xl font-semibold bg-transparent border-none outline-none placeholder:text-[var(--placeholder-color)] text-[var(--foreground)]"
        />
        <div className="mt-1">
          <CharCount current={post.title?.length || 0} limit={100} />
        </div>
      </div>

      {/* Thumbnail */}
      <MediaUpload
        mode="single"
        media={(post.media || []).filter((m: MediaAttachment) => m.caption === 'thumbnail')}
        onChange={(media: MediaAttachment[]) => {
          const other = (post.media || []).filter((m: MediaAttachment) => m.caption !== 'thumbnail');
          onFieldChange({ media: [...other, ...media.map((m: MediaAttachment) => ({ ...m, caption: 'thumbnail' }))] });
        }}
        label="Thumbnail"
      />

      {/* Video description */}
      <div>
        <label className="block text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider mb-2">
          Video description
        </label>
        <textarea
          value={post.description || ''}
          onChange={(e) => onFieldChange({ description: e.target.value })}
          placeholder="Video description for YouTube"
          rows={4}
          className="w-full text-sm bg-transparent border border-[var(--toolbar-border)] rounded-lg p-3 outline-none placeholder:text-[var(--placeholder-color)] text-[var(--foreground)] resize-y"
        />
        <div className="mt-1 text-right">
          <CharCount current={post.description?.length || 0} limit={5000} />
        </div>
      </div>

      {/* Hook */}
      <div>
        <label className="block text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider mb-2">
          Hook (first 30 seconds)
        </label>
        <textarea
          value={post.hook || ''}
          onChange={(e) => onFieldChange({ hook: e.target.value })}
          placeholder="What grabs attention in the first 30 seconds?"
          rows={3}
          className="w-full text-sm bg-transparent border border-[var(--toolbar-border)] rounded-lg p-3 outline-none placeholder:text-[var(--placeholder-color)] text-[var(--foreground)] resize-y"
        />
      </div>

      {/* Script body (rich text) */}
      <div>
        <label className="block text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider mb-2">
          Script
        </label>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
