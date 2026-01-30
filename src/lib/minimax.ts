import * as Sentry from "@sentry/nextjs";
import { CoachingFeedback, DEFAULT_COACHING_FEEDBACK, calculateSkillLevel } from "./coaching";

/**
 * MiniMax model usage (platform.minimax.io docs):
 * - Text Chat (/v1/text/chatcompletion_v2): M2-her only (dialogue, role-play). Used for Shifu interviewer.
 * - Anthropic-compatible (/anthropic/v1/messages): MiniMax-M2.1, MiniMax-M2.1-lightning, MiniMax-M2 (code, reasoning). Used for report generation and analysis on api.minimax.io.
 * - api.minimax.chat: same chatcompletion_v2 endpoint can use MiniMax-M2.1-lightning for both chat and report.
 */
// Support both api.minimax.io (official) and api.minimax.chat; keys from platform.minimax.io use .io
const MINIMAX_API_BASE = (process.env.MINIMAX_API_BASE_URL || "https://api.minimax.io").replace(/\/$/, "");
const MINIMAX_API_URL = `${MINIMAX_API_BASE}/v1/text/chatcompletion_v2`;
const MINIMAX_ANTHROPIC_URL = MINIMAX_API_BASE.includes("api.minimax.io")
  ? `${MINIMAX_API_BASE}/anthropic/v1/messages`
  : null;
// TTS on .io uses t2a_v2; .chat uses text_to_speech. Override with MINIMAX_TTS_BASE_URL if needed.
const MINIMAX_TTS_BASE = (process.env.MINIMAX_TTS_BASE_URL || MINIMAX_API_BASE).replace(/\/$/, "");
const MINIMAX_TTS_URL = MINIMAX_TTS_BASE.includes("api.minimax.io")
  ? `${MINIMAX_TTS_BASE}/v1/t2a_v2`
  : `${MINIMAX_TTS_BASE}/v1/text_to_speech`;
const MINIMAX_API_KEY = (process.env.MINIMAX_API_KEY || "").trim();
const MINIMAX_GROUP_ID = (process.env.MINIMAX_GROUP_ID || "").trim();
const USE_OFFICIAL_IO = MINIMAX_API_BASE.includes("api.minimax.io"); 

// Using MiniMax-M2.1 for code generation and refactoring as requested
const MODEL_NAME = "MiniMax-M2.1";
export const CHAT_MODEL_NAME = "MiniMax-M2.1-lightning";

// ============================================================================
// Input Sanitization
// ============================================================================

function sanitizeForPrompt(input: string): string {
  if (!input || typeof input !== 'string') return '';
  const MAX_INPUT_LENGTH = 50000;
  return input.slice(0, MAX_INPUT_LENGTH);
}

function sanitizeCode(code: string): string {
  if (!code || typeof code !== 'string') return '';
  const MAX_CODE_LENGTH = 100000;
  return code.slice(0, MAX_CODE_LENGTH);
}

function sanitizeError(error: string): string {
  if (!error || typeof error !== 'string') return '';
  return error.slice(0, 5000);
}

// ============================================================================
// MiniMax API Client
// ============================================================================

interface MiniMaxMessage {
  sender_type: "USER" | "BOT";
  sender_name: string;
  text: string;
}

interface MiniMaxResponse {
  reply: string;
  choices?: { message: { content: string } }[];
  base_resp?: {
    status_code: number;
    status_msg: string;
  };
}

// Convert to official api.minimax.io format (role/content) when using .io
// NOTE: Do NOT include a "name" field — distinct names cause "group chat not supported" errors.
function toOfficialMessages(messages: MiniMaxMessage[]): { role: string; content: string }[] {
  return messages.map((m) => {
    const role = m.sender_type === "BOT" ? "assistant" : (m.sender_name === "System" ? "system" : "user");
    return { role, content: m.text };
  });
}

export async function callMiniMax(messages: MiniMaxMessage[], temperature = 0.7, model = MODEL_NAME): Promise<string> {
  if (!MINIMAX_API_KEY) {
    throw new Error("MINIMAX_API_KEY is not set. Add it to your .env.local file.");
  }

  // Do not use GroupId: api.minimax.io returns "group chat not supported" when it is present
  const url = MINIMAX_API_URL;

  const payload = USE_OFFICIAL_IO
    ? {
        model: "M2-her",
        messages: toOfficialMessages(messages),
        temperature,
        top_p: 0.95,
        max_tokens: 1024,
        stream: false,
      }
    : {
        model,
        messages,
        temperature,
        tokens_to_generate: 4096,
        stream: false,
      };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${MINIMAX_API_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`MiniMax API Error (${response.status}): ${errorText}`);
  }

  const data = await response.json() as MiniMaxResponse;

  if (data.base_resp && data.base_resp.status_code !== 0) {
    throw new Error(`MiniMax API Error: ${data.base_resp.status_msg}`);
  }

  if (data.choices && data.choices.length > 0) {
    return data.choices[0].message.content;
  }

  return data.reply || "";
}

export async function textToSpeech(text: string, voiceId = "English_Gentle-voiced_man"): Promise<ArrayBuffer> {
  if (!MINIMAX_API_KEY) {
    throw new Error("MINIMAX_API_KEY is not set");
  }

  const payload: Record<string, unknown> = {
    model: "speech-2.6-turbo",
    voice_setting: {
      voice_id: voiceId,
      speed: 1.0,
      vol: 1.0,
      pitch: 0,
    },
    audio_setting: {
      sample_rate: 32000,
      bitrate: 128000,
      format: "mp3",
      channel: 1,
    },
    pronunciation_dict: {
      tone: [],
      phoneme: [],
    },
    text,
  };
  if (MINIMAX_TTS_BASE.includes("api.minimax.io")) {
    payload.stream = false;
    payload.output_format = "hex";
  }
  
  // Do not use GroupId: api.minimax.io returns "group chat not supported" when it is present
  const ttsUrl = MINIMAX_TTS_URL;

  const response = await fetch(ttsUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${MINIMAX_API_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`MiniMax TTS Error: ${errorText}`);
  }

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const data = await response.json() as { base_resp?: { status_code: number; status_msg: string }; data?: { audio?: string } };
    if (data.base_resp && data.base_resp.status_code !== 0) {
      throw new Error(`MiniMax TTS API Error: ${data.base_resp.status_msg}`);
    }
    // api.minimax.io T2A returns JSON with data.audio as hex string
    if (data.data?.audio) {
      const hex = data.data.audio;
      const bytes = new Uint8Array(hex.length / 2);
      for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
      }
      return bytes.buffer;
    }
  }

  return await response.arrayBuffer();
}

// ============================================================================
// Streaming TTS (WebSocket) - for lower latency, stream audio chunks
// ============================================================================

const MINIMAX_TTS_WS_URL = MINIMAX_TTS_BASE.includes("api.minimax.io")
  ? MINIMAX_TTS_BASE.replace(/^https:\/\//, "wss://").replace(/\/$/, "") + "/ws/v1/t2a_v2"
  : null;

/** Yields audio chunks (Uint8Array) from MiniMax WebSocket TTS. Only works when using api.minimax.io. */
export async function* textToSpeechStream(
  text: string,
  voiceId = "English_Gentle-voiced_man"
): AsyncGenerator<Uint8Array, void, unknown> {
  if (!MINIMAX_API_KEY) throw new Error("MINIMAX_API_KEY is not set");
  if (!MINIMAX_TTS_WS_URL) throw new Error("Streaming TTS is only supported with api.minimax.io");

  const wsMod = await import("ws");
  const Ws = ((wsMod as { default?: unknown }).default ?? wsMod) as new (
    url: string,
    opts?: { headers: Record<string, string> }
  ) => { on: (ev: string, fn: (data?: Buffer) => void) => void; send: (data: string) => void; close: () => void };
  const ws = new Ws(MINIMAX_TTS_WS_URL, {
    headers: { Authorization: `Bearer ${MINIMAX_API_KEY}` },
  });

  const open = new Promise<void>((resolve, reject) => {
    ws.on("open", () => resolve());
    ws.on("error", (err: unknown) => reject(err));
  });

  const messages: Buffer[] = [];
  let resolveNext: (() => void) | null = null;
  const waitNext = () => new Promise<void>((r) => { resolveNext = r; });

  ws.on("message", (data?: Buffer) => {
    if (data) messages.push(data);
    if (resolveNext) {
      resolveNext();
      resolveNext = null;
    }
  });

  await open;

  const taskStart = {
    event: "task_start",
    model: "speech-2.6-turbo",
    voice_setting: { voice_id: voiceId, speed: 1, vol: 1, pitch: 0 },
    audio_setting: { sample_rate: 32000, bitrate: 128000, format: "mp3", channel: 1 },
    pronunciation_dict: { tone: [], phoneme: [] },
    continuous_sound: false,
  };
  ws.send(JSON.stringify(taskStart));

  let taskStarted = false;
  let sentContinue = false;

  while (true) {
    while (messages.length > 0) {
      const raw = messages.shift()!;
      let obj: { event?: string; data?: { audio?: string }; base_resp?: { status_code: number } };
      try {
        obj = JSON.parse(raw.toString("utf8")) as typeof obj;
      } catch {
        continue;
      }
      if (obj.event === "task_started") taskStarted = true;
      if (obj.event === "task_failed" || (obj.base_resp && obj.base_resp.status_code !== 0)) {
        ws.close();
        console.error("MiniMax TTS WebSocket task failed", JSON.stringify(obj, null, 2));
        throw new Error(`MiniMax TTS WebSocket task failed: ${JSON.stringify(obj)}`);
      }
      if (obj.event === "task_finished") {
        ws.close();
        return;
      }
      if (obj.data?.audio) {
        const hex = obj.data.audio;
        const bytes = new Uint8Array(hex.length / 2);
        for (let i = 0; i < hex.length; i += 2) bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
        yield bytes;
      }
    }
    if (taskStarted && !sentContinue) {
      sentContinue = true;
      ws.send(JSON.stringify({ event: "task_continue", text }));
      ws.send(JSON.stringify({ event: "task_finish" }));
    }
    await waitNext();
  }
}

// ============================================================================
// Robust JSON Parsing
// ============================================================================

function parseJSON<T>(text: string, defaultValue: T): { success: boolean; data: T; rawText?: string } {
  if (!text) return { success: false, data: defaultValue, rawText: text };

  const cleanText = text
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim();

  try {
    return { success: true, data: JSON.parse(cleanText) };
  } catch {
    const match = cleanText.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return { success: true, data: JSON.parse(match[0]) };
      } catch {
         // Ignore
      }
    }
  }
  return { success: false, data: defaultValue, rawText: text };
}

// ============================================================================
// Anthropic-compatible API (report generation on api.minimax.io)
// ============================================================================

interface AnthropicMessage {
  role: "user" | "assistant" | "system";
  content: string | { type: string; text: string }[];
}

/** Call MiniMax M2.1 via Anthropic-compatible endpoint. Used for report generation on api.minimax.io. */
async function callMiniMaxAnthropic(
  system: string,
  userMessage: string,
  model: string = "MiniMax-M2.1",
  maxTokens: number = 2048
): Promise<string> {
  if (!MINIMAX_API_KEY) throw new Error("MINIMAX_API_KEY is not set.");
  if (!MINIMAX_ANTHROPIC_URL) throw new Error("Anthropic endpoint is only available for api.minimax.io");

  const body = {
    model,
    max_tokens: maxTokens,
    system: sanitizeForPrompt(system).slice(0, 10000) || "You are a helpful assistant.",
    messages: [
      {
        role: "user" as const,
        content: [{ type: "text" as const, text: userMessage }],
      },
    ],
  };

  const response = await fetch(MINIMAX_ANTHROPIC_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${MINIMAX_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`MiniMax Anthropic API Error (${response.status}): ${err}`);
  }

  const data = (await response.json()) as {
    content?: { type: string; text?: string }[];
    stop_reason?: string;
  };
  const content = data.content;
  if (Array.isArray(content) && content.length > 0) {
    const textBlock = content.find((c) => c.type === "text" && c.text);
    if (textBlock && "text" in textBlock) return textBlock.text as string;
  }
  return "";
}

// ============================================================================
// AutoFix Generation
// ============================================================================

export interface AutoFixResult {
  fixedCode: string;
  dependencies: string[];
}

export async function generateAutoFix(
  code: string,
  error: string,
  language: string
): Promise<AutoFixResult | null> {
  return Sentry.startSpan({ name: "ai.autofix", op: "ai.pipeline" }, async (span) => {
    try {
      const prompt = `
Role: Senior Software Engineer & Debugger.
Task: Fix the following code based on the error message.
Language: ${sanitizeForPrompt(language)}

Error:
${sanitizeError(error)}

Original Code:
${sanitizeCode(code)}

Instructions:
1. Analyze the error and the code.
2. Determine if any external libraries/packages are missing.
3. Provide the full fixed code block.
4. Provide a list of missing dependencies (e.g. ["numpy", "pandas"]) if any.
5. If imports are missing, add them to the code.
6. If syntax is wrong, fix it.

Output JSON only:
{
  "fixedCode": "Full fixed code string here",
  "dependencies": ["package_name1", "package_name2"]
}
      `;

      span.setAttribute("ai.model_id", MODEL_NAME);
      
      const responseText = await callMiniMax([
        { sender_type: "USER", sender_name: "User", text: prompt }
      ]);

      const parseResult = parseJSON<{ fixedCode?: string; dependencies?: string[] }>(
        responseText,
        { fixedCode: undefined, dependencies: [] }
      );

      if (!parseResult.success || !parseResult.data.fixedCode) {
        throw new Error("Failed to parse AutoFix response");
      }

      return {
        fixedCode: parseResult.data.fixedCode,
        dependencies: parseResult.data.dependencies || []
      };
    } catch (error) {
      Sentry.captureException(error);
      console.error("AutoFix failed:", error);
      return null;
    }
  });
}

// ============================================================================
// Code Analysis
// ============================================================================

export interface CodeAnalysisResult {
  score: number;
  security_score: number;
  complexity: string;
  issues: string[];
  security_issues: string[];
  reasoning_trace: string;
}

const DEFAULT_ANALYSIS_RESULT: CodeAnalysisResult = {
  score: 0,
  security_score: 0,
  complexity: "Unknown",
  issues: ["Failed to analyze code"],
  security_issues: [],
  reasoning_trace: "Analysis failed"
};

export async function analyzeCodeWithMiniMax(
  code: string,
  language: string
): Promise<CodeAnalysisResult> {
  return Sentry.startSpan({ name: "ai.analysis", op: "ai.pipeline" }, async (span) => {
    try {
      const prompt = `
Role: Senior Code Reviewer & Security Researcher.
Input: ${sanitizeForPrompt(language)} Code.
Task: Perform a comprehensive analysis including:

1. Code Quality:
   - Critical Bugs.
   - Time Complexity (Big O).
   - Code Smells.

2. Security Audit:
   - Prompt Injection.
   - Resource Exhaustion.
   - Data Leakage.
   - Dangerous Operations.

Output JSON only:
{
  "score": 1-10,
  "security_score": 1-10,
  "complexity": "O(n)",
  "issues": ["List of brief issue descriptions"],
  "security_issues": ["List of security-specific vulnerabilities"],
  "reasoning_trace": "Brief summary of thought process"
}

Code:
${sanitizeCode(code)}
      `;

      span.setAttribute("ai.model_id", MODEL_NAME);

      const responseText = await callMiniMax([
        { sender_type: "USER", sender_name: "User", text: prompt }
      ]);

      const parseResult = parseJSON<CodeAnalysisResult>(responseText, DEFAULT_ANALYSIS_RESULT);
      return parseResult.data;
    } catch (error) {
      Sentry.captureException(error);
      return DEFAULT_ANALYSIS_RESULT;
    }
  });
}

// ============================================================================
// Interview Report Generation
// ============================================================================

export interface InterviewReportData {
  transcript: { timestamp: number; speaker: 'agent' | 'user'; message: string }[];
  code: string;
  language: string;
  testResults: any[];
  integrity: any;
  codeAnalysis?: any;
  coderabbitReview?: any;
  problemId?: string;
}

export interface StructuredInterviewReport {
  overallScore: number;
  hireRecommendation: 'HIRE' | 'NO HIRE' | 'STRONG HIRE' | 'LEAN HIRE' | 'LEAN NO HIRE';
  executiveSummary: string;
  technicalEvaluation: any;
  communicationEvaluation: any;
  problemSolvingEvaluation: any;
  finalFeedback: string;
}

export async function generateInterviewReport(
  data: InterviewReportData
): Promise<StructuredInterviewReport | null> {
    const sanitizedCode = sanitizeCode(data.code);
    const sanitizedLanguage = sanitizeForPrompt(data.language);
    
    // Format transcript
    const formattedTranscript = data.transcript.length > 0
      ? data.transcript.map(msg => {
          const time = new Date(msg.timestamp).toLocaleTimeString();
          const speaker = msg.speaker === 'agent' ? 'Interviewer' : 'Candidate';
          return `[${time}] ${speaker}: ${msg.message}`;
        }).join('\n')
      : 'No conversation recorded.';

    const prompt = `
You are a senior technical interviewer. Generate a comprehensive interview evaluation report.

PROBLEM: ${data.problemId || 'Unknown'}
LANGUAGE: ${sanitizedLanguage}

TRANSCRIPT:
${formattedTranscript}

CODE:
${sanitizedCode}

OUTPUT JSON ONLY:
{
  "overallScore": <0-100>,
  "hireRecommendation": "<STRONG HIRE|HIRE|LEAN HIRE|LEAN NO HIRE|NO HIRE>",
  "executiveSummary": "Summary...",
  "technicalEvaluation": {
    "score": <0-10>,
    "summary": "...",
    "strengths": [],
    "weaknesses": []
  },
  "communicationEvaluation": {
    "score": <0-10>,
    "summary": "...",
    "strengths": [],
    "weaknesses": []
  },
  "problemSolvingEvaluation": {
    "score": <0-10>,
    "summary": "...",
    "strengths": [],
    "weaknesses": []
  },
  "finalFeedback": "Feedback..."
}
`;
  
  try {
     const responseText = await callMiniMax([{ sender_type: "USER", sender_name: "User", text: prompt }]);
     return parseJSON<StructuredInterviewReport>(responseText, {} as any).data;
  } catch (e) {
      console.error(e);
      return null;
  }
}

// ============================================================================
// Practice Interview Feedback
// ============================================================================

export interface PracticeInterviewData extends InterviewReportData {
  companyId?: string;
  companyName?: string;
}

export async function generatePracticeInterviewFeedback(
  data: PracticeInterviewData
): Promise<CoachingFeedback> {
  return Sentry.startSpan({ name: "ai.coaching_feedback", op: "ai.pipeline" }, async (span) => {
    try {
      const sanitizedCode = sanitizeCode(data.code);
      const sanitizedLanguage = sanitizeForPrompt(data.language);
      
      const formattedTranscript = data.transcript.length > 0
          ? data.transcript.map(msg => {
            const speaker = msg.speaker === 'agent' ? 'Coach' : 'Student';
            return `${speaker}: ${msg.message}`;
          }).join('\n')
          : 'No conversation.';

      const prompt = `
You are a coding coach. Provide ENCOURAGING feedback.

Context: ${data.companyName || 'General'}
Language: ${sanitizedLanguage}

Transcript:
${formattedTranscript}

Code:
${sanitizedCode}

Output JSON ONLY:
{
  "overallLevel": "Beginner" | "Developing" | "Proficient" | "Advanced" | "Expert",
  "overallScore": 1-10,
  "categories": {
    "problemSolving": { "level": "...", "score": 1-10, "description": "..." },
    "codeQuality": { "level": "...", "score": 1-10, "description": "..." },
    "communication": { "level": "...", "score": 1-10, "description": "..." },
    "optimization": { "level": "...", "score": 1-10, "description": "..." }
  },
  "strengths": ["...", "..."],
  "improvementPlan": [{ "priority": "High", "area": "...", "suggestion": "...", "resources": [] }],
  "recommendedProblems": [{ "title": "...", "difficulty": "Easy", "reason": "...", "tags": [] }],
  "encouragement": "..."
}`;

      span.setAttribute("ai.model_id", MODEL_NAME);
      const responseText = await callMiniMax([{ sender_type: "USER", sender_name: "User", text: prompt }]);

      const parseResult = parseJSON<CoachingFeedback>(responseText, DEFAULT_COACHING_FEEDBACK);
      
      if (!parseResult.success) return DEFAULT_COACHING_FEEDBACK;

      const feedback = parseResult.data;
      return {
        ...DEFAULT_COACHING_FEEDBACK,
        ...feedback,
        overallLevel: feedback.overallLevel || calculateSkillLevel(feedback.overallScore || 5)
      };

    } catch (error) {
      Sentry.captureException(error);
      return DEFAULT_COACHING_FEEDBACK;
    }
  });
}
