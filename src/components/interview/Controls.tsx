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
  mode?: 'coding' | 'system-design' | 'behavioral';
}

export function Controls({
    onRun,
    onAutoFix,
    onEndInterview,
    isRunning,
    isFixing,
    hasError,
    mode = 'coding',
}: ControlsProps) {
  const isVoiceOnly = mode === 'system-design' || mode === 'behavioral';

  return (
    <div className="flex flex-col gap-2 p-4">
      {!isVoiceOnly && (
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
      )}

      {!isVoiceOnly && hasError && onAutoFix && (
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

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="destructive"
            className={`w-full ${!isVoiceOnly ? 'mt-4' : ''}`}
            aria-label="End interview and download report"
          >
            <FileDown className="w-4 h-4 mr-2" aria-hidden="true" />
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
