'use client';

import { useMemo } from 'react';
import { useSystemDesignStore } from '@/lib/system-design-store';
import { getSystemDesignTopic } from '@/data/system-design-topics';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle2, Circle, Layers } from 'lucide-react';
import { countMermaidComponents } from '@/lib/mermaid-parser';

const PHASES = [
  { id: 'requirements', label: 'Requirements', minMinutes: 0 },
  { id: 'high-level', label: 'High-Level Design', minMinutes: 3 },
  { id: 'deep-dive', label: 'Deep Dive', minMinutes: 10 },
  { id: 'scaling', label: 'Scaling', minMinutes: 25 },
  { id: 'closing', label: 'Closing', minMinutes: 35 },
];

/**
 * Extract all node labels from a Mermaid diagram string.
 * Handles: node[Label], node(Label), node{Label}, node[(Label)],
 *          node[[Label]], node{{Label}}, node>Label]
 */
function extractNodeLabels(diagram: string): string[] {
  if (!diagram) return [];
  const labels: string[] = [];
  // Match node definitions with various bracket types
  const patterns = [
    /\w+\[\[(.+?)\]\]/g,    // subroutine [[text]]
    /\w+\[\((.+?)\)\]/g,    // cylindrical [(text)]
    /\w+\{\{(.+?)\}\}/g,    // hexagon {{text}}
    /\w+\[(.+?)\]/g,        // standard [text]
    /\w+\((.+?)\)/g,        // round (text)
    /\w+\{(.+?)\}/g,        // diamond {text}
    /\w+>\s*(.+?)\]/g,      // asymmetric >text]
  ];
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(diagram)) !== null) {
      labels.push(match[1].trim());
    }
  }
  return labels;
}

/**
 * Normalize a string for fuzzy matching: lowercase, strip non-alphanumeric
 */
function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Check if an expected component name fuzzy-matches any node label.
 * Returns the matched label or null.
 * e.g. "loadbalancer" matches "Load Balancer", "cache" matches "Redis Cache"
 */
function fuzzyMatchComponent(
  expectedComponent: string,
  nodeLabels: string[]
): string | null {
  const normExpected = normalize(expectedComponent);
  for (const label of nodeLabels) {
    const normLabel = normalize(label);
    if (normLabel.includes(normExpected) || normExpected.includes(normLabel)) {
      return label;
    }
  }
  return null;
}

export function SystemDesignPanel() {
  const selectedTopicId = useSystemDesignStore((s) => s.selectedTopicId);
  const mermaidDiagram = useSystemDesignStore((s) => s.mermaidDiagram);
  const interviewStartTime = useSystemDesignStore((s) => s.interviewStartTime);

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

  // Extract node labels for fuzzy matching
  const nodeLabels = useMemo(() => extractNodeLabels(mermaidDiagram), [mermaidDiagram]);

  // Fuzzy-match each expected component against actual node labels
  const componentMatches = useMemo(() => {
    return topic.expectedComponents.map((comp) => ({
      name: comp,
      matchedLabel: fuzzyMatchComponent(comp, nodeLabels),
    }));
  }, [topic.expectedComponents, nodeLabels]);

  const matchedCount = componentMatches.filter((c) => c.matchedLabel !== null).length;

  // Determine current phase using a blend of time elapsed and node count
  const elapsedMinutes = interviewStartTime
    ? (Date.now() - interviewStartTime) / 60000
    : 0;

  // Node-count-based phase index
  let nodePhaseIndex = 0;
  if (nodeCount >= 1) nodePhaseIndex = 1;
  if (nodeCount >= 3) nodePhaseIndex = 2;
  if (nodeCount >= 5) nodePhaseIndex = 3;
  if (nodeCount >= 7) nodePhaseIndex = 4;

  // Time-based phase index
  let timePhaseIndex = 0;
  if (elapsedMinutes >= 3) timePhaseIndex = 1;
  if (elapsedMinutes >= 10) timePhaseIndex = 2;
  if (elapsedMinutes >= 25) timePhaseIndex = 3;
  if (elapsedMinutes >= 35) timePhaseIndex = 4;

  // Blend: if node count is running ahead of time, prefer time-based phasing.
  // Otherwise take the max of both heuristics.
  const currentPhaseIndex =
    nodePhaseIndex > timePhaseIndex + 1
      ? timePhaseIndex  // node count is disproportionately high; trust time
      : Math.max(nodePhaseIndex, timePhaseIndex);

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
              Components ({matchedCount}/{topic.expectedComponents.length})
            </h4>
            <div className="space-y-1.5">
              {componentMatches.map(({ name, matchedLabel }) => {
                const isPlaced = matchedLabel !== null;
                return (
                  <div
                    key={name}
                    className={`flex items-center gap-2 text-sm ${
                      isPlaced ? 'text-green-400' : 'text-muted-foreground/60'
                    }`}
                  >
                    {isPlaced ? (
                      <CheckCircle2 className="w-3 h-3 shrink-0" />
                    ) : (
                      <Circle className="w-3 h-3 shrink-0" />
                    )}
                    <span className="capitalize">{name}</span>
                    {isPlaced && matchedLabel && (
                      <span className="text-[10px] text-muted-foreground ml-auto truncate max-w-[100px]" title={matchedLabel}>
                        {matchedLabel}
                      </span>
                    )}
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
