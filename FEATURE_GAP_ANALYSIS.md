# Alexis (BetterThanLeet) — Feature Gap Analysis & Roadmap

> Generated: February 9, 2026
> Method: Three-agent parallel analysis (Competitor Researcher, Codebase Analyzer, Devil's Advocate)

---

## Table of Contents

- [1. Executive Summary](#1-executive-summary)
- [2. Current Feature Map](#2-current-feature-map)
- [3. Competitor Landscape](#3-competitor-landscape)
- [4. Critical Analysis (Devil's Advocate)](#4-critical-analysis-devils-advocate)
- [5. Identified Gaps (30 Items)](#5-identified-gaps-30-items)
- [6. Prioritized Feature Roadmap](#6-prioritized-feature-roadmap)
- [7. Technical Architecture](#7-technical-architecture)

---

## 1. Executive Summary

### What Alexis Is

An AI-powered technical interview platform featuring a voice-first AI interviewer named "Alexis" that conducts live FAANG-style technical interviews. Three modes: coding interviews (with sandboxed code execution), system design interviews (with live Mermaid diagrams), and practice coaching.

### The Moat

Alexis is the **only product** that combines all three in one tool:
1. Voice-based AI mock interviews
2. Sandboxed code execution (Daytona)
3. System design with interactive diagrams (Mermaid)

Most competitors (Interviewing.io, Exponent, Codemia, Final Round AI) excel at only ONE of these. This is the core differentiator.

### The Problem

Three fatal flaws prevent Alexis from being a retainable product:
1. **No retention mechanism** — No accounts, no progress tracking, no reason to return after session one
2. **No business model side** — Neither a good B2C product (too few problems) nor a good B2B product (no recruiter features)
3. **The core differentiator is fragile** — Sandbox adds 30-60s latency, integrity monitoring is bypassable, voice quality trails ChatGPT Voice

---

## 2. Current Feature Map

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.1.4, React 19.2.3 (App Router) |
| State | Zustand v5 + localStorage persistence |
| AI | Gemini 2.5 Flash Native Audio Preview (raw WebSocket) |
| Sandbox | Daytona SDK (isolated containers) |
| Code Analysis | CodeRabbit CLI (mostly mock) |
| Editor | Monaco Editor (@monaco-editor/react) |
| Diagrams | Mermaid.js |
| UI | Tailwind CSS v4, Radix UI, Lucide Icons |
| Validation | Zod v4 |
| Monitoring | Sentry (@sentry/nextjs) |
| Testing | Vitest + Testing Library |

### Three Interview Modes

| Mode | Route | Description |
|------|-------|-------------|
| Real Interview | `/interview` | Full FAANG-style coding interview with AI evaluator |
| Practice/Coaching | `/practice` → `/interview` | Supportive coaching with hints and progressive guidance |
| System Design | `/system-design` → `/interview` | Architecture discussion with live Mermaid diagrams |

### Coding Interview Features

- **Voice-First AI Agent**: Real-time bidirectional audio via Gemini Live WebSocket
  - Natural conversation with interruption handling
  - User/model speech transcription
  - Voice Activity Detection with configurable sensitivity
  - Connection retry with exponential backoff (up to 3 retries)
  - Microphone noise filtering (80-8000Hz bandpass)
  - Audio playback with pre-scheduling queue
- **Monaco Code Editor**: Syntax highlighting for Python and JavaScript
  - Paste detection (integrity monitoring)
  - Keyboard shortcut to run code (Ctrl+Enter)
- **Daytona Sandbox**: Isolated container for secure code execution
  - Workspace creation with progress tracking
  - Package installation (pip/npm)
  - File read/write operations
  - Automatic cleanup on page leave
- **Test Runner**: Generated test harness wrapping user code + test cases
  - Supports Python and JavaScript
  - Parses pass/fail results from stdout
  - Confetti animation on all tests passing
- **11 AI Agent Tools**: read_candidate_code, run_code, get_current_problem, get_interview_mode, read_sandbox_file, install_dependency, run_hidden_test, provide_hint, explain_concept, get_integrity_status, end_interview

### Problem Set

| Category | Count | Notes |
|----------|-------|-------|
| Core Problems (Real Mode) | 3 | Two Sum, Reverse Linked List, LRU Cache |
| Company Problems (Practice) | 25 | Google(5), Amazon(5), Meta(5), Microsoft(5), Apple(5) |
| NeetCode 150 (Practice) | ~150 | Arrays, Two Pointers, Sliding Window, Stack, Binary Search, Trees, Heaps, Backtracking, etc. |
| Custom Problems | User-added | Manual entry or LeetCode URL import |

### System Design Features

- **18 System Design Topics** (Medium and Hard difficulty):
  Demo REST API, Image Hosting, URL Shortener, Chat Application, Twitter Feed, Rate Limiter, Notification System, Cloud File Storage, Web Crawler, Video Streaming, Search Autocomplete, Payment System, Ride-Sharing, E-Commerce Platform, Distributed KV Store, Booking System, Social Media Stories, Collaborative Editor
- **Mermaid Diagram Canvas**: Real-time rendering, undo/redo (50-entry), zoom (0.25x-3x), export SVG/PNG, copy source, edit source directly, dark/light mode
- **FAANG-Style Interviewer**: Evaluator persona that presents problems, waits for candidate to drive design, challenges decisions, draws only what candidate describes
- **System Design Report**: 5 scoring categories (Requirements, High-Level Design, Deep Dive, Scaling, Communication), component coverage checklist, diagram complexity metrics

### Reporting System

| Report Type | Method | Content |
|-------------|--------|---------|
| Interview Report (Real) | AI-generated via Gemini | Executive summary, technical/communication/problem-solving scores, hire recommendation, integrity metrics |
| Practice Report | AI-generated via Gemini | Skill levels, improvement plan, recommended next problems |
| System Design Report | Client-side scoring | Keyword-based scoring, component ratios, transcript depth |

### Security & Infrastructure

- **Rate Limiting**: Token bucket on all `/api/*` routes with per-endpoint limits
- **Session Auth**: In-memory tokens (4-hour TTL) — resets on server restart
- **Input Validation**: Zod schemas, path sanitization, package name sanitization
- **Integrity Monitoring**: Tab switch counting, paste detection, large paste flagging, typing pattern analysis
- **Sentry**: Error monitoring configured

### API Routes (16 total)

| Route | Purpose |
|-------|---------|
| `/api/auth/session` | Generate session token |
| `/api/gemini/session` | Proxy Gemini API key |
| `/api/interview/report` | Generate AI interview report |
| `/api/sandbox/create` | Create Daytona workspace |
| `/api/sandbox/delete` | Delete Daytona workspace |
| `/api/sandbox/execute` | Execute code in sandbox |
| `/api/sandbox/files` | List files in sandbox |
| `/api/sandbox/install` | Install packages in sandbox |
| `/api/sandbox/read` | Read file from sandbox |
| `/api/sandbox/test` | Run hidden tests in sandbox |
| `/api/analysis/autofix` | AI auto-fix for code errors |
| `/api/analysis/coderabbit` | CodeRabbit analysis |
| `/api/analysis/review` | Code review analysis |
| `/api/leetcode/import` | Import problem from LeetCode URL |
| `/api/practice/feedback` | Generate practice coaching feedback |
| `/api/tts` | Text-to-speech endpoint |

### Tests (8 files)

- `src/lib/__tests__/gemini.test.ts`
- `src/lib/__tests__/mermaid-parser.test.ts`
- `src/lib/__tests__/agent-reasoning.test.ts`
- `src/lib/__tests__/pipeline.integration.test.ts`
- `src/lib/daytona.test.ts`
- `src/lib/daytona.integration.test.ts`
- `src/lib/utils.test.ts`
- `src/components/editor/CodeEditor.test.tsx`

---

## 3. Competitor Landscape

### AI Mock Interview Platforms

| Product | Price | Key Features | Standout |
|---------|-------|-------------|----------|
| **Interviewing.io** | $225+/session | Anonymous voice interviews with real FAANG engineers, CoderPad, replayable recordings, written feedback | Real human interviewers, anonymity, replay |
| **Exponent / Pramp** | $72/year | Peer-to-peer mocks, AI interviewer, 363 system design questions, video walkthroughs | Affordable, comprehensive library, peer community |
| **Prepfully** | $89-$399/session | Anonymous expert coaching, resume review, whiteboarding, free question bank | Expert sessions, flexible pricing |
| **Final Round AI** | $149-$300/month | Real-time copilot during LIVE interviews, coding copilot, resume builder, company-specific prep | Live interview assistance; complaints about billing, lag |

### System Design Interview Tools

| Product | Price | Key Features | Standout |
|---------|-------|-------------|----------|
| **Codemia** | $59/year | 120+ problems, interactive diagramming, AI feedback, free course | "LeetCode for System Design" |
| **Hello Interview** | Free | Guided practice, whiteboard, FAANG-tuned AI feedback | Free, FAANG-tuned |
| **Design Gurus** | $499 lifetime | "Grokking" courses, 140K+ learners, interactive diagrams | Industry standard content |
| **HackerRank** | Enterprise | Excalidraw whiteboard in CodePair, IDE/whiteboard toggle | Excalidraw integration |
| **CodeSignal** | Enterprise | Miro-powered whiteboard, real-time collaboration | Professional diagrams |

### AI Coding Interview Assistants

| Product | Key Features | Standout |
|---------|-------------|----------|
| **Interview Coder** | Audio transcription, live coding assist, 20+ undetectability features, 12+ languages | Invisible overlay, 97K+ users |
| **Interview Solver** | Real-time code analysis, multi-language | Focused on coding assistance |
| **LockedIn AI** | Resume-tailored answers, coding copilot | Personalized to resume |
| **ShadeCoder** | Invisible AI coding copilot, multimodal reasoning | Stealth + multimodal |
| **Sensei AI** | 30+ languages, browser-based, real-time suggestions | Best for international candidates |

### Voice-Based AI Interview Tools

| Product | Key Features | Standout |
|---------|-------------|----------|
| **Huru.ai** | Analyzes word choice, pacing, vocal tone; STAR method; role-specific banks | Deep speech analytics |
| **Yoodli** | Real-time speech analysis, filler word reduction, color-coded dashboard | Best speech analytics dashboard |
| **MockIF** | Unpredictable follow-ups, interruptions, pacing changes, silence | Most realistic simulation |
| **Google Interview Warmup** | Free, no signup, transcription, key term highlighting | Completely free |
| **Prepare.fyi** | Claude AI evaluation, STAR method analysis | Claude-powered analysis |

### Common User Complaints Across Platforms

1. Billing confusion — unclear pricing, hard-to-cancel subscriptions
2. Inconsistent AI quality — lag, repetitive prompts, generic feedback
3. Poor system design support — most coding tools fail at system design
4. No-show peers — peer platforms have ~20% bad session rate
5. Short sessions — 5-30 min limits don't simulate real 45-60 min interviews
6. Generic feedback — not company or role-specific enough
7. Limited follow-up questions — AI doesn't probe like a real interviewer
8. No progress tracking — hard to see improvement over time
9. Detection risks — "cheating" tools getting detected
10. Missing whiteboard — many platforms lack diagramming for system design

---

## 4. Critical Analysis (Devil's Advocate)

### User Retention Killers

1. **30-60 second cold-start wall**: Daytona sandbox provisioning forces users to stare at a loading screen before writing a single line of code. LeetCode loads in under 2 seconds.
2. **Only 3 built-in problems in real mode**: A user who finishes all three in an hour has no reason to come back. NeetCode 150 exists but is tucked behind a separate practice flow.
3. **Only Python and JavaScript**: No Java, C++, Go, Rust. Eliminates the majority of interview candidates who use Java or C++.
4. **No user accounts, no progress tracking**: Zero persistence beyond localStorage. No login, no dashboard showing improvement over time. No retention loop.
5. **Report dialog is a dead end**: No "Try Again," "Try a Harder Problem," "Share Report," or "Save to Profile." User hits a wall.

### Competitive Disadvantages

- **"Why not ChatGPT Voice + LeetCode?"**: ChatGPT has screen sharing, 200+ languages, better voice quality, cross-session memory. Alexis's only differentiators are sandbox execution and integrity monitoring — both fragile.
- **No multiplayer / recruiter side**: Every real interview platform (HackerRank, CodeSignal, Karat) has both candidate AND recruiter sides. Alexis has zero recruiter features.
- **Problem library is embarrassingly thin**: Compared to LeetCode's 3000+ problems with editorials, discussions, and contests.

### Technical Red Flags

1. **API Key Exposure**: Fallback to `NEXT_PUBLIC_GEMINI_API_KEY` (client-side env var). WebSocket URL includes API key in query string. Partially masked console logging.
2. **Auth is security theater**: In-memory session tokens reset on server restart. `sessions.size === 0` bypasses all auth. Zero actual security.
3. **`dangerouslySetInnerHTML` in layout.tsx**: Currently static string, but pattern sets bad precedent for XSS.
4. **ScriptProcessorNode is deprecated**: `createScriptProcessor()` runs on main thread, causes jank, will break in future browsers. Replacement: `AudioWorkletNode`.
5. **No database anywhere**: Sessions in-memory, user data in localStorage. Server restart = all sessions invalidated. No cross-device sync, no backup, no analytics.
6. **Unbounded transcript arrays**: Both stores append indefinitely. Long interviews can hit 5MB localStorage limit causing silent data loss.

### The "So What?" Test

**Current honest advantages over ChatGPT Voice:**
1. Sandboxed code execution (Daytona)
2. Integrity monitoring (tab switches, paste detection)
3. Structured interview report
4. System design diagram generation

**Current honest disadvantages vs ChatGPT Voice:**
1. ChatGPT supports all languages
2. Better voice quality and lower latency
3. No 60-second container spinup
4. Cross-session memory
5. Works on mobile

**What would make someone pay for this (currently nothing):**
1. Recruiter/hiring manager portal (B2B revenue)
2. Comprehensive problem library with editorials (B2C value)
3. Progress tracking across sessions (retention)
4. Interview replay and recording (unique value)
5. ATS integration (enterprise stickiness)
6. Multi-language support (top 5 languages)
7. Sub-5-second startup time

---

## 5. Identified Gaps (30 Items)

### Critical Gaps

| # | Gap | Impact |
|---|-----|--------|
| 1 | No user authentication / accounts | No persistence, no retention |
| 2 | No progress tracking / history persistence | Can't track improvement |
| 3 | No database | Everything ephemeral, no cross-device sync |
| 4 | CodeRabbit integration is mock/stub | Advertised feature doesn't work |
| 5 | Only 3 core problems in real mode | Toy-level content |
| 6 | Python-only for most problems | JS starter code missing for 175+ problems |
| 7 | No mobile support | Desktop-only 3-panel layout |

### Significant Gaps

| # | Gap | Impact |
|---|-----|--------|
| 8 | No user settings/preferences page | No customization |
| 9 | No interview history view | Can't review past performance |
| 10 | No behavioral interview mode | Missing 30-50% of real interviews |
| 11 | Limited language support (2 languages) | Excludes Java/C++/Go users |
| 12 | No internationalization (i18n) | English only |
| 13 | No accessibility audit | No ARIA labels, screen reader support |
| 14 | System design scoring is keyword-based | Fragile and gameable |
| 15 | No collaborative/multi-user mode | Solo only |
| 16 | LeetCode import fragility | Scraping may break or violate ToS |
| 17 | TTS route may be dead code | Unclear purpose alongside Gemini native audio |
| 18 | No admin dashboard | No server-side management |

### Feature Gaps (vs Competitors)

| # | Gap | Competitor Reference |
|---|-----|---------------------|
| 19 | No solution explanations/editorials | LeetCode, Hello Interview, Exponent |
| 20 | No difficulty progression/recommendations | Codemia, LeetCode |
| 21 | No discussion/community | LeetCode, Pramp |
| 22 | No interview scheduling/time-boxing | All enterprise tools |
| 23 | No video/webcam integration | HackerRank, Pramp |
| 24 | No speech analytics (filler words, WPM) | Yoodli, Huru.ai |
| 25 | No session recording/replay | Interviewing.io |
| 26 | No company interview format guides | Exponent, Final Round AI |
| 27 | No spaced repetition | None (greenfield opportunity) |
| 28 | No gamification (streaks, XP, levels) | None for interview prep |
| 29 | No interview readiness score | None (greenfield opportunity) |
| 30 | No AI interviewer personas | None (greenfield opportunity) |

### Code Quality Issues

- Low test coverage (8 test files total, no E2E)
- `eslint-disable @typescript-eslint/no-explicit-any` scattered throughout
- Store migration chain (5 versions) growing unwieldy
- No E2E tests (Playwright/Cypress)
- Unused features: `isWizardMode` in store, Analysis Panel, Metrics Dashboard, Code History tracking

---

## 6. Prioritized Feature Roadmap

### Tier 1 — Retention Killers (Implement First)

Without these, users try once and leave.

| Priority | Feature | Effort | Impact |
|----------|---------|--------|--------|
| P0 | User accounts + auth (OAuth/email) | High | Enables everything else |
| P0 | Persistent progress dashboard | High | Core retention loop |
| P0 | Expand problem library to 100+ with editorials | Medium | Table stakes content |
| P1 | Post-interview flow (Try Again, Next Problem, Save) | Low | Eliminates dead-end UX |
| P1 | Add Java and C++ language support | Medium | Doubles addressable market |
| P1 | Solution explanations after attempt | Medium | Users can't learn without these |

### Tier 2 — Competitive Parity (Implement Second)

Competitors all have these. Users will compare.

| Priority | Feature | Effort | Impact |
|----------|---------|--------|--------|
| P2 | Speech analytics (filler words, WPM, pace) | Medium | Unique interview skill signal |
| P2 | Behavioral interview mode (STAR method) | Medium | Covers 30-50% of real interviews |
| P2 | Session recording and replay | High | Interviewing.io's #1 feature |
| P2 | Company-specific interview guides | Low | High-value content, low effort |
| P2 | Difficulty progression and recommendations | Medium | "Try this next" keeps users engaged |
| P2 | Sub-5s startup (workspace pooling) | High | Eliminates #1 UX complaint |

### Tier 3 — Differentiators (Implement Third)

Would make Alexis genuinely special.

| Priority | Feature | Effort | Impact |
|----------|---------|--------|--------|
| P3 | Interview Readiness Score | Medium | "72% ready for Google L5" — no competitor has this |
| P3 | AI Interviewer Personas | Low | Different styles (friendly, tough, fast-paced) |
| P3 | Spaced repetition for interview prep | Medium | Duolingo-style resurfacing of weak topics |
| P3 | Gamification (streaks, XP, levels) | Medium | 40% better retention per studies |
| P3 | Mobile practice mode | High | Quick verbal drills on the go |
| P3 | Resume-tailored questions | Medium | Personalized interview prep |

### Tier 4 — Technical Debt (Parallel Track)

Undermines credibility if left unfixed.

| Priority | Issue | Effort |
|----------|-------|--------|
| P1 | Replace in-memory auth with real auth system | High (tied to Tier 1 auth) |
| P1 | Add database (Postgres/Supabase/Planetscale) | High (tied to Tier 1 persistence) |
| P2 | Replace ScriptProcessorNode with AudioWorkletNode | Medium |
| P2 | Fix or remove CodeRabbit mock integration | Low |
| P2 | Cap transcript arrays to prevent memory leak | Low |
| P3 | Add E2E tests (Playwright) | Medium |
| P3 | Improve test coverage (target 60%+) | High |

---

## 7. Technical Architecture

### Current Architecture

```
Landing (/)
  +-- Practice Mode (/practice) --> Problem Selection --> Interview (/interview)
  +-- System Design (/system-design) --> Topic Selection --> Interview (/interview)
  +-- Real Interview (Start button) --> Interview (/interview)

Interview Page (shared):
  - Coding Mode: Problem Panel | Editor + Console | Agent + Transcript
  - System Design: Topic Panel | Mermaid Canvas | Agent + Transcript

AI Communication: Browser <-> Gemini Live (WebSocket) with bidirectional audio
Code Execution: Browser -> Next.js API -> Daytona SDK -> Isolated Sandbox
Reporting: Browser -> Next.js API -> Gemini (structured generation) -> Client
State: Zustand (client) + localStorage (persistence) + in-memory (server)
```

### Proposed Architecture (Post-Tier 1)

```
Landing (/)
  +-- Auth (login/signup) --> Dashboard (/dashboard)
  +-- Dashboard: Progress, History, Recommendations, Settings
  +-- Practice Mode (/practice) --> Problem Selection --> Interview (/interview)
  +-- System Design (/system-design) --> Topic Selection --> Interview (/interview)
  +-- Behavioral (/behavioral) --> Question Selection --> Interview (/interview)
  +-- Real Interview (Start button) --> Interview (/interview)

Persistence: PostgreSQL or Supabase
  - Users, Sessions, Interview History, Progress, Settings
Auth: NextAuth.js or Clerk (OAuth + email)
Analytics: Server-side event tracking
State: Zustand (client) + Database (server) + Cache (Redis optional)
```

---

## Appendix: Competitor Quick Reference

| Competitor | Type | Price | Languages | System Design | Voice AI | Code Exec |
|-----------|------|-------|-----------|--------------|----------|-----------|
| LeetCode | Problem bank | $35/mo | 20+ | No | No | Yes |
| Interviewing.io | Human mock | $225+ | Any | Yes | Yes (human) | Yes |
| Exponent | Content + AI | $72/yr | N/A | Yes (course) | No | No |
| Codemia | System design | $59/yr | N/A | Yes | No | No |
| Hello Interview | Guided practice | Free | N/A | Yes | No | No |
| Final Round AI | Live copilot | $149-300/mo | 5+ | Limited | No | Yes |
| Interview Coder | Live copilot | Lifetime | 12+ | No | Audio in | No |
| Yoodli | Speech coach | Sub | N/A | No | Yes | No |
| MockIF | Mock interview | Sub | N/A | No | Yes | No |
| HackerRank | Enterprise | Enterprise | 35+ | Yes (Excalidraw) | No | Yes |
| **Alexis** | **AI Interviewer** | **Free** | **2** | **Yes (Mermaid)** | **Yes** | **Yes** |

**Alexis is the only tool that has Voice AI + Code Execution + System Design Diagrams in one product.** The opportunity is to make that foundation retainable and monetizable.
