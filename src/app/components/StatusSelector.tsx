'use client';

import { ContentStatus, STATUS_LABELS } from '../types/content';

interface StatusSelectorProps {
  value: ContentStatus;
  onChange: (status: ContentStatus) => void;
  size?: 'sm' | 'md';
}

const STATUS_COLORS: Record<ContentStatus, { bg: string; text: string; border: string }> = {
  idea: {
    bg: 'bg-gray-100 dark:bg-gray-800',
    text: 'text-gray-700 dark:text-gray-300',
    border: 'border-gray-300 dark:border-gray-600',
  },
  draft: {
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    text: 'text-yellow-700 dark:text-yellow-400',
    border: 'border-yellow-300 dark:border-yellow-700',
  },
  ready: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    text: 'text-blue-700 dark:text-blue-400',
    border: 'border-blue-300 dark:border-blue-700',
  },
  published: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    text: 'text-green-700 dark:text-green-400',
    border: 'border-green-300 dark:border-green-700',
  },
};

const STATUSES: ContentStatus[] = ['idea', 'draft', 'ready', 'published'];

export default function StatusSelector({ value, onChange, size = 'md' }: StatusSelectorProps) {
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';

  return (
    <div className="flex gap-1" role="radiogroup" aria-label="Content status">
      {STATUSES.map((status) => {
        const isSelected = value === status;
        const colors = STATUS_COLORS[status];

        return (
          <button
            key={status}
            onClick={() => onChange(status)}
            className={`
              ${sizeClasses}
              rounded-full
              font-medium
              transition-all
              border
              ${isSelected
                ? `${colors.bg} ${colors.text} ${colors.border}`
                : 'bg-transparent text-[var(--muted-foreground)] border-transparent hover:bg-[var(--muted)]/50'
              }
              focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-1
            `}
            role="radio"
            aria-checked={isSelected}
            aria-label={STATUS_LABELS[status]}
          >
            {STATUS_LABELS[status]}
          </button>
        );
      })}
    </div>
  );
}

export function StatusBadge({ status, size = 'sm' }: { status: ContentStatus; size?: 'sm' | 'md' }) {
  const colors = STATUS_COLORS[status];
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';

  return (
    <span
      className={`
        ${sizeClasses}
        ${colors.bg}
        ${colors.text}
        ${colors.border}
        border
        rounded-full
        font-medium
        inline-block
      `}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
