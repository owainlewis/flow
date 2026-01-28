'use client';

import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { Trash2 } from 'lucide-react';
import { Note, PLATFORM_LABELS } from '../types/content';
import { formatDate } from '../utils/feed';
import { StatusBadge } from './StatusSelector';

interface NoteCardProps {
  note: Note;
  onClick: () => void;
  onDelete: (id: string) => void;
}

function stripHtml(html: string): string {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
}

function truncateText(text: string, maxLength: number = 150): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return trimmed.slice(0, maxLength).trim() + '...';
}

const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  linkedin: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
    </svg>
  ),
  youtube: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 19c-4.19 0-6.8-.16-7.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83.25-.9.83-1.48 1.73-1.73.47-.13 1.33-.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 5c4.19 0 6.8.16 7.83.44.9.25 1.48.83 1.73 1.73z" />
    </svg>
  ),
  newsletter: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  ),
  twitter: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  other: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  ),
};

export default function NoteCard({ note, onClick, onDelete }: NoteCardProps) {
  const plainText = note.body ? stripHtml(note.body) : '';
  const preview = truncateText(plainText);

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className="note-card group relative cursor-pointer p-6 rounded-lg border border-[var(--toolbar-border)] hover:bg-[var(--button-hover)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-2 focus:ring-offset-[var(--background)]"
    >
      <AlertDialog.Root>
        <AlertDialog.Trigger asChild>
          <button
            onClick={(e) => e.stopPropagation()}
            className="absolute top-4 right-4 p-2 rounded-md text-[var(--muted-foreground)] hover:text-red-500 hover:bg-red-500/10 transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            aria-label="Delete note"
          >
            <Trash2 size={18} />
          </button>
        </AlertDialog.Trigger>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <AlertDialog.Content
            onClick={(e) => e.stopPropagation()}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-md rounded-lg bg-[var(--background)] border border-[var(--toolbar-border)] p-6 shadow-lg focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
          >
            <AlertDialog.Title className="text-lg font-semibold text-[var(--foreground)]">
              Delete note?
            </AlertDialog.Title>
            <AlertDialog.Description className="mt-2 text-sm text-[var(--muted-foreground)]">
              This action cannot be undone. This note will be permanently deleted.
            </AlertDialog.Description>
            <div className="mt-6 flex justify-end gap-3">
              <AlertDialog.Cancel asChild>
                <button className="px-4 py-2 text-sm font-medium rounded-md border border-[var(--toolbar-border)] text-[var(--foreground)] hover:bg-[var(--button-hover)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ring)]">
                  Cancel
                </button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <button
                  onClick={() => onDelete(note.id)}
                  className="px-4 py-2 text-sm font-medium rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-[var(--background)]"
                >
                  Delete
                </button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-sm text-[var(--muted-foreground)]">
            {formatDate(note.createdAt)}
          </span>
          {note.platform && (
            <span className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
              {PLATFORM_ICONS[note.platform]}
              <span>{PLATFORM_LABELS[note.platform]}</span>
              {note.format && <span className="text-[var(--muted-foreground)]/60">/ {note.format}</span>}
            </span>
          )}
        </div>
        <StatusBadge status={note.status} size="sm" />
      </div>

      <p className="text-[var(--foreground)] leading-relaxed pr-10">
        {preview || <span className="text-[var(--muted-foreground)]">Empty note</span>}
      </p>
    </div>
  );
}
