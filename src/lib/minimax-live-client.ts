/**
 * MiniMax Live Client
 * Replaces GeminiLiveClient using MiniMax REST API (LLM + TTS) and Browser STT.
 * Features: interruption handling, audio queue with gapless playback, optional continuous listening.
 */

const MAX_AUDIO_QUEUE_SIZE = 100;

export type InterviewMode = 'real' | 'practice';
export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface ProblemContext {
  title: string;
  difficulty: string;
  description: string;
  constraints: string[];
  functionName: string;
  examples: any[]; // Added to match interface
  starterCode?: string;
  companyName?: string;
  tags?: string[];
}

export class MiniMaxLiveClient {
  private recognition: any = null; // SpeechRecognition
  private audioContext: AudioContext | null = null;
  private isListening = false;
  private interviewMode: InterviewMode = 'real';
  private problemContext: ProblemContext | null = null;
  private history: { role: 'user' | 'model'; content: string }[] = [];
  private lastCodeContext = "";

  // Interruption + audio queue
  private audioQueue: string[] = []; // base64 chunks
  private currentSource: AudioBufferSourceNode | null = null;
  private scheduledSources: AudioBufferSourceNode[] = [];
  private abortController: AbortController | null = null;
  private inFlightRequest = false;
  private playbackLoopRunning = false;
  private endOfUtteranceTimeout: ReturnType<typeof setTimeout> | null = null;
  private pendingFinalTranscript = "";
  private readonly END_OF_UTTERANCE_MS = 650;

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

  constructor(private apiKey: string, mode: InterviewMode = 'real') {
    this.interviewMode = mode;
  }

  setInterviewMode(mode: InterviewMode) {
    this.interviewMode = mode;
  }

  getInterviewMode() {
    return this.interviewMode;
  }

  setProblemContext(problem: ProblemContext) {
    this.problemContext = problem;
  }

  isConnected() {
      return this.isListening || (this.recognition !== null);
  }

  async connect() {
    this.onStatusChange('connecting');
    try {
      // Initialize AudioContext for playback
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioContextClass();

      // Initialize Speech Recognition
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        throw new Error("Speech Recognition not supported in this browser (try Chrome)");
      }

      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

      this.recognition.onstart = () => {
        console.log("🎤 Listening...");
      };

      // Interruption: user started speaking while model was talking
      this.recognition.onspeechstart = () => {
        if (this.isModelSpeaking()) {
          this.handleInterruption();
        }
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          this.scheduleOrSendUserMessage(finalTranscript);
        }
      };

      this.recognition.onerror = (event: any) => {
        const err = event.error || 'unknown';
        if (err === 'not-allowed') {
          this.onError(new Error("Microphone permission denied"));
          return;
        }
        if (err === 'network') {
          this.onError(new Error("Voice input needs internet and works best in Chrome. Check your connection, then click Reconnect."));
          return;
        }
        if (err === 'no-speech') {
          // User didn't say anything - don't treat as fatal
          return;
        }
        this.onError(new Error(`Speech recognition error: ${err}`));
      };
      
      this.recognition.onend = () => {
          if (this.isListening) {
              try {
                  this.recognition.start();
              } catch {
                  // ignore
              }
          }
      };

      this.startListening();
      this.onStatusChange('connected');
      
      // Initial Greeting
      setTimeout(() => {
          this.handleUserMessage("Hello, I'm ready for the interview.", true);
      }, 1000);

    } catch (error) {
      console.error("Connection failed:", error);
      this.onStatusChange('error');
      this.onError(error instanceof Error ? error : new Error("Failed to connect"));
    }
  }

  startListening() {
    if (this.recognition && !this.isListening) {
      try {
        this.recognition.start();
        this.isListening = true;
      } catch {
        // Already started
      }
    }
  }

  stopListening() {
    if (this.recognition) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  private isModelSpeaking(): boolean {
    return this.inFlightRequest || this.audioQueue.length > 0 || this.currentSource !== null || this.scheduledSources.length > 0;
  }

  private handleInterruption() {
    this.clearAudioQueue();
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    this.inFlightRequest = false;
    this.onModelSpeaking(false);
    this.onVolume(0);
    this.onInterrupted();
  }

  /** End-of-utterance: after a short silence, send accumulated final transcript. */
  private scheduleOrSendUserMessage(finalTranscript: string) {
    this.pendingFinalTranscript = (this.pendingFinalTranscript ? this.pendingFinalTranscript + " " : "") + finalTranscript.trim();
    if (this.endOfUtteranceTimeout) clearTimeout(this.endOfUtteranceTimeout);
    this.endOfUtteranceTimeout = setTimeout(() => {
      this.endOfUtteranceTimeout = null;
      const toSend = this.pendingFinalTranscript.trim();
      this.pendingFinalTranscript = "";
      if (toSend) this.handleUserMessage(toSend);
    }, this.END_OF_UTTERANCE_MS);
  }

  /** Stop all playback and clear queue (used on interrupt and disconnect). */
  clearAudioQueue() {
    for (const source of this.scheduledSources) {
      try {
        source.stop(0);
        source.disconnect();
      } catch {
        // already stopped
      }
    }
    this.scheduledSources = [];
    if (this.currentSource) {
      try {
        this.currentSource.stop(0);
        this.currentSource.disconnect();
      } catch {
        // already stopped
      }
      this.currentSource = null;
    }
    this.audioQueue = [];
    this.playbackLoopRunning = false;
    this.onModelSpeaking(false);
    this.onVolume(0);
  }

  private enqueueAudio(base64Chunk: string) {
    if (this.audioQueue.length >= MAX_AUDIO_QUEUE_SIZE) {
      this.audioQueue.shift();
    }
    this.audioQueue.push(base64Chunk);
    this.onModelSpeaking(true);
    this.schedulePlaybackLoop();
  }

  private async schedulePlaybackLoop() {
    if (!this.audioContext || this.playbackLoopRunning || this.audioQueue.length === 0) return;
    this.playbackLoopRunning = true;

    const base64 = this.audioQueue.shift()!;
    let buffer: AudioBuffer;
    try {
      const binaryString = window.atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
      buffer = await this.audioContext.decodeAudioData(bytes.buffer.slice(0));
    } catch {
      this.playbackLoopRunning = false;
      if (this.audioQueue.length > 0) this.schedulePlaybackLoop();
      else {
        this.onModelSpeaking(false);
        this.onVolume(0);
        this.onTurnEnd();
        this.startListening();
      }
      return;
    }

    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(this.audioContext.destination);
    this.scheduledSources.push(source);
    this.currentSource = source;

    const playNext = () => {
      const idx = this.scheduledSources.indexOf(source);
      if (idx !== -1) this.scheduledSources.splice(idx, 1);
      if (source === this.currentSource) this.currentSource = null;
      this.onVolume(0);
      if (this.audioQueue.length > 0) {
        this.schedulePlaybackLoop();
      } else if (this.scheduledSources.length === 0) {
        this.playbackLoopRunning = false;
        this.onModelSpeaking(false);
        this.onTurnEnd();
        this.startListening();
      }
    };

    source.onended = playNext;

    const ch0 = source.buffer!.getChannelData(0) as Float32Array;
    const sum = ch0.reduce((a, s) => a + s * s, 0);
    this.onVolume(Math.sqrt(sum / ch0.length) * 2);
    source.start(0);
  }

  getProblemDescription(): string {
    if (!this.problemContext) return "";
    const p = this.problemContext;
    const lines: string[] = [
      p.title,
      p.difficulty ? p.difficulty : "",
      "",
      p.description || "",
      "",
    ];
    if (p.examples?.length) {
      lines.push("Examples");
      p.examples.forEach((e: any) => {
        if (typeof e === "string") {
          lines.push(e);
        } else if (e && typeof e === "object") {
          lines.push(`Input: ${e.input ?? ""}`);
          lines.push(`Output: ${e.output ?? ""}`);
          if (e.explanation) lines.push(`Explanation: ${e.explanation}`);
        }
      });
      lines.push("");
    }
    if (p.constraints?.length) {
      lines.push("Constraints");
      p.constraints.forEach((c: string) => lines.push(c));
    }
    return lines.join("\n").trim();
  }

  async handleUserMessage(text: string, silent = false) {
    this.stopListening();
    this.onModelSpeaking(true);

    const controller = new AbortController();
    this.abortController = controller;
    this.inFlightRequest = true;

    try {
      const response = await fetch('/api/interview/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          history: this.history,
          context: this.lastCodeContext,
          problemDescription: this.getProblemDescription(),
          stream: true,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorBody = await response.text().catch(() => "No response body");
        let errMessage: string;
        try {
          const parsed = JSON.parse(errorBody) as { error?: string };
          errMessage = parsed.error || errorBody;
        } catch {
          errMessage = response.status === 401 ? "Invalid MiniMax API key. Check .env.local." : `Chat API failed (${response.status}).`;
        }
        throw new Error(errMessage);
      }

      this.abortController = null;
      this.inFlightRequest = false;

      const contentType = response.headers.get("content-type") ?? "";
      if (contentType.includes("text/event-stream")) {
        await this.handleStreamResponse(response, silent, text);
        return;
      }

      const data = await response.json() as { text?: string; audio?: string };
      if (!silent) this.history.push({ role: 'user', content: text });
      this.history.push({ role: 'model', content: data.text ?? '' });
      this.onMessage(data.text ?? '');

      if (data.audio) {
        this.enqueueAudio(data.audio);
      } else {
        this.onTurnEnd();
        this.startListening();
      }
    } catch (error) {
      this.inFlightRequest = false;
      this.abortController = null;
      if (error instanceof Error && error.name === 'AbortError') return;
      this.onError(error instanceof Error ? error : new Error("Chat failed"));
      this.onModelSpeaking(false);
      this.startListening();
    }
  }

  private async handleStreamResponse(response: Response, silent: boolean, userText: string) {
    if (!response.body) return;
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let hadAudio = false;

    if (!silent) this.history.push({ role: 'user', content: userText });

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const blocks = buffer.split("\n\n");
        buffer = blocks.pop() ?? "";
        for (const block of blocks) {
          let event = "";
          let dataLine = "";
          for (const line of block.split("\n")) {
            if (line.startsWith("event:")) event = line.slice(6).trim();
            if (line.startsWith("data:")) dataLine = line.slice(5).trim();
          }
          if (event === "text" && dataLine) {
            try {
              const data = JSON.parse(dataLine) as { text?: string };
              this.history.push({ role: 'model', content: data.text ?? '' });
              this.onMessage(data.text ?? '');
            } catch {
              // ignore
            }
          }
          if (event === "audio" && dataLine) {
            hadAudio = true;
            this.enqueueAudio(dataLine);
          }
          if (event === "error" && dataLine) {
            try {
              const data = JSON.parse(dataLine) as { error?: string };
              this.onError(new Error(data.error ?? "Stream error"));
            } catch {
              this.onError(new Error("Stream error"));
            }
          }
        }
      }
      if (!hadAudio) {
        this.onTurnEnd();
        this.startListening();
      }
    } catch (e) {
      this.onError(e instanceof Error ? e : new Error("Stream read failed"));
      this.onModelSpeaking(false);
      this.startListening();
    }
  }

  disconnect() {
    if (this.endOfUtteranceTimeout) {
      clearTimeout(this.endOfUtteranceTimeout);
      this.endOfUtteranceTimeout = null;
    }
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    this.stopListening();
    this.recognition = null;
    this.clearAudioQueue();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.onStatusChange('disconnected');
  }

  sendText(text: string) {
    this.handleUserMessage(text);
  }

  sendCodeContext(code: string, _silent = true) {
    this.lastCodeContext = code;
  }

  promptToSpeak() {
      // Not implemented
  }

}

// Export as GeminiLiveClient alias for compatibility
export { MiniMaxLiveClient as GeminiLiveClient };
