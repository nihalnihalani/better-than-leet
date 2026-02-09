'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, Activity, MessageSquare, Brain, Clock, BookOpen } from 'lucide-react';
import { analyzeSpeech, type SpeechAnalytics } from '@/lib/speech-analytics';

interface TranscriptMessage {
  timestamp: number;
  speaker: 'agent' | 'user';
  message: string;
  type?: 'text' | 'audio';
}

interface SpeechAnalyticsPanelProps {
  transcript: TranscriptMessage[];
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-500';
  if (score >= 60) return 'text-yellow-500';
  if (score >= 40) return 'text-orange-500';
  return 'text-red-500';
}

function getScoreStroke(score: number): string {
  if (score >= 80) return 'stroke-green-500';
  if (score >= 60) return 'stroke-yellow-500';
  if (score >= 40) return 'stroke-orange-500';
  return 'stroke-red-500';
}

function getBarColor(index: number): string {
  const colors = [
    'bg-blue-500', 'bg-purple-500', 'bg-cyan-500', 'bg-pink-500',
    'bg-yellow-500', 'bg-green-500', 'bg-orange-500', 'bg-red-500',
    'bg-indigo-500', 'bg-teal-500', 'bg-rose-500', 'bg-amber-500',
  ];
  return colors[index % colors.length];
}

function WPMLabel(wpm: number): string {
  if (wpm === 0) return 'No data';
  if (wpm < 100) return 'Slow';
  if (wpm <= 130) return 'Measured';
  if (wpm <= 160) return 'Ideal';
  if (wpm <= 180) return 'Brisk';
  return 'Fast';
}

export function SpeechAnalyticsPanel({ transcript }: SpeechAnalyticsPanelProps) {
  const analytics: SpeechAnalytics = useMemo(
    () => analyzeSpeech(transcript),
    [transcript],
  );

  const maxFillerCount = useMemo(
    () => Math.max(1, ...analytics.fillerWords.breakdown.map((f) => f.count)),
    [analytics.fillerWords.breakdown],
  );

  const circleRadius = 40;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const circleOffset = circleCircumference - (analytics.confidenceScore / 100) * circleCircumference;

  const hasData = transcript.filter((m) => m.speaker === 'user').length > 0;

  if (!hasData) {
    return (
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Mic className="w-4 h-4 text-blue-400" />
            Speech Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground italic">
            No speech data available for analysis.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-400" />
          Speech Analytics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Confidence Score + Key Metrics Row */}
        <div className="flex items-center gap-6">
          {/* Confidence Circle */}
          <div className="relative w-24 h-24 shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r={circleRadius} fill="none" className="stroke-muted" strokeWidth="8" />
              <circle
                cx="50" cy="50" r={circleRadius} fill="none"
                className={getScoreStroke(analytics.confidenceScore)}
                strokeWidth="8" strokeLinecap="round"
                strokeDasharray={circleCircumference}
                strokeDashoffset={circleOffset}
                style={{ transition: 'stroke-dashoffset 0.6s ease' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-lg font-bold ${getScoreColor(analytics.confidenceScore)}`}>
                {analytics.confidenceScore}
              </span>
              <span className="text-[9px] text-muted-foreground uppercase">Confidence</span>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3 flex-1">
            <div className="text-center p-2 rounded-lg bg-muted/50">
              <div className="text-lg font-bold text-foreground">{analytics.pace.overallWPM}</div>
              <div className="text-[10px] text-muted-foreground uppercase">{WPMLabel(analytics.pace.overallWPM)}</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-muted/50">
              <div className="text-lg font-bold text-foreground">{analytics.fillerWords.total}</div>
              <div className="text-[10px] text-muted-foreground uppercase">Filler Words</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-muted/50">
              <div className="text-lg font-bold text-foreground">{analytics.vocabulary.uniqueWords}</div>
              <div className="text-[10px] text-muted-foreground uppercase">Unique Words</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-muted/50">
              <div className="text-lg font-bold text-foreground">{analytics.pauses.longPauses}</div>
              <div className="text-[10px] text-muted-foreground uppercase">Long Pauses</div>
            </div>
          </div>
        </div>

        {/* Filler Word Breakdown */}
        {analytics.fillerWords.breakdown.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Brain className="w-3 h-3" />
              Filler Words ({analytics.fillerWords.rate}% rate)
            </div>
            <div className="space-y-1.5">
              {analytics.fillerWords.breakdown.slice(0, 6).map((filler, i) => (
                <div key={filler.word} className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-16 text-right truncate">{filler.word}</span>
                  <div className="flex-1 h-4 rounded bg-muted/50 overflow-hidden">
                    <div
                      className={`h-full rounded ${getBarColor(i)} transition-all duration-500`}
                      style={{ width: `${(filler.count / maxFillerCount) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono text-foreground w-6 text-right">{filler.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Talk Ratio */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <MessageSquare className="w-3 h-3" />
            Talk Ratio
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-5 rounded-full overflow-hidden bg-muted/50 flex">
              <div
                className="h-full bg-blue-500 transition-all duration-500 flex items-center justify-center"
                style={{ width: `${analytics.talkRatio.candidatePercent}%` }}
              >
                {analytics.talkRatio.candidatePercent > 15 && (
                  <span className="text-[9px] text-white font-medium">
                    You {analytics.talkRatio.candidatePercent}%
                  </span>
                )}
              </div>
              <div
                className="h-full bg-purple-500 transition-all duration-500 flex items-center justify-center"
                style={{ width: `${analytics.talkRatio.interviewerPercent}%` }}
              >
                {analytics.talkRatio.interviewerPercent > 15 && (
                  <span className="text-[9px] text-white font-medium">
                    Alexis {analytics.talkRatio.interviewerPercent}%
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* WPM Over Time */}
        {analytics.pace.segments.length > 1 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Clock className="w-3 h-3" />
              Pace Over Time (WPM)
            </div>
            <div className="h-16 flex items-end gap-1">
              {analytics.pace.segments.map((seg, i) => {
                const maxWPM = Math.max(...analytics.pace.segments.map((s) => s.wpm), 1);
                const height = (seg.wpm / maxWPM) * 100;
                const isIdeal = seg.wpm >= 120 && seg.wpm <= 160;
                return (
                  <div
                    key={i}
                    className={`flex-1 rounded-t transition-all duration-300 ${isIdeal ? 'bg-green-500/70' : 'bg-blue-500/50'}`}
                    style={{ height: `${Math.max(height, 5)}%` }}
                    title={`${seg.wpm} WPM`}
                  />
                );
              })}
            </div>
            <div className="flex justify-between text-[9px] text-muted-foreground">
              <span>Start</span>
              <span>End</span>
            </div>
          </div>
        )}

        {/* Vocabulary */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <BookOpen className="w-3 h-3" />
            Vocabulary
          </div>
          <div className="flex items-center gap-4 text-xs text-foreground/80">
            <span>{analytics.vocabulary.totalWords} total words</span>
            <span>{analytics.vocabulary.uniqueWords} unique</span>
            <span className={analytics.vocabulary.diversityScore > 0.5 ? 'text-green-400' : 'text-yellow-400'}>
              {Math.round(analytics.vocabulary.diversityScore * 100)}% diversity
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Generate a plain-text summary for copy/export
 */
export function getSpeechAnalyticsSummary(transcript: TranscriptMessage[]): string {
  const analytics = analyzeSpeech(transcript);
  const lines = [
    'Speech Analytics:',
    `  Confidence Score: ${analytics.confidenceScore}/100`,
    `  Words Per Minute: ${analytics.pace.overallWPM} (${WPMLabel(analytics.pace.overallWPM)})`,
    `  Filler Words: ${analytics.fillerWords.total} (${analytics.fillerWords.rate}% rate)`,
    ...analytics.fillerWords.breakdown.slice(0, 5).map(
      (f) => `    - "${f.word}": ${f.count}`
    ),
    `  Talk Ratio: You ${analytics.talkRatio.candidatePercent}% / Alexis ${analytics.talkRatio.interviewerPercent}%`,
    `  Long Pauses (>10s): ${analytics.pauses.longPauses}`,
    `  Vocabulary: ${analytics.vocabulary.uniqueWords} unique / ${analytics.vocabulary.totalWords} total (${Math.round(analytics.vocabulary.diversityScore * 100)}% diversity)`,
  ];
  return lines.join('\n');
}
