'use client';

import { FolderGit2, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { InterviewAgent } from "@/components/agent/InterviewAgent";
import { AnalysisPanel } from "@/components/analysis/AnalysisPanel";
import { useInterviewStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export default function TestPage() {
  const [mounted, setMounted] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [output, setOutput] = useState("");
  const [analysisResult, setAnalysisResult] = useState(null);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const { code, setCode } = useInterviewStore();

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  // Initialize workspace on load
  useEffect(() => {
    async function initWorkspace() {
      try {
        const res = await fetch('/api/sandbox/create', {
          method: 'POST',
          body: JSON.stringify({ language: 'python' }),
        });
        const data = await res.json();
        setWorkspaceId(data.id);
      } catch (err) {
        console.error("Failed to init workspace", err);
      }
    }
    initWorkspace();
  }, []);

  const handleRun = async (codeToRun: string) => {
    if (!workspaceId) return;
    setIsRunning(true);
    setOutput("Running...");
    
    try {
      const res = await fetch('/api/sandbox/execute', {
        method: 'POST',
        body: JSON.stringify({
          workspaceId,
          code: codeToRun,
          language: 'python'
        }),
      });
      const data = await res.json();
      setOutput(data.stdout || data.stderr || "No output");
    } catch (err) {
        setOutput(`Error: ${err}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
    try {
      const res = await fetch('/api/analysis/review', {
        method: 'POST',
        body: JSON.stringify({ code, language: 'python' }),
      });
      const data = await res.json();
      setAnalysisResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleEditorChange = (value: string | undefined) => {
    setCode(value || "");
  };

  if (!mounted) return null;

  return (
    <div className="p-8 space-y-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <FolderGit2 className="w-8 h-8" />
        Phase 4: Full Integration Test
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Interview & Analysis */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Interview Agent</CardTitle>
            </CardHeader>
            <CardContent>
              <InterviewAgent />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>MiniMax Analysis</CardTitle>
              <Button size="sm" onClick={handleAnalyze} disabled={isAnalyzing}>
                <Sparkles className="w-4 h-4 mr-2" />
                Analyze Code
              </Button>
            </CardHeader>
            <CardContent>
              <AnalysisPanel result={analysisResult} isLoading={isAnalyzing} />
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Editor & Output */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle>Python Editor (Workspace: {workspaceId || "Initializing..."})</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-hidden rounded-b-xl min-h-[500px]">
               <CodeEditor 
                 language="python"
                 initialCode={code}
                 onRun={handleRun}
                 onChange={handleEditorChange}
                 isRunning={isRunning}
               />
            </CardContent>
          </Card>

          <Card>
             <CardHeader>
               <CardTitle>Execution Output</CardTitle>
             </CardHeader>
             <CardContent>
               <pre className="bg-black/90 text-green-400 p-4 rounded-md font-mono text-sm min-h-[100px] whitespace-pre-wrap">
                 {output || "Ready to execute..."}
               </pre>
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
