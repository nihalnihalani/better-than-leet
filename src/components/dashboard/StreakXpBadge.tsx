'use client';

import Link from 'next/link';
import { Flame, Zap } from 'lucide-react';
import { useProgressStore } from '@/lib/progress-store';

export function StreakXpBadge() {
  const { streak, xp, completedInterviews } = useProgressStore();

  // Don't render if user has no progress yet
  if (completedInterviews.length === 0) return null;

  return (
    <Link
      href="/dashboard"
      className="hidden sm:inline-flex items-center gap-3 px-3 py-1.5 rounded-full bg-muted/60 hover:bg-muted transition-colors text-sm"
    >
      {streak.currentStreak > 0 && (
        <span className="inline-flex items-center gap-1 text-orange-500 font-medium">
          <Flame className="w-3.5 h-3.5" />
          {streak.currentStreak}d
        </span>
      )}
      <span className="inline-flex items-center gap-1 text-purple-500 font-medium">
        <Zap className="w-3.5 h-3.5" />
        {xp.toLocaleString()} XP
      </span>
    </Link>
  );
}
