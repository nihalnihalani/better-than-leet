'use client';

import { useEffect, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  BackgroundVariant,
  ConnectionMode,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { customNodeTypes } from './CustomNodes';
import { useInterviewStore } from '@/lib/store';

const NODE_WIDTH = 160;
const NODE_HEIGHT = 60;
const H_GAP = 80; // horizontal gap between nodes in same layer
const V_GAP = 100; // vertical gap between layers

/**
 * Simple layered graph layout (BFS-based).
 * Assigns each node to a layer (depth) based on incoming edges, then
 * centres nodes within each layer horizontally.
 */
function getLayoutedElements(nodes: Node[], edges: Edge[]) {
  if (nodes.length === 0) return { nodes, edges };

  // Build adjacency info
  const children = new Map<string, string[]>(); // source → targets
  const inDegree = new Map<string, number>();
  for (const n of nodes) {
    children.set(n.id, []);
    inDegree.set(n.id, 0);
  }
  for (const e of edges) {
    children.get(e.source)?.push(e.target);
    inDegree.set(e.target, (inDegree.get(e.target) ?? 0) + 1);
  }

  // BFS from roots (in-degree 0) to assign layers
  const layer = new Map<string, number>();
  const queue: string[] = [];
  for (const n of nodes) {
    if ((inDegree.get(n.id) ?? 0) === 0) {
      queue.push(n.id);
      layer.set(n.id, 0);
    }
  }

  // If no roots (cycle), start from first node
  if (queue.length === 0) {
    queue.push(nodes[0].id);
    layer.set(nodes[0].id, 0);
  }

  let head = 0;
  while (head < queue.length) {
    const id = queue[head++];
    const d = layer.get(id)!;
    for (const child of children.get(id) ?? []) {
      if (!layer.has(child)) {
        layer.set(child, d + 1);
        queue.push(child);
      }
    }
  }

  // Catch any unreachable nodes
  for (const n of nodes) {
    if (!layer.has(n.id)) {
      layer.set(n.id, 0);
    }
  }

  // Group nodes by layer
  const layers = new Map<number, string[]>();
  for (const n of nodes) {
    const l = layer.get(n.id)!;
    if (!layers.has(l)) layers.set(l, []);
    layers.get(l)!.push(n.id);
  }

  // Assign positions – centre each layer horizontally
  const maxLayerWidth = Math.max(
    ...Array.from(layers.values()).map((ids) => ids.length)
  );
  const totalWidth = maxLayerWidth * (NODE_WIDTH + H_GAP) - H_GAP;

  const posMap = new Map<string, { x: number; y: number }>();
  for (const [l, ids] of layers) {
    const layerWidth = ids.length * (NODE_WIDTH + H_GAP) - H_GAP;
    const offsetX = (totalWidth - layerWidth) / 2;
    ids.forEach((id, i) => {
      posMap.set(id, {
        x: offsetX + i * (NODE_WIDTH + H_GAP),
        y: l * (NODE_HEIGHT + V_GAP),
      });
    });
  }

  const layoutedNodes = nodes.map((node) => ({
    ...node,
    position: posMap.get(node.id) ?? { x: 0, y: 0 },
  }));

  return { nodes: layoutedNodes, edges };
}

export function DiagramCanvas() {
  const diagramNodes = useInterviewStore((s) => s.diagramNodes);
  const diagramEdges = useInterviewStore((s) => s.diagramEdges);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // Convert store nodes/edges to React Flow format and apply layout
  useEffect(() => {
    if (diagramNodes.length === 0) {
      setNodes([]);
      setEdges([]);
      return;
    }

    const rfNodes: Node[] = diagramNodes.map((n) => ({
      id: n.id,
      type: 'systemDesign',
      position: { x: 0, y: 0 },
      data: {
        label: n.label,
        subtitle: n.subtitle,
        nodeType: n.type,
      },
    }));

    const rfEdges: Edge[] = diagramEdges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      label: e.label,
      animated: true,
      style: { stroke: 'rgba(148, 163, 184, 0.6)', strokeWidth: 2 },
      labelStyle: { fill: 'rgba(148, 163, 184, 0.8)', fontSize: 11 },
    }));

    const { nodes: layouted, edges: layoutedEdges } = getLayoutedElements(rfNodes, rfEdges);
    setNodes(layouted);
    setEdges(layoutedEdges);
  }, [diagramNodes, diagramEdges, setNodes, setEdges]);

  const proOptions = useMemo(() => ({ hideAttribution: true }), []);

  const defaultEdgeOptions = useMemo(
    () => ({
      animated: true,
      style: { stroke: 'rgba(148, 163, 184, 0.6)', strokeWidth: 2 },
    }),
    []
  );

  return (
    <div className="w-full h-full bg-[#0a0a0f] relative">
      {diagramNodes.length === 0 ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-muted-foreground/50 space-y-2">
            <p className="text-lg font-medium">Architecture Diagram</p>
            <p className="text-sm">
              Components will appear here as you discuss the design with Alexis
            </p>
          </div>
        </div>
      ) : (
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={customNodeTypes}
          connectionMode={ConnectionMode.Loose}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          proOptions={proOptions}
          defaultEdgeOptions={defaultEdgeOptions}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          panOnDrag
          zoomOnScroll
          minZoom={0.3}
          maxZoom={2}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1}
            color="rgba(148, 163, 184, 0.1)"
          />
          <Controls
            showInteractive={false}
            className="!bg-gray-900/80 !border-gray-700 !shadow-lg [&>button]:!bg-gray-800 [&>button]:!border-gray-700 [&>button]:!text-gray-300 [&>button:hover]:!bg-gray-700"
          />
          <MiniMap
            nodeColor={() => 'rgba(148, 163, 184, 0.3)'}
            maskColor="rgba(0, 0, 0, 0.7)"
            className="!bg-gray-900/80 !border-gray-700"
          />
        </ReactFlow>
      )}
    </div>
  );
}
