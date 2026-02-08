'use client';

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from "@/components/ui/resizable";
import { ProblemDescription } from "@/components/interview/ProblemDescription";
import { ConsolePanel } from "@/components/interview/ConsolePanel";
import { Controls } from "@/components/interview/Controls";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { InterviewAgent } from "@/components/agent/InterviewAgent";
import { TranscriptPanel } from "@/components/agent/TranscriptPanel";
import { useInterviewStore } from "@/lib/store";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { InterviewReportDialog } from "@/components/interview/InterviewReportDialog";
import { PracticeReportDialog } from "@/components/practice/PracticeReportDialog";
import { WorkspaceProgressIndicator } from "@/components/workspace/WorkspaceProgressIndicator";
import { Timer } from "@/components/interview/Timer";
import { Shield, GraduationCap } from "lucide-react";
import { PROBLEMS } from "@/data/problems";
import { COMPANIES, NEETCODE_CATEGORIES } from "@/data/company-problems";
import { generateTestCode } from "@/lib/test-runner";
import { authFetch, initSession } from "@/lib/api-client";
import { playSound, setMuted } from "@/lib/sounds";
import { Volume2, VolumeX } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import confetti from "canvas-confetti";
import Link from "next/link";
import { SystemDesignAgent } from "@/components/agent/SystemDesignAgent";
import MermaidDiagramCanvas from "@/components/diagram/MermaidDiagramCanvas";
import { SystemDesignPanel } from "@/components/diagram/SystemDesignPanel";
import { useSystemDesignStore } from "@/lib/system-design-store";
import { Layers } from "lucide-react";

export default function InterviewPage() {
  const {
    code,
    setCode,
    consoleOutput,
    addLog,
    clearLogs,
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
    customProblems,
    agentDisconnect,
    setOnEndInterview,
    startSession,
    interviewStartTime,
    language,
    setLanguage,
    selectedTopicId,
  } = useInterviewStore();

  const [mounted, setMounted] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  const [soundMuted, setSoundMuted] = useState(false);

  const toggleMute = () => {
    const next = !soundMuted;
    setSoundMuted(next);
    setMuted(next);
  };
  const [lastError, setLastError] = useState<string | null>(null);

  const isSystemDesign = interviewMode === 'system-design';

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  // Integrity tracking (real AND practice modes - not system-design)
  useEffect(() => {
    if (isSystemDesign) return; // Skip for system-design only

    const handleBlur = () => {
      useInterviewStore.getState().addBlurEvent();
      console.log('⚠️ User switched tabs during interview');
    };

    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, [isSystemDesign]);

  // Initialize interview mode and problem (CODING INTERVIEW ONLY)
  useEffect(() => {
    // Skip for system design mode
    if (isSystemDesign) return;
    
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
  }, [isSystemDesign, interviewMode, currentProblemId, selectedCompanyId, setCurrentProblemId, setCode, setInterviewMode, setSelectedCompanyId]);

  // Initialize workspace with progress tracking (CODING INTERVIEW ONLY)
  const initWorkspace = async () => {
    setWorkspaceStatus('creating');
    setWorkspaceProgress({ step: 'Connecting to Daytona...', progress: 10 });
    setWorkspaceError(null);

    try {
      setWorkspaceProgress({ step: 'Creating sandbox environment...', progress: 25 });

      const res = await authFetch('/api/sandbox/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language }),
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
        startSession();
        playSound('ready');
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

  // Cleanup workspace on page unload/navigation
  const cleanupWorkspace = async (wsId: string) => {
    try {
      console.log('🗑️ Cleaning up workspace on page leave:', wsId);
      await fetch('/api/sandbox/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId: wsId }),
        keepalive: true, // Ensures request completes even if page unloads
      });
      console.log('✅ Workspace cleanup complete');
    } catch (err) {
      console.warn('Failed to cleanup workspace:', err);
    }
  };

  useEffect(() => {
    // Skip for system design mode
    if (isSystemDesign) return;
    
    // Initialize session token first, then workspace
    initSession().then(() => initWorkspace());

    // Cleanup on page unload (browser close, tab close, navigation away)
    const handleBeforeUnload = () => {
      const wsId = useInterviewStore.getState().workspaceId;
      if (wsId) {
        // Use sendBeacon for reliable cleanup on page unload
        const data = JSON.stringify({ workspaceId: wsId });
        navigator.sendBeacon('/api/sandbox/delete', new Blob([data], { type: 'application/json' }));
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup on component unmount (React navigation)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      const wsId = useInterviewStore.getState().workspaceId;
      if (wsId) {
        cleanupWorkspace(wsId);
        setWorkspaceId(null);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSystemDesign]); // Run once

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
      if (selectedCompanyId === 'custom') {
        // Custom problems from user's library
        currentProblem = customProblems.find(p => p.id === currentProblemId);
      } else if (selectedCompanyId === 'neetcode-150') {
        // NeetCode 150 problems
        currentProblem = NEETCODE_CATEGORIES
          .flatMap(cat => cat.problems)
          .find(p => p.id === currentProblemId);
      } else {
        // Regular company problems
        const company = COMPANIES.find(c => c.id === selectedCompanyId);
        currentProblem = company?.problems.find(p => p.id === currentProblemId);
      }
    }

    const testCode = currentProblem
      ? generateTestCode(currentProblem, codeToRun, language)
      : codeToRun;

    try {
      const res = await authFetch('/api/sandbox/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId,
          code: testCode,
          language,
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

          playSound(testsPassed === testsTotal ? 'success' : 'error');

          if (testsPassed === testsTotal && testsTotal > 0) {
            confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
          }
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
      const res = await authFetch('/api/analysis/autofix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          error: lastError,
          language,
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

  const handleEndInterview = async () => {
    // Stop Gemini Live first
    if (agentDisconnect) {
      agentDisconnect();
    }

    // Delete the sandbox workspace
    const wsId = useInterviewStore.getState().workspaceId;
    if (wsId) {
      try {
        console.log('🗑️ Deleting workspace on end interview:', wsId);
        await authFetch('/api/sandbox/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ workspaceId: wsId }),
        });
        console.log('✅ Workspace deleted');
        setWorkspaceId(null);
        setWorkspaceStatus('idle');
      } catch (err) {
        console.warn('Failed to delete workspace:', err);
      }
    }

    // Then show the report
    playSound('complete');
    setShowReport(true);
  };

  // Register end-interview callback so the AI agent can trigger it via tool
  useEffect(() => {
    setOnEndInterview(() => handleEndInterview);
    return () => setOnEndInterview(null);
  }, [setOnEndInterview]);

  const handleLanguageChange = (newLang: string) => {
    if (newLang === language) return;
    setLanguage(newLang);

    // Find the current problem and swap to the appropriate starter code
    const problem = PROBLEMS.find(p => p.id === currentProblemId);
    if (problem) {
      if (newLang === 'javascript' && problem.starterCodeJS) {
        setCode(problem.starterCodeJS);
      } else {
        setCode(problem.starterCode);
      }
    }
  };

  if (!mounted) return null;

  // SYSTEM DESIGN MODE - Render dedicated layout
  if (isSystemDesign) {
    return <SystemDesignInterviewLayout />;
  }

  // CODING INTERVIEW MODE - Render standard layout
  return (
    <div id="interface-container" className="h-screen w-full bg-background overflow-hidden flex flex-col">
      <header className="h-12 border-b flex items-center px-4 justify-between bg-card z-10">
        <Link href="/" className="font-bold flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Logo size={24} />
          Alexis
        </Link>
        <div className="text-xs text-muted-foreground flex items-center gap-4">
          <Timer />
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="h-7 px-2 rounded border border-border bg-background text-foreground text-xs cursor-pointer focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="python">Python</option>
            <option value="javascript">JavaScript</option>
          </select>
          <button
            onClick={toggleMute}
            className="p-1 rounded hover:bg-accent transition-colors"
            aria-label={soundMuted ? "Unmute sounds" : "Mute sounds"}
            title={soundMuted ? "Unmute sounds" : "Mute sounds"}
          >
            {soundMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
          <ThemeToggle />
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
                  language={language}
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
              <div className="p-4 border-b shrink-0">
                <InterviewAgent />
              </div>

              <div className="flex-1 min-h-0 overflow-hidden border-b">
                <TranscriptPanel />
              </div>

              <Controls
                onRun={() => handleRun(code)}
                onAutoFix={handleAutoFix}
                onEndInterview={handleEndInterview}
                isRunning={isRunning}
                isFixing={isFixing}
                hasError={!!lastError}
              />
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

/**
 * System Design Interview Layout
 * Completely separate from the coding interview layout above
 * Uses its own store (system-design-store) and agent (SystemDesignAgent)
 */
function SystemDesignInterviewLayout() {
  const selectedTopicId = useSystemDesignStore((s) => s.selectedTopicId);
  const setOnEndInterview = useSystemDesignStore((s) => s.setOnEndInterview);
  const agentDisconnect = useSystemDesignStore((s) => s.agentDisconnect);
  
  const [mounted, setMounted] = useState(false);
  const [soundMuted, setSoundMuted] = useState(false);

  const toggleMute = () => {
    const next = !soundMuted;
    setSoundMuted(next);
    setMuted(next);
  };

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  // Check if topic is selected
  useEffect(() => {
    if (!selectedTopicId) {
      window.location.href = '/system-design';
    }
  }, [selectedTopicId]);

  // Initialize session
  useEffect(() => {
    initSession().then(() => {
      useSystemDesignStore.getState().startSession();
    });
  }, []);

  const handleEndInterview = async () => {
    // Disconnect agent
    const agentDisconnectFn = useSystemDesignStore.getState().agentDisconnect;
    if (agentDisconnectFn) {
      agentDisconnectFn();
    }

    playSound('complete');

    // Navigate back to topic selection
    window.location.href = '/system-design';
  };

  // Register end-interview callback
  useEffect(() => {
    setOnEndInterview(() => handleEndInterview);
    return () => setOnEndInterview(null);
  }, [setOnEndInterview]);

  if (!mounted) return null;

  return (
    <div id="interface-container" className="h-screen w-full bg-background overflow-hidden flex flex-col">
      <header className="h-12 border-b flex items-center px-4 justify-between bg-card z-10">
        <Link href="/" className="font-bold flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Logo size={24} />
          Alexis
        </Link>
        <div className="text-xs text-muted-foreground flex items-center gap-4">
          <Timer />
          <button
            onClick={toggleMute}
            className="p-1 rounded hover:bg-accent transition-colors"
            aria-label={soundMuted ? "Unmute sounds" : "Mute sounds"}
            title={soundMuted ? "Unmute sounds" : "Mute sounds"}
          >
            {soundMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
          <ThemeToggle />
          <span className="text-primary flex items-center gap-1 bg-primary/10 px-2 py-1 rounded">
            <Layers className="w-3 h-3" /> System Design
          </span>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          {/* Left Panel: Topic Info & Components Checklist */}
          <ResizablePanel defaultSize={20} minSize={15}>
            <SystemDesignPanel />
          </ResizablePanel>

          <ResizableHandle />

          {/* Center Panel: Architecture Diagram */}
          <ResizablePanel defaultSize={50} minSize={30}>
            <MermaidDiagramCanvas />
          </ResizablePanel>

          <ResizableHandle />

          {/* Right Panel: Agent & Transcript */}
          <ResizablePanel defaultSize={30} minSize={20} className="bg-card border-l">
            <div className="flex flex-col h-full overflow-hidden">
              <div className="p-4 border-b shrink-0">
                <SystemDesignAgent />
              </div>

              <div className="flex-1 min-h-0 overflow-hidden border-b">
                <TranscriptPanel />
              </div>

              <Controls
                onRun={() => {}}
                onEndInterview={handleEndInterview}
                isRunning={false}
                isFixing={false}
                hasError={false}
              />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
