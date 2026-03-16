# BetterThanLeet - Your AI Technical Interviewer, Powered by Gemini

> **"LeetCode can't ask follow-up questions. Alexis can."**

AI-powered mock interview platform with voice-based FAANG-style interviewers for coding, system design, and behavioral prep - featuring real-time code execution, live architecture diagrams, speech analytics, and progress tracking.

---

## Inspiration

Technical interviews are broken. Candidates grind hundreds of LeetCode problems in isolation, but real interviews require **communication** - explaining your thought process, handling follow-up questions, whiteboarding system designs under pressure, and telling compelling stories about past experience.

We asked ourselves: **What if you could practice with an AI interviewer that actually listens, responds, challenges you, and even draws your architecture diagrams - just like sitting across from a real FAANG interviewer?**

LeetCode tests if you can solve algorithms. BetterThanLeet tests if you can **communicate your solutions** under pressure, handle curveballs, and think on your feet. The gap between "can solve it alone at home" and "can nail it in a live interview" is enormous - and that's the gap we close.

Gemini's Live API with native audio made this possible for the first time. Real-time voice with natural interruption handling, autonomous tool calling (the AI decides when to run your code), and seamless turn-taking - this is the technology the interview prep space was waiting for.

---

## What It Does

BetterThanLeet provides **three complete interview experiences** through a single platform, all powered by Gemini:

### 1. Coding Interviews
- **Real-time voice conversation** with Alexis while you write code in a Monaco Editor
- **Autonomous tool calling** - Gemini decides when to run your tests, read your code, and give feedback without you asking
- Sandboxed code execution via Daytona SDK (Python, JavaScript, TypeScript)
- 500+ problems from NeetCode 150 + custom LeetCode import
- Integrity tracking (tab switches, paste detection) with a 0-100 integrity score
- AutoFix powered by Gemini 3 Flash - one-click error resolution with automatic dependency installation
- Solution editorials with time/space complexity analysis after each session
- **AI Interviewer Personas**: Friendly, Tough, Fast-Paced, or Detail-Oriented styles

### 2. System Design Interviews
- **FAANG-style evaluative interviewer** - Alexis challenges your decisions ("Why Kafka over RabbitMQ?"), doesn't help you build
- **Live Mermaid diagram generation** - describe components by voice, Alexis draws them on an interactive canvas as your whiteboard
- Interactive diagram toolbar: undo/redo, zoom, export PNG/SVG, copy source, live source editor
- 18 curated topics (URL Shortener, Chat App, Payment System, Video Streaming, Ride-Sharing, etc.)
- Component checklist tracking expected architectural elements
- Phase management: Requirements -> High-Level Design -> Deep Dive -> Scaling -> Closing

### 3. Behavioral Interviews
- **STAR-method guided evaluation** across 20 topic categories
- Voice-only focused interface for authentic conversational practice
- Categories include Leadership, Conflict Resolution, Customer Focus, Decision-Making, Handling Pressure, and more
- Structured scoring on Situation, Task, Action, and Result dimensions

### Cross-Cutting Features
- **Speech Analytics Dashboard**: Filler word detection (um, uh, basically...), words-per-minute tracking, talk ratio analysis, pause detection, vocabulary diversity, and composite confidence score (0-100)
- **Progress Dashboard**: Interview readiness score, category performance across all modes, XP/streak system, trend analysis, and personalized recommendations for what to practice next
- **Company Interview Guides**: Curated prep guides for Google, Meta, Amazon, Apple, Microsoft, Netflix, Uber, and Stripe with round-by-round breakdowns, focus areas, tips, and common topics
- **Countdown Timer**: Configurable interview duration with audio warnings at 5 minutes

---

## How We Built It

### Gemini Integration - The Core Engine

BetterThanLeet is built entirely around two Gemini models:

**Gemini 2.5 Flash Native Audio (Live API)** powers the real-time voice interview experience. We connect via raw WebSocket to `wss://generativelanguage.googleapis.com` and send/receive PCM audio chunks. The setup includes:
- Voice Activity Detection with natural turn-taking (700ms silence threshold)
- Interruption handling (`START_OF_ACTIVITY_INTERRUPTS`) - candidates can interrupt mid-sentence
- Input/output audio transcription for live transcript
- Proactive function calling - Gemini autonomously decides when to run code, read files, or end the interview
- Audio processing: 16kHz input with biquad noise filtering (80Hz high-pass, 8kHz low-pass), 24kHz output playback

**Gemini 3 Flash (REST API)** powers the analysis layer:
- Comprehensive interview report generation with hiring recommendations
- AutoFix code suggestions with automatic dependency detection
- Code quality, security, and complexity analysis
- Practice mode coaching feedback

Three distinct tool sets enable mode-specific AI behavior:
- **Coding tools**: `run_code`, `read_candidate_code`, `get_current_problem`, `end_interview`
- **System design tools**: `get_interview_mode`, `read_transcript`, `end_interview`
- **Behavioral tools**: `evaluate_response`, `transition_topic`, `end_interview`

### Architecture Diagram

![Architecture Diagram](https://mermaid.ink/img/Z3JhcGggVEQKICAgIENhbmRpZGF0ZVsiQ2FuZGlkYXRlIl0gLS0+fCJTcGVha3MgKyBDb2RlcyJ8IEFwcFsiQmV0dGVyVGhhbkxlZXQgQXBwIl0KICAgIEFwcCAtLT58IkNob29zZSBNb2RlInwgQ29kaW5nWyJDb2RpbmcgSW50ZXJ2aWV3Il0KICAgIEFwcCAtLT58IkNob29zZSBNb2RlInwgU0RbIlN5c3RlbSBEZXNpZ24gSW50ZXJ2aWV3Il0KICAgIEFwcCAtLT58IkNob29zZSBNb2RlInwgQmVoYXZbIkJlaGF2aW9yYWwgSW50ZXJ2aWV3Il0KCiAgICBzdWJncmFwaCAiR2VtaW5pIEFJIENvcmUgLSBSZWFsLVRpbWUgVm9pY2UgRW5naW5lIgogICAgICAgIENvZGluZyAtLT58IkF1ZGlvIFN0cmVhbSJ8IExpdmVbIkdlbWluaSAyLjUgRmxhc2hcbk5hdGl2ZSBBdWRpb1xuTGl2ZSBBUEkgV2ViU29ja2V0Il0KICAgICAgICBTRCAtLT58IkF1ZGlvIFN0cmVhbSJ8IExpdmUKICAgICAgICBCZWhhdiAtLT58IkF1ZGlvIFN0cmVhbSJ8IExpdmUKICAgICAgICBMaXZlIC0tPnwiQXV0b25vbW91cyBUb29sIENhbGxzInwgVG9vbHN7IlRvb2wgUm91dGVyIn0KICAgICAgICBUb29scyAtLT58InJ1bl9jb2RlInwgU2FuZGJveFsiRGF5dG9uYSBTYW5kYm94XG5Jc29sYXRlZCBDb250YWluZXIiXQogICAgICAgIFRvb2xzIC0tPnwicmVhZF9jYW5kaWRhdGVfY29kZSJ8IEVkaXRvclN0YXRlWyJNb25hY28gRWRpdG9yIFN0YXRlIl0KICAgICAgICBUb29scyAtLT58ImVuZF9pbnRlcnZpZXcifCBFbmRGbG93WyJFbmQgSW50ZXJ2aWV3Il0KICAgICAgICBTYW5kYm94IC0tPnwic3Rkb3V0IHN0ZGVyciBleGl0IGNvZGUifCBMaXZlCiAgICAgICAgRWRpdG9yU3RhdGUgLS0+fCJDdXJyZW50IENvZGUifCBMaXZlCiAgICBlbmQKCiAgICBMaXZlIC0tPnwiMjRrSHogVm9pY2UgUmVzcG9uc2UifCBTcGVha2VyWyJBdWRpbyBQbGF5YmFjayJdCiAgICBMaXZlIC0tPnwiTWVybWFpZCBDb2RlIEJsb2NrcyJ8IENhbnZhc1siTGl2ZSBEaWFncmFtIENhbnZhc1xuVW5kbyBSZWRvIEV4cG9ydCJdCiAgICBMaXZlIC0tPnwiSW5wdXQgT3V0cHV0IFRyYW5zY3JpcHRpb24ifCBUcmFuc2NyaXB0WyJMaXZlIFRyYW5zY3JpcHQiXQoKICAgIFRyYW5zY3JpcHQgLS0+fCJTcGVlY2ggRGF0YSJ8IEFuYWx5dGljc1siU3BlZWNoIEFuYWx5dGljc1xuRmlsbGVyIFdvcmRzIFdQTSBDb25maWRlbmNlXG5UYWxrIFJhdGlvIFBhdXNlcyBWb2NhYnVsYXJ5Il0KCiAgICBFbmRGbG93IC0tPnwiR2VuZXJhdGUgUmVwb3J0InwgRmxhc2hbIkdlbWluaSAzIEZsYXNoXG5SRVNUIEFQSSJdCiAgICBGbGFzaCAtLT58IlNjb3JlcyBGZWVkYmFjayJ8IFJlcG9ydFsiSW50ZXJ2aWV3IFJlcG9ydFxuSGlyaW5nIFJlYyBDb2RlIFF1YWxpdHlcbkNvbW11bmljYXRpb24gU3RyZW5ndGhzIl0KCiAgICBBbmFseXRpY3MgLS0+fCJNZXRyaWNzInwgRGFzaGJvYXJkWyJQcm9ncmVzcyBEYXNoYm9hcmRcblJlYWRpbmVzcyBTY29yZSBYUCBTdHJlYWtzXG5DYXRlZ29yeSBUcmVuZHMgUmVjb21tZW5kYXRpb25zIl0KICAgIFJlcG9ydCAtLT58IlNhdmUgU2Vzc2lvbiJ8IERhc2hib2FyZAoKICAgIHN0eWxlIExpdmUgZmlsbDojNDI4NUY0LHN0cm9rZTojMWE3M2U4LGNvbG9yOiNmZmYKICAgIHN0eWxlIEZsYXNoIGZpbGw6IzM0QTg1MyxzdHJva2U6IzFlOGUzZSxjb2xvcjojZmZmCiAgICBzdHlsZSBTYW5kYm94IGZpbGw6I0ZGNkQwMSxzdHJva2U6I2U2NTEwMCxjb2xvcjojZmZmCiAgICBzdHlsZSBEYXNoYm9hcmQgZmlsbDojOUMyN0IwLHN0cm9rZTojN0IxRkEyLGNvbG9yOiNmZmYKICAgIHN0eWxlIEFuYWx5dGljcyBmaWxsOiMwMEJDRDQsc3Ryb2tlOiMwMDk3QTcsY29sb3I6I2ZmZgo=)

### Gemini WebSocket Connection Flow

![WebSocket Flow](https://mermaid.ink/img/c2VxdWVuY2VEaWFncmFtCiAgICBwYXJ0aWNpcGFudCBDYW5kaWRhdGUKICAgIHBhcnRpY2lwYW50IEFwcCBhcyBCZXR0ZXJUaGFuTGVldAogICAgcGFydGljaXBhbnQgV1MgYXMgV2ViU29ja2V0CiAgICBwYXJ0aWNpcGFudCBHZW1pbmkgYXMgR2VtaW5pIDIuNSBGbGFzaCBMaXZlIEFQSQogICAgcGFydGljaXBhbnQgU2FuZGJveCBhcyBEYXl0b25hIFNhbmRib3gKCiAgICBBcHAtPj5XUzogQ29ubmVjdCB0byB3c3M6Ly9nZW5lcmF0aXZlbGFuZ3VhZ2UuZ29vZ2xlYXBpcy5jb20KICAgIEFwcC0+PldTOiBTZW5kIHNldHVwIGNvbmZpZwogICAgTm90ZSByaWdodCBvZiBXUzogbW9kZWwsIHZvaWNlLCB0b29scyw8YnIvPnN5c3RlbSBpbnN0cnVjdGlvbiwgVkFEIGNvbmZpZyw8YnIvPnRyYW5zY3JpcHRpb24gZW5hYmxlZAoKICAgIEdlbWluaS0tPj5BcHA6IHNldHVwQ29tcGxldGUKICAgIEFwcC0+PkFwcDogU3RhcnQgbWljcm9waG9uZSBjYXB0dXJlCgogICAgbG9vcCBSZWFsLVRpbWUgSW50ZXJ2aWV3CiAgICAgICAgQ2FuZGlkYXRlLT4+QXBwOiBTcGVha3MgaW50byBtaWNyb3Bob25lCiAgICAgICAgQXBwLT4+QXBwOiAxNmtIeiBQQ00gKyBub2lzZSBmaWx0ZXIKICAgICAgICBBcHAtPj5XUzogQXVkaW8gY2h1bmtzIGJhc2U2NAogICAgICAgIEdlbWluaS0tPj5BcHA6IGlucHV0VHJhbnNjcmlwdAogICAgICAgIEdlbWluaS0tPj5BcHA6IG1vZGVsVHVybiBhdWRpbyByZXNwb25zZQogICAgICAgIEFwcC0+PkFwcDogUGxheSAyNGtIeiBhdWRpbwogICAgICAgIEdlbWluaS0tPj5BcHA6IG91dHB1dFRyYW5zY3JpcHQKCiAgICAgICAgYWx0IEF1dG9ub21vdXMgVG9vbCBDYWxsCiAgICAgICAgICAgIE5vdGUgb3ZlciBHZW1pbmk6IEFJIGRlY2lkZXMgdG8gcnVuIGNvZGUKICAgICAgICAgICAgR2VtaW5pLS0+PkFwcDogdG9vbENhbGwgcnVuX2NvZGUKICAgICAgICAgICAgQXBwLT4+U2FuZGJveDogRXhlY3V0ZSBpbiBpc29sYXRlZCBjb250YWluZXIKICAgICAgICAgICAgU2FuZGJveC0tPj5BcHA6IHN0ZG91dCBzdGRlcnIgZXhpdCBjb2RlCiAgICAgICAgICAgIEFwcC0+PldTOiB0b29sUmVzcG9uc2UgdGVzdCByZXN1bHRzCiAgICAgICAgICAgIEdlbWluaS0tPj5BcHA6IFZlcmJhbCBmZWVkYmFjayBvbiByZXN1bHRzCiAgICAgICAgZW5kCgogICAgICAgIGFsdCBDYW5kaWRhdGUgSW50ZXJydXB0cwogICAgICAgICAgICBDYW5kaWRhdGUtPj5BcHA6IFNwZWFrcyB3aGlsZSBBSSB0YWxraW5nCiAgICAgICAgICAgIEFwcC0+PldTOiBTVEFSVF9PRl9BQ1RJVklUWQogICAgICAgICAgICBHZW1pbmktLT4+QXBwOiBpbnRlcnJ1cHRlZAogICAgICAgICAgICBBcHAtPj5BcHA6IFN0b3AgYXVkaW8gcGxheWJhY2sKICAgICAgICAgICAgR2VtaW5pLS0+PkFwcDogTmV3IHJlc3BvbnNlIHRvIGludGVycnVwdGlvbgogICAgICAgIGVuZAoKICAgICAgICBhbHQgU3lzdGVtIERlc2lnbiBNb2RlCiAgICAgICAgICAgIENhbmRpZGF0ZS0+PkFwcDogRGVzY3JpYmUgYXJjaGl0ZWN0dXJlIGJ5IHZvaWNlCiAgICAgICAgICAgIEdlbWluaS0tPj5BcHA6IG1vZGVsVHVybiB3aXRoIE1lcm1haWQgY29kZQogICAgICAgICAgICBBcHAtPj5BcHA6IFBhcnNlIGFuZCByZW5kZXIgZGlhZ3JhbQogICAgICAgICAgICBHZW1pbmktLT4+QXBwOiBQcm9iaW5nIGZvbGxvdy11cCBxdWVzdGlvbgogICAgICAgIGVuZAogICAgZW5kCgogICAgQ2FuZGlkYXRlLT4+QXBwOiBFbmQgdGhlIGludGVydmlldwogICAgR2VtaW5pLS0+PkFwcDogdG9vbENhbGwgZW5kX2ludGVydmlldwogICAgQXBwLT4+R2VtaW5pOiBHZW5lcmF0ZSByZXBvcnQgdmlhIEdlbWluaSAzIEZsYXNoIFJFU1QgQVBJCiAgICBHZW1pbmktLT4+QXBwOiBTdHJ1Y3R1cmVkIGludGVydmlldyByZXBvcnQKICAgIEFwcC0+PkNhbmRpZGF0ZTogRGlzcGxheSByZXBvcnQgd2l0aCBzY29yZXMK)

### State Management

![State Management](https://mermaid.ink/img/Z3JhcGggTFIKICAgIHN1YmdyYXBoIFN0b3Jlc1siWnVzdGFuZCBTdG9yZXMgd2l0aCBQZXJzaXN0IE1pZGRsZXdhcmUiXQogICAgICAgIE1haW5bInN0b3JlLnRzXG5Db2RlIGxhbmd1YWdlIHByb2JsZW1cbkludGVydmlldyBtb2RlIHN0YXRlXG5UcmFuc2NyaXB0IGNhcCA1MDBcbkNvbnNvbGUgY2FwIDIwMFxuVGVzdHMgY2FwIDEwMCJdCiAgICAgICAgU0RbInN5c3RlbS1kZXNpZ24tc3RvcmUudHNcblRvcGljIHBoYXNlIGRpYWdyYW1zXG5UcmFuc2NyaXB0IGNhcCA1MDBcbkNvbXBvbmVudCBjaGVja2xpc3QiXQogICAgICAgIEJlaGF2WyJiZWhhdmlvcmFsLXN0b3JlLnRzXG5Ub3BpYyBTVEFSIHJlc3BvbnNlc1xuVHJhbnNjcmlwdCBjYXAgNTAwXG5UcmFuc2NyaXB0IE5PVCBwZXJzaXN0ZWQiXQogICAgICAgIFByb2dyZXNzWyJwcm9ncmVzcy1zdG9yZS50c1xuQ29tcGxldGVkIGludGVydmlld3MgY2FwIDIwMFxuWFAgc3RyZWFrcyByZWFkaW5lc3NcbkNhdGVnb3J5IHNjb3JlcyJdCiAgICBlbmQKCiAgICBzdWJncmFwaCBQZXJzaXN0ZW5jZVsibG9jYWxTdG9yYWdlIHZpYSBwYXJ0aWFsaXplIl0KICAgICAgICBNUFsiTWFpbjogY29kZSBsYW5ndWFnZVxucHJvYmxlbSBzZXR0aW5ncyBwZXJzb25hIl0KICAgICAgICBTUFsiU0Q6IHRvcGljIHBoYXNlIG9ubHkiXQogICAgICAgIEJQWyJCZWhhdmlvcmFsOiB0b3BpYyBvbmx5Il0KICAgICAgICBQUFsiUHJvZ3Jlc3M6IGFsbCBkYXRhIl0KICAgIGVuZAoKICAgIE1haW4gLS0+IE1QCiAgICBTRCAtLT4gU1AKICAgIEJlaGF2IC0tPiBCUAogICAgUHJvZ3Jlc3MgLS0+IFBQCgogICAgc3R5bGUgTWFpbiBmaWxsOiM0Mjg1RjQsc3Ryb2tlOiMxYTczZTgsY29sb3I6I2ZmZgogICAgc3R5bGUgU0QgZmlsbDojMzRBODUzLHN0cm9rZTojMWU4ZTNlLGNvbG9yOiNmZmYKICAgIHN0eWxlIEJlaGF2IGZpbGw6I0ZGNkQwMSxzdHJva2U6I2U2NTEwMCxjb2xvcjojZmZmCiAgICBzdHlsZSBQcm9ncmVzcyBmaWxsOiM5QzI3QjAsc3Ryb2tlOiM3QjFGQTIsY29sb3I6I2ZmZgo=)

### Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **AI Voice** | Gemini 2.5 Flash Native Audio (Live API) | Real-time voice interviews via WebSocket |
| **AI Analysis** | Gemini 3 Flash (REST API) | Reports, AutoFix, code quality analysis |
| **Frontend** | Next.js 16, React 19, TypeScript 5 | App framework with App Router |
| **Styling** | Tailwind CSS 4, Radix UI | Responsive design with accessible components |
| **Code Editor** | Monaco Editor | VS Code-quality editing in browser |
| **Diagrams** | Mermaid 11.12 | Live architecture diagram rendering |
| **State** | Zustand 5 with persist middleware | Client state with capped localStorage |
| **Sandbox** | Daytona SDK | Isolated Docker containers for code execution |
| **Code Review** | CodeRabbit | Automated code quality analysis |
| **Monitoring** | Sentry | Production error tracking |
| **Validation** | Zod 4 | Runtime type safety |
| **Testing** | Vitest, Testing Library | 93+ unit and integration tests |

---

## Challenges We Ran Into

### Non-ASCII Character Rejection
The Gemini Native Audio model silently rejects system instructions containing non-ASCII characters (em-dashes, arrows, emojis) with a cryptic WebSocket close code 1007: "Request contains an invalid argument." No error message, no hint. We spent hours debugging before discovering that a single em-dash character (`U+2014`) in our 14KB system prompt could crash the entire connection. We had to scan every prompt file character-by-character and replace all non-ASCII with ASCII equivalents.

### Natural Turn-Taking
Building a conversation that feels real required careful tuning of Voice Activity Detection. Too sensitive and the AI stops mid-sentence from keyboard clicks. Too insensitive and interruptions don't register. We landed on 700ms silence duration with low start/end sensitivity, plus biquad noise filters (80Hz high-pass, 8kHz low-pass) to strip out ambient noise before it hits the VAD.

### Real-Time Diagram Generation from Voice
Extracting valid Mermaid syntax from Gemini's streaming text responses was harder than expected. The AI sometimes outputs partial diagrams, invalid syntax, or mixes diagram code with conversational text mid-stream. We built a custom parser that validates Mermaid syntax before rendering, handles partial updates gracefully, and maintains an undo/redo history so candidates can recover from bad renders.

### localStorage Overflow
Unbounded transcript arrays caused localStorage to silently fail after 30+ minute interview sessions with zero error messages. We implemented caps across all Zustand stores (transcripts: 500 entries, console output: 200, test results: 100) and carefully excluded large arrays from persistence via `partialize()`. The behavioral store doesn't persist transcripts at all since they can grow very large in voice-heavy sessions.

### Speech Analytics False Positives
Our initial filler word detection flagged common legitimate words ("so," "right," "like") as filler, producing inflated and inaccurate metrics that frustrated users. We narrowed detection to 9 high-confidence patterns and fixed pause detection to measure actual candidate thinking time (gap between AI finishing and candidate starting) rather than AI response latency, which was being incorrectly attributed to the candidate.

### Making the AI an Interviewer, Not a Helper
The hardest design challenge was behavioral. Our system design AI initially acted as a collaborative helper - presenting starting diagrams and guiding candidates through architecture. Real FAANG interviewers present the problem and wait. We rewrote the entire persona to be evaluative: Alexis challenges decisions ("Why Kafka over RabbitMQ?"), probes failure modes ("What happens if this node goes down?"), and only draws diagrams reflecting what the candidate has described - never proposing architecture on its own.

---

## Accomplishments That We're Proud Of

- **Three complete interview modes** (coding, system design, behavioral) in a single platform powered by Gemini - no competitor offers all three with voice AI
- **Real-time Mermaid diagram generation from voice** - describe "add a load balancer in front of the API servers" and watch it appear on the canvas. Industry first for interview prep
- **Natural interruption handling** - candidates interrupt mid-sentence and the AI seamlessly pivots, just like a real conversation
- **Autonomous tool calling** - Gemini proactively decides when to run tests, read code, and give feedback. The AI drives the interview, not the UI
- **Comprehensive speech analytics** - filler words, pace, confidence, vocabulary diversity, talk ratio. Metrics that actually help candidates improve their communication skills, not just their algorithms
- **FAANG-style evaluative AI** - Alexis challenges, probes, and pushes back. It's not a friendly tutor - it's the interviewer you'll face at Google
- **500+ problems** with solution editorials, company-specific guides for 8 companies, 18 system design topics, 20 behavioral categories
- **Sub-second voice latency** - the conversation genuinely feels natural, not like talking to a chatbot with awkward pauses

---

## What We Learned

- **Gemini's Native Audio changes the paradigm** - the voice synthesis quality and natural turn-taking make voice-first AI applications genuinely viable for complex, extended interactions. This isn't a voice assistant answering quick questions - it's a 45-minute technical conversation that feels real.

- **Tool calling in voice mode is the killer feature** - having Gemini autonomously decide when to run code or read files creates moments that feel magical. The AI doesn't just talk about your code - it runs it, sees the output, and gives contextual feedback. Candidates regularly forget they're talking to an AI.

- **Prompt engineering for voice is a different discipline** - prompts that work perfectly for text chat fail in voice mode. We learned to write conversational, short-response prompts (1-2 sentences max), handle interruption recovery, and discovered the hard way that non-ASCII characters silently break everything.

- **State management requires discipline at scale** - three interview modes each with their own Zustand store, transcript, persistence strategy, and array caps. One unbounded array can silently corrupt an entire localStorage partition.

- **Interview prep is about communication, not algorithms** - through competitive analysis, we discovered the real gap isn't "more LeetCode problems." It's that nobody practices the communication layer. Speech analytics and behavioral interviews turned out to be the features users found most valuable.

---

## What's Next for BetterThanLeet

- **Gemini 3 Migration** - Upgrade to Gemini 3's enhanced reasoning for deeper technical evaluation, more nuanced follow-up questions, better code understanding, and reduced latency
- **Multi-Language Expansion** - Add Java, C++, Go, and Rust support for coding interviews
- **Video Recording and Playback** - Record full interview sessions with synchronized audio, code changes, and transcript for later review and sharing
- **Collaborative Mock Interviews** - Two candidates interview each other with AI moderation, scoring, and comparative analytics
- **Company-Specific AI Personas** - Personas trained to mimic the interview style of specific companies (Google's "Googleyness" emphasis, Amazon's Leadership Principles framework)
- **Mobile App** - Voice-first interviews on the go for commute practice
- **Enterprise API** - Let companies use BetterThanLeet for actual candidate screening with customizable rubrics and ATS integration
- **Interview Marketplace** - Connect candidates with human interviewers, using AI analytics to evaluate both sides

---

## Testing Instructions

**No test login required.** The app runs locally; you start an interview directly from the UI.

### Quick run (with API keys)

1. **Prerequisites:** Node.js 18+, and API keys for Gemini and (for full voice) optionally Daytona.
2. **Setup:**
   ```bash
   git clone https://github.com/nihalnihalani/BetterThanLeet.git
   cd BetterThanLeet
   npm install
   ```
3. **Environment:** Create `.env.local` in the project root with at least:
   - `GEMINI_API_KEY` (required for voice and analysis)
   - `DAYTONA_API_KEY` and `DAYTONA_API_URL` (for real code execution; see mock option below)
4. **Run:** `npm run dev` then open **http://localhost:3000**.
5. **Test flow:** Click **Start Interview** on the landing page → go to the interview page → click **Start Interview** in the agent panel → allow microphone access. Choose a problem, talk to Alexis, and write code; use **Run Code** to execute in the sandbox and **End Interview & Report** to generate the report.

### Testing without API keys (mock mode)

To try the UI without Daytona or external APIs, add to `.env.local`:

- `NEXT_PUBLIC_USE_MOCK_DAYTONA=true`
- `NEXT_PUBLIC_USE_MOCK_CODERABBIT=true` (if used)

Restart the dev server. The interview UI and flow work with mocked sandbox and analysis.

### Demo / fallback (Wizard Mode)

If the live AI is unreliable during a demo: enable **Wizard Mode** in the footer, then press **Ctrl+Shift+X** to trigger scripted voice lines so the demo can continue.

---

## Gemini Integration Summary

BetterThanLeet is built entirely around Gemini's multimodal capabilities. The core experience is a **real-time voice conversation** with "Alexis," an AI interviewer powered by **Gemini 2.5 Flash Native Audio** via the Live API over raw WebSocket connections. Candidates speak naturally and Gemini responds with synthesized speech - handling interruptions, follow-up questions, and dynamic difficulty adjustment in real time.

**Gemini Live API** drives three distinct interview modes: coding interviews with proactive tool calling (the AI autonomously runs tests and reads code via function calling), system design interviews where Gemini generates live Mermaid architecture diagrams as candidates describe components by voice, and behavioral interviews using STAR-method evaluation.

**Gemini 3 Flash** powers the analysis layer: generating comprehensive interview reports with hiring recommendations, producing AutoFix suggestions for broken code, and delivering code quality/security/complexity analysis.

Key Gemini features used: **Native Audio synthesis**, **Voice Activity Detection** with interruption handling, **real-time transcription** (input + output), **function/tool calling** for autonomous code execution, and **structured output** for reports and analysis. Gemini is not a feature bolted on - it IS the product. Every interaction, from the first greeting to the final report, flows through Gemini.


