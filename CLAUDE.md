# Project Rules for Claude Code — BetterThanLeet

## Auto-Commit and Push Rule

**MANDATORY**: After every change you make to any file in this repository, you MUST:

1. Stage the changed files: `git add <specific files you changed>`
2. Commit with a clear message describing what changed: `git commit -m "description of change"`
3. Push to `main`: `git push origin main`

This applies to EVERY change — no exceptions. Do not batch changes. Commit and push immediately after each logical change.

- Always push to `main`
- Never force push
- Use descriptive commit messages that explain the "why"
- If a pre-commit hook fails, fix the issue and create a NEW commit (never amend)

## Agent Team Strategy

Use agent teams for any task that benefits from parallel work across independent modules. Teams are enabled via `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` in settings.

### When to Use Teams
- Frontend + backend changes in parallel (one teammate per layer)
- Multiple API route fixes simultaneously (one teammate per route group)
- Research + implementation in parallel (one explores Gemini API docs, another implements)
- UI component work + store/state logic in parallel
- Debugging with competing hypotheses — teammates test different theories simultaneously
- Any task with 3+ independent subtasks that don't touch the same files

### When NOT to Use Teams
- Sequential tasks with heavy dependencies between steps
- Changes to a single component or a single API route
- Simple config tweaks, env changes, or small fixes
- Tasks where coordination overhead exceeds the benefit

### Team Configuration
- Start with **3-5 teammates** for most workflows
- Aim for **5-6 tasks per teammate** to keep everyone productive
- Use **Opus for the lead** (reasoning/coordination), **Opus for teammates** (focused implementation)
- Use **delegate mode** (`Shift+Tab`) when the lead should only coordinate, not write code

### Independent Modules

Each teammate should own a separate module to avoid file conflicts:

| Module | Directory | Notes |
|--------|-----------|-------|
| Landing Page | `src/app/page.tsx` | Home page, hero section, feature cards |
| Interview Page | `src/app/interview/page.tsx` | Main workspace — 4-panel resizable UI |
| Practice Mode | `src/app/practice/`, `src/components/practice/` | Problem selector, NeetCode, custom import |
| System Design | `src/app/system-design/`, `src/components/diagram/` | Topic selector, Mermaid diagrams |
| Sandbox API | `src/app/api/sandbox/` | Daytona workspace CRUD + code execution |
| Analysis API | `src/app/api/analysis/` | Code review, auto-fix, CodeRabbit |
| Interview API | `src/app/api/interview/`, `src/app/api/practice/` | Report generation, coaching feedback |
| Auth & Session | `src/app/api/auth/`, `src/app/api/gemini/` | Session management, Gemini session init |
| Gemini Core | `src/lib/gemini.ts` | REST API: analysis, reports, auto-fix |
| Gemini Live | `src/lib/gemini-live-client.ts`, `src/lib/interview-live-client.ts` | WebSocket voice clients |
| System Design Live | `src/lib/system-design-live-client.ts` | WebSocket for system design mode |
| Daytona SDK | `src/lib/daytona.ts` | Sandbox wrapper: workspace, files, exec |
| Agent Tools | `src/lib/agent-tools.ts`, `src/lib/gemini-tools.ts` | Tool definitions + implementations |
| State (Interview) | `src/lib/store.ts` | Zustand store: code, workspace, transcript |
| State (System Design) | `src/lib/system-design-store.ts` | Zustand store: topics, diagrams |
| Prompts | `src/lib/interviewer-prompt.ts`, `src/lib/system-design-prompt.ts` | System instructions |
| UI Components | `src/components/ui/` | Shared primitives (button, card, dialog, etc.) |
| Agent Components | `src/components/agent/` | Voice agent UI, visualizer, status |
| Editor Components | `src/components/editor/` | Monaco editor with Daytona sync |
| Interview Components | `src/components/interview/` | Console, controls, reports, timer |
| Problem Data | `src/data/` | Problem sets, company problems, NeetCode 150 |

### Team Communication Rules
- Use `SendMessage` (type: "message") for direct teammate communication — always refer to teammates by **name**
- Use `SendMessage` (type: "broadcast") **only** for critical blockers affecting everyone
- Use `TaskCreate`/`TaskUpdate`/`TaskList` for work coordination — teammates self-claim unblocked tasks
- When a teammate finishes, they check `TaskList` for the next available task (prefer lowest ID first)
- Mark tasks `completed` only after verification passes

### Task Dependencies
- Use `addBlockedBy` to express task ordering (e.g., "API route depends on Daytona SDK changes")
- Teammates skip blocked tasks and pick up unblocked work
- When a blocking task completes, dependent tasks auto-unblock

### Plan Approval for Risky Work
- For architectural changes or risky refactors, require **plan approval** before implementation
- The teammate works in read-only mode, submits a plan, lead approves/rejects
- Only after approval does the teammate implement

### Team Quality Hooks
- `TaskCompleted` hook: prevents marking tasks done unless `npm run build` passes
- `TeammateIdle` hook: auto-assigns follow-up work to idle teammates
- Every teammate must run verification before reporting completion

### Shutdown Protocol
- When all tasks are complete, the lead sends `shutdown_request` to each teammate
- Teammates approve shutdown after confirming their work is committed
- Lead calls `TeamDelete` to clean up team resources

## Workflow Orchestration

### 1. Plan Mode Default
- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions)
- If something goes sideways, STOP and re-plan immediately — don't keep pushing
- Use plan mode for verification steps, not just building
- Write detailed specs upfront to reduce ambiguity

### 2. Subagent Strategy
- Use subagents liberally to keep main context window clean
- Offload research, exploration, and parallel analysis to subagents
- For complex problems, throw more compute at it via subagents
- One task per subagent for focused execution

### 3. Self-Improvement Loop
- After ANY correction from the user: update `tasks/lessons.md` with the pattern
- Write rules for yourself that prevent the same mistake
- Ruthlessly iterate on these lessons until mistake rate drops
- Review lessons at session start for relevant project

### 4. Verification Before Done
- Never mark a task complete without proving it works
- Run `npm run build` — must pass with zero errors
- Run `npm run lint` — no new warnings or errors
- Test the feature manually in the browser when applicable
- Ask yourself: "Would a staff engineer approve this?"

### 5. Demand Elegance (Balanced)
- For non-trivial changes: pause and ask "is there a more elegant way?"
- If a fix feels hacky: "Knowing everything I know now, implement the elegant solution"
- Skip this for simple, obvious fixes — don't over-engineer
- Challenge your own work before presenting it

### 6. Autonomous Bug Fixing
- When given a bug report: just fix it. Don't ask for hand-holding
- Point at logs, errors, failing tests — then resolve them
- Zero context switching required from the user
- Go fix failing CI tests without being told how

## Task Management

1. **Plan First**: Write plan to `tasks/todo.md` with checkable items
2. **Verify Plan**: Check in before starting implementation
3. **Track Progress**: Mark items complete as you go
4. **Explain Changes**: High-level summary at each step
5. **Document Results**: Add review section to `tasks/todo.md`
6. **Capture Lessons**: Update `tasks/lessons.md` after corrections

## Project Context

- **Project**: BetterThanLeet — AI-powered technical interview platform
- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript
- **Styling**: Tailwind CSS 4 + Radix UI primitives
- **State**: Zustand (2 stores — interview + system design)
- **AI**: Google Gemini (REST for analysis, WebSocket Live API for real-time voice)
- **Sandbox**: Daytona SDK (isolated coding environments with Docker)
- **Editor**: Monaco Editor (@monaco-editor/react)
- **Monitoring**: Sentry (optional)
- **Dev Server**: `npm run dev` → http://localhost:3000
- **Build**: `npm run build`
- **Test**: `npm run test` (Vitest)
- **Lint**: `npm run lint` (ESLint)

### Architecture Overview

```
Next.js App Router
├── Pages: / (landing), /interview (workspace), /practice, /system-design
├── API Routes: /api/sandbox/*, /api/analysis/*, /api/interview/*, /api/gemini/*
├── Gemini REST (gemini.ts): async analysis, reports, auto-fix
├── Gemini Live WebSocket: real-time voice (interview-live-client.ts, gemini-live-client.ts)
├── Daytona SDK (daytona.ts): sandbox create/execute/delete/files
├── Zustand Stores: store.ts (interview), system-design-store.ts
└── Tool System: Gemini calls tools → frontend executes → sends results back
```

### Interview Flow (End-to-End)

```
1. Landing Page → User clicks "Start Interview"
2. /interview loads → initSession() validates auth
3. Daytona sandbox created via /api/sandbox/create
4. Gemini Live WebSocket connects (voice + tools)
5. User codes in Monaco editor, speaks to AI agent
6. Agent calls tools: read_code, run_code, install_dependency, etc.
7. Results flow back to agent via WebSocket toolResponse
8. Interview ends → /api/interview/report generates hire/no-hire
9. Sandbox cleaned up via /api/sandbox/delete
```

### Environment Variables

| Variable | Required | Description |
|----------|:--------:|-------------|
| `GEMINI_API_KEY` | Yes | Google Gemini API key (AI + voice) |
| `DAYTONA_API_KEY` | Yes* | Daytona API key (* or use mock mode) |
| `DAYTONA_API_URL` | Yes* | Daytona server URL (* or use mock mode) |
| `NEXT_PUBLIC_USE_MOCK_DAYTONA` | No | `true` to skip real Daytona calls |
| `NEXT_PUBLIC_USE_MOCK_CODERABBIT` | No | `true` to mock CodeRabbit responses |
| `SENTRY_AUTH_TOKEN` | No | Sentry monitoring (optional) |

### Key Technical Decisions
- **ElevenLabs removed** — all voice is now Gemini Live API (native audio)
- **Two WebSocket clients** — `interview-live-client.ts` (coding) vs `gemini-live-client.ts` (system design) — intentional separation
- **Tool-based agent control** — Gemini calls defined tools, frontend executes them, results sent back
- **Integrity tracking** — blur events + paste detection for anti-cheat (coding modes only)
- **Mock modes** — Daytona and CodeRabbit can be mocked for local dev without API keys

## Verification Standards

Before marking any task complete:
- `npm run build` — zero errors
- `npm run lint` — no new issues
- `npm run test` — all tests pass (when tests exist for the changed module)
- Manual browser test of affected pages
- Verify no TypeScript errors in changed files
- Check that `.env.local` secrets are never committed

## Core Principles

- **Simplicity First**: Make every change as simple as possible. Impact minimal code.
- **No Laziness**: Find root causes. No temporary fixes. Senior developer standards.
- **Minimal Impact**: Changes should only touch what's necessary. Avoid introducing bugs.
- **Security**: Never commit API keys. Sanitize inputs. Validate at system boundaries.
- **No Dead Code**: Remove unused imports, components, and variables. Don't leave ElevenLabs or other legacy remnants.
