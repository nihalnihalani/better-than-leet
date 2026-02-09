'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Trophy, Flame, Zap, BarChart3 } from 'lucide-react';
import { useProgressStore } from '@/lib/progress-store';

export function StatsCards() {
  const { completedInterviews, streak, xp } = useProgressStore();

  const totalInterviews = completedInterviews.length;
  const avgScore =
    totalInterviews > 0
      ? Math.round(
          completedInterviews.reduce((s, i) => s + i.score, 0) / totalInterviews,
        )
      : 0;

  const stats = [
    {
      label: 'Total Sessions',
      value: totalInterviews,
      icon: BarChart3,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'Average Score',
      value: totalInterviews > 0 ? `${avgScore}%` : '--',
      icon: Trophy,
      color: 'text-yellow-500',
      bg: 'bg-yellow-500/10',
    },
    {
      label: 'Current Streak',
      value: `${streak.currentStreak}d`,
      icon: Flame,
      color: 'text-orange-500',
      bg: 'bg-orange-500/10',
    },
    {
      label: 'Total XP',
      value: xp.toLocaleString(),
      icon: Zap,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="bg-card">
          <CardContent className="pt-6 flex flex-col items-center gap-2">
            <div className={`p-2 rounded-lg ${stat.bg}`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div className="text-2xl font-bold text-foreground">{stat.value}</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">
              {stat.label}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
