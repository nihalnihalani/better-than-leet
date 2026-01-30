'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { Play, Sparkles, Wand2, Rabbit, FileDown } from "lucide-react";
import { useInterviewStore } from '@/lib/store';
import { reportGenerator } from '@/lib/reporting';

interface ControlsProps {
  onRun: () => void;
  onAnalyze: () => void;
  onCodeRabbit: () => void;
  onAutoFix?: () => void;
  onEndInterview: () => void; // New prop
  isRunning: boolean;
  isAnalyzing: boolean;
  isCodeRabbitLoading: boolean;
  isFixing?: boolean;
  hasError?: boolean;
}

export function Controls({ 
    onRun, 
    onAnalyze, 
    onCodeRabbit, 
    onAutoFix, 
    onEndInterview,
    isRunning, 
    isAnalyzing, 
    isCodeRabbitLoading,
    isFixing,
    hasError 
}: ControlsProps) {
  const { isWizardMode, toggleWizardMode } = useInterviewStore();

  return (
    <div className="flex flex-col gap-2 p-4">
      <Button
        onClick={onRun}
        disabled={isRunning}
        aria-busy={isRunning}
        aria-label={isRunning ? "Running code" : "Run code"}
        className="w-full bg-green-600 hover:bg-green-700 text-white"
      >
        <Play className="w-4 h-4 mr-2" fill="currentColor" aria-hidden="true" />
        {isRunning ? "Running..." : "Run Code"}
      </Button>

      {hasError && onAutoFix && (
        <Button
            onClick={onAutoFix}
            disabled={isFixing}
            aria-busy={isFixing}
            aria-label={isFixing ? "Agent is fixing code" : "Auto fix code with agent"}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white animate-pulse"
        >
            <Wand2 className="w-4 h-4 mr-2" aria-hidden="true" />
            {isFixing ? "Agent Fixing..." : "Auto Fix with Agent"}
        </Button>
      )}

      <div className="grid grid-cols-2 gap-2">
        <Button
          onClick={onAnalyze}
          disabled={isAnalyzing}
          aria-busy={isAnalyzing}
          aria-label={isAnalyzing ? "Analyzing with MiniMax" : "Quick review with MiniMax"}
          variant="secondary"
          className="w-full"
        >
          <Sparkles className="w-4 h-4 mr-2" aria-hidden="true" />
          {isAnalyzing ? "MiniMax..." : "Quick Review"}
        </Button>

        <Button
          onClick={onCodeRabbit}
          disabled={isCodeRabbitLoading}
          aria-busy={isCodeRabbitLoading}
          aria-label={isCodeRabbitLoading ? "Loading CodeRabbit review" : "Review with CodeRabbit"}
          variant="outline"
          className="w-full border-orange-500/50 text-orange-500 hover:bg-orange-500/10 hover:text-orange-400"
        >
          <Rabbit className="w-4 h-4 mr-2" aria-hidden="true" />
          {isCodeRabbitLoading ? "CodeRabbit..." : "CodeRabbit Review"}
        </Button>
      </div>

      <Button
        variant="ghost"
        className="w-full text-xs text-muted-foreground"
        onClick={() => window.location.reload()}
        aria-label="Retry workspace connection"
      >
        <Sparkles className="w-3 h-3 mr-2" aria-hidden="true" />
        Retry Workspace Connection
      </Button>

      <Button
        variant="destructive"
        className="w-full mt-4"
        onClick={onEndInterview}
        aria-label="End interview and download report"
      >
        <FileDown className="w-4 h-4 mr-2" aria-hidden="true" />
        End Interview
      </Button>

      <div className="pt-4 border-t border-gray-800 mt-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleWizardMode}
          aria-pressed={isWizardMode}
          aria-label={isWizardMode ? "Disable wizard mode" : "Enable wizard mode"}
          className={`w-full text-xs ${isWizardMode ? 'text-purple-400 bg-purple-900/10' : 'text-gray-500'}`}
        >
          <Wand2 className="w-3 h-3 mr-2" aria-hidden="true" />
          {isWizardMode ? "Disable Wizard Mode" : "Enable Wizard Mode"}
        </Button>
      </div>
    </div>
  );
}
