import React, { useState, useCallback } from 'react';
import { LogEntry, TestResult } from './types';
import { TWO_SUM_PROBLEM } from './constants';
import CodeEditor from './components/CodeEditor';
import Terminal from './components/Terminal';
import ControlBar from './components/ControlBar';
import { useGeminiLive } from './hooks/useGeminiLive';

function App() {
  const [code, setCode] = useState(TWO_SUM_PROBLEM.defaultCode);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [integrityEvents, setIntegrityEvents] = useState(0);

  const addLog = useCallback((message: string, type: 'info' | 'error' | 'success' | 'warning' | 'tool' | 'ai' = 'info') => {
    setLogs(prev => [...prev, {
      timestamp: Date.now(),
      source: type === 'tool' ? 'tool' : type === 'ai' ? 'ai' : 'system',
      message,
      type: (type === 'tool' || type === 'ai') ? undefined : type as any
    }]);
  }, []);

  const handlePaste = useCallback(() => {
    setIntegrityEvents(prev => prev + 1);
    addLog('Paste event detected in editor', 'warning');
  }, [addLog]);

  // Mock Test Runner
  const runTests = useCallback(async (currentCode: string): Promise<TestResult[]> => {
    addLog('Compiling and running tests...', 'info');
    const results: TestResult[] = [];
    
    // Naive safety wrapper for demo purposes. 
    // In production, run this in a Web Worker or Sandboxed environment.
    try {
        // eslint-disable-next-line no-new-func
        const userFn = new Function('nums', 'target', `${currentCode}\nreturn twoSum(nums, target);`);

        for (const testCase of TWO_SUM_PROBLEM.testCases) {
            try {
                // Deep copy inputs to prevent mutation side effects
                const inputCopy = JSON.parse(JSON.stringify(testCase.input));
                const result = userFn(inputCopy[0], inputCopy[1]);
                
                // Simple equality check for array output
                const isCorrect = Array.isArray(result) && 
                    result.length === 2 && 
                    result.sort((a,b) => a-b).toString() === testCase.expected.sort((a:number,b:number) => a-b).toString();

                results.push({
                    passed: isCorrect,
                    input: JSON.stringify(testCase.input),
                    expected: JSON.stringify(testCase.expected),
                    actual: JSON.stringify(result),
                    description: testCase.description
                });
            } catch (err: any) {
                results.push({
                    passed: false,
                    input: JSON.stringify(testCase.input),
                    expected: JSON.stringify(testCase.expected),
                    actual: 'Error',
                    error: err.message,
                    description: testCase.description
                });
            }
        }
    } catch (err: any) {
        addLog(`Syntax Error: ${err.message}`, 'error');
        return [];
    }

    setTestResults(results);
    const passedCount = results.filter(r => r.passed).length;
    addLog(`Tests completed: ${passedCount}/${results.length} passed.`, passedCount === results.length ? 'success' : 'warning');
    return results;
  }, [addLog]);

  const { connect, disconnect, status, isMicOn, volume } = useGeminiLive({
    apiKey: process.env.API_KEY,
    problem: TWO_SUM_PROBLEM,
    code,
    testRunner: runTests,
    onLog: addLog,
    integrityEvents
  });

  return (
    <div className="flex flex-col h-screen w-full bg-slate-950 text-slate-200">
      {/* Header */}
      <header className="h-14 border-b border-slate-800 bg-slate-900/50 flex items-center px-6 justify-between shrink-0">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white">A</div>
           <h1 className="font-semibold text-lg tracking-tight">Shifu <span className="text-slate-500 font-normal">| AI Technical Interviewer</span></h1>
        </div>
        <div className="text-xs text-slate-500 font-mono">
           gemini-2.5-flash-native-audio-preview
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Panel: Problem Description */}
        <div className="w-1/3 border-r border-slate-800 flex flex-col bg-slate-900/20">
          <div className="p-6 overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-2">{TWO_SUM_PROBLEM.title}</h2>
            <div className="prose prose-invert prose-sm max-w-none text-slate-300">
              <p className="whitespace-pre-wrap font-sans leading-relaxed">{TWO_SUM_PROBLEM.description}</p>
              
              <h3 className="text-white mt-6 font-semibold">Examples</h3>
              <div className="space-y-4 mt-2">
                {TWO_SUM_PROBLEM.testCases.map((tc, i) => (
                  <div key={i} className="bg-slate-900 rounded p-3 border border-slate-800 font-mono text-xs">
                    <div className="text-slate-400">Input: <span className="text-blue-300">{JSON.stringify(tc.input[0])}, target = {tc.input[1]}</span></div>
                    <div className="text-slate-400 mt-1">Output: <span className="text-green-300">{JSON.stringify(tc.expected)}</span></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Code & Terminal */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 p-4 pb-0">
            <CodeEditor 
              code={code} 
              onChange={setCode} 
              onPaste={handlePaste}
            />
          </div>
          <div className="h-1/3 p-4">
            <Terminal logs={logs} testResults={testResults} />
          </div>
        </div>
      </main>

      {/* Control Bar */}
      <ControlBar 
        status={status}
        onConnect={connect}
        onDisconnect={disconnect}
        onRunCode={() => runTests(code)}
        isMicOn={isMicOn}
        volume={volume}
      />
    </div>
  );
}

export default App;