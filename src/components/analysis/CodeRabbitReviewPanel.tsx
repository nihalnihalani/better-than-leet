import React from 'react';
import { Rabbit, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { CodeRabbitReview } from '@/lib/coderabbit';

export function CodeRabbitReviewPanel({ result, isLoading }: { result: CodeRabbitReview | null, isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-gray-400">
        <Rabbit className="w-6 h-6 mb-2 opacity-50" />
        <p className="text-sm">Analyzing code...</p>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
        <h3 className="text-orange-400 font-semibold flex items-center gap-2 mb-2">
            <Rabbit className="w-5 h-5" /> CodeRabbit Summary
        </h3>
        <p className="text-sm text-gray-300 leading-relaxed">
            {result.summary}
        </p>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Walkthrough</h4>
        <ul className="space-y-3">
            {result.walkthrough.map((step, i) => (
                <li key={i} className="flex gap-3 text-sm text-gray-300">
                    <div className="min-w-[20px] h-[20px] rounded-full bg-gray-800 flex items-center justify-center text-xs font-mono text-gray-500 mt-0.5">
                        {i + 1}
                    </div>
                    <span>{step}</span>
                </li>
            ))}
        </ul>
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Detailed Issues</h4>
        {result.issues.length === 0 ? (
            <div className="flex items-center gap-2 text-green-400 text-sm p-4 bg-green-900/10 rounded-lg border border-green-900/30">
                <CheckCircle className="w-4 h-4" /> No significant issues found.
            </div>
        ) : (
            result.issues.map((issue, i) => (
                <div key={i} className={`p-3 rounded-lg border text-sm ${
                    issue.severity === 'high' ? 'bg-red-950/20 border-red-900/50 text-red-200' :
                    issue.severity === 'medium' ? 'bg-yellow-950/20 border-yellow-900/50 text-yellow-200' :
                    'bg-blue-950/20 border-blue-900/50 text-blue-200'
                }`}>
                    <div className="flex items-start gap-2">
                        {issue.severity === 'high' ? <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" /> : <Info className="w-4 h-4 mt-0.5 shrink-0" />}
                        <div>
                            <span className="font-semibold uppercase text-xs opacity-70 mb-1 block">
                                {issue.severity} Priority
                                {issue.line ? ` • Line ${issue.line}` : ''}
                            </span>
                            {issue.message}
                        </div>
                    </div>
                </div>
            ))
        )}
      </div>
    </div>
  );
}
