'use client';

import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { Trash2 } from 'lucide-react';
import { Post, PLATFORM_LABELS } from '../types/content';
import { formatDate } from '../utils/feed';
import { getPlatformIcons } from '../utils/platform-icons';
import { StatusBadge } from './StatusSelector';

interface PostCardProps {
  post: Post;
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

const PLATFORM_ICONS = getPlatformIcons(14);

export default function PostCard({ post, onClick, onDelete }: PostCardProps) {
  const plainText = post.body ? stripHtml(post.body) : '';
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
      className="post-card group relative cursor-pointer p-6 rounded-lg border border-[var(--toolbar-border)] hover:bg-[var(--button-hover)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-2 focus:ring-offset-[var(--background)]"
    >
      <AlertDialog.Root>
        <AlertDialog.Trigger asChild>
          <button
            onClick={(e) => e.stopPropagation()}
            className="absolute top-4 right-4 p-2 rounded-md text-[var(--muted-foreground)] hover:text-red-500 hover:bg-red-500/10 transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            aria-label="Delete post"
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
              Delete post?
            </AlertDialog.Title>
            <AlertDialog.Description className="mt-2 text-sm text-[var(--muted-foreground)]">
              This action cannot be undone. This post will be permanently deleted.
            </AlertDialog.Description>
            <div className="mt-6 flex justify-end gap-3">
              <AlertDialog.Cancel asChild>
                <button className="px-4 py-2 text-sm font-medium rounded-md border border-[var(--toolbar-border)] text-[var(--foreground)] hover:bg-[var(--button-hover)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ring)]">
                  Cancel
                </button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <button
                  onClick={() => onDelete(post.id)}
                  className="px-4 py-2 text-sm font-medium rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-[var(--background)]"
                >
                  Delete
                </button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>

      <div className="flex items-center justify-between mb-3 pr-10">
        <div className="flex items-center gap-3">
          <span className="text-sm text-[var(--muted-foreground)]">
            {formatDate(post.createdAt)}
          </span>
          {post.platform && (
            <span className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
              {PLATFORM_ICONS[post.platform]}
              <span>{PLATFORM_LABELS[post.platform]}</span>
            </span>
          )}
        </div>
        <StatusBadge status={post.status} size="sm" />
      </div>

      {post.title && (
        <p className="font-medium text-[var(--foreground)] mb-1 pr-10">{post.title}</p>
      )}

      <p className="text-[var(--foreground)] leading-relaxed pr-10">
        {preview || <span className="text-[var(--muted-foreground)]">Empty post</span>}
      </p>
    </div>
  );
}
