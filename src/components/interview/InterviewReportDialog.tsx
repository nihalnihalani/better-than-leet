'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle, Code, Brain, Loader2, FileDown, RotateCcw, ArrowRight, Copy, Check, Save } from "lucide-react";
import { useInterviewStore } from "@/lib/store";
import { SpeechAnalyticsPanel } from "@/components/analytics/SpeechAnalyticsPanel";
import { SolutionPanel } from "@/components/practice/SolutionPanel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState, useCallback, useRef } from "react";
import { authFetch } from "@/lib/api-client";
import { PROBLEMS } from "@/data/problems";
import { useProgressStore, xpForSession } from "@/lib/progress-store";

interface InterviewReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function calculateIntegrityScore(integrity: {
  blurCount: number;
  pasteCount: number;
  largePasteEvents: { timestamp: number; length: number }[];
}): number {
  // Diminishing penalty for blur events (first few are more suspicious)
  // Max penalty: 25 points
  const blurPenalty = Math.min(25, integrity.blurCount * 3 + Math.floor(integrity.blurCount / 3) * 2);

  // Small pastes have minor penalty, large pastes are weighted heavily
  // Max penalty: 40 points for regular pastes, plus additional for large pastes
  const smallPastePenalty = Math.min(20, (integrity.pasteCount - integrity.largePasteEvents.length) * 3);
  const largePastePenalty = Math.min(35, integrity.largePasteEvents.length * 15);

  // Calculate final score
  const totalPenalty = blurPenalty + smallPastePenalty + largePastePenalty;
  return Math.max(0, 100 - totalPenalty);
}

export function InterviewReportDialog({ open, onOpenChange }: InterviewReportDialogProps) {
  const {
    integrity,
    code,
    transcript,
    testResults,
    currentProblemId
  } = useInterviewStore();

  const currentProblem = PROBLEMS.find((p) => p.id === currentProblemId);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [aiReport, setAiReport] = useState<any>(null); // StructuredReport
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const integrityScore = calculateIntegrityScore(integrity);
  const isIntegrityGood = integrityScore > 70;
  const savedToProgressRef = useRef(false);

  // Generate AI report when dialog opens
  useEffect(() => {
    if (open && !aiReport && !isGenerating) {
      generateReport();
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // Save to progress when report is ready
  useEffect(() => {
    if (!aiReport || savedToProgressRef.current) return;
    savedToProgressRef.current = true;

    const techScore = aiReport.technicalEvaluation?.score ?? 0;
    const commScore = aiReport.communicationEvaluation?.score ?? 0;
    const psScore = aiReport.problemSolvingEvaluation?.score ?? 0;
    const overallScore = Math.round(((techScore + commScore + psScore) / 3) * 10);
    const startTime = useInterviewStore.getState().interviewStartTime;
    const duration = startTime ? Date.now() - startTime : 0;
    const problem = PROBLEMS.find((p) => p.id === currentProblemId);

    const { addCompletedInterview, updateStreak, addXp } = useProgressStore.getState();
    addCompletedInterview({
      id: `coding-${Date.now()}`,
      timestamp: Date.now(),
      mode: 'coding',
      topicOrProblem: problem?.title ?? 'Coding Challenge',
      score: overallScore,
      duration,
      categoryScores: {
        coding: techScore * 10,
        communication: commScore * 10,
        problemSolving: psScore * 10,
      },
    });
    updateStreak();
    addXp(xpForSession(overallScore, duration));
  }, [aiReport, currentProblemId]);

  const generateReport = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await authFetch('/api/interview/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript,
          code,
          language: useInterviewStore.getState().language || 'python',
          testResults,
          integrity,
          problemId: currentProblemId || 'Coding Challenge'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.friendlyMessage?.message || data.error || 'Failed to generate report');
      }

      setAiReport(data.data.report);

      // Workspace cleanup is handled in handleEndInterview — no duplicate deletion here
    } catch (err) {
      console.error('Failed to generate AI report:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate report');
    } finally {
      setIsGenerating(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-500";
    if (score >= 5) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-background border border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Interview Final Report
            </span>
            {aiReport && aiReport.hireRecommendation && (
              <span className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-lg ${(aiReport.hireRecommendation || "").includes("HIRE") && !(aiReport.hireRecommendation || "").includes("NO")
                ? "bg-green-500/20 text-green-400 border border-green-500/50"
                : "bg-red-500/20 text-red-400 border border-red-500/50"
                }`}>
                {(aiReport.hireRecommendation || "PENDING").replace("_", " ")}
              </span>
            )}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            AI-powered comprehensive evaluation of candidate performance.
          </DialogDescription>
        </DialogHeader>

        {isGenerating ? (
          <div className="flex flex-col items-center justify-center py-20 gap-6">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full animate-pulse"></div>
              <Loader2 className="w-16 h-16 animate-spin text-blue-400 relative z-10" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-lg font-medium text-foreground">Generating Analysis...</p>
              <p className="text-sm text-muted-foreground">Processing transcript, code quality, and behavioral signals.</p>
            </div>
          </div>
        ) : error ? (
          <div className="p-8 text-center space-y-4">
            <div className="inline-flex p-4 rounded-full bg-red-500/10 mb-2">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-red-400">Generation Failed</h3>
            <p className="text-muted-foreground max-w-md mx-auto">{error}</p>
            <Button onClick={generateReport} variant="outline" className="mt-4">
              Try Again
            </Button>
          </div>
        ) : aiReport ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">

            {/* Executive Summary - Full Width */}
            <Card className="lg:col-span-2 border-l-4 border-l-blue-500 bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-400">
                  <Brain className="w-5 h-5" /> Executive Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="text-foreground/80 leading-relaxed">
                {aiReport.executiveSummary}
              </CardContent>
            </Card>

            {/* Technical Evaluation */}
            <Card className="border-l-4 border-l-purple-500 bg-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-purple-400">
                  <Code className="w-5 h-5" /> Technical Skills
                </CardTitle>
                <span className={`text-xl font-bold ${getScoreColor(aiReport.technicalEvaluation.score)}`}>
                  {aiReport.technicalEvaluation.score}/10
                </span>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{aiReport.technicalEvaluation.summary}</p>
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-green-400 uppercase tracking-wider">Strengths</h4>
                  <ul className="list-disc list-inside text-sm text-foreground/80 space-y-1">
                    {aiReport.technicalEvaluation.strengths.map((s: string, i: number) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-red-400 uppercase tracking-wider">Weaknesses</h4>
                  <ul className="list-disc list-inside text-sm text-foreground/80 space-y-1">
                    {aiReport.technicalEvaluation.weaknesses.map((w: string, i: number) => <li key={i}>{w}</li>)}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Communication Evaluation */}
            <Card className="border-l-4 border-l-yellow-500 bg-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-yellow-400">
                  <span className="text-xl">💬</span> Communication
                </CardTitle>
                <span className={`text-xl font-bold ${getScoreColor(aiReport.communicationEvaluation.score)}`}>
                  {aiReport.communicationEvaluation.score}/10
                </span>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{aiReport.communicationEvaluation.summary}</p>
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-green-400 uppercase tracking-wider">Strengths</h4>
                  <ul className="list-disc list-inside text-sm text-foreground/80 space-y-1">
                    {aiReport.communicationEvaluation.strengths.map((s: string, i: number) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-red-400 uppercase tracking-wider">Areas to Improve</h4>
                  <ul className="list-disc list-inside text-sm text-foreground/80 space-y-1">
                    {aiReport.communicationEvaluation.weaknesses.map((w: string, i: number) => <li key={i}>{w}</li>)}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Problem Solving Evaluation */}
            <Card className="border-l-4 border-l-cyan-500 bg-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-cyan-400">
                  <span className="text-xl">🧩</span> Problem Solving
                </CardTitle>
                <span className={`text-xl font-bold ${getScoreColor(aiReport.problemSolvingEvaluation.score)}`}>
                  {aiReport.problemSolvingEvaluation.score}/10
                </span>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{aiReport.problemSolvingEvaluation.summary}</p>
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-green-400 uppercase tracking-wider">Strengths</h4>
                  <ul className="list-disc list-inside text-sm text-foreground/80 space-y-1">
                    {aiReport.problemSolvingEvaluation.strengths.map((s: string, i: number) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-red-400 uppercase tracking-wider">Areas to Improve</h4>
                  <ul className="list-disc list-inside text-sm text-foreground/80 space-y-1">
                    {aiReport.problemSolvingEvaluation.weaknesses.map((w: string, i: number) => <li key={i}>{w}</li>)}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Integrity & Metrics */}
            <Card className={`border-l-4 ${isIntegrityGood ? "border-l-green-500" : "border-l-red-500"} bg-card`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Shield className={`w-5 h-5 ${isIntegrityGood ? "text-green-500" : "text-red-500"}`} />
                  Integrity & Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <div className={`text-2xl font-bold ${isIntegrityGood ? "text-green-400" : "text-red-400"}`}>
                      {integrityScore}%
                    </div>
                    <div className="text-xs text-muted-foreground uppercase mt-1">Trust Score</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <div className="text-2xl font-bold text-blue-400">
                      {testResults.length > 0
                        ? `${testResults[testResults.length - 1].testsPassed}/${testResults[testResults.length - 1].testsTotal}`
                        : "-"}
                    </div>
                    <div className="text-xs text-muted-foreground uppercase mt-1">Tests Passed</div>
                  </div>
                </div>

                {/* Detailed Integrity Breakdown */}
                <div className="space-y-2 pt-2 border-t border-border">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Integrity Details</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Tab Switches:</span>
                      <span className={`font-mono ${integrity.blurCount > 5 ? "text-red-400" : integrity.blurCount > 2 ? "text-yellow-400" : "text-green-400"}`}>
                        {integrity.blurCount} {integrity.blurCount > 5 ? "🔴" : integrity.blurCount > 2 ? "🟡" : "🟢"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Paste Events:</span>
                      <span className={`font-mono ${integrity.pasteCount > 3 ? "text-yellow-400" : "text-green-400"}`}>
                        {integrity.pasteCount} {integrity.pasteCount > 3 ? "🟡" : "🟢"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Large Pastes (&gt;100 chars):</span>
                      <span className={`font-mono ${integrity.largePasteEvents.length > 0 ? "text-red-400" : "text-green-400"}`}>
                        {integrity.largePasteEvents.length} {integrity.largePasteEvents.length > 0 ? "🔴" : "🟢"}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Speech Analytics */}
            <div className="lg:col-span-2">
              <SpeechAnalyticsPanel transcript={transcript} />
            </div>

            {/* Final Verdict & Feedback */}
            <Card className="lg:col-span-2 border-t-4 border-t-pink-500 bg-gradient-to-b from-pink-950/20 to-card">
              <CardHeader>
                <CardTitle className="text-pink-400 flex items-center gap-2">
                  🎯 Final Feedback
                </CardTitle>
              </CardHeader>
              <CardContent className="text-foreground/80 italic">
                &ldquo;{aiReport.finalFeedback}&rdquo;
              </CardContent>
            </Card>

          </div>
        ) : null}

        {/* Solution Editorial */}
        {currentProblem && (
          <div className="mt-4">
            <SolutionPanel
              solution={currentProblem.solution}
              solutionCode={currentProblem.solutionCode}
              timeComplexity={currentProblem.timeComplexity}
              spaceComplexity={currentProblem.spaceComplexity}
            />
          </div>
        )}

        <InterviewReportActions
          onOpenChange={onOpenChange}
          currentProblemId={currentProblemId}
        />
      </DialogContent>
    </Dialog>
  );
}

function InterviewReportActions({
  onOpenChange,
  currentProblemId,
}: {
  onOpenChange: (open: boolean) => void;
  currentProblemId: string | null;
}) {
  const [copied, setCopied] = useState(false);
  const { setCode, setCurrentProblemId, clearTranscript, clearTestResults, clearLogs, setStatus } = useInterviewStore();

  const handleTryAgain = useCallback(() => {
    const problem = PROBLEMS.find((p) => p.id === currentProblemId);
    if (problem) {
      setCode(problem.starterCode);
      clearTranscript();
      clearTestResults();
      clearLogs();
      setStatus('idle');
    }
    onOpenChange(false);
    window.location.href = '/interview';
  }, [currentProblemId, setCode, clearTranscript, clearTestResults, clearLogs, setStatus, onOpenChange]);

  const handleNextProblem = useCallback(() => {
    const currentIndex = PROBLEMS.findIndex((p) => p.id === currentProblemId);
    const nextIndex = (currentIndex + 1) % PROBLEMS.length;
    const nextProblem = PROBLEMS[nextIndex];
    setCurrentProblemId(nextProblem.id);
    setCode(nextProblem.starterCode);
    clearTranscript();
    clearTestResults();
    clearLogs();
    setStatus('idle');
    onOpenChange(false);
    window.location.href = '/interview';
  }, [currentProblemId, setCurrentProblemId, setCode, clearTranscript, clearTestResults, clearLogs, setStatus, onOpenChange]);

  const handleShare = useCallback(() => {
    const problem = PROBLEMS.find((p) => p.id === currentProblemId);
    const text = `I just completed "${problem?.title ?? 'a coding challenge'}" on BetterThanLeet with AI interviewer Alexis! Try it yourself.`;
    try {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard may fail
    }
  }, [currentProblemId]);

  return (
    <div className="flex flex-wrap justify-between gap-2 mt-6 border-t border-border pt-6 no-print">
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={handleTryAgain}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
        <Button variant="outline" size="sm" onClick={handleNextProblem}>
          <ArrowRight className="w-4 h-4 mr-2" />
          Next Problem
        </Button>
        <Button variant="outline" size="sm" onClick={handleShare}>
          {copied ? <Check className="w-4 h-4 mr-2 text-green-500" /> : <Copy className="w-4 h-4 mr-2" />}
          {copied ? 'Copied!' : 'Share Results'}
        </Button>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => { onOpenChange(false); window.location.href = '/dashboard'; }}>
          <Save className="w-4 h-4 mr-2" />
          View Dashboard
        </Button>
        <Button variant="outline" onClick={() => { onOpenChange(false); window.location.href = '/'; }}>
          Return Home
        </Button>
        <Button onClick={() => window.print()}>
          <FileDown className="w-4 h-4 mr-2" />
          Download PDF
        </Button>
      </div>
    </div>
  );
}
