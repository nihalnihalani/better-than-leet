'use client';

import { useSystemDesignStore } from '@/lib/system-design-store';
import { getSystemDesignTopic } from '@/data/system-design-topics';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle2, Circle, Layers } from 'lucide-react';
import { countMermaidComponents } from '@/lib/mermaid-parser';

const PHASES = [
  { id: 'requirements', label: 'Requirements' },
  { id: 'high-level', label: 'High-Level Design' },
  { id: 'deep-dive', label: 'Deep Dive' },
  { id: 'scaling', label: 'Scaling' },
  { id: 'closing', label: 'Closing' },
];

export function SystemDesignPanel() {
  const selectedTopicId = useSystemDesignStore((s) => s.selectedTopicId);
  const mermaidDiagram = useSystemDesignStore((s) => s.mermaidDiagram);

  const topic = selectedTopicId ? getSystemDesignTopic(selectedTopicId) : null;

  if (!topic) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground p-4">
        <p>No topic selected</p>
      </div>
    );
  }

  // Count components from Mermaid diagram
  const { nodes: nodeCount } = countMermaidComponents(mermaidDiagram);

  // Determine current phase based on diagram state
  let currentPhaseIndex = 0;
  if (nodeCount >= 1) currentPhaseIndex = 1;
  if (nodeCount >= 3) currentPhaseIndex = 2;
  if (nodeCount >= 5) currentPhaseIndex = 3;
  if (nodeCount >= 7) currentPhaseIndex = 4;

  // Extract component types from Mermaid (simplified - just count unique node IDs)
  const nodeMatches = mermaidDiagram.match(/\w+[\[\(\{\>]/g) || [];
  const uniqueNodes = new Set(nodeMatches.map(m => m.replace(/[\[\(\{\>]/, '')));
  const componentsPlaced = uniqueNodes.size;

  return (
    <div className="h-full flex flex-col bg-card">
      {/* Topic Header */}
      <div className="p-4 border-b space-y-1">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-primary" />
          <h2 className="font-semibold text-sm">System Design</h2>
        </div>
        <h3 className="font-bold text-lg">{topic.title}</h3>
        <span
          className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full ${
            topic.difficulty === 'Hard'
              ? 'bg-red-500/20 text-red-400'
              : 'bg-yellow-500/20 text-yellow-400'
          }`}
        >
          {topic.difficulty}
        </span>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Problem Description */}
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Problem
            </h4>
            <p className="text-sm text-foreground/80 leading-relaxed">{topic.description}</p>
          </div>

          {/* Phase Progress */}
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Interview Phase
            </h4>
            <div className="space-y-2">
              {PHASES.map((phase, i) => {
                const isActive = i === currentPhaseIndex;
                const isCompleted = i < currentPhaseIndex;
                return (
                  <div
                    key={phase.id}
                    className={`flex items-center gap-2 text-sm py-1 px-2 rounded ${
                      isActive
                        ? 'bg-primary/10 text-primary font-medium'
                        : isCompleted
                          ? 'text-muted-foreground'
                          : 'text-muted-foreground/50'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                    ) : (
                      <Circle
                        className={`w-3.5 h-3.5 shrink-0 ${
                          isActive ? 'text-primary' : 'text-muted-foreground/30'
                        }`}
                      />
                    )}
                    <span>{phase.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Expected Components Checklist */}
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Components ({componentsPlaced}/{topic.expectedComponents.length})
            </h4>
            <div className="space-y-1.5">
              {topic.expectedComponents.map((comp, idx) => {
                // Simple heuristic: mark as placed if we have enough components
                const isPlaced = idx < componentsPlaced;
                return (
                  <div
                    key={comp}
                    className={`flex items-center gap-2 text-sm ${
                      isPlaced ? 'text-green-400' : 'text-muted-foreground/60'
                    }`}
                  >
                    {isPlaced ? (
                      <CheckCircle2 className="w-3 h-3 shrink-0" />
                    ) : (
                      <Circle className="w-3 h-3 shrink-0" />
                    )}
                    <span className="capitalize">{comp}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Discussion Points */}
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Key Discussion Points
            </h4>
            <ul className="space-y-2">
              {topic.discussionPoints.map((point, i) => (
                <li key={i} className="text-sm text-foreground/70 leading-relaxed flex gap-2">
                  <span className="text-muted-foreground/40 shrink-0">{i + 1}.</span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
