# Implementation: System Design Interview Agent

This document describes how the **System Design Interview Agent** was built within Alexis, from architecture decisions to every file involved.

## Separation Principle

The system design agent is **completely isolated** from the interview agent. They share no logic, no tools, no state (except minimal routing fields in the main store). This ensures:

- Changes to one agent never break the other
- Each agent can evolve independently
- Clear boundaries prevent accidental coupling
- No shared tool handlers or WebSocket clients

The only connection point is the `/interview` page which routes between the two agent UIs based on `interviewMode`.

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

**File:** `src/lib/system-design-tools.ts` *(isolated from interview agent)*

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

**File:** `src/lib/system-design-agent-tools.ts` *(isolated from interview agent)*

All tools are executed client-side (in the browser). The `getSystemDesignTools()` function returns an object of tool handlers. System-design tools:

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

**File:** `src/lib/system-design-store.ts` *(isolated from interview agent)*

A dedicated Zustand store manages all system design state (diagram, transcript, topic selection):

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

Diagram state is persisted to `localStorage` under the key `system-design-storage`:
```typescript
partialize: (state) => ({
  selectedTopicId: state.selectedTopicId,
  diagramNodes: state.diagramNodes,
  diagramEdges: state.diagramEdges,
  transcript: state.transcript,
})
```

This is completely separate from the main interview store (`interview-storage`).

---

## Gemini Live Client — WebSocket Integration

**File:** `src/lib/system-design-live-client.ts` *(isolated from interview agent)*

The `SystemDesignLiveClient` class manages the raw WebSocket connection specifically for system design interviews:

### Hardcoded for System Design

```typescript
constructor(private apiKey: string) {
  // No mode parameter - always system design
}

setSystemDesignTopic(topicId: string) {
  this.systemDesignTopic = getSystemDesignTopic(topicId) || null;
}
```

### System Instruction

Always uses the system design instruction:
```typescript
const systemInstruction = getSystemDesignInstruction(this.systemDesignTopic);
```

### Tool Set

Always uses `SYSTEM_DESIGN_TOOLS`:
```typescript
tools: SYSTEM_DESIGN_TOOLS
```

### WebSocket Setup Message

Sent on connection open. Includes:
- Model: `gemini-2.5-flash-native-audio-preview-12-2025`
- Response modality: `AUDIO` only
- Voice: `Aoede`
- System instruction with topic-specific prompt
- Tools: `SYSTEM_DESIGN_TOOLS`
- Real-time input config: VAD with high start sensitivity, low end sensitivity, 700ms silence duration
- Input/output audio transcription enabled

### Simplified Audio Pipeline

No code context sending - the client only handles:
- Microphone input → WebSocket
- WebSocket audio output → speakers
- Tool calls for diagram manipulation
- Transcript tracking

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

### System Design Agent Component

**File:** `src/components/agent/SystemDesignAgent.tsx` *(isolated from interview agent)*

Dedicated agent UI for system design interviews:

- Uses `SystemDesignLiveClient` (not `GeminiLiveClient`)
- Uses `useSystemDesignStore` (not `useInterviewStore`)
- Calls `getSystemDesignTools()` (not `getAgentTools()`)
- No workspace dependency - auto-starts immediately
- No code context sending logic
- Context recovery includes diagram state summary (nodes/edges)

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

## Isolation Strategy

The system design agent is **completely isolated** from the interview agent:

### Separate Files (No Shared Logic)

| Component | System Design | Interview Agent |
|-----------|---------------|-----------------|
| WebSocket Client | `system-design-live-client.ts` | `gemini-live-client.ts` |
| Tool Declarations | `system-design-tools.ts` | `gemini-tools.ts` |
| Tool Handlers | `system-design-agent-tools.ts` | `agent-tools.ts` |
| Agent UI | `SystemDesignAgent.tsx` | `InterviewAgent.tsx` |
| State Store | `system-design-store.ts` | `store.ts` |
| System Prompt | `system-design-prompt.ts` | `interviewer-prompt.ts` |

### Shared Files (Minimal Changes Only)

| File | Change | Why |
|------|--------|-----|
| `store.ts` | Added `'system-design'` to `interviewMode` union + `selectedTopicId` field | Routing only - no diagram state |
| `interview/page.tsx` | Early-return branch for system design layout | Route switching - no interview logic changes |

### Benefits

- **Zero coupling**: Changes to the interview agent never affect system design
- **Independent evolution**: Each agent can be refactored without risk
- **Clear boundaries**: Store isolation prevents state contamination
- **No fallback complexity**: Each client uses its own tool set exclusively

---

## File Reference

### System Design Only (Isolated Files)

| File | Purpose |
|------|---------|
| `src/data/system-design-topics.ts` | Topic catalog (11 topics with metadata) |
| `src/lib/system-design-prompt.ts` | AI system instruction for system design mode |
| `src/lib/system-design-tools.ts` | Tool declarations (`SYSTEM_DESIGN_TOOLS`, `MINIMAL_SYSTEM_DESIGN_TOOLS`) |
| `src/lib/system-design-agent-tools.ts` | Tool execution handlers (`update_diagram`, `read_diagram`, `get_interview_mode`, `end_interview`, `read_transcript`) |
| `src/lib/system-design-store.ts` | Zustand state (diagram nodes/edges, transcript, topic selection) |
| `src/lib/system-design-live-client.ts` | WebSocket client hardcoded for system design |
| `src/components/agent/SystemDesignAgent.tsx` | Agent UI component (no workspace, no code context) |
| `src/components/diagram/DiagramCanvas.tsx` | React Flow canvas with BFS layout |
| `src/components/diagram/CustomNodes.tsx` | 9 typed node components with icons/colors |
| `src/components/diagram/SystemDesignPanel.tsx` | Side panel (phase tracker, component checklist) |
| `src/app/system-design/page.tsx` | Topic selection UI |

### Shared Files (Minimal Changes)

| File | System Design Usage | Change Made |
|------|---------------------|-------------|
| `src/lib/store.ts` | Routing only (`interviewMode`, `selectedTopicId`) | Added `'system-design'` to union type |
| `src/app/interview/page.tsx` | Renders `SystemDesignInterviewLayout` when `mode === 'system-design'` | Early-return branch added |

### Interview Agent Files (Untouched)

These files were NOT modified:
- `src/lib/gemini-live-client.ts`
- `src/lib/gemini-tools.ts`
- `src/lib/agent-tools.ts`
- `src/components/agent/InterviewAgent.tsx`
- `src/lib/interviewer-prompt.ts`
