'use client';

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProblemDescription } from "@/components/interview/ProblemDescription";
import { ConsolePanel } from "@/components/interview/ConsolePanel";
import { Controls } from "@/components/interview/Controls";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { InterviewAgent } from "@/components/agent/InterviewAgent";
import { AnalysisPanel } from "@/components/analysis/AnalysisPanel";
import { useInterviewStore } from "@/lib/store";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { CodeRabbitReviewPanel } from "@/components/analysis/CodeRabbitReviewPanel";
import { Logo } from "@/components/ui/Logo";
import { InterviewReportDialog } from "@/components/interview/InterviewReportDialog";
import { PracticeReportDialog } from "@/components/practice/PracticeReportDialog";
import { WorkspaceProgressIndicator } from "@/components/workspace/WorkspaceProgressIndicator";
import { Shield, AlertTriangle, GraduationCap } from "lucide-react";
import { PROBLEMS } from "@/data/problems";
import { COMPANIES } from "@/data/company-problems";
import { generateTestCode } from "@/lib/test-runner";

export default function InterviewPage() {
  const {
    code,
    setCode,
    consoleOutput,
    addLog,
    clearLogs,
    latestReview,
    setReview,
    coderabbitReview,
    setCodeRabbitReview,
    workspaceId,
    setWorkspaceId,
    workspaceStatus,
    setWorkspaceStatus,
    setWorkspaceProgress,
    setWorkspaceError,
    currentProblemId,
    setCurrentProblemId,
    interviewMode,
    setInterviewMode,
    selectedCompanyId,
    setSelectedCompanyId,
  } = useInterviewStore();

  const [mounted, setMounted] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCodeRabbitLoading, setIsCodeRabbitLoading] = useState(false);
  // activeTab is now controlled by the Tabs component, but we can sync it or just let Tabs handle it
  // We keep it in state to switch programmatically when buttons are clicked
  const [activeTab, setActiveTab] = useState<'minimax' | 'coderabbit'>('minimax');
  const [isFixing, setIsFixing] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  // Initialize interview mode and problem
  useEffect(() => {
    // If in practice mode but no company/problem selected, user navigated directly - reset to real mode
    if (interviewMode === 'practice' && (!selectedCompanyId || !currentProblemId)) {
      setInterviewMode('real');
      setSelectedCompanyId(null);
      setCurrentProblemId(PROBLEMS[0].id);
      setCode(PROBLEMS[0].starterCode);
      return;
    }

    // For regular interview mode, ensure a problem is selected
    if (interviewMode !== 'practice' && !currentProblemId && PROBLEMS.length > 0) {
      setCurrentProblemId(PROBLEMS[0].id);
      setCode(PROBLEMS[0].starterCode);
    }
  }, [interviewMode, currentProblemId, selectedCompanyId, setCurrentProblemId, setCode, setInterviewMode, setSelectedCompanyId]);

  // Initialize workspace with progress tracking
  const initWorkspace = async () => {
    setWorkspaceStatus('creating');
    setWorkspaceProgress({ step: 'Connecting to Daytona...', progress: 10 });
    setWorkspaceError(null);

    try {
      setWorkspaceProgress({ step: 'Creating sandbox environment...', progress: 25 });

      const res = await fetch('/api/sandbox/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: 'python' }),
      });

      setWorkspaceProgress({ step: 'Configuring workspace...', progress: 50 });

      const data = await res.json();

      // Check for rate limiting or other errors
      if (!res.ok) {
        const errorMsg = data.friendlyMessage?.message || data.error || 'Failed to create workspace';
        throw new Error(errorMsg);
      }

      // Handle both direct and wrapped response formats
      const newWorkspaceId = data.data?.id || data.id;

      if (newWorkspaceId) {
        setWorkspaceStatus('installing');
        setWorkspaceProgress({ step: 'Installing development tools...', progress: 75 });

        // Brief pause to show installation step
        await new Promise(r => setTimeout(r, 500));

        setWorkspaceProgress({ step: 'Finalizing setup...', progress: 90 });
        setWorkspaceId(newWorkspaceId);

        setWorkspaceProgress({ step: 'Ready!', progress: 100 });
        setWorkspaceStatus('ready');
        addLog(`Workspace initialized: ${newWorkspaceId}`);
      } else {
        throw new Error(data.error || 'Unknown error - no workspace ID returned');
      }
    } catch (err) {
      console.error("Failed to init workspace", err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize workspace';
      setWorkspaceStatus('error');
      setWorkspaceError(errorMessage);
      addLog(`Failed to initialize workspace: ${errorMessage}`);
    }
  };

  useEffect(() => {
    initWorkspace();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once

  const handleRun = async (codeToRun: string) => {
    if (!workspaceId) {
      addLog("Error: Workspace not ready.");
      return;
    }
    setIsRunning(true);
    clearLogs();
    addLog("Running tests...");

    // Find current problem from either regular problems or company-specific problems
    let currentProblem = PROBLEMS.find(p => p.id === currentProblemId);

    // Check company problems if in practice mode and not found in regular problems
    if (!currentProblem && interviewMode === 'practice' && selectedCompanyId) {
      const company = COMPANIES.find(c => c.id === selectedCompanyId);
      currentProblem = company?.problems.find(p => p.id === currentProblemId);
    }

    const testCode = currentProblem
      ? generateTestCode(currentProblem, codeToRun)
      : codeToRun;

    try {
      const res = await fetch('/api/sandbox/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId,
          code: testCode,
          language: 'python'
        }),
      });
      const json = await res.json();
      // Handle both direct and wrapped response formats
      const data = json.data || json;

      if (data.stdout) {
        addLog(data.stdout, 'stdout');
        setLastError(null);

        // Parse and store test results if tests were run
        if (currentProblem) {
          const testOutput = data.stdout;
          const passedMatches = testOutput.match(/✓ Test \d+ passed/g) || [];
          const failedMatches = testOutput.match(/✗ Test \d+ (failed|error)/g) || [];
          const testsPassed = passedMatches.length;
          const testsTotal = currentProblem.testCases.length;

          useInterviewStore.getState().addTestResult({
            timestamp: Date.now(),
            problemId: currentProblemId || 'unknown',
            testsPassed,
            testsTotal,
            details: {
              stdout: data.stdout,
              passed: passedMatches,
              failed: failedMatches
            }
          });
        }
      }
      if (data.stderr) {
        addLog(`Error:\n${data.stderr}`, 'stderr');
        setLastError(data.stderr);

        // Auto-suggest fix in logs
        addLog("💡 Tip: Click 'Auto Fix' to let the agent repair this.", 'system');
      }
      if (!data.stdout && !data.stderr) addLog("No output returned.", 'system');

    } catch (err) {
      addLog(`System Error: ${err}`, 'stderr');
    } finally {
      setIsRunning(false);
    }
  };

  const handleAutoFix = async () => {
    if (!lastError || !code) return;

    setIsFixing(true);
    addLog("Agent is analyzing error pattern...", 'agent');

    try {
      const res = await fetch('/api/analysis/autofix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          error: lastError,
          language: 'python',
          workspaceId
        })
      });
      const json = await res.json();
      // Handle both direct and wrapped response formats
      const data = json.data || json;

      if (data.fixedCode) {
        setCode(data.fixedCode);
        addLog("✨ Agent applied fix to code.", 'agent');

        if (data.installedPackages && data.installedPackages.length > 0) {
          data.installedPackages.forEach((pkg: string) => {
            addLog(`📦 Agent installed ${pkg}`, 'agent');
          });
        }

        setLastError(null); // Clear error state
      } else {
        addLog("Agent could not determine a fix.", 'system');
      }
    } catch (err) {
      console.error(err);
      addLog("Auto-fix service failed.", 'stderr');
    } finally {
      setIsFixing(false);
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setActiveTab('minimax');
    setReview(null);
    try {
      const res = await fetch('/api/analysis/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language: 'python' }),
      });
      const json = await res.json();
      // Handle both direct and wrapped response formats
      const data = json.data || json;
      setReview(data);
    } catch (err) {
      console.error(err);
      addLog("Analysis failed.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCodeRabbit = async () => {
    setIsCodeRabbitLoading(true);
    setActiveTab('coderabbit');
    setCodeRabbitReview(null);
    try {
      const res = await fetch('/api/analysis/coderabbit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          language: 'python',
          workspaceId
        }),
      });
      const json = await res.json();
      // Handle both direct and wrapped response formats
      const data = json.data || json;
      setCodeRabbitReview(data);
    } catch (err) {
      console.error(err);
      addLog("CodeRabbit Analysis failed.");
    } finally {
      setIsCodeRabbitLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div id="interface-container" className="h-screen w-full bg-background overflow-hidden flex flex-col">
      <header className="h-12 border-b flex items-center px-4 justify-between bg-card z-10">
        <div className="font-bold flex items-center gap-2">
          <Logo size={24} />
          Daytona Interview Sandbox
        </div>
        <div className="text-xs text-muted-foreground flex items-center gap-4">
          {interviewMode === 'practice' && (
            <span className="text-primary flex items-center gap-1 bg-primary/10 px-2 py-1 rounded">
              <GraduationCap className="w-3 h-3" /> Practice Mode
            </span>
          )}
          {workspaceId ? (
            <span className="text-green-500 flex items-center gap-1">
              <Shield className="w-3 h-3" /> Shield Active
            </span>
          ) : (
            <span className="text-yellow-500 flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" /> Initializing
            </span>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          {/* Left Panel: Problem Description */}
          <ResizablePanel defaultSize={25} minSize={20}>
            <ProblemDescription />
          </ResizablePanel>

          <ResizableHandle />

          {/* Center Panel: Editor (top) & Console (bottom) */}
          <ResizablePanel defaultSize={50} minSize={30}>
            <div className="flex flex-col h-full">
              {/* Code Editor - Top 70% */}
              <div className="flex-[7] min-h-0 overflow-hidden">
                <CodeEditor
                  language="python"
                  initialCode={code}
                  onChange={(val) => setCode(val || "")}
                  onRun={() => handleRun(code)}
                  isRunning={isRunning}
                />
              </div>
              {/* Console Panel - Bottom 30% */}
              <div className="flex-[3] min-h-0 overflow-hidden">
                <ConsolePanel output={consoleOutput} />
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle />

          {/* Right Panel: Agent & Controls */}
          <ResizablePanel defaultSize={35} minSize={20} className="bg-card border-l">
            <div className="flex flex-col h-full overflow-hidden">
              <div className="p-4 border-b">
                <InterviewAgent />
              </div>

              <Controls
                onRun={() => handleRun(code)}
                onAnalyze={handleAnalyze}
                onCodeRabbit={handleCodeRabbit}
                onAutoFix={handleAutoFix}
                onEndInterview={() => setShowReport(true)}
                isRunning={isRunning}
                isAnalyzing={isAnalyzing}
                isCodeRabbitLoading={isCodeRabbitLoading}
                isFixing={isFixing}
                hasError={!!lastError}
              />

              <div className="flex-1 overflow-y-auto p-4 flex flex-col">
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full flex-1 flex flex-col">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="minimax">MiniMax Analysis</TabsTrigger>
                    <TabsTrigger value="coderabbit">CodeRabbit</TabsTrigger>
                  </TabsList>
                  <TabsContent value="minimax" className="flex-1 mt-0">
                    <AnalysisPanel result={latestReview} isLoading={isAnalyzing} />
                  </TabsContent>
                  <TabsContent value="coderabbit" className="flex-1 mt-0">
                    <CodeRabbitReviewPanel result={coderabbitReview} isLoading={isCodeRabbitLoading} />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {interviewMode === 'practice' ? (
        <PracticeReportDialog open={showReport} onOpenChange={setShowReport} />
      ) : (
        <InterviewReportDialog open={showReport} onOpenChange={setShowReport} />
      )}

      {/* Workspace Progress Indicator */}
      <WorkspaceProgressIndicator onRetry={initWorkspace} />
    </div>
  );
}
