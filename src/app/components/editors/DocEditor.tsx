'use client';

import { useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { PLATFORM_FIELDS, PLATFORM_CHAR_LIMITS } from '../../types/content';
import { PlatformEditorProps } from './types';

export default function DocEditor({ post, onBodyChange, onFieldChange, onEditorReady, initialBody }: PlatformEditorProps) {
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
        placeholder: 'Start writing...',
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

  // Expose editor to parent
  useEffect(() => {
    onEditorReady?.(editor ?? null);
    return () => onEditorReady?.(null);
  }, [editor, onEditorReady]);

  // Initialize content once
  useEffect(() => {
    if (editor && !initializedRef.current && initialBody !== undefined) {
      initializedRef.current = true;
      editor.commands.setContent(initialBody || '');
      editor.commands.focus('end');
    }
  }, [editor, initialBody]);

  const platformFields = post.platform ? PLATFORM_FIELDS[post.platform] : undefined;
  const charLimits = post.platform ? PLATFORM_CHAR_LIMITS[post.platform] : undefined;

  return (
    <div className="max-w-[700px] mx-auto p-8">
      {/* Platform-specific title field */}
      {platformFields?.title && (
        <>
          <input
            type="text"
            value={post.title || ''}
            onChange={(e) => onFieldChange({ title: e.target.value })}
            placeholder={platformFields.title}
            className="w-full text-2xl font-semibold bg-transparent border-none outline-none placeholder:text-[var(--placeholder-color)] text-[var(--foreground)] mb-4"
          />
          {charLimits?.title && (
            <div className={`text-xs mb-3 ${
              (post.title?.length || 0) > charLimits.title
                ? 'text-red-500'
                : (post.title?.length || 0) > charLimits.title * 0.9
                  ? 'text-yellow-500'
                  : 'text-[var(--muted-foreground)]'
            }`}>
              {post.title?.length || 0}/{charLimits.title}
            </div>
          )}
        </>
      )}

      <EditorContent editor={editor} />

      {/* Platform-specific description field */}
      {platformFields?.description && (
        <div className="mt-6">
          <textarea
            value={post.description || ''}
            onChange={(e) => onFieldChange({ description: e.target.value })}
            placeholder={platformFields.description}
            rows={4}
            className="w-full text-sm bg-transparent border border-[var(--toolbar-border)] rounded-lg p-3 outline-none placeholder:text-[var(--placeholder-color)] text-[var(--foreground)] resize-y"
          />
          {charLimits?.description && (
            <div className={`text-xs mt-1 text-right ${
              (post.description?.length || 0) > charLimits.description
                ? 'text-red-500'
                : (post.description?.length || 0) > charLimits.description * 0.9
                  ? 'text-yellow-500'
                  : 'text-[var(--muted-foreground)]'
            }`}>
              {post.description?.length || 0}/{charLimits.description}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
