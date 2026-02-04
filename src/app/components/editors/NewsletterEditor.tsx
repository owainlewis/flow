'use client';

import { useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { PlatformEditorProps } from './types';
import { CharCount } from './CharCount';
import MediaUpload from '../MediaUpload';
import { MediaAttachment } from '../../types/content';

export default function NewsletterEditor({ post, onBodyChange, onFieldChange, onEditorReady, initialBody }: PlatformEditorProps) {
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
        placeholder: 'Write your edition...',
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
      {/* Subject line */}
      <div>
        <input
          type="text"
          value={post.subjectLine || ''}
          onChange={(e) => onFieldChange({ subjectLine: e.target.value })}
          placeholder="Subject line"
          className="w-full text-2xl font-semibold bg-transparent border-none outline-none placeholder:text-[var(--placeholder-color)] text-[var(--foreground)]"
        />
        <div className="mt-1">
          <CharCount current={post.subjectLine?.length || 0} target={{ min: 40, max: 60 }} />
        </div>
      </div>

      {/* Preheader */}
      <div>
        <input
          type="text"
          value={post.preheader || ''}
          onChange={(e) => onFieldChange({ preheader: e.target.value })}
          placeholder="Preheader — preview text shown in inbox"
          className="w-full text-sm bg-transparent border-none outline-none placeholder:text-[var(--placeholder-color)] text-[var(--muted-foreground)]"
        />
        <div className="mt-1">
          <CharCount current={post.preheader?.length || 0} target={{ min: 40, max: 100 }} />
        </div>
      </div>

      {/* Header image */}
      <MediaUpload
        mode="single"
        media={(post.media || []).filter((m: MediaAttachment) => m.caption === 'header')}
        onChange={(media: MediaAttachment[]) => {
          const other = (post.media || []).filter((m: MediaAttachment) => m.caption !== 'header');
          onFieldChange({ media: [...other, ...media.map((m: MediaAttachment) => ({ ...m, caption: 'header' }))] });
        }}
        label="Header image"
      />

      {/* Body (rich text) */}
      <EditorContent editor={editor} />
    </div>
  );
}
