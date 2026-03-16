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
        case 'stderr': return 'text-red-400';
        case 'system': return 'text-gray-400';
        case 'agent': return 'text-purple-300';
        default: return 'text-gray-300';
    }
};

export function ConsolePanel({ output }: ConsolePanelProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [output]);

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] border-t border-white/10 font-mono text-xs">
      <div className="flex items-center gap-2 h-8 px-3 border-b border-white/10 select-none shrink-0">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
        </div>
        <span className="text-[11px] uppercase tracking-wider text-gray-500 font-medium ml-2">Console</span>
      </div>
      <pre className="flex-1 p-3 overflow-auto font-mono">
        {output.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-600">
            <Terminal className="w-8 h-8 mb-2 opacity-30" />
            <span className="text-[11px] text-gray-500">Awaiting output...</span>
          </div>
        ) : (
          <div role="log" aria-live="polite" aria-label="Console output log" className="flex flex-col gap-0.5">
            {output.map((log, i) => (
              <div key={i} className={cn("flex items-start gap-2 py-0.5 px-1 rounded-sm leading-5", LogColor(log.type))}>
                  <span className="mt-0.5 shrink-0 select-none opacity-60" aria-hidden="true">
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
