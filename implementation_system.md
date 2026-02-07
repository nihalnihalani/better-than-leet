# Implementation: System Design Interview Agent

This document describes how the **System Design Interview Agent** was built within Alexis, from architecture decisions to every file involved.

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Data Layer — Topics & Types](#data-layer--topics--types)
4. [Prompt Engineering](#prompt-engineering)
5. [Tool Definitions (Gemini Function Calling)](#tool-definitions-gemini-function-calling)
6. [Tool Execution (Client-Side Handlers)](#tool-execution-client-side-handlers)
7. [State Management (Zustand Store)](#state-management-zustand-store)
8. [Gemini Live Client — WebSocket Integration](#gemini-live-client--websocket-integration)
9. [UI Components](#ui-components)
   - [Topic Selection Page](#topic-selection-page)
   - [Interview Page — System Design Layout](#interview-page--system-design-layout)
   - [Diagram Canvas (React Flow)](#diagram-canvas-react-flow)
   - [Custom Nodes](#custom-nodes)
   - [System Design Side Panel](#system-design-side-panel)
   - [Interview Agent Component](#interview-agent-component)
10. [Reconnection & Context Recovery](#reconnection--context-recovery)
11. [Fallback Strategy](#fallback-strategy)
12. [File Reference](#file-reference)

---

## Overview

The System Design Agent lets candidates have a **live voice conversation** with Alexis about system design topics (e.g. "Design a URL Shortener"). As the candidate talks, Alexis **builds an architecture diagram in real-time** using function calls that manipulate a shared diagram state.

Key differences from the coding interview agent:
- **No code editor or sandbox** — the entire interview is voice + diagram.
- **Dedicated prompt** tuned for system design interview phases (requirements → high-level design → deep dive → scaling → closing).
- **Reduced tool set** — only diagram tools + transcript/interview control (no `run_code`, `read_candidate_code`, etc.).
- **Custom React Flow diagram** with typed nodes (service, database, cache, queue, load balancer, CDN, storage, client, worker).

---

## Architecture

```
┌──────────────────┐     WebSocket (Gemini Live API)     ┌──────────────────┐
│                  │ ◄──────────────────────────────────► │   Gemini 2.5     │
│   Browser Client │                                     │   Flash Native   │
│                  │                                     │   Audio Preview  │
└───────┬──────────┘                                     └──────────────────┘
        │
        │  Zustand Store (diagramNodes, diagramEdges, transcript)
        │
   ┌────┴──────────────────────────────────┐
   │                                       │
   ▼                                       ▼
┌──────────────┐                   ┌───────────────┐
│ DiagramCanvas│                   │ SystemDesign   │
│ (React Flow) │                   │ Panel          │
│              │                   │ (phase tracker,│
│ CustomNodes  │                   │  checklist)    │
└──────────────┘                   └───────────────┘
```

The flow:
1. User selects a topic on `/system-design`.
2. Store is set to `interviewMode: 'system-design'` and `selectedTopicId`.
3. User is routed to `/interview` which detects system design mode and renders the diagram layout instead of the code editor layout.
4. `InterviewAgent` creates a `GeminiLiveClient` in `system-design` mode, which uses the system design prompt and `SYSTEM_DESIGN_TOOLS`.
5. Gemini speaks to the user via audio and calls `update_diagram` / `read_diagram` tools to manipulate the diagram.
6. Tool handlers in `agent-tools.ts` update the Zustand store, which triggers React Flow to re-render the diagram.

---

## Data Layer — Topics & Types

**File:** `src/data/system-design-topics.ts`

Defines the `SystemDesignTopic` interface and the catalog of 11 topics:

```typescript
export interface SystemDesignTopic {
  id: string;                    // e.g. 'url-shortener'
  title: string;                 // e.g. 'URL Shortener'
  description: string;           // Problem statement
  difficulty: 'Medium' | 'Hard';
  expectedComponents: string[];  // e.g. ['client', 'loadbalancer', 'service', 'cache', 'database']
  discussionPoints: string[];    // Key areas to probe
}
```

Topics include: Image Hosting, URL Shortener, Chat Application, Twitter Feed, Rate Limiter, Notification System, Cloud File Storage, Web Crawler, Video Streaming, Search Autocomplete, and Payment System.

Each topic's `expectedComponents` drives the checklist in the side panel, and `discussionPoints` give the AI specific areas to probe during the interview.

---

## Prompt Engineering

**File:** `src/lib/system-design-prompt.ts`

The system design prompt is separate from the coding interview prompt. It consists of two parts:

### 1. Base Instruction (`SYSTEM_DESIGN_INSTRUCTION`)

Sets the AI persona and behavior rules:

- **Voice rules**: Short responses (1-3 sentences), handle interruptions naturally, conversational fillers.
- **Interview phases**: Requirements (3-5 min) → High-Level Design (10-15 min) → Deep Dive (10-15 min) → Scaling (5-10 min) → Closing (2-3 min).
- **Diagram building guidance**: Start simple (`client → API → database`), batch operations, use descriptive labels, label edges with protocols.
- **Available tools**: `update_diagram`, `read_diagram`, `read_transcript`, `get_interview_mode`, `end_interview`.
- **Reconnection handling**: Don't restart, call `read_diagram` and `read_transcript` to recover context.

### 2. Topic Section (`buildTopicSection`)

Dynamically appended per-topic. Includes:
- Title, difficulty, and description
- Expected components list (guides the candidate toward these)
- Discussion points (numbered, for the AI to probe)
- Opening instructions: greet warmly, introduce the problem, ask to start with requirements, do NOT start building the diagram yet

### Composition

```typescript
export function getSystemDesignInstruction(topic: SystemDesignTopic): string {
  return SYSTEM_DESIGN_INSTRUCTION + buildTopicSection(topic);
}
```

---

## Tool Definitions (Gemini Function Calling)

**File:** `src/lib/gemini-tools.ts`

Three tool sets are defined:

### `SYSTEM_DESIGN_TOOLS` (primary)

A focused set of 5 tools:

| Tool | Purpose |
|------|---------|
| `get_interview_mode` | Returns mode info and role guidance |
| `end_interview` | Ends the session, triggers report generation |
| `read_transcript` | Reads conversation history (params: `last_n_messages`) |
| `update_diagram` | **Batched** diagram operations (add/remove/update nodes and edges) |
| `read_diagram` | Returns current diagram state (all nodes and edges) |

The `update_diagram` tool accepts a single JSON object with optional arrays:
- `add_nodes`: `[{ id, type, label, subtitle? }]`
- `add_edges`: `[{ from, to, label? }]`
- `remove_nodes`: `[nodeId, ...]`
- `update_nodes`: `[{ id, label?, subtitle? }]`

This batched design reduces round-trips — the AI can add 3 nodes and 2 edges in a single tool call.

Node types are constrained to: `service`, `database`, `cache`, `queue`, `loadbalancer`, `cdn`, `storage`, `client`, `worker`.

### `MINIMAL_SYSTEM_DESIGN_TOOLS` (fallback)

4 tools with no complex parameter schemas — used if the Live API rejects the primary tool set. Only supports `get_interview_mode`, `end_interview`, `read_transcript`, `read_diagram` (no `update_diagram` — voice-only mode).

### `INTERVIEW_TOOLS` (secondary fallback)

The full coding interview tool set. Used as a fallback if `SYSTEM_DESIGN_TOOLS` causes a 1008 policy error.

---

## Tool Execution (Client-Side Handlers)

**File:** `src/lib/agent-tools.ts`

All tools are executed client-side (in the browser). The `getAgentTools()` function returns an object of tool handlers. System-design-relevant tools:

### `update_diagram`

1. Validates each operation (checks for missing fields, duplicate IDs).
2. Adds nodes via `store.addDiagramNode()`.
3. Adds edges via `store.addDiagramEdge()` — validates that both source and target nodes exist, auto-generates edge ID as `${from}-to-${to}`.
4. Removes nodes via `store.removeDiagramNode()` — also cascades removal of connected edges.
5. Updates nodes via `store.updateDiagramNode()`.
6. Returns a JSON summary: `{ success, operations_completed, operations_failed, details, errors }`.

### `read_diagram`

Returns the full diagram state as JSON (all nodes with id/type/label/subtitle, all edges with id/source/target/label).

### `get_interview_mode`

When in system-design mode, returns guidance specific to the role:
```json
{
  "mode": "system-design",
  "role": "SYSTEM_DESIGN_INTERVIEWER",
  "guidance": "You are conducting a SYSTEM DESIGN interview..."
}
```

### `end_interview`

Calls `onEndInterview()` from the store after a 1.5s delay (so the tool response is sent back to Gemini before tearing down the connection). Returns a string telling the AI to say goodbye.

### `read_transcript`

Returns the last N messages from the conversation transcript, formatted with timestamps and speaker labels.

All tools are wrapped with `wrapTool()` which catches errors and prevents disconnections from tool failures.

---

## State Management (Zustand Store)

**File:** `src/lib/store.ts`

The store was extended with system design fields (store version 6):

### Types

```typescript
interface DiagramNode {
  id: string;
  type: SystemDesignNodeType; // 'service' | 'database' | 'cache' | etc.
  label: string;
  subtitle?: string;
}

interface DiagramEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}
```

### State Fields

| Field | Type | Purpose |
|-------|------|---------|
| `interviewMode` | `'real' \| 'practice' \| 'system-design'` | Current interview type |
| `selectedTopicId` | `string \| null` | Selected system design topic |
| `diagramNodes` | `DiagramNode[]` | All nodes in the architecture diagram |
| `diagramEdges` | `DiagramEdge[]` | All edges (connections) in the diagram |

### Actions

| Action | Behavior |
|--------|----------|
| `addDiagramNode(node)` | Appends to `diagramNodes` |
| `removeDiagramNode(id)` | Removes from `diagramNodes` AND removes all edges where `source === id` or `target === id` |
| `updateDiagramNode(id, updates)` | Merges partial updates into matching node |
| `addDiagramEdge(edge)` | Appends to `diagramEdges` |
| `removeDiagramEdge(id)` | Removes from `diagramEdges` |
| `clearDiagram()` | Resets both arrays to `[]` |

### Persistence

Diagram state is persisted to `localStorage` via Zustand's `persist` middleware:
```typescript
partialize: (state) => ({
  // ...other fields...
  selectedTopicId: state.selectedTopicId,
  diagramNodes: state.diagramNodes,
  diagramEdges: state.diagramEdges,
})
```

Migration from version 5 → 6 adds default empty diagram state.

---

## Gemini Live Client — WebSocket Integration

**File:** `src/lib/gemini-live-client.ts`

The `GeminiLiveClient` class manages the raw WebSocket connection to the Gemini Live API. System-design-specific behavior:

### Mode Detection

```typescript
constructor(private apiKey: string, mode: InterviewMode = 'real') {
  this.interviewMode = mode;
}

setSystemDesignTopic(topicId: string) {
  this.systemDesignTopic = getSystemDesignTopic(topicId) || null;
}
```

### System Instruction Selection

During `connect()`:
```typescript
if (this.interviewMode === 'system-design' && this.systemDesignTopic) {
  systemInstruction = getSystemDesignInstruction(this.systemDesignTopic);
} else {
  systemInstruction = getSystemInstruction(this.interviewMode);
}
```

### Tool Set Selection

In the setup message:
```typescript
tools: (this.interviewMode === 'system-design' && !this.useFallbackTools)
  ? SYSTEM_DESIGN_TOOLS
  : INTERVIEW_TOOLS
```

### WebSocket Setup Message

Sent on connection open. Includes:
- Model: `gemini-2.5-flash-native-audio-preview-12-2025`
- Response modality: `AUDIO` only
- Voice: `Aoede`
- System instruction with topic-specific prompt
- Tools: `SYSTEM_DESIGN_TOOLS` (or fallback)
- Real-time input config: VAD with high start sensitivity, low end sensitivity, 700ms silence duration
- Input/output audio transcription enabled

### Audio Pipeline

- **Input**: 16kHz mono PCM, with high-pass (80Hz) and low-pass (8kHz) filters, noise suppression, echo cancellation.
- **Output**: 24kHz PCM, queued and scheduled for gapless playback via Web Audio API.
- **Interruption**: When `serverContent.interrupted` is received, all queued audio is immediately cleared and a post-interrupt nudge timer (7s) is started.

### Tool Call Handling

When a `toolCall` message arrives:
1. Extract `functionCalls` array.
2. Pass to `onToolsCall` callback (set by `InterviewAgent`).
3. Send responses back as `toolResponse.functionResponses`.
4. 10-second timeout per tool execution.

---

## UI Components

### Topic Selection Page

**File:** `src/app/system-design/page.tsx`

A grid of cards showing all 11 topics. Each card displays:
- Title and difficulty badge (Medium = yellow, Hard = red)
- Description
- First 4 expected components as tags, with "+N more" overflow

On selection:
1. Sets `interviewMode` to `'system-design'`
2. Sets `selectedTopicId`
3. Clears any previous diagram state
4. Routes to `/interview`

### Interview Page — System Design Layout

**File:** `src/app/interview/page.tsx`

The interview page detects `isSystemDesign = interviewMode === 'system-design'` and renders a completely different layout:

**Standard coding layout:**
```
[ Problem Description | Code Editor + Console | Agent + Transcript + Controls ]
```

**System design layout:**
```
[ SystemDesignPanel (20%) | DiagramCanvas (50%) | Agent + Transcript + Controls (30%) ]
```

Key differences in system design mode:
- No workspace/sandbox is created (no code execution needed)
- Session starts immediately after `initSession()`
- No code editor, no console panel
- `Controls` component hides code actions (`hideCodeActions` prop)
- Language selector hidden in header
- "Design Mode" badge shown instead of "Shield Active"
- No `WorkspaceProgressIndicator`

### Diagram Canvas (React Flow)

**File:** `src/components/diagram/DiagramCanvas.tsx`

Uses `@xyflow/react` (React Flow) to render the architecture diagram.

**Layout Algorithm**: Custom BFS-based layered graph layout:
1. Builds adjacency list from edges.
2. BFS from root nodes (in-degree 0) to assign layer depths.
3. Groups nodes by layer, centers each layer horizontally.
4. Spacing: 160px node width, 80px horizontal gap, 100px vertical gap.

**Data Flow**:
- Reads `diagramNodes` and `diagramEdges` from Zustand store.
- Converts to React Flow `Node[]` and `Edge[]` format.
- Applies layout algorithm.
- Re-renders on every store change via `useEffect`.

**React Flow Configuration**:
- Dark background with dot pattern
- Animated edges (dashed flowing animation)
- Non-interactive (no drag, no connect, no select) — read-only visualization
- Pan and zoom enabled (0.3x to 2x)
- MiniMap and Controls overlays
- `fitView` with 0.3 padding

**Empty State**: Shows "Architecture Diagram — Components will appear here as you discuss the design with Alexis".

### Custom Nodes

**File:** `src/components/diagram/CustomNodes.tsx`

Each node type has a unique visual identity:

| Type | Icon | Color |
|------|------|-------|
| `service` | Server | Blue |
| `database` | Database | Green |
| `cache` | Zap | Yellow |
| `queue` | List | Orange |
| `loadbalancer` | GitBranch | Purple |
| `cdn` | Globe | Cyan |
| `storage` | HardDrive | Gray |
| `client` | Monitor | Slate |
| `worker` | Cpu | Red |

Each node renders:
- Colored background with matching border (`bg-{color}-950/80`, `border-{color}-500/60`)
- Icon + label in a row
- Optional subtitle in smaller text
- 4 handles (top, bottom, left, right) for edge connections

Nodes are memoized with `React.memo` for performance.

### System Design Side Panel

**File:** `src/components/diagram/SystemDesignPanel.tsx`

Left sidebar showing interview context:

1. **Topic Header**: Title, difficulty badge, "System Design" label.
2. **Interview Phase Tracker**: 5 phases (Requirements → High-Level Design → Deep Dive → Scaling → Closing). Current phase is estimated by node count:
   - 0 nodes → Requirements
   - 1+ nodes → High-Level Design
   - 3+ nodes → Deep Dive
   - 5+ nodes → Scaling
   - 7+ nodes → Closing
3. **Components Checklist**: Shows each expected component with a check mark if a node of that type exists in the diagram. Displays progress as `(placed/total)`.
4. **Discussion Points**: Numbered list of key areas to discuss.

### Interview Agent Component

**File:** `src/components/agent/InterviewAgent.tsx`

Handles Gemini Live client lifecycle. System-design-specific behavior:

- Sets `client.setSystemDesignTopic(selectedTopicId)` when mode is `system-design`.
- Skips sending initial code context on setup complete (`onSetupComplete`).
- Skips code update debouncing entirely.
- Context recovery on reconnection includes diagram state summary.

---

## Reconnection & Context Recovery

When the WebSocket disconnects and reconnects, the `InterviewAgent` builds a context recovery message:

```
[CONTEXT RECOVERY - You were disconnected]

**Recent conversation:** (last 10 transcript messages)
**Current Diagram State:** Nodes (N): Label1 (type), ... | Edges (M): src→tgt, ...
**Current Phase:** Requirements / Design / Deep Dive

Instructions: Don't re-introduce, don't mention disconnection, call read_diagram(), continue naturally.
```

This is injected as a text message 500ms after setup completes, giving the model full context to resume seamlessly.

---

## Fallback Strategy

The system has a graceful degradation path for tool compatibility:

1. **Primary**: `SYSTEM_DESIGN_TOOLS` (5 tools including `update_diagram` with complex schema).
2. **Fallback 1**: If Gemini returns 1008 (policy violation), retry with `INTERVIEW_TOOLS` (14 tools, simpler schemas). Diagram tools still work since `update_diagram` and `read_diagram` handlers exist in `agent-tools.ts`.
3. **Fallback 2**: `MINIMAL_SYSTEM_DESIGN_TOOLS` (4 tools, no parameters) — defined but not currently auto-triggered. Available for manual use.

The fallback is tracked via `useFallbackTools` boolean in the client:
```typescript
if (this.interviewMode === 'system-design' && !this.useFallbackTools) {
  this.useFallbackTools = true;
  this.retryTimeoutId = setTimeout(() => this.connect(true), 500);
  return;
}
```

---

## File Reference

| File | Purpose |
|------|---------|
| `src/data/system-design-topics.ts` | Topic catalog (11 topics with metadata) |
| `src/lib/system-design-prompt.ts` | AI system instruction for system design mode |
| `src/lib/gemini-tools.ts` | Tool declarations (`SYSTEM_DESIGN_TOOLS`, `MINIMAL_SYSTEM_DESIGN_TOOLS`) |
| `src/lib/agent-tools.ts` | Tool execution handlers (`update_diagram`, `read_diagram`) |
| `src/lib/store.ts` | Zustand state (diagram nodes/edges, interview mode) |
| `src/lib/gemini-live-client.ts` | WebSocket client (mode-aware setup, tool routing, fallback) |
| `src/app/system-design/page.tsx` | Topic selection UI |
| `src/app/interview/page.tsx` | Interview page (system design layout branch) |
| `src/components/diagram/DiagramCanvas.tsx` | React Flow canvas with BFS layout |
| `src/components/diagram/CustomNodes.tsx` | 9 typed node components with icons/colors |
| `src/components/diagram/SystemDesignPanel.tsx` | Side panel (phase tracker, component checklist) |
| `src/components/agent/InterviewAgent.tsx` | Gemini client lifecycle, auto-start, reconnection |
