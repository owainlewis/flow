'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { loadFeed, saveFeed, createNote, countChars } from '../../utils/feed';

const THEME_KEY = 'contentflow-theme';

export default function NewNotePage() {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const hasContent = useRef(false);

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
      hasContent.current = editor.getText().trim().length > 0;
    },
  });

  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (editor && isLoaded) {
      editor.commands.focus('end');
    }
  }, [editor, isLoaded]);

  const handleSave = useCallback(() => {
    if (!editor) return;

    const content = editor.getHTML();
    const hasText = editor.getText().trim().length > 0;

    if (hasText) {
      const note = createNote(content);
      const feed = loadFeed();
      feed.items.unshift(note);
      saveFeed(feed);
      router.push(`/notes/${note.id}`);
    } else {
      router.push('/notes');
    }
  }, [editor, router]);

  const handleBack = useCallback(() => {
    router.push('/notes');
  }, [router]);

  const handleToggleDarkMode = useCallback(() => {
    setIsDarkMode((prev) => {
      const newValue = !prev;
      if (newValue) {
        document.documentElement.classList.add('dark');
        localStorage.setItem(THEME_KEY, 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem(THEME_KEY, 'light');
      }
      return newValue;
    });
  }, []);

  if (!isLoaded) {
    return null;
  }

  const charCount = editor ? countChars(editor.getHTML()) : 0;

  return (
    <div className="h-screen flex flex-col">
      <div className="toolbar h-14 px-4 flex items-center justify-between shrink-0">
        <button
          onClick={handleBack}
          className="toolbar-button text-sm font-medium flex items-center gap-1.5"
          title="Back to notes"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            className="toolbar-button text-sm font-medium flex items-center gap-1.5"
            title="Save note"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
            Save
          </button>
          <button
            onClick={handleToggleDarkMode}
            className="toolbar-button text-sm font-medium"
            title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? 'Light' : 'Dark'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="max-w-[700px] mx-auto p-8">
          <div className="mb-4 text-xs text-[var(--muted-foreground)] text-right">
            {charCount} chars
          </div>
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
}
