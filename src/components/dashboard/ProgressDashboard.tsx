'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Code, Layers, Users, MessageSquare, TrendingUp, Lightbulb } from 'lucide-react';
import {
  useProgressStore,
  getReadinessScore,
  getCategoryAverages,
  getScoreTrend,
  getWeakestCategory,
} from '@/lib/progress-store';

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-500';
  if (score >= 60) return 'text-yellow-500';
  if (score >= 40) return 'text-orange-500';
  return 'text-red-500';
}

function getStrokeColor(score: number): string {
  if (score >= 80) return 'stroke-green-500';
  if (score >= 60) return 'stroke-yellow-500';
  if (score >= 40) return 'stroke-orange-500';
  return 'stroke-red-500';
}

function getBarColor(score: number): string {
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-yellow-500';
  if (score >= 40) return 'bg-orange-500';
  return 'bg-red-500';
}

const CATEGORY_META: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  coding: { label: 'Coding', icon: <Code className="w-4 h-4" />, color: 'text-blue-400' },
  systemDesign: { label: 'System Design', icon: <Layers className="w-4 h-4" />, color: 'text-purple-400' },
  behavioral: { label: 'Behavioral', icon: <Users className="w-4 h-4" />, color: 'text-cyan-400' },
  communication: { label: 'Communication', icon: <MessageSquare className="w-4 h-4" />, color: 'text-pink-400' },
};

const RECOMMENDATIONS: Record<string, string> = {
  coding: 'Practice more coding problems. Focus on data structures and algorithms.',
  systemDesign: 'Try more system design topics. Discuss tradeoffs and scaling.',
  behavioral: 'Practice telling stories with the STAR method. Quantify your impact.',
  communication: 'Focus on explaining your thought process out loud while solving.',
};

export function ProgressDashboard() {
  const { completedInterviews } = useProgressStore();

  const readiness = useMemo(
    () => getReadinessScore(completedInterviews),
    [completedInterviews],
  );

  const categoryAvgs = useMemo(
    () => getCategoryAverages(completedInterviews),
    [completedInterviews],
  );

  const trend = useMemo(
    () => getScoreTrend(completedInterviews),
    [completedInterviews],
  );

  const weakest = useMemo(
    () => getWeakestCategory(completedInterviews),
    [completedInterviews],
  );

  // Circular progress values
  const circleRadius = 54;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const circleOffset = circleCircumference - (readiness / 100) * circleCircumference;

  // Trend chart max for normalizing bar heights
  const trendMax = trend.length > 0 ? Math.max(...trend, 1) : 1;

  if (completedInterviews.length === 0) {
    return (
      <Card className="bg-card">
        <CardContent className="flex flex-col items-center justify-center py-16 gap-4 text-center">
          <Lightbulb className="w-12 h-12 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-foreground">No sessions yet</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Complete a coding, system design, or behavioral interview to start
            tracking your progress and readiness score.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Readiness Score */}
      <Card className="bg-card flex flex-col items-center justify-center py-8">
        <div className="relative w-36 h-36">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r={circleRadius}
              fill="none"
              className="stroke-muted"
              strokeWidth="10"
            />
            <circle
              cx="60"
              cy="60"
              r={circleRadius}
              fill="none"
              className={getStrokeColor(readiness)}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circleCircumference}
              strokeDashoffset={circleOffset}
              style={{ transition: 'stroke-dashoffset 0.6s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-3xl font-bold ${getScoreColor(readiness)}`}>
              {readiness}
            </span>
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              / 100
            </span>
          </div>
        </div>
        <p className="mt-4 text-sm font-medium text-foreground">Interview Readiness</p>
        <p className="text-xs text-muted-foreground mt-1">
          Based on {completedInterviews.length} session{completedInterviews.length !== 1 ? 's' : ''}
        </p>
      </Card>

      {/* Category Breakdown */}
      <Card className="lg:col-span-2 bg-card">
        <CardHeader>
          <CardTitle className="text-foreground">Category Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(categoryAvgs).map(([key, score]) => {
            const meta = CATEGORY_META[key];
            if (!meta) return null;
            return (
              <div key={key} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className={`flex items-center gap-2 font-medium ${meta.color}`}>
                    {meta.icon}
                    {meta.label}
                  </span>
                  <span className="font-mono text-foreground">
                    {score > 0 ? `${score}%` : '--'}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${score > 0 ? getBarColor(score) : 'bg-muted'}`}
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Score Trend */}
      {trend.length > 1 && (
        <Card className="lg:col-span-2 bg-card">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              Score Trend (Last {trend.length} Sessions)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-1 h-32">
              {trend.map((score, i) => (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center gap-1"
                >
                  <span className="text-[10px] text-muted-foreground">{score}</span>
                  <div
                    className={`w-full rounded-t ${getBarColor(score)} transition-all duration-300`}
                    style={{ height: `${(score / trendMax) * 100}%`, minHeight: '4px' }}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommended Next */}
      {weakest && (
        <Card className="bg-card border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-yellow-400" />
              Recommended Next
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground/80">
              Your weakest area is{' '}
              <span className="font-medium text-foreground">
                {CATEGORY_META[weakest]?.label ?? weakest}
              </span>
              .
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {RECOMMENDATIONS[weakest] ?? 'Keep practicing to improve!'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
