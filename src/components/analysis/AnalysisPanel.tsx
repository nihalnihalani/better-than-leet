'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle, BrainCircuit, Shield, ShieldAlert } from 'lucide-react';
import { cn } from "@/lib/utils";

interface AnalysisResult {
  score: number;
  security_score?: number;
  complexity: string;
  issues: string[];
  security_issues?: string[];
  reasoning_trace: string;
}

export function AnalysisPanel({ result, isLoading }: { result: AnalysisResult | null, isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-muted-foreground animate-pulse">
        <BrainCircuit className="w-8 h-8 mb-2 animate-spin-slow" />
        <p>Gemini is analyzing your code...</p>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div id="analysis-container" className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-lg bg-card border border-border">
          <div className="text-sm text-muted-foreground mb-1">Quality Score</div>
          <div className={cn("text-2xl font-bold", 
            result.score >= 8 ? "text-green-500" : 
            result.score >= 5 ? "text-yellow-500" : "text-red-500"
          )}>
            {result.score}/10
          </div>
        </div>
        <div className="p-4 rounded-lg bg-card border border-border">
            <div className="text-sm text-muted-foreground mb-1">Security Score</div>
            <div className={cn("text-2xl font-bold", 
              (result.security_score || 0) >= 9 ? "text-green-500" : 
              (result.security_score || 0) >= 6 ? "text-yellow-500" : "text-red-500"
            )}>
              {result.security_score !== undefined ? `${result.security_score}/10` : "N/A"}
            </div>
        </div>
        <div className="col-span-2 p-4 rounded-lg bg-card border border-border">
          <div className="text-sm text-muted-foreground mb-1">Time Complexity</div>
          <div className="text-2xl font-bold text-blue-400">{result.complexity}</div>
        </div>
      </div>

      {result.security_issues && result.security_issues.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-red-400 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" /> Security Vulnerabilities
            </h4>
            <ul className="space-y-2">
              {result.security_issues.map((issue, i) => (
                  <li key={i} className="text-sm text-red-300 bg-red-950/40 p-2 rounded border border-red-900/50">
                    • {issue}
                  </li>
                ))}
            </ul>
          </div>
      )}

      <div className="space-y-2">
        <h4 className="font-semibold text-foreground/80 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> Code Issues
        </h4>
        <ul className="space-y-2">
          {result.issues.length === 0 ? (
            <li className="flex items-center gap-2 text-green-400 text-sm">
              <CheckCircle className="w-4 h-4" /> No major issues found.
            </li>
          ) : (
            result.issues.map((issue, i) => (
              <li key={i} className="text-sm text-foreground/80 bg-yellow-900/20 p-2 rounded border border-yellow-900/30">
                • {issue}
              </li>
            ))
          )}
        </ul>
      </div>

      <div className="space-y-2">
        <h4 className="font-semibold text-foreground/80 flex items-center gap-2">
          <BrainCircuit className="w-4 h-4" /> AI Reasoning
        </h4>
        <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg border border-border italic">
          "{result.reasoning_trace}"
        </div>
      </div>
    </div>
  );
}
