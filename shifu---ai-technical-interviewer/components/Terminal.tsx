import React, { useEffect, useRef } from 'react';
import { LogEntry, TestResult } from '../types';

interface TerminalProps {
  logs: LogEntry[];
  testResults: TestResult[];
}

const Terminal: React.FC<TerminalProps> = ({ logs, testResults }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, testResults]);

  return (
    <div className="flex flex-col h-full bg-black rounded-lg border border-slate-800 overflow-hidden font-mono text-xs">
      <div className="bg-slate-900 px-3 py-1.5 border-b border-slate-800 text-slate-400">
        Output / Console
      </div>
      <div ref={scrollRef} className="flex-1 p-3 overflow-y-auto space-y-2">
        {/* Render Test Results if any */}
        {testResults.length > 0 && (
          <div className="mb-4 space-y-1">
             <div className="text-blue-400 font-bold mb-1">--- Test Execution ---</div>
             {testResults.map((tr, i) => (
               <div key={i} className={`flex items-start gap-2 ${tr.passed ? 'text-green-400' : 'text-red-400'}`}>
                 <span>{tr.passed ? '✓' : '✗'}</span>
                 <div>
                    <div>{tr.description}</div>
                    {!tr.passed && (
                      <div className="text-slate-500 pl-4 mt-1">
                        Expected: {tr.expected}<br/>
                        Actual: {tr.actual}
                        {tr.error && <br/>}
                        {tr.error && <span className="text-red-500">Error: {tr.error}</span>}
                      </div>
                    )}
                 </div>
               </div>
             ))}
             <div className="border-b border-slate-800 my-2"></div>
          </div>
        )}

        {/* Render Logs */}
        {logs.map((log, index) => (
          <div key={index} className="flex gap-2">
            <span className="text-slate-600 shrink-0">
              {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' })}
            </span>
            <span className={`
              ${log.type === 'error' ? 'text-red-500' : ''}
              ${log.type === 'success' ? 'text-green-500' : ''}
              ${log.type === 'warning' ? 'text-yellow-500' : ''}
              ${log.type === 'tool' ? 'text-purple-400' : ''}
              ${log.source === 'ai' ? 'text-blue-300' : 'text-slate-300'}
            `}>
              {log.source === 'ai' && <span className="font-bold text-blue-400 mr-1">Shifu:</span>}
              {log.source === 'tool' && <span className="font-bold text-purple-500 mr-1">[TOOL]</span>}
              {log.message}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Terminal;