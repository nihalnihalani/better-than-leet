'use client';

import { useSystemDesignStore } from '@/lib/system-design-store';
import { Button } from "@/components/ui/button";
import { StatusIndicator } from './StatusIndicator';
import { Visualizer } from './Visualizer';
import { ThinkingIndicator } from './ThinkingIndicator';
import { Mic, MicOff, Layers } from 'lucide-react';
import { useCallback, useEffect, useState, useRef } from 'react';
import { getSystemDesignTools } from '@/lib/system-design-agent-tools';
import { GeminiLiveClient, ConnectionStatus } from '@/lib/gemini-live-client';
import { authFetch, initSession } from '@/lib/api-client';
import { extractMermaidBlocks, validateMermaidSyntax } from '@/lib/mermaid-parser';

const DEMO_DIAGRAM = `graph LR
    Client[Web Client] -->|HTTPS| LB{Load Balancer}
    LB --> API1[API Server 1]
    LB --> API2[API Server 2]
    API1 --> Cache{{Redis Cache}}
    API2 --> Cache
    API1 --> DB[(PostgreSQL Primary)]
    API2 --> DB
    API1 -->|Async Jobs| Queue>Message Queue]
    Queue --> Worker[Background Worker]
    Worker --> S3[S3 Storage]`;

export function SystemDesignAgent() {
    const { selectedTopicId, setAgentDisconnect, setMermaidDiagram } = useSystemDesignStore();
    const [isThinking, setIsThinking] = useState(false);
    const [currentAction, setCurrentAction] = useState<string>('');

    // Gemini Live Client State
    const [status, setStatus] = useState<ConnectionStatus>('disconnected');
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [volume, setVolume] = useState(0);
    const [isModelSpeaking, setIsModelSpeaking] = useState(false);
    const [wasInterrupted, setWasInterrupted] = useState(false);
    const [clientReady, setClientReady] = useState(false);
    const [isMicMuted, setIsMicMuted] = useState(false);
    const clientRef = useRef<GeminiLiveClient | null>(null);
    const hasConnectedOnceRef = useRef(false);
    const selectedTopicIdRef = useRef(selectedTopicId);
    selectedTopicIdRef.current = selectedTopicId;

    // Tool handler
    const handleToolsCall = useCallback(async (functionCalls: any[]) => {
        if (functionCalls.some((c: any) => c.name === 'end_interview') && clientRef.current) {
            clientRef.current.markInterviewEnding();
        }

        const toolFunctions = getSystemDesignTools();
        setIsThinking(true);
        setCurrentAction(`Running ${functionCalls.length} tool(s)...`);

        const responses = await Promise.all(
            functionCalls.map(async (call) => {
                const name = call.name;
                const args = call.args || {};
                const id = call.id;
                const fn = (toolFunctions as any)[name];

                if (fn) {
                    try {
                        const result = await fn(args);
                        return { id, name, response: { result } };
                    } catch (err) {
                        return { id, name, response: { error: String(err) } };
                    }
                } else {
                    return { id, name, response: { error: `Tool ${name} not found` } };
                }
            })
        );

        setIsThinking(false);
        return responses;
    }, []);

    // Initialize Client
    useEffect(() => {
        let cancelled = false;

        async function initClient() {
            // Ensure session token is available before fetching API key
            await initSession();

            let apiKey: string | undefined;
            try {
                const res = await authFetch('/api/gemini/session');
                const data = await res.json();
                if (data.data?.apiKey) {
                    apiKey = data.data.apiKey;
                }
            } catch {
                // Server fetch failed
            }

            if (!apiKey || cancelled) {
                if (!apiKey) {
                    console.error("Gemini API Key missing. Set GEMINI_API_KEY in .env.local");
                }
                return;
            }

            const client = new GeminiLiveClient(apiKey.trim(), 'system-design');

            const topicId = selectedTopicIdRef.current;
            if (topicId) {
                client.setSystemDesignTopic(topicId);
            }

            client.onStatusChange = (s) => setStatus(s);
            client.onToolsCall = handleToolsCall;
            client.onVolume = (vol) => {
                setVolume(vol);
                setIsSpeaking(vol > 0.01);
            };
            client.onError = (err) => {
                console.error("System Design Client Error:", err);
                setIsThinking(false);
                setCurrentAction('');
            };
            client.onMessage = (msg) => {
                const store = useSystemDesignStore.getState();
                store.addTranscriptMessage('agent', msg, 'audio');

                // Extract and validate Mermaid diagram blocks
                const mermaidBlocks = extractMermaidBlocks(msg);

                if (mermaidBlocks.length > 0) {
                    const latestDiagram = mermaidBlocks[mermaidBlocks.length - 1];
                    const validation = validateMermaidSyntax(latestDiagram);

                    if (validation.valid) {
                        store.setMermaidDiagram(latestDiagram);
                        store.addTranscriptMessage('agent', '[System: Diagram successfully updated]', 'text');
                    } else {
                        store.addTranscriptMessage('agent', `[System: Diagram update failed - ${validation.error}]`, 'text');
                    }
                }
            };
            client.onUserTranscript = (text) => {
                useSystemDesignStore.getState().addTranscriptMessage('user', text, 'audio');
            };
            client.onInterrupted = () => {
                setWasInterrupted(true);
                setIsModelSpeaking(false);
                setIsThinking(false);
                setCurrentAction('');
                setTimeout(() => setWasInterrupted(false), 3000);
            };
            client.onTurnEnd = () => {
                setIsModelSpeaking(false);
                setIsThinking(false);
            };
            client.onModelSpeaking = (speaking) => {
                setIsModelSpeaking(speaking);
                if (speaking) setCurrentAction('Alexis speaking...');
            };
            client.onNoResponse = () => {};

            client.onSetupComplete = () => {
                setTimeout(() => {
                    if (client.isConnected()) {
                        client.sendText(`[SYSTEM] RESPOND NOW. Your response is what the candidate hears directly.

DO NOT say: "I'm crafting a response" or "My response is ready"
DO NOT narrate your process
DO SAY THIS EXACTLY:

"Hey! Welcome to Alexis. Let's design this system together. Here's the starting architecture:

\`\`\`mermaid
graph LR
    Client[Web Client] --> API[API Server]
    API --> DB[(Database)]
\`\`\`

This shows a client connecting to an API server which talks to a database. What features should we add?"

OUTPUT THIS NOW. Not a description of it - the actual greeting and diagram.`);
                    }
                }, 1500);
            };

            clientRef.current = client;
            setClientReady(true);

            setAgentDisconnect(() => {
                if (clientRef.current) {
                    clientRef.current.disconnect();
                }
            });
        }

        initClient();

        return () => {
            cancelled = true;
            setClientReady(false);
            if (clientRef.current) {
                clientRef.current.disconnect();
                clientRef.current = null;
            }
            setAgentDisconnect(null);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleStart = useCallback(async () => {
        if (!clientRef.current) return;

        try {
            await clientRef.current.connect();
            hasConnectedOnceRef.current = true;
        } catch (err) {
            console.error("Error connecting:", err);
        }
    }, []);

    const handleStop = useCallback(() => {
        if (clientRef.current) {
            clientRef.current.disconnect();
        }
    }, []);

    const handleToggleMute = useCallback(() => {
        if (clientRef.current) {
            const newMutedState = clientRef.current.toggleMicMute();
            setIsMicMuted(newMutedState);
        }
    }, []);

    // Auto-start ONCE when client is ready
    useEffect(() => {
        if (status === 'disconnected' && clientReady && clientRef.current && !hasConnectedOnceRef.current) {
            handleStart();
        }
    }, [status, clientReady, handleStart]);

    return (
        <div id="agent-container" className="flex flex-col gap-4">
            {/* Thinking Indicator */}
            {(isThinking || isModelSpeaking) && (
                <ThinkingIndicator isThinking={isThinking || isModelSpeaking} currentAction={currentAction} />
            )}

            {/* Microphone muted indicator */}
            {isMicMuted && status === 'connected' && (
                <div className="text-xs text-red-400 bg-red-900/20 p-2 rounded border border-red-500/30 flex items-center gap-2">
                    <MicOff className="w-3 h-3" />
                    Microphone muted
                </div>
            )}

            {/* Interruption feedback */}
            {wasInterrupted && !isMicMuted && (
                <div className="text-xs text-yellow-400 bg-yellow-900/20 p-2 rounded border border-yellow-500/30 flex items-center gap-2 animate-pulse">
                    <MicOff className="w-3 h-3" />
                    Listening to you...
                </div>
            )}

            <div className="flex items-center gap-4 p-4 border rounded-xl bg-card">
                <div className="flex flex-col items-center gap-2">
                    <StatusIndicator status={status} isModelSpeaking={isModelSpeaking} />
                    {status === 'connected' && !isModelSpeaking && isSpeaking && (
                        <div className="flex items-center gap-1 text-[10px] text-emerald-400">
                            <Mic className="w-2.5 h-2.5 animate-pulse" />
                            <span>Mic active</span>
                        </div>
                    )}
                </div>

                <div className="flex-1 w-full min-w-0">
                    <Visualizer isSpeaking={isSpeaking || isModelSpeaking} volume={volume} />
                </div>

                {status === 'connected' ? (
                    <div className="flex gap-2">
                        <Button
                            variant={isMicMuted ? "default" : "outline"}
                            size="icon"
                            onClick={handleToggleMute}
                            title={isMicMuted ? "Unmute microphone" : "Mute microphone"}
                        >
                            {isMicMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                        </Button>
                        <Button variant="destructive" size="icon" onClick={handleStop} title="Disconnect">
                            <MicOff className="w-4 h-4" />
                        </Button>
                    </div>
                ) : status === 'connecting' ? (
                    <Button variant="outline" disabled>
                        <Mic className="w-4 h-4 mr-2 animate-pulse" />
                        Connecting...
                    </Button>
                ) : (
                    <Button variant="default" onClick={handleStart}>
                        <Layers className="w-4 h-4 mr-2" />
                        Reconnect
                    </Button>
                )}
            </div>
        </div>
    );
}
