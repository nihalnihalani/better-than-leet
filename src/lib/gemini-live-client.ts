/**
 * Gemini Live Client v5
 * Hybrid approach: raw WebSocket (for reliable API key passing) + SDK message format
 * Features:
 * - Manual WebSocket URL construction with API key in query string
 * - Message format matching @google/genai SDK (fixes 1007 protocol errors)
 * - Voice Activity Detection (VAD) for natural turn-taking
 * - Interruption handling - stops when user speaks
 * - Proactive tool calling
 * - Connection retry with exponential backoff
 * - Audio capture with noise filtering
 * - Seamless audio playback with pre-scheduling
 */

import { INTERVIEW_TOOLS } from "./gemini-tools";
import { getSystemInstruction } from "./interviewer-prompt";

// Audio sample rates per Gemini Live API spec
const INPUT_SAMPLE_RATE = 16000;  // Input MUST be 16kHz
const OUTPUT_SAMPLE_RATE = 24000; // Output is always 24kHz

// Use gemini-2.5-flash-native-audio for Live API
const MODEL = "models/gemini-2.5-flash-native-audio-preview-12-2025";

// WebSocket endpoint
const WS_BASE_URL = "wss://generativelanguage.googleapis.com";
const API_VERSION = "v1beta";

// Connection retry configuration
const MAX_RETRY_ATTEMPTS = 3;
const INITIAL_RETRY_DELAY_MS = 1000;
const MAX_AUDIO_QUEUE_SIZE = 100; // Prevent memory leaks

// After an interruption, if no model response within this time, nudge the model
const POST_INTERRUPT_TIMEOUT_MS = 7000;

// Interview mode type
export type InterviewMode = 'real' | 'practice';

// Problem context to send to Gemini directly at startup
export interface ProblemContext {
  title: string;
  difficulty: string;
  description: string;
  examples: Array<{ input: string; output: string; explanation?: string }>;
  constraints: string[];
  functionName: string;
  starterCode?: string;
  companyName?: string;
  tags?: string[];
}

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export class GeminiLiveClient {
  // WebSocket
  private ws: WebSocket | null = null;
  private _isConnected = false;

  // Audio I/O
  private audioContext: AudioContext | null = null;
  private outputAudioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private interviewMode: InterviewMode = 'real';
  private problemContext: ProblemContext | null = null;

  // Audio Playback Queue
  private audioQueue: Float32Array[] = [];
  private isPlaying = false;
  private nextPlayTime = 0;
  private currentSource: AudioBufferSourceNode | null = null;
  private scheduledSources: AudioBufferSourceNode[] = [];

  // Connection retry state
  private retryAttempts = 0;
  private retryTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private isSetupComplete = false;

  // Response tracking
  private lastResponseTime = 0;
  private pendingUserInput = false;
  private responseCheckTimeoutId: ReturnType<typeof setTimeout> | null = null;

  // Audio processing nodes (stored for cleanup)
  private processor: ScriptProcessorNode | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private highPassFilter: BiquadFilterNode | null = null;
  private lowPassFilter: BiquadFilterNode | null = null;

  // Callbacks
  public onStatusChange: (status: ConnectionStatus) => void = () => {};
  public onMessage: (message: string) => void = () => {};
  public onError: (error: Error) => void = () => {};
  public onToolsCall: (toolCalls: any[]) => Promise<any[]> = async () => [];
  public onVolume: (volume: number) => void = () => {};
  public onInterrupted: () => void = () => {};
  public onTurnEnd: () => void = () => {};
  public onModelSpeaking: (isSpeaking: boolean) => void = () => {};
  public onNoResponse: () => void = () => {};
  public onSetupComplete: () => void = () => {};
  public onUserTranscript: (text: string) => void = () => {};

  constructor(private apiKey: string, mode: InterviewMode = 'real') {
    this.apiKey = apiKey.trim();
    this.interviewMode = mode;
    console.log(`🔑 GeminiLiveClient API key: "${this.apiKey ? this.apiKey.substring(0, 10) + '...' + this.apiKey.substring(this.apiKey.length - 4) : 'EMPTY/UNDEFINED'}" (length: ${this.apiKey?.length ?? 0})`);
  }

  setInterviewMode(mode: InterviewMode) {
    this.interviewMode = mode;
  }

  getInterviewMode(): InterviewMode {
    return this.interviewMode;
  }

  setProblemContext(problem: ProblemContext) {
    this.problemContext = problem;
    console.log(`📋 Problem context set: ${problem.title}`);
  }

  async connect(isRetry = false) {
    if (!isRetry) {
      this.retryAttempts = 0;
    }

    console.log(`🚀 Starting Gemini Live connection... ${isRetry ? `(retry ${this.retryAttempts}/${MAX_RETRY_ATTEMPTS})` : ''}`);
    this.onStatusChange('connecting');

    try {
      // Validate API key
      if (!this.apiKey || this.apiKey.length < 10) {
        throw new Error("Invalid or missing Gemini API key");
      }

      // Pre-check microphone permission
      try {
        const permissionStatus = await navigator.permissions?.query({ name: 'microphone' as PermissionName });
        if (permissionStatus?.state === 'denied') {
          throw new Error("Microphone permission denied. Please enable it in browser settings.");
        }
      } catch {
        // permissions.query may not be supported, continue anyway
      }

      // Build system instruction with problem context
      let systemInstruction = getSystemInstruction(this.interviewMode);
      if (this.problemContext) {
        systemInstruction += this.buildProblemSection();
      }

      // Construct WebSocket URL with API key directly in query string
      const wsUrl = `${WS_BASE_URL}/ws/google.ai.generativelanguage.${API_VERSION}.GenerativeService.BidiGenerateContent?key=${this.apiKey}`;

      // Debug: check if key is properly attached (masked)
      const maskedKey = this.apiKey.substring(0, 8) + '...' + this.apiKey.substring(this.apiKey.length - 4);
      console.log(`🔗 WebSocket URL constructed with key: ${maskedKey} (length: ${this.apiKey.length})`);

      console.log(`🎙️ Connecting: ${this.interviewMode} mode, model: ${MODEL}`);
      console.log(`📋 Problem: ${this.problemContext?.title || 'none'}`);
      console.log(`🔗 WebSocket URL: ${wsUrl.replace(this.apiKey, this.apiKey.substring(0, 8) + '...')}`);

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log("🎙️ Gemini Live WebSocket Connected!");
        this._isConnected = true;
        this.retryAttempts = 0;
        this.isSetupComplete = false;
        this.onStatusChange('connected');

        // Send setup message in SDK format
        this.sendSetupMessage(systemInstruction);
      };

      this.ws.onmessage = (event: MessageEvent) => {
        this.handleRawMessage(event);
      };

      this.ws.onerror = (event: Event) => {
        console.error("❌ WebSocket Error:", event);
      };

      this.ws.onclose = (event: CloseEvent) => {
        console.log("🔌 Gemini Live WebSocket Closed:", event.code, event.reason);
        this._isConnected = false;
        this.ws = null;
        this.handleClose(event);
      };

    } catch (error) {
      console.error("❌ Connection failed:", error);
      this._isConnected = false;
      this.ws = null;
      this.onStatusChange('error');
      this.onError(error instanceof Error ? error : new Error("Failed to connect"));
    }
  }

  private sendSetupMessage(systemInstruction: string) {
    if (!this.ws) return;

    // Build setup message in the exact format the @google/genai SDK uses
    // (reverse-engineered from liveConnectParametersToMldev)
    const setupMessage = {
      setup: {
        model: MODEL,
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: "Aoede"
              }
            }
          }
        },
        systemInstruction: {
          role: "user",
          parts: [{ text: systemInstruction }]
        },
        tools: INTERVIEW_TOOLS,
        realtimeInputConfig: {
          // Ensure user speech during interruption is included in context
          // so the model responds to what the user said, not resuming its
          // previous train of thought
          activityHandling: "START_OF_ACTIVITY_INTERRUPTS",
          turnCoverage: "TURN_INCLUDES_ALL_INPUT",
          automaticActivityDetection: {
            disabled: false,
            // High sensitivity detects interruptions faster
            startOfSpeechSensitivity: "START_SENSITIVITY_HIGH",
            // Lower end sensitivity lets user pause mid-sentence without
            // the model jumping in
            endOfSpeechSensitivity: "END_SENSITIVITY_LOW",
            // Include a small audio buffer before detected speech start
            prefixPaddingMs: 20,
            // Wait 700ms of silence before considering speech finished
            // (longer than default to let user complete thoughts after interrupting)
            silenceDurationMs: 700
          }
        },
        // Improves natural conversation handling and interruption awareness
        enableAffectiveDialog: true,
        proactivity: {
          proactiveAudio: true
        }
      }
    };

    console.log("📤 Sending setup message...");
    this.ws.send(JSON.stringify(setupMessage));
  }

  disconnect() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
      this.retryTimeoutId = null;
    }
    if (this.responseCheckTimeoutId) {
      clearTimeout(this.responseCheckTimeoutId);
      this.responseCheckTimeoutId = null;
    }

    if (this.ws) {
      try {
        this.ws.close();
      } catch {
        // Already closed
      }
      this.ws = null;
    }
    this._isConnected = false;
    this.isSetupComplete = false;
    this.stopAudio();
    this.retryAttempts = 0;
  }

  sendText(text: string) {
    if (!this.ws || !this._isConnected) {
      console.warn("Cannot send text: not connected");
      return;
    }

    this.ws.send(JSON.stringify({
      clientContent: {
        turns: [{ role: "user", parts: [{ text }] }],
        turnComplete: true,
      }
    }));
  }

  sendCodeContext(code: string, silent: boolean = true) {
    if (!this.ws || !this._isConnected) {
      return;
    }

    const truncatedCode = code.length > 10000
      ? code.substring(0, 10000) + "\n... [code truncated]"
      : code;

    const contextMessage = silent
      ? `[CONTEXT UPDATE - Candidate's current code in editor]\n\`\`\`\n${truncatedCode}\n\`\`\`\n[End of code update. DO NOT speak right now - the candidate may still be typing. Only comment if they address you directly or have clearly paused for a long time. When you do comment, keep it brief and ask about their approach rather than pointing out issues.]`
      : `Here's my current code:\n\`\`\`\n${truncatedCode}\n\`\`\``;

    console.log("📝 Sending code context to Gemini (length:", code.length, ")");
    this.ws.send(JSON.stringify({
      clientContent: {
        turns: [{ role: "user", parts: [{ text: contextMessage }] }],
        turnComplete: true,
      }
    }));
  }

  isConnected(): boolean {
    return this._isConnected && this.ws !== null;
  }

  promptToSpeak(context?: string) {
    if (!this.ws || !this._isConnected) {
      console.warn("Cannot prompt: not connected");
      return;
    }

    const prompt = context
      ? `[The candidate just said: "${context}". Please respond to them naturally.]`
      : `[The candidate is waiting for you to respond. Please speak to them.]`;

    console.log("🎤 Prompting model to speak...");
    this.ws.send(JSON.stringify({
      clientContent: {
        turns: [{ role: "user", parts: [{ text: prompt }] }],
        turnComplete: true,
      }
    }));
  }

  getTimeSinceLastResponse(): number {
    if (this.lastResponseTime === 0) return -1;
    return Date.now() - this.lastResponseTime;
  }

  clearAudioQueue() {
    this.audioQueue = [];

    for (const source of this.scheduledSources) {
      try {
        source.stop(0);
        source.disconnect();
      } catch {
        // Already stopped
      }
    }
    this.scheduledSources = [];

    if (this.currentSource) {
      try {
        this.currentSource.stop(0);
        this.currentSource.disconnect();
      } catch {
        // Already stopped
      }
      this.currentSource = null;
    }

    this.isPlaying = false;
    this.nextPlayTime = 0;
    this.onModelSpeaking(false);
    this.onVolume(0);
    console.log("🔇 Audio stopped immediately (user interrupted)");
  }

  // --- Raw WebSocket Message Handling ---

  private handleRawMessage(event: MessageEvent) {
    this.lastResponseTime = Date.now();

    let msg: any;
    try {
      if (typeof event.data === 'string') {
        msg = JSON.parse(event.data);
      } else if (event.data instanceof Blob) {
        // Handle Blob data - read it as text then parse
        event.data.text().then(text => {
          try {
            const blobMsg = JSON.parse(text);
            this.processServerMessage(blobMsg);
          } catch {
            console.warn("Failed to parse Blob message");
          }
        });
        return;
      } else {
        console.warn("Unknown message type:", typeof event.data);
        return;
      }
    } catch {
      console.warn("Failed to parse message:", event.data);
      return;
    }

    this.processServerMessage(msg);
  }

  private processServerMessage(msg: any) {
    // Handle setup complete - start audio input
    if (msg.setupComplete !== undefined) {
      console.log("✅ Gemini Live setup complete - starting audio input...");
      this.isSetupComplete = true;
      this.startAudioInput();
      this.onSetupComplete();
    }

    // Handle server content (audio/text/interruption/turnComplete)
    if (msg.serverContent) {
      const wasInterrupted = !!msg.serverContent.interrupted;

      if (wasInterrupted) {
        console.log("🛑 Model interrupted by user");
        this.clearAudioQueue();
        this.pendingUserInput = true;
        this.onInterrupted();

        // Start a timer: if the model doesn't respond after the user
        // finishes speaking, nudge it to reply. This handles the case
        // where Gemini's VAD detects the interruption but the model
        // never generates a follow-up response.
        if (this.responseCheckTimeoutId) {
          clearTimeout(this.responseCheckTimeoutId);
        }
        this.responseCheckTimeoutId = setTimeout(() => {
          this.responseCheckTimeoutId = null;
          if (this.pendingUserInput && this._isConnected && this.ws) {
            console.log("⚠️ No model response after interruption - prompting to speak");
            this.onNoResponse();
            // Use interruption-aware prompt so model responds to what the
            // user said rather than resuming its previous train of thought
            this.promptToSpeak("[The candidate interrupted you and spoke to you. DO NOT continue your previous response. Respond to what they just said. If you couldn't understand them, ask them to repeat.]");
          }
        }, POST_INTERRUPT_TIMEOUT_MS);
      }

      if (msg.serverContent.turnComplete) {
        // When turnComplete arrives alongside interrupted, it's the
        // cancelled model turn ending - NOT a response to the user.
        // Don't clear the pending state or nudge timer in that case.
        if (!wasInterrupted) {
          console.log("✅ Model turn complete");
          this.pendingUserInput = false;

          if (this.responseCheckTimeoutId) {
            clearTimeout(this.responseCheckTimeoutId);
            this.responseCheckTimeoutId = null;
          }
        } else {
          console.log("✅ Interrupted model turn ended (waiting for new response)");
        }

        this.onTurnEnd();
      }

      // Handle user speech transcription from Gemini
      if (msg.serverContent.inputTranscript) {
        this.onUserTranscript(msg.serverContent.inputTranscript);
      }

      if (msg.serverContent.modelTurn) {
        // Model is responding - clear any pending nudge timer
        this.pendingUserInput = false;
        if (this.responseCheckTimeoutId) {
          clearTimeout(this.responseCheckTimeoutId);
          this.responseCheckTimeoutId = null;
        }

        const parts = msg.serverContent.modelTurn.parts || [];
        let hasAudioResponse = false;
        let hasTextResponse = false;

        for (const part of parts) {
          if (part.inlineData && part.inlineData.mimeType?.startsWith("audio/")) {
            hasAudioResponse = true;
            const audioData = this.base64ToFloat32Array(part.inlineData.data);
            this.enqueueAudio(audioData);
          }
          if (part.text) {
            hasTextResponse = true;
            this.onMessage(part.text);
          }
        }

        if (hasAudioResponse || hasTextResponse) {
          console.log(`📤 Model response: audio=${hasAudioResponse}, text=${hasTextResponse}`);
        }
      }
    }

    // Handle tool calls
    if (msg.toolCall) {
      this.handleToolCall(msg.toolCall);
    }
  }

  private async handleToolCall(toolCall: any) {
    const functionCalls = toolCall.functionCalls || [];
    console.log("🛠️ Tool Call Received:", functionCalls.map((f: any) => ({ name: f.name, id: f.id })));

    try {
      const responses = await Promise.race([
        this.onToolsCall(functionCalls),
        new Promise<any[]>((_, reject) =>
          setTimeout(() => reject(new Error("Tool execution timeout")), 30000)
        )
      ]);

      console.log("📤 Sending tool responses:", responses.map((r: any) => ({ name: r.name, id: r.id })));
      this.ws?.send(JSON.stringify({
        toolResponse: {
          functionResponses: responses.map((r: any) => ({
            id: r.id,
            name: r.name,
            response: r.response,
          })),
        }
      }));
    } catch (error) {
      console.error("❌ Tool execution failed:", error);
      this.ws?.send(JSON.stringify({
        toolResponse: {
          functionResponses: functionCalls.map((call: any) => ({
            id: call.id,
            name: call.name,
            response: { error: `Tool execution failed: ${error}` },
          })),
        }
      }));
    }
  }

  private handleClose(event: CloseEvent) {
    if (this.responseCheckTimeoutId) {
      clearTimeout(this.responseCheckTimeoutId);
      this.responseCheckTimeoutId = null;
    }

    let errorMessage = "";
    let shouldRetry = false;

    switch (event.code) {
      case 1000:
        break;
      case 1006:
        errorMessage = "Connection lost unexpectedly. Check your internet connection.";
        shouldRetry = true;
        break;
      case 1007:
        errorMessage = event.reason
          ? `Protocol error: ${event.reason}`
          : "Protocol error. Check API configuration.";
        break;
      case 1008:
        errorMessage = "API key rejected or policy violation. Try regenerating your API key.";
        break;
      case 1011:
        errorMessage = "Server error. The model may not be available.";
        shouldRetry = true;
        break;
      default:
        if (event.code >= 4000) {
          errorMessage = `Gemini API error: ${event.reason || 'Unknown error'} (code: ${event.code})`;
          shouldRetry = event.code < 4400;
        }
    }

    if (shouldRetry && this.retryAttempts < MAX_RETRY_ATTEMPTS) {
      this.retryAttempts++;
      const delay = INITIAL_RETRY_DELAY_MS * Math.pow(2, this.retryAttempts - 1);
      console.log(`🔄 Retrying connection in ${delay}ms... (attempt ${this.retryAttempts}/${MAX_RETRY_ATTEMPTS})`);

      this.retryTimeoutId = setTimeout(() => {
        this.connect(true);
      }, delay);
      return;
    }

    if (errorMessage) {
      console.error("❌", errorMessage);
      this.onError(new Error(errorMessage));
      this.onStatusChange('error');
    } else {
      this.onStatusChange('disconnected');
    }
    this.stopAudio();
  }

  private buildProblemSection(): string {
    if (!this.problemContext) return '';
    const p = this.problemContext;
    return `

## CURRENT INTERVIEW PROBLEM

**Title:** ${p.title}
**Difficulty:** ${p.difficulty}
${p.companyName ? `**Company Style:** ${p.companyName}` : ''}
${p.tags ? `**Tags:** ${p.tags.join(', ')}` : ''}

**Problem Description:**
${p.description}

**Examples (YOU MUST walk through at least one example with the candidate):**
${p.examples.map((ex, i) => `
Example ${i + 1}:
- Input: ${ex.input}
- Output: ${ex.output}${ex.explanation ? `
- Explanation: ${ex.explanation}` : ''}`).join('\n')}

**Constraints (MENTION these to the candidate):**
${p.constraints.map(c => `- ${c}`).join('\n')}

**Function to Implement:** \`${p.functionName}\`
${p.starterCode ? `
**Starter Code (already in the candidate's editor):**
\`\`\`
${p.starterCode}
\`\`\`` : ''}

---

**START NOW:** Greet the candidate warmly (e.g., "Hey! I'm Alexis, nice to meet you!"), then:
1. Explain the problem in your own words
2. Walk through at least ONE example step by step (e.g., "So for example, if the input is [2,7,11,15] and target is 9, we'd return [0,1] because 2+7=9")
3. Mention the key constraints (e.g., "There's always exactly one solution" or "The array can be up to 10^4 elements")
4. Ask "Does that make sense? Any questions before you start coding?"
`;
  }

  // --- Audio Input ---

  private async startAudioInput() {
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: { ideal: INPUT_SAMPLE_RATE },
          echoCancellation: { ideal: true },
          noiseSuppression: { ideal: true },
          autoGainControl: { ideal: true },
        },
      });

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) {
        throw new Error("AudioContext not supported in this browser");
      }

      this.audioContext = new AudioContextClass({
        sampleRate: INPUT_SAMPLE_RATE,
        latencyHint: 'interactive',
      });

      this.outputAudioContext = new AudioContextClass({
        sampleRate: OUTPUT_SAMPLE_RATE,
        latencyHint: 'interactive',
      });

      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      if (this.outputAudioContext.state === 'suspended') {
        await this.outputAudioContext.resume();
      }

      const source = this.audioContext.createMediaStreamSource(this.mediaStream);

      const highPass = this.audioContext.createBiquadFilter();
      highPass.type = 'highpass';
      highPass.frequency.value = 80;

      const lowPass = this.audioContext.createBiquadFilter();
      lowPass.type = 'lowpass';
      lowPass.frequency.value = 8000;

      source.connect(highPass);
      highPass.connect(lowPass);

      const processor = this.audioContext.createScriptProcessor(2048, 1, 1);

      processor.onaudioprocess = (e) => {
        if (!this.ws || !this._isConnected || !this.isSetupComplete) return;

        const inputData = e.inputBuffer.getChannelData(0);

        // Calculate input volume for visualization
        let sum = 0;
        for (let i = 0; i < inputData.length; i++) {
          sum += inputData[i] * inputData[i];
        }
        const inputVolume = Math.sqrt(sum / inputData.length);

        if (inputVolume > 0.01) {
          this.onVolume(inputVolume);
        }

        // Convert to Int16 PCM Base64 and send in SDK format
        const pcmData = this.float32ToInt16Base64(inputData);

        try {
          this.ws.send(JSON.stringify({
            realtimeInput: {
              mediaChunks: [{
                mimeType: `audio/pcm;rate=${INPUT_SAMPLE_RATE}`,
                data: pcmData,
              }]
            }
          }));
        } catch {
          // WebSocket may have closed between check and send
        }
      };

      lowPass.connect(processor);
      processor.connect(this.audioContext.destination);

      // Store references for cleanup
      this.processor = processor;
      this.sourceNode = source;
      this.highPassFilter = highPass;
      this.lowPassFilter = lowPass;

      console.log("🎤 Microphone active at", INPUT_SAMPLE_RATE, "Hz with noise filtering");

    } catch (err: any) {
      console.error("Audio Input Error:", err);

      let errorMessage = "Microphone access failed";
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMessage = "Microphone permission denied. Please allow microphone access and try again.";
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMessage = "No microphone found. Please connect a microphone and try again.";
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorMessage = "Microphone is in use by another application.";
      } else if (err.message) {
        errorMessage = `Microphone error: ${err.message}`;
      }

      this.onError(new Error(errorMessage));
      this.onStatusChange('error');
    }
  }

  private stopAudio() {
    try {
      if (this.processor) { this.processor.disconnect(); this.processor = null; }
      if (this.sourceNode) { this.sourceNode.disconnect(); this.sourceNode = null; }
      if (this.highPassFilter) { this.highPassFilter.disconnect(); this.highPassFilter = null; }
      if (this.lowPassFilter) { this.lowPassFilter.disconnect(); this.lowPassFilter = null; }
    } catch {
      // Nodes may already be disconnected
    }

    this.clearAudioQueue();

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    if (this.audioContext) {
      this.audioContext.close().catch(() => {});
      this.audioContext = null;
    }
    if (this.outputAudioContext) {
      this.outputAudioContext.close().catch(() => {});
      this.outputAudioContext = null;
    }
  }

  // --- Audio Output ---

  private async enqueueAudio(data: Float32Array) {
    if (this.audioQueue.length >= MAX_AUDIO_QUEUE_SIZE) {
      console.warn("⚠️ Audio queue full, dropping oldest chunk");
      this.audioQueue.shift();
    }

    this.audioQueue.push(data);
    this.onModelSpeaking(true);

    await this.ensureAudioContextActive();
    this.scheduleAudioPlayback();
  }

  private async ensureAudioContextActive() {
    if (this.outputAudioContext && this.outputAudioContext.state === 'suspended') {
      try {
        await this.outputAudioContext.resume();
        console.log("🔊 Output audio context resumed");
      } catch (e) {
        console.warn("Failed to resume output audio context:", e);
      }
    }
    if (this.audioContext && this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume();
        console.log("🎤 Input audio context resumed");
      } catch (e) {
        console.warn("Failed to resume input audio context:", e);
      }
    }
  }

  private scheduleAudioPlayback() {
    const ctx = this.outputAudioContext;
    if (!ctx) return;

    while (this.audioQueue.length > 0) {
      const chunk = this.audioQueue.shift()!;

      const buffer = ctx.createBuffer(1, chunk.length, OUTPUT_SAMPLE_RATE);
      buffer.copyToChannel(chunk as Float32Array<ArrayBuffer>, 0);

      let sum = 0;
      for (let i = 0; i < chunk.length; i++) {
        sum += chunk[i] * chunk[i];
      }
      const rms = Math.sqrt(sum / chunk.length);
      this.onVolume(rms * 2);

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);

      const currentTime = ctx.currentTime;
      if (this.nextPlayTime < currentTime) {
        this.nextPlayTime = currentTime + 0.02;
      }

      source.start(this.nextPlayTime);
      this.nextPlayTime += buffer.duration;

      this.scheduledSources.push(source);
      this.currentSource = source;
      this.isPlaying = true;

      source.onended = () => {
        const idx = this.scheduledSources.indexOf(source);
        if (idx > -1) {
          this.scheduledSources.splice(idx, 1);
        }

        if (this.scheduledSources.length === 0 && this.audioQueue.length === 0) {
          this.isPlaying = false;
          this.onModelSpeaking(false);
          this.onVolume(0);
          this.currentSource = null;
        }
      };
    }
  }

  // --- Data Conversion ---

  private float32ToInt16Base64(float32Array: Float32Array): string {
    const int16Array = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }

    let binary = '';
    const bytes = new Uint8Array(int16Array.buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private base64ToFloat32Array(base64: string): Float32Array<ArrayBuffer> {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    const buffer = new ArrayBuffer(bytes.length);
    new Uint8Array(buffer).set(bytes);

    const int16Array = new Int16Array(buffer);
    const float32Array = new Float32Array(int16Array.length);

    for (let i = 0; i < int16Array.length; i++) {
      float32Array[i] = int16Array[i] / 32768.0;
    }

    return float32Array;
  }
}
