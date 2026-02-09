'use client';

import { useMemo, useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProgressStore, xpForSession } from '@/lib/progress-store';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  CheckCircle,
  Clock,
  Copy,
  Check,
  BarChart3,
  MessageSquare,
  Target,
  ClipboardList,
  Zap,
  TrendingUp,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import { useBehavioralStore } from '@/lib/behavioral-store';
import { getBehavioralTopic } from '@/data/behavioral-topics';
import { SpeechAnalyticsPanel, getSpeechAnalyticsSummary } from '@/components/analytics/SpeechAnalyticsPanel';

interface BehavioralReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface CategoryScore {
  label: string;
  score: number;
  weight: number;
  icon: React.ReactNode;
  color: string;
}

function calcSituationScore(transcriptText: string): number {
  const keywords = [
    'team', 'project', 'company', 'role', 'department', 'client', 'customer',
    'manager', 'quarter', 'year', 'deadline', 'launch', 'sprint', 'organization',
    'startup', 'enterprise', 'environment', 'context', 'background',
  ];
  const lower = transcriptText.toLowerCase();
  const hits = keywords.filter((k) => lower.includes(k)).length;
  return Math.min(100, Math.round((hits / 8) * 100));
}

function calcTaskScore(transcriptText: string): number {
  const keywords = [
    'responsible', 'my role', 'i was', 'i had to', 'my job', 'tasked',
    'assigned', 'goal', 'objective', 'challenge', 'needed to', 'expected',
    'deliver', 'accountable', 'ownership',
  ];
  const lower = transcriptText.toLowerCase();
  const hits = keywords.filter((k) => lower.includes(k)).length;
  return Math.min(100, Math.round((hits / 7) * 100));
}

function calcActionScore(transcriptText: string): number {
  const keywords = [
    'i decided', 'i created', 'i built', 'i spoke', 'i organized', 'i led',
    'i researched', 'i proposed', 'i implemented', 'i scheduled', 'i prioritized',
    'i reached out', 'i analyzed', 'i designed', 'first i', 'then i', 'my approach',
    'i personally', 'i took', 'i initiated',
  ];
  const lower = transcriptText.toLowerCase();
  const hits = keywords.filter((k) => lower.includes(k)).length;
  return Math.min(100, Math.round((hits / 8) * 100));
}

function calcResultScore(transcriptText: string): number {
  const keywords = [
    'result', 'outcome', 'impact', 'improved', 'increased', 'reduced', 'saved',
    'percent', '%', 'revenue', 'growth', 'shipped', 'launched', 'delivered',
    'feedback', 'promoted', 'recognized', 'learned', 'milestone',
  ];
  const lower = transcriptText.toLowerCase();
  const hits = keywords.filter((k) => lower.includes(k)).length;
  return Math.min(100, Math.round((hits / 7) * 100));
}

function calcCommunicationScore(
  messageCount: number,
  avgMessageLength: number,
): number {
  const countScore = Math.min(50, Math.round((messageCount / 15) * 50));
  const lengthScore = Math.min(50, Math.round((avgMessageLength / 150) * 50));
  return countScore + lengthScore;
}

function getOverallScoreColor(score: number): string {
  if (score >= 80) return 'text-green-500';
  if (score >= 60) return 'text-yellow-500';
  if (score >= 40) return 'text-orange-500';
  return 'text-red-500';
}

function getOverallStrokeColor(score: number): string {
  if (score >= 80) return 'stroke-green-500';
  if (score >= 60) return 'stroke-yellow-500';
  if (score >= 40) return 'stroke-orange-500';
  return 'stroke-red-500';
}

function getProgressBarColor(score: number): string {
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-yellow-500';
  if (score >= 40) return 'bg-orange-500';
  return 'bg-red-500';
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes === 0) return `${seconds}s`;
  return `${minutes}m ${seconds}s`;
}

export function BehavioralReportDialog({
  open,
  onOpenChange,
}: BehavioralReportDialogProps) {
  const router = useRouter();

  const {
    transcript,
    selectedTopicId,
    interviewStartTime,
  } = useBehavioralStore();

  const topic = selectedTopicId ? getBehavioralTopic(selectedTopicId) : undefined;

  const userMessages = useMemo(
    () => transcript.filter((m) => m.speaker === 'user'),
    [transcript],
  );

  const userTranscriptText = useMemo(
    () => userMessages.map((m) => m.message).join(' '),
    [userMessages],
  );

  const avgMessageLength = useMemo(() => {
    if (userMessages.length === 0) return 0;
    const totalLen = userMessages.reduce((sum, m) => sum + m.message.length, 0);
    return Math.round(totalLen / userMessages.length);
  }, [userMessages]);

  const timeSpentRef = useRef(0);
  if (open && interviewStartTime && timeSpentRef.current === 0) {
    timeSpentRef.current = Date.now() - interviewStartTime;
  }
  useEffect(() => {
    if (!open) timeSpentRef.current = 0;
  }, [open]);
  const timeSpent = timeSpentRef.current;

  const categoryScores: CategoryScore[] = useMemo(
    () => [
      {
        label: 'Situation Clarity',
        score: calcSituationScore(userTranscriptText),
        weight: 0.2,
        icon: <Target className="w-4 h-4" />,
        color: 'text-blue-400',
      },
      {
        label: 'Task Definition',
        score: calcTaskScore(userTranscriptText),
        weight: 0.2,
        icon: <ClipboardList className="w-4 h-4" />,
        color: 'text-purple-400',
      },
      {
        label: 'Action Specificity',
        score: calcActionScore(userTranscriptText),
        weight: 0.25,
        icon: <Zap className="w-4 h-4" />,
        color: 'text-cyan-400',
      },
      {
        label: 'Result Impact',
        score: calcResultScore(userTranscriptText),
        weight: 0.2,
        icon: <TrendingUp className="w-4 h-4" />,
        color: 'text-yellow-400',
      },
      {
        label: 'Communication',
        score: calcCommunicationScore(userMessages.length, avgMessageLength),
        weight: 0.15,
        icon: <MessageSquare className="w-4 h-4" />,
        color: 'text-pink-400',
      },
    ],
    [userTranscriptText, userMessages.length, avgMessageLength],
  );

  const overallScore = useMemo(() => {
    const weighted = categoryScores.reduce(
      (acc, c) => acc + c.score * c.weight,
      0,
    );
    return Math.round(weighted);
  }, [categoryScores]);

  // Save to progress (once)
  const savedToProgressRef = useRef(false);
  useEffect(() => {
    if (!open || savedToProgressRef.current || overallScore === 0) return;
    savedToProgressRef.current = true;

    const commCat = categoryScores.find((c) => c.label === 'Communication');
    const duration = timeSpent;

    const { addCompletedInterview, updateStreak, addXp } = useProgressStore.getState();
    addCompletedInterview({
      id: `beh-${Date.now()}`,
      timestamp: Date.now(),
      mode: 'behavioral',
      topicOrProblem: topic?.title ?? 'Behavioral',
      score: overallScore,
      duration,
      categoryScores: {
        behavioral: overallScore,
        communication: commCat?.score ?? 0,
      },
    });
    updateStreak();
    addXp(xpForSession(overallScore, duration));
  }, [open, overallScore, categoryScores, timeSpent, topic]);

  const { strengths, improvements } = useMemo(() => {
    const sorted = [...categoryScores].sort((a, b) => b.score - a.score);
    const s: string[] = [];
    const imp: string[] = [];

    sorted.forEach((cat) => {
      if (cat.score >= 70) {
        s.push(`Strong ${cat.label.toLowerCase()} (${cat.score}%)`);
      } else if (cat.score < 50) {
        imp.push(`Improve ${cat.label.toLowerCase()} (${cat.score}%)`);
      }
    });

    if (userMessages.length >= 10) {
      s.push('Good conversational depth and engagement');
    }
    if (timeSpent > 0 && timeSpent >= 10 * 60 * 1000) {
      s.push('Thorough responses with adequate time investment');
    }

    if (s.length === 0) s.push('Solid overall performance across STAR categories');
    if (imp.length === 0) imp.push('Continue refining specificity in each STAR component');

    return { strengths: s, improvements: imp };
  }, [categoryScores, userMessages.length, timeSpent]);

  const starTips = useMemo(() => {
    const tips: string[] = [];
    const scores = categoryScores.reduce((acc, c) => ({ ...acc, [c.label]: c.score }), {} as Record<string, number>);

    if (scores['Situation Clarity'] < 60) {
      tips.push('Set the scene with more detail: team size, company context, timeline, and stakes.');
    }
    if (scores['Task Definition'] < 60) {
      tips.push('Clarify YOUR specific responsibility. Use "I was responsible for..." instead of "we needed to..."');
    }
    if (scores['Action Specificity'] < 60) {
      tips.push('Describe concrete actions YOU took. Use "I decided...", "I created...", "I led..." with step-by-step detail.');
    }
    if (scores['Result Impact'] < 60) {
      tips.push('Quantify your results with metrics: percentages, revenue, time saved, team size, or user impact.');
    }
    if (scores['Communication'] < 60) {
      tips.push('Practice speaking at length about your experiences. Aim for 2-3 minute responses per question.');
    }

    return tips;
  }, [categoryScores]);

  const handleCopyReport = useCallback(() => {
    const lines = [
      `Behavioral Interview Report: ${topic?.title ?? 'Unknown Topic'}`,
      `Overall Score: ${overallScore}%`,
      '',
      ...categoryScores.map(
        (c) => `${c.label} (${Math.round(c.weight * 100)}%): ${c.score}%`,
      ),
      '',
      `Time Spent: ${formatDuration(timeSpent)}`,
      `User Messages: ${userMessages.length}`,
      '',
      'Strengths:',
      ...strengths.map((s) => `  - ${s}`),
      '',
      'Areas for Improvement:',
      ...improvements.map((i) => `  - ${i}`),
      '',
      'STAR Tips:',
      ...starTips.map((t) => `  - ${t}`),
      '',
      getSpeechAnalyticsSummary(transcript),
    ];
    try {
      navigator.clipboard.writeText(lines.join('\n'));
    } catch {
      // Clipboard API may fail in non-HTTPS contexts
    }
  }, [transcript, topic, overallScore, categoryScores, timeSpent, userMessages.length, strengths, improvements, starTips]);

  const handleClose = useCallback(() => {
    onOpenChange(false);
    router.push('/behavioral');
  }, [onOpenChange, router]);

  const circleRadius = 54;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const circleOffset = circleCircumference - (overallScore / 100) * circleCircumference;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-background border border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-emerald-500" />
            <span className="bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
              Behavioral Interview Report
            </span>
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {topic
              ? `STAR Method evaluation for: ${topic.title}`
              : 'Evaluation of your behavioral interview performance.'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
          {/* Overall Score */}
          <Card className="lg:col-span-1 bg-card flex flex-col items-center justify-center py-8">
            <div className="relative w-36 h-36">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60" cy="60" r={circleRadius}
                  fill="none" className="stroke-muted" strokeWidth="10"
                />
                <circle
                  cx="60" cy="60" r={circleRadius}
                  fill="none"
                  className={getOverallStrokeColor(overallScore)}
                  strokeWidth="10" strokeLinecap="round"
                  strokeDasharray={circleCircumference}
                  strokeDashoffset={circleOffset}
                  style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-3xl font-bold ${getOverallScoreColor(overallScore)}`}>
                  {overallScore}
                </span>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">/ 100</span>
              </div>
            </div>
            <p className="mt-4 text-sm font-medium text-foreground">Overall Score</p>

            {timeSpent > 0 && (
              <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{formatDuration(timeSpent)}</span>
              </div>
            )}
          </Card>

          {/* Category Scores */}
          <Card className="lg:col-span-2 bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">STAR Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {categoryScores.map((cat) => (
                <div key={cat.label} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className={`flex items-center gap-2 font-medium ${cat.color}`}>
                      {cat.icon}
                      {cat.label}
                      <span className="text-xs text-muted-foreground">
                        ({Math.round(cat.weight * 100)}%)
                      </span>
                    </span>
                    <span className="font-mono text-foreground">{cat.score}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${getProgressBarColor(cat.score)}`}
                      style={{ width: `${cat.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Strengths */}
          <Card className="border-l-4 border-l-green-500 bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-500">
                <TrendingUp className="w-4 h-4" />
                Strengths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Areas for Improvement */}
          <Card className="border-l-4 border-l-orange-500 bg-card lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-500">
                <ArrowRight className="w-4 h-4" />
                Areas for Improvement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {improvements.map((imp, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                    <ArrowRight className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                    {imp}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Speech Analytics */}
          <div className="lg:col-span-3">
            <SpeechAnalyticsPanel transcript={transcript} />
          </div>

          {/* STAR Tips */}
          {starTips.length > 0 && (
            <Card className="lg:col-span-3 bg-card">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-400" />
                  STAR Method Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {starTips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-foreground/80">
                      <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Footer Actions */}
        <BehavioralReportActions
          onCopyReport={handleCopyReport}
          onTryAnother={handleClose}
          topicTitle={topic?.title}
          overallScore={overallScore}
        />
      </DialogContent>
    </Dialog>
  );
}

function BehavioralReportActions({
  onCopyReport,
  onTryAnother,
  topicTitle,
  overallScore,
}: {
  onCopyReport: () => void;
  onTryAnother: () => void;
  topicTitle?: string;
  overallScore: number;
}) {
  const [copied, setCopied] = useState(false);

  const handleShare = useCallback(() => {
    const text = `I just completed a behavioral interview on "${topicTitle ?? 'a topic'}" and scored ${overallScore}%! Practice with AI interviewer Alexis.`;
    try {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard may fail
    }
  }, [topicTitle, overallScore]);

  return (
    <div className="flex flex-wrap justify-between gap-2 mt-6 border-t border-border pt-6">
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onTryAnother}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Try Another Topic
        </Button>
        <Button variant="outline" size="sm" onClick={handleShare}>
          {copied ? <Check className="w-4 h-4 mr-2 text-green-500" /> : <Copy className="w-4 h-4 mr-2" />}
          {copied ? 'Copied!' : 'Share Results'}
        </Button>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onCopyReport}>
          <Copy className="w-4 h-4 mr-2" />
          Copy Summary
        </Button>
      </div>
    </div>
  );
}
