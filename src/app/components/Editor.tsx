'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect, useRef, useCallback } from 'react';
import { countChars, formatDate } from '../utils/feed';

interface EditorProps {
  content: string;
  createdAt: number;
  onSave: (content: string) => void;
  onCancel: () => void;
  autoFocus?: boolean;
}

export default function Editor({ content, createdAt, onSave, onCancel, autoFocus = true }: EditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const hasChanges = useRef(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
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
    content: content || '',
    editorProps: {
      attributes: {
        class: 'editor-content outline-none',
      },
    },
    onUpdate: () => {
      hasChanges.current = true;
    },
  });

  const handleSave = useCallback(() => {
    if (editor) {
      onSave(editor.getHTML());
    }
  }, [editor, onSave]);

  // Handle click outside to save
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        handleSave();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleSave]);

  // Handle Escape key to save
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleSave();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleSave]);

  // Focus editor on mount
  useEffect(() => {
    if (editor && autoFocus) {
      editor.commands.focus('end');
    }
  }, [editor, autoFocus]);

  const charCount = editor ? countChars(editor.getHTML()) : 0;

  return (
    <div
      ref={containerRef}
      className="note-card p-6 rounded-lg border-2 border-blue-500 bg-[var(--background)]"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm text-[var(--muted-foreground)]">
          {formatDate(createdAt)}
        </div>
        <div className="text-xs text-[var(--muted-foreground)]">
          {charCount} chars
        </div>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
