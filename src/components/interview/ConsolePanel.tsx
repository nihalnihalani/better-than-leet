'use client';

import React, { useRef, useEffect } from 'react';
import { Terminal, AlertCircle, Info, Cpu, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type LogType = 'stdout' | 'stderr' | 'system' | 'agent';

interface ConsolePanelProps { 
  output: { type: LogType; content: string }[] 
}

const LogIcon = ({ type }: { type: LogType }) => {
    switch (type) {
        case 'stderr': return <AlertCircle className="w-3 h-3 text-red-400" />;
        case 'system': return <Info className="w-3 h-3 text-gray-500" />;
        case 'agent': return <Cpu className="w-3 h-3 text-purple-400" />;
        case 'stdout': return <CheckCircle className="w-3 h-3 text-emerald-400" />;
        default: return <Terminal className="w-3 h-3 text-gray-500" />;
    }
};

const LogColor = (type: LogType) => {
    switch (type) {
        case 'stderr': return 'text-red-500 dark:text-red-400';
        case 'system': return 'text-muted-foreground';
        case 'agent': return 'text-purple-600 dark:text-purple-300';
        default: return 'text-foreground/80';
    }
};

export function ConsolePanel({ output }: ConsolePanelProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [output]);

  return (
    <div className="flex flex-col h-full bg-muted/30 dark:bg-card border-t border-border font-mono text-xs">
      <div className="flex items-center gap-2 h-8 px-3 border-b border-border select-none shrink-0 bg-muted/50 dark:bg-muted/20">
        <Terminal className="w-3 h-3 text-muted-foreground" />
        <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Console</span>
      </div>
      <div className="flex-1 p-3 overflow-auto font-mono">
        {output.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground/50">
            <Terminal className="w-8 h-8 mb-2 opacity-20" />
            <span className="text-[11px]">Awaiting output...</span>
          </div>
        ) : (
          <div role="log" aria-live="polite" aria-label="Console output log" className="flex flex-col gap-0.5">
            {output.map((log, i) => (
              <div key={i} className={cn("flex items-start gap-2 py-0.5 px-1 rounded-sm leading-5", LogColor(log.type))}>
                  <span className="mt-0.5 shrink-0 select-none opacity-60" aria-hidden="true">
                      <LogIcon type={log.type} />
                  </span>
                  <span className="whitespace-pre-wrap break-words">{log.content}</span>
              </div>
            ))}
          </div>
        )}
        <div ref={endRef} />
      </div>
    </div>
  );
}
