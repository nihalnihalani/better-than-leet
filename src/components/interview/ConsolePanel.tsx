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
        case 'stderr': return <AlertCircle className="w-3 h-3 text-red-500" />;
        case 'system': return <Info className="w-3 h-3 text-blue-400" />;
        case 'agent': return <Cpu className="w-3 h-3 text-purple-400 animate-pulse" />;
        case 'stdout': return <CheckCircle className="w-3 h-3 text-green-500" />;
        default: return <Terminal className="w-3 h-3" />;
    }
};

const LogColor = (type: LogType) => {
    switch (type) {
        case 'stderr': return 'text-red-400';
        case 'system': return 'text-blue-400';
        case 'agent': return 'text-purple-300';
        default: return 'text-foreground/80';
    }
};

export function ConsolePanel({ output }: ConsolePanelProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [output]);

  return (
    <div className="flex flex-col h-full bg-background border-t border-border font-mono text-sm shadow-inner">
      <div className="flex items-center gap-2 px-4 py-2 bg-card border-b border-border text-xs font-semibold text-muted-foreground select-none">
        <Terminal className="w-3 h-3" />
        Console
        <div className="ml-auto flex gap-2">
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div> ONLINE</div>
        </div>
      </div>
      <pre className="flex-1 p-4 overflow-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent font-mono">
        {output.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50">
            <Cpu className="w-12 h-12 mb-2" />
            <span className="text-xs">Awaiting Input...</span>
          </div>
        ) : (
          <div role="log" aria-live="polite" aria-label="Console output log" className="flex flex-col gap-1">
            {output.map((log, i) => (
              <div key={i} className={cn("flex items-start gap-2 wrap-break-word leading-relaxed animate-in fade-in slide-in-from-bottom-1 duration-200", LogColor(log.type))}>
                  <span className="mt-1 opacity-70 shrink-0 select-none" aria-hidden="true">
                      <LogIcon type={log.type} />
                  </span>
                  <span className="whitespace-pre-wrap">{log.content}</span>
              </div>
            ))}
          </div>
        )}
        <div ref={endRef} />
      </pre>
    </div>
  );
}
