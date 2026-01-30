import { useEffect, useRef, useState, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { TOOLS, SYSTEM_INSTRUCTION } from '../constants';
import { Problem, TestResult, ConnectionState } from '../types';
import { decode, decodeAudioData, createPcmBlob } from '../utils/audioUtils';

interface UseGeminiLiveProps {
  apiKey: string | undefined;
  problem: Problem;
  code: string;
  testRunner: (code: string) => Promise<TestResult[]>;
  onLog: (message: string, type: 'info' | 'error' | 'tool' | 'ai' | 'success' | 'warning') => void;
  integrityEvents: number;
}

export const useGeminiLive = ({
  apiKey,
  problem,
  code,
  testRunner,
  onLog,
  integrityEvents
}: UseGeminiLiveProps) => {
  const [status, setStatus] = useState<ConnectionState>(ConnectionState.DISCONNECTED);
  const [isMicOn, setIsMicOn] = useState(false);
  const [volume, setVolume] = useState(0); // For visualization
  
  // Refs to access latest state inside callbacks/event listeners without re-binding
  const codeRef = useRef(code);
  const problemRef = useRef(problem);
  const integrityRef = useRef(integrityEvents);
  
  // Audio Context Refs
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorNodeRef = useRef<ScriptProcessorNode | null>(null);
  const sessionRef = useRef<any>(null); // To store the active session

  // Update refs when props change
  useEffect(() => { codeRef.current = code; }, [code]);
  useEffect(() => { problemRef.current = problem; }, [problem]);
  useEffect(() => { integrityRef.current = integrityEvents; }, [integrityEvents]);

  const connect = async () => {
    if (!apiKey) {
      onLog('API Key missing', 'error');
      return;
    }

    try {
      setStatus(ConnectionState.CONNECTING);
      onLog('Initializing Gemini Live session...', 'info');

      // Initialize Audio Contexts
      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      nextStartTimeRef.current = 0;

      const ai = new GoogleGenAI({ apiKey });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: SYSTEM_INSTRUCTION,
          tools: [{ functionDeclarations: TOOLS }],
        },
        callbacks: {
          onopen: async () => {
            setStatus(ConnectionState.CONNECTED);
            onLog('Connected to Shifu', 'success');
            
            // Start Microphone Stream
            try {
              const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
              const ctx = inputAudioContextRef.current;
              if (!ctx) return;

              const source = ctx.createMediaStreamSource(stream);
              const processor = ctx.createScriptProcessor(4096, 1, 1);
              
              processor.onaudioprocess = (e) => {
                // Calculate volume for visualizer
                const inputData = e.inputBuffer.getChannelData(0);
                let sum = 0;
                for (let i = 0; i < inputData.length; i++) {
                   sum += inputData[i] * inputData[i];
                }
                setVolume(Math.sqrt(sum / inputData.length));

                if (!sessionRef.current) return; // Wait for session
                
                // Send audio to Gemini
                const pcmBlob = createPcmBlob(inputData);
                sessionRef.current.sendRealtimeInput({ media: pcmBlob });
              };

              source.connect(processor);
              processor.connect(ctx.destination);
              
              sourceNodeRef.current = source;
              processorNodeRef.current = processor;
              setIsMicOn(true);

            } catch (err) {
              console.error("Microphone error:", err);
              onLog('Failed to access microphone', 'error');
              setStatus(ConnectionState.ERROR);
            }
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle Tool Calls
            if (message.toolCall) {
              for (const fc of message.toolCall.functionCalls) {
                onLog(`Tool called: ${fc.name}`, 'tool');
                let result: any = {};

                try {
                  switch (fc.name) {
                    case 'get_current_problem':
                      result = {
                        title: problemRef.current.title,
                        description: problemRef.current.description
                      };
                      break;
                    case 'read_candidate_code':
                      result = { code: codeRef.current };
                      break;
                    case 'run_code':
                      const results = await testRunner(codeRef.current);
                      result = { testResults: results };
                      break;
                    case 'get_integrity_status':
                      result = { 
                        pasteEvents: integrityRef.current,
                        status: integrityRef.current > 2 ? 'SUSPICIOUS' : 'CLEAN'
                      };
                      break;
                    case 'install_dependency':
                      result = { success: true, message: `Installed ${fc.args['packageName']}` };
                      break;
                    default:
                      result = { error: 'Unknown tool' };
                  }
                } catch (e: any) {
                    result = { error: e.message };
                }

                // Send tool response
                if (sessionRef.current) {
                  sessionRef.current.sendToolResponse({
                    functionResponses: {
                      id: fc.id,
                      name: fc.name,
                      response: { result },
                    }
                  });
                }
              }
            }

            // Handle Audio Output from Gemini
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio && outputAudioContextRef.current) {
              const ctx = outputAudioContextRef.current;
              // Ensure nextStartTime is at least current time to avoid overlapping/stutter
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              
              try {
                const audioBuffer = await decodeAudioData(
                  decode(base64Audio),
                  ctx,
                  24000,
                  1
                );
                
                const source = ctx.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(ctx.destination);
                source.start(nextStartTimeRef.current);
                
                nextStartTimeRef.current += audioBuffer.duration;
              } catch (e) {
                console.error("Audio decoding error", e);
              }
            }
          },
          onclose: () => {
             setStatus(ConnectionState.DISCONNECTED);
             onLog('Session closed', 'info');
          },
          onerror: (e) => {
            console.error(e);
            setStatus(ConnectionState.ERROR);
            onLog('Session error occurred', 'error');
          }
        }
      });

      // Save the session object when the promise resolves
      sessionRef.current = await sessionPromise;
      
    } catch (error: any) {
      console.error(error);
      setStatus(ConnectionState.ERROR);
      onLog(`Connection failed: ${error.message}`, 'error');
    }
  };

  const disconnect = useCallback(() => {
    // Stop Audio
    if (sourceNodeRef.current) sourceNodeRef.current.disconnect();
    if (processorNodeRef.current) processorNodeRef.current.disconnect();
    if (inputAudioContextRef.current) inputAudioContextRef.current.close();
    if (outputAudioContextRef.current) outputAudioContextRef.current.close();

    // The SDK doesn't have an explicit 'disconnect' method on the session object 
    // effectively, we just stop sending audio and release resources.
    // However, we can try to close if the object supports it or just set state.
    // Assuming standard WebSocket closure is handled by the SDK internally on window unload or garbage collection
    // but we reset our refs.
    
    sessionRef.current = null;
    setIsMicOn(false);
    setStatus(ConnectionState.DISCONNECTED);
    onLog('Disconnected', 'info');
  }, [onLog]);

  return { connect, disconnect, status, isMicOn, volume };
};