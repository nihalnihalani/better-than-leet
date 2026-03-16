'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Play, Wand2, FileDown } from "lucide-react";

interface ControlsProps {
  onRun: () => void;
  onAutoFix?: () => void;
  onEndInterview: () => void;
  isRunning: boolean;
  isFixing?: boolean;
  hasError?: boolean;
}

export function Controls({
    onRun,
    onAutoFix,
    onEndInterview,
    isRunning,
    isFixing,
    hasError
}: ControlsProps) {
  return (
    <div className="flex flex-col gap-2 p-3">
      <Button
        onClick={onRun}
        disabled={isRunning}
        aria-busy={isRunning}
        aria-label={isRunning ? "Running code" : "Run code"}
        className="w-full rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors duration-150"
      >
        <Play className="w-3.5 h-3.5 mr-1.5" fill="currentColor" aria-hidden="true" />
        {isRunning ? "Running..." : "Run Code"}
      </Button>

      {hasError && onAutoFix && (
        <Button
            onClick={onAutoFix}
            disabled={isFixing}
            aria-busy={isFixing}
            aria-label={isFixing ? "Agent is fixing code" : "Auto fix code with agent"}
            className="w-full rounded-lg bg-white/10 hover:bg-white/15 text-purple-400 border border-purple-500/20 transition-colors duration-150"
        >
            <Wand2 className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
            {isFixing ? "Agent Fixing..." : "Auto Fix"}
        </Button>
      )}

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            className="w-full mt-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors duration-150"
            aria-label="End interview and download report"
          >
            <FileDown className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
            End Interview
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to end the interview?</AlertDialogTitle>
            <AlertDialogDescription>
              Your interview will be evaluated and a report will be generated. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onEndInterview}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              End Interview
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
