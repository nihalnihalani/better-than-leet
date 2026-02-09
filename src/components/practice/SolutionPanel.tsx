'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Clock, HardDrive, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';

interface SolutionPanelProps {
  solution?: string;
  solutionCode?: string;
  timeComplexity?: string;
  spaceComplexity?: string;
  defaultExpanded?: boolean;
}

export function SolutionPanel({
  solution,
  solutionCode,
  timeComplexity,
  spaceComplexity,
  defaultExpanded = false,
}: SolutionPanelProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [copied, setCopied] = useState(false);

  if (!solution && !solutionCode) return null;

  const handleCopyCode = () => {
    if (!solutionCode) return;
    try {
      navigator.clipboard.writeText(solutionCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API may fail
    }
  };

  return (
    <Card className="bg-card border-l-4 border-l-emerald-500">
      <CardHeader className="cursor-pointer select-none" onClick={() => setExpanded(!expanded)}>
        <CardTitle className="flex items-center justify-between text-emerald-500">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Solution Editorial
          </div>
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </CardTitle>
      </CardHeader>
      {expanded && (
        <CardContent className="space-y-4">
          {solution && (
            <div className="text-sm text-foreground/80 leading-relaxed">
              {solution}
            </div>
          )}

          {(timeComplexity || spaceComplexity) && (
            <div className="flex gap-4">
              {timeComplexity && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  Time: <span className="font-mono text-foreground">{timeComplexity}</span>
                </div>
              )}
              {spaceComplexity && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <HardDrive className="w-3 h-3" />
                  Space: <span className="font-mono text-foreground">{spaceComplexity}</span>
                </div>
              )}
            </div>
          )}

          {solutionCode && (
            <div className="relative">
              <div className="absolute top-2 right-2 z-10">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopyCode}>
                  {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                </Button>
              </div>
              <pre className="text-xs bg-muted/50 rounded-lg p-4 overflow-x-auto">
                <code>{solutionCode}</code>
              </pre>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
