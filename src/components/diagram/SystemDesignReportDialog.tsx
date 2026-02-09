'use client';

import { useMemo, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
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
  XCircle,
  Clock,
  Copy,
  Download,
  BarChart3,
  Network,
  MessageSquare,
  Shield,
  Layers,
  Search,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import { useSystemDesignStore } from '@/lib/system-design-store';
import { getSystemDesignTopic } from '@/data/system-design-topics';
import { countMermaidComponents } from '@/lib/mermaid-parser';

interface SystemDesignReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// --- Scoring helpers ---

interface CategoryScore {
  label: string;
  score: number;
  weight: number;
  icon: React.ReactNode;
  color: string;
}

function calcRequirementsScore(transcriptText: string): number {
  const keywords = [
    'requirement',
    'constraint',
    'scale',
    'users',
    'traffic',
    'latency',
    'availability',
    'consistency',
    'throughput',
    'bandwidth',
    'storage',
    'read',
    'write',
    'qps',
    'sla',
    'functional',
    'non-functional',
  ];
  const lower = transcriptText.toLowerCase();
  const hits = keywords.filter((k) => lower.includes(k)).length;
  return Math.min(100, Math.round((hits / 8) * 100));
}

function calcHighLevelDesignScore(
  componentCount: number,
  expectedCount: number,
): number {
  if (expectedCount === 0) return 0;
  const ratio = componentCount / expectedCount;
  return Math.min(100, Math.round(ratio * 100));
}

function calcDeepDiveScore(
  transcriptLength: number,
  edgesCount: number,
): number {
  // Transcript depth: at least 2000 chars is solid, 5000+ is great
  const transcriptScore = Math.min(50, Math.round((transcriptLength / 5000) * 50));
  // Diagram complexity: 5 edges is basic, 15+ is thorough
  const edgesScore = Math.min(50, Math.round((edgesCount / 15) * 50));
  return transcriptScore + edgesScore;
}

function calcScalingScore(transcriptText: string): number {
  const keywords = [
    'cache',
    'caching',
    'load balancer',
    'replica',
    'replication',
    'cdn',
    'partition',
    'shard',
    'horizontal scaling',
    'vertical scaling',
    'failover',
    'redundancy',
    'consistent hashing',
    'rate limit',
    'circuit breaker',
    'health check',
    'auto-scaling',
    'queue',
    'message queue',
    'backpressure',
  ];
  const lower = transcriptText.toLowerCase();
  const hits = keywords.filter((k) => lower.includes(k)).length;
  return Math.min(100, Math.round((hits / 8) * 100));
}

function calcCommunicationScore(
  messageCount: number,
  avgMessageLength: number,
): number {
  // At least 6 messages shows decent back-and-forth; 15+ is great
  const countScore = Math.min(50, Math.round((messageCount / 15) * 50));
  // Average message length of ~80 chars is reasonable, 200+ is very detailed
  const lengthScore = Math.min(50, Math.round((avgMessageLength / 200) * 50));
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

// --- Component ---

export function SystemDesignReportDialog({
  open,
  onOpenChange,
}: SystemDesignReportDialogProps) {
  const router = useRouter();
  const mermaidContainerRef = useRef<HTMLDivElement>(null);

  const {
    transcript,
    mermaidDiagram,
    selectedTopicId,
    interviewStartTime,
    diagramHistory,
  } = useSystemDesignStore();

  const topic = selectedTopicId ? getSystemDesignTopic(selectedTopicId) : undefined;
  const expectedComponents = topic?.expectedComponents ?? [];

  // Derived metrics
  const { nodes: nodeCount, edges: edgeCount } = useMemo(
    () => countMermaidComponents(mermaidDiagram),
    [mermaidDiagram],
  );

  const userMessages = useMemo(
    () => transcript.filter((m) => m.speaker === 'user'),
    [transcript],
  );

  const transcriptText = useMemo(
    () => transcript.map((m) => m.message).join(' '),
    [transcript],
  );

  const avgMessageLength = useMemo(() => {
    if (userMessages.length === 0) return 0;
    const totalLen = userMessages.reduce((sum, m) => sum + m.message.length, 0);
    return Math.round(totalLen / userMessages.length);
  }, [userMessages]);

  const timeSpent = useMemo(() => {
    if (!interviewStartTime) return 0;
    return Date.now() - interviewStartTime;
  }, [interviewStartTime]);

  // Category scores
  const categoryScores: CategoryScore[] = useMemo(
    () => [
      {
        label: 'Requirements Gathering',
        score: calcRequirementsScore(transcriptText),
        weight: 0.2,
        icon: <Search className="w-4 h-4" />,
        color: 'text-blue-400',
      },
      {
        label: 'High-Level Design',
        score: calcHighLevelDesignScore(nodeCount, expectedComponents.length),
        weight: 0.25,
        icon: <Layers className="w-4 h-4" />,
        color: 'text-purple-400',
      },
      {
        label: 'Deep Dive',
        score: calcDeepDiveScore(transcriptText.length, edgeCount),
        weight: 0.25,
        icon: <Network className="w-4 h-4" />,
        color: 'text-cyan-400',
      },
      {
        label: 'Scaling & Reliability',
        score: calcScalingScore(transcriptText),
        weight: 0.2,
        icon: <Shield className="w-4 h-4" />,
        color: 'text-yellow-400',
      },
      {
        label: 'Communication',
        score: calcCommunicationScore(userMessages.length, avgMessageLength),
        weight: 0.1,
        icon: <MessageSquare className="w-4 h-4" />,
        color: 'text-pink-400',
      },
    ],
    [transcriptText, nodeCount, expectedComponents.length, edgeCount, userMessages.length, avgMessageLength],
  );

  const overallScore = useMemo(() => {
    const weighted = categoryScores.reduce(
      (acc, c) => acc + c.score * c.weight,
      0,
    );
    return Math.round(weighted);
  }, [categoryScores]);

  // Strengths & improvements
  const { strengths, improvements } = useMemo(() => {
    const sorted = [...categoryScores].sort((a, b) => b.score - a.score);
    const s: string[] = [];
    const imp: string[] = [];

    sorted.forEach((cat) => {
      if (cat.score >= 70) {
        s.push(`Strong ${cat.label.toLowerCase()} skills (${cat.score}%)`);
      } else if (cat.score < 50) {
        imp.push(`Improve ${cat.label.toLowerCase()} (${cat.score}%)`);
      }
    });

    if (diagramHistory.length >= 5) {
      s.push('Iterative diagram refinement throughout the session');
    }
    if (timeSpent > 0 && timeSpent < 30 * 60 * 1000) {
      s.push('Good time management');
    }

    if (s.length === 0) s.push('Solid overall performance across categories');
    if (imp.length === 0) imp.push('Continue refining depth on each topic');

    return { strengths: s, improvements: imp };
  }, [categoryScores, diagramHistory.length, timeSpent]);

  // Matched expected components
  const componentMatches = useMemo(() => {
    const lower = mermaidDiagram.toLowerCase() + ' ' + transcriptText.toLowerCase();
    return expectedComponents.map((comp) => ({
      name: comp,
      found: lower.includes(comp.toLowerCase()),
    }));
  }, [expectedComponents, mermaidDiagram, transcriptText]);

  // Render mermaid preview
  useEffect(() => {
    if (!open || !mermaidDiagram || !mermaidContainerRef.current) return;

    let cancelled = false;

    async function renderDiagram() {
      try {
        const mermaid = (await import('mermaid')).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: 'neutral',
          securityLevel: 'loose',
        });

        if (cancelled || !mermaidContainerRef.current) return;

        const id = `report-mermaid-${Date.now()}`;
        const { svg } = await mermaid.render(id, mermaidDiagram);

        if (!cancelled && mermaidContainerRef.current) {
          mermaidContainerRef.current.innerHTML = svg;
        }
      } catch {
        if (!cancelled && mermaidContainerRef.current) {
          mermaidContainerRef.current.innerHTML =
            '<p class="text-sm text-muted-foreground italic">Unable to render diagram preview.</p>';
        }
      }
    }

    renderDiagram();

    return () => {
      cancelled = true;
    };
  }, [open, mermaidDiagram]);

  // Copy report summary to clipboard
  const handleCopyReport = useCallback(() => {
    const lines = [
      `System Design Report: ${topic?.title ?? 'Unknown Topic'}`,
      `Overall Score: ${overallScore}%`,
      '',
      ...categoryScores.map(
        (c) => `${c.label} (${Math.round(c.weight * 100)}%): ${c.score}%`,
      ),
      '',
      `Time Spent: ${formatDuration(timeSpent)}`,
      `Diagram Nodes: ${nodeCount}`,
      `Diagram Edges: ${edgeCount}`,
      `Diagram Revisions: ${diagramHistory.length}`,
      '',
      'Components Covered:',
      ...componentMatches.map(
        (c) => `  ${c.found ? '[x]' : '[ ]'} ${c.name}`,
      ),
      '',
      'Strengths:',
      ...strengths.map((s) => `  - ${s}`),
      '',
      'Areas for Improvement:',
      ...improvements.map((i) => `  - ${i}`),
    ];
    navigator.clipboard.writeText(lines.join('\n'));
  }, [
    topic,
    overallScore,
    categoryScores,
    timeSpent,
    nodeCount,
    edgeCount,
    diagramHistory.length,
    componentMatches,
    strengths,
    improvements,
  ]);

  // Export diagram as SVG
  const handleExportSvg = useCallback(() => {
    if (!mermaidContainerRef.current) return;

    const svgEl = mermaidContainerRef.current.querySelector('svg');
    if (!svgEl) return;

    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svgEl);
    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${topic?.id ?? 'system-design'}-diagram.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [topic]);

  // Close and navigate
  const handleClose = useCallback(() => {
    onOpenChange(false);
    router.push('/system-design');
  }, [onOpenChange, router]);

  // Circular progress SVG values
  const circleRadius = 54;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const circleOffset = circleCircumference - (overallScore / 100) * circleCircumference;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-background border border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-blue-500" />
            <span className="bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent">
              System Design Report
            </span>
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {topic
              ? `Evaluation for: ${topic.title}`
              : 'Evaluation of your system design interview performance.'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
          {/* --- Overall Score (circular indicator) --- */}
          <Card className="lg:col-span-1 bg-card flex flex-col items-center justify-center py-8">
            <div className="relative w-36 h-36">
              <svg
                className="w-full h-full -rotate-90"
                viewBox="0 0 120 120"
              >
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
                  className={getOverallStrokeColor(overallScore)}
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={circleCircumference}
                  strokeDashoffset={circleOffset}
                  style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span
                  className={`text-3xl font-bold ${getOverallScoreColor(overallScore)}`}
                >
                  {overallScore}
                </span>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                  / 100
                </span>
              </div>
            </div>
            <p className="mt-4 text-sm font-medium text-foreground">
              Overall Score
            </p>

            {/* Time spent */}
            {timeSpent > 0 && (
              <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{formatDuration(timeSpent)}</span>
              </div>
            )}
          </Card>

          {/* --- Category Scores --- */}
          <Card className="lg:col-span-2 bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Category Breakdown</CardTitle>
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

          {/* --- Components Covered vs Expected --- */}
          <Card className="lg:col-span-1 bg-card">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" />
                Components
              </CardTitle>
            </CardHeader>
            <CardContent>
              {componentMatches.length > 0 ? (
                <ul className="space-y-2">
                  {componentMatches.map((comp) => (
                    <li
                      key={comp.name}
                      className="flex items-center gap-2 text-sm"
                    >
                      {comp.found ? (
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                      )}
                      <span
                        className={
                          comp.found
                            ? 'text-foreground'
                            : 'text-muted-foreground line-through'
                        }
                      >
                        {comp.name}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  No expected components defined for this topic.
                </p>
              )}

              <div className="mt-4 pt-4 border-t border-border text-sm text-muted-foreground">
                {componentMatches.filter((c) => c.found).length} /{' '}
                {componentMatches.length} covered
              </div>
            </CardContent>
          </Card>

          {/* --- Diagram Complexity Metrics --- */}
          <Card className="lg:col-span-2 bg-card">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Network className="w-4 h-4 text-cyan-400" />
                Diagram Complexity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <div className="text-2xl font-bold text-foreground">
                    {nodeCount}
                  </div>
                  <div className="text-xs text-muted-foreground uppercase mt-1">
                    Nodes
                  </div>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <div className="text-2xl font-bold text-foreground">
                    {edgeCount}
                  </div>
                  <div className="text-xs text-muted-foreground uppercase mt-1">
                    Edges
                  </div>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <div className="text-2xl font-bold text-foreground">
                    {diagramHistory.length}
                  </div>
                  <div className="text-xs text-muted-foreground uppercase mt-1">
                    Revisions
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* --- Strengths --- */}
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
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-foreground/80"
                  >
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* --- Areas for Improvement --- */}
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
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-foreground/80"
                  >
                    <ArrowRight className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                    {imp}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* --- Mermaid Diagram Preview --- */}
          {mermaidDiagram && (
            <Card className="lg:col-span-3 bg-card">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Network className="w-4 h-4 text-blue-400" />
                  Final Diagram
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  ref={mermaidContainerRef}
                  className="flex items-center justify-center overflow-auto rounded-lg bg-muted/30 p-4 min-h-[200px]"
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* --- Footer Actions --- */}
        <div className="flex flex-wrap justify-end gap-2 mt-6 border-t border-border pt-6">
          <Button variant="outline" size="sm" onClick={handleCopyReport}>
            <Copy className="w-4 h-4 mr-2" />
            Copy Summary
          </Button>
          {mermaidDiagram && (
            <Button variant="outline" size="sm" onClick={handleExportSvg}>
              <Download className="w-4 h-4 mr-2" />
              Export SVG
            </Button>
          )}
          <Button onClick={handleClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
