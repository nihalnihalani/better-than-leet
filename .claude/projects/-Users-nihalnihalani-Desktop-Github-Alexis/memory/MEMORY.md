# Alexis Project Memory

## Architecture
- Next.js App Router with client components (`'use client'`)
- Two Zustand stores: `useInterviewStore` (main/coding) and `useSystemDesignStore` (system design)
- Both stores use `persist` middleware with localStorage — hydration race condition pattern requires `_hasHydrated` flag with `onRehydrateStorage`
- Two WebSocket clients: `InterviewLiveClient` (coding) and `GeminiLiveClient` (system design) — both in `src/lib/`
- Interview modes: `'real'`, `'practice'`, `'system-design'`

## Key Patterns
- Use `getState()` instead of destructured store values in callbacks to avoid stale closures
- `eslint-disable-line` (NOT `next-line`) for multi-line hooks deps warnings
- Mermaid diagrams are AI-generated in text output, extracted via `extractMermaidBlocks()`
- `authFetch` from `@/lib/api-client` must be used for ALL authenticated API calls

## Common Pitfalls
- `endSession()` must be called in both `handleEndInterview` functions AND must clear `interviewStartTime`
- Timer component (`Timer.tsx`) stops when `interviewStartTime` is null
- Report dialogs should NOT do workspace cleanup (handled in `handleEndInterview`)
- `hasConnectedOnceRef.current = true` must be set in `onSetupComplete` (not before)
- Auto-reconnect needs to check both `status === 'disconnected'` AND `status === 'error'`

## ESLint Config
- Uses `next/core-web-vitals` + `next/typescript` — no `argsIgnorePattern` for unused vars
- `_prefix` convention NOT recognized — use `eslint-disable` comments instead
- File-level disable for WebSocket clients: `/* eslint-disable @typescript-eslint/no-explicit-any */`
