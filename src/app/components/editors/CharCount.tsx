interface CharCountProps {
  current: number;
  limit?: number;
  /** For range-based targets like newsletter subject lines */
  target?: { min: number; max: number };
}

export function CharCount({ current, limit, target }: CharCountProps) {
  let colorClass = 'text-[var(--muted-foreground)]';

  if (limit) {
    if (current > limit) colorClass = 'text-red-500';
    else if (current > limit * 0.9) colorClass = 'text-yellow-500';
  }

  if (target) {
    if (current >= target.min && current <= target.max) colorClass = 'text-green-600 dark:text-green-400';
    else if (current > target.max) colorClass = 'text-red-500';
    else if (current >= target.min * 0.8) colorClass = 'text-yellow-500';
  }

  const display = limit
    ? `${current}/${limit}`
    : target
      ? `${current} (target: ${target.min}-${target.max})`
      : `${current}`;

  return <span className={`text-xs ${colorClass}`}>{display}</span>;
}
