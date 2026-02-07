'use client';

import { useSystemDesignStore } from '@/lib/system-design-store';
import { Button } from "@/components/ui/button";
import { StatusIndicator } from './StatusIndicator';
import { Visualizer } from './Visualizer';
import { ThinkingIndicator } from './ThinkingIndicator';
import { Mic, MicOff, Layers, TestTube } from 'lucide-react';
import { useCallback, useEffect, useState, useRef } from 'react';
import { getSystemDesignTools } from '@/lib/system-design-agent-tools';
import { GeminiLiveClient, ConnectionStatus } from '@/lib/gemini-live-client';
import { authFetch } from '@/lib/api-client';
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

    // Tool handler - always gets fresh state to avoid closure issues
    const handleToolsCall = useCallback(async (functionCalls: any[]) => {
        console.log("🛠️ Handling Tool Calls:", functionCalls.map((c: any) => c.name));

        // If end_interview is being called, mark the client as ending
        if (functionCalls.some((c: any) => c.name === 'end_interview') && clientRef.current) {
            clientRef.current.markInterviewEnding();
        }

        // Get fresh tools
        const toolFunctions = getSystemDesignTools();

        setIsThinking(true);
        setCurrentAction(`Running ${functionCalls.length} tool(s)...`);

        // Execute all tools in parallel for better performance
        const responses = await Promise.all(
            functionCalls.map(async (call) => {
                const name = call.name;
                const args = call.args || {};
                const id = call.id;
                const fn = (toolFunctions as any)[name];

                console.log(`🔧 Executing tool: ${name}`, { id, args });

                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/09eab501-0e28-4c32-9b57-199a2e4fe649',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'SystemDesignAgent.tsx:tool-dispatch',message:'Tool dispatch',data:{name,hasHandler:!!fn,argKeys:Object.keys(args||{}),args:JSON.stringify(args).substring(0,500)},timestamp:Date.now(),hypothesisId:'A'})}).catch(()=>{});
                // #endregion
                if (fn) {
                    try {
                        const result = await fn(args);
                        // #region agent log
                        fetch('http://127.0.0.1:7242/ingest/09eab501-0e28-4c32-9b57-199a2e4fe649',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'SystemDesignAgent.tsx:tool-result',message:'Tool result',data:{name,resultPreview:typeof result==='string'?result.substring(0,500):JSON.stringify(result).substring(0,500)},timestamp:Date.now(),hypothesisId:'A'})}).catch(()=>{});
                        // #endregion
                        console.log(`✅ Tool ${name} result:`, typeof result === 'string' ? result.substring(0, 200) : result);
                        return {
                            id: id,
                            name: name,
                            response: { result: result }
                        };
                    } catch (err) {
                        // #region agent log
                        fetch('http://127.0.0.1:7242/ingest/09eab501-0e28-4c32-9b57-199a2e4fe649',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'SystemDesignAgent.tsx:tool-error',message:'Tool threw error',data:{name,error:String(err)},timestamp:Date.now(),hypothesisId:'A'})}).catch(()=>{});
                        // #endregion
                        console.error(`❌ Tool ${name} error:`, err);
                        return {
                            id: id,
                            name: name,
                            response: { error: String(err) }
                        };
                    }
                } else {
                    // #region agent log
                    fetch('http://127.0.0.1:7242/ingest/09eab501-0e28-4c32-9b57-199a2e4fe649',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'SystemDesignAgent.tsx:tool-not-found',message:'Tool NOT FOUND',data:{name,availableTools:Object.keys(toolFunctions)},timestamp:Date.now(),hypothesisId:'A'})}).catch(()=>{});
                    // #endregion
                    console.warn(`⚠️ Tool ${name} not found in toolFunctions`);
                    return {
                        id: id,
                        name: name,
                        response: { error: `Tool ${name} not found` }
                    };
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
            // Get API key from server
            let apiKey: string | undefined;
            try {
                const res = await authFetch('/api/gemini/session');
                const data = await res.json();
                if (data.data?.apiKey) {
                    apiKey = data.data.apiKey;
                }
            } catch {
                // Fall back to env var
            }

            if (!apiKey) {
                apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
            }

            console.log("🔑 Gemini API Key available:", !!apiKey, apiKey ? `(${apiKey.substring(0, 10)}...)` : '');

            if (!apiKey || cancelled) {
                if (!apiKey) {
                    console.error("❌ Gemini API Key missing! Set GEMINI_API_KEY in .env.local");
                }
                return;
            }

            // Create client for system design
            console.log(`📐 Creating Gemini Live client in system-design mode`);
            const client = new GeminiLiveClient(apiKey.trim(), 'system-design');

            // Set system design topic
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
                // Handle text transcript updates from model
                const store = useSystemDesignStore.getState();
                store.addTranscriptMessage('agent', msg, 'audio');

                console.log('📝 Agent message received (full):', msg);
                console.log('📝 Message length:', msg.length, 'characters');
                console.log('📝 Contains backticks?', msg.includes('```'));
                console.log('📝 Contains "mermaid"?', msg.toLowerCase().includes('mermaid'));

                // Extract and validate Mermaid diagram blocks
                const mermaidBlocks = extractMermaidBlocks(msg);
                console.log(`🔍 Extracted ${mermaidBlocks.length} Mermaid block(s) from agent message`);

                if (mermaidBlocks.length > 0) {
                    // Use the last block if multiple are present
                    const latestDiagram = mermaidBlocks[mermaidBlocks.length - 1];
                    console.log('📊 Mermaid diagram extracted:', latestDiagram.substring(0, 100) + '...');
                    const validation = validateMermaidSyntax(latestDiagram);

                    if (validation.valid) {
                        console.log('✅ Valid Mermaid diagram extracted, updating store');
                        store.setMermaidDiagram(latestDiagram);
                        // Add success feedback to transcript
                        store.addTranscriptMessage('agent', '[System: Diagram successfully updated]', 'text');
                    } else {
                        console.error('❌ Invalid Mermaid syntax:', validation.error);
                        console.error('❌ Invalid diagram content:', latestDiagram);
                        // Add error feedback to transcript so agent can see it
                        store.addTranscriptMessage('agent', `[System: Diagram update failed - ${validation.error}]`, 'text');
                    }
                } else {
                    console.warn('⚠️ No Mermaid blocks found in agent message');
                }
            };
            client.onUserTranscript = (text) => {
                // Handle user speech transcription from Gemini
                useSystemDesignStore.getState().addTranscriptMessage('user', text, 'audio');
            };
            client.onInterrupted = () => {
                console.log("🛑 User interrupted - stopping AI speech");
                setWasInterrupted(true);
                setIsModelSpeaking(false);
                setIsThinking(false);
                setCurrentAction('');
                setTimeout(() => setWasInterrupted(false), 3000);
            };
            client.onTurnEnd = () => {
                console.log("✅ Model turn complete");
                setIsModelSpeaking(false);
                setIsThinking(false);
            };
            client.onModelSpeaking = (speaking) => {
                setIsModelSpeaking(speaking);
                if (speaking) {
                    setCurrentAction('Alexis speaking...');
                }
            };

            client.onNoResponse = () => {
                console.warn("⚠️ Model didn't respond to user input");
            };

            // After setup, send a text nudge to get the model to start using tools
            client.onSetupComplete = () => {
                console.log("📐 System design session ready - sending tool nudge");
                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/09eab501-0e28-4c32-9b57-199a2e4fe649',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'SystemDesignAgent.tsx:onSetupComplete',message:'Setup complete, sending nudge',data:{topicId:selectedTopicId},timestamp:Date.now(),hypothesisId:'NUDGE'})}).catch(()=>{});
                // #endregion
                // Give a brief delay for audio pipeline to initialize, then nudge
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
            console.log(`📐 System Design Live client initialized`);

            // Register disconnect callback
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

    // Build context recovery message for reconnection
    const buildContextRecovery = useCallback(() => {
        const state = useSystemDesignStore.getState();
        const { transcript, mermaidDiagram } = state;

        // Build transcript summary (last 10 messages)
        const recentTranscript = transcript.slice(-10);
        const transcriptSummary = recentTranscript.map(msg =>
            `${msg.speaker === 'agent' ? 'You' : 'Candidate'}: ${msg.message.substring(0, 150)}${msg.message.length > 150 ? '...' : ''}`
        ).join('\n');

        // Build diagram state summary
        let diagramSummary = '';
        if (mermaidDiagram) {
            const lines = mermaidDiagram.split('\n').length;
            diagramSummary = `\n\n**Current Diagram State:**\n- Mermaid diagram present (${lines} lines)\n- Preview: ${mermaidDiagram.substring(0, 100)}...`;
        }

        const contextMessage = `[CONTEXT RECOVERY - You were disconnected]

**What happened:** The connection was lost. This message contains a summary of the conversation so far.

**Recent conversation:**
${transcriptSummary || '(No conversation yet)'}
${diagramSummary}

**IMPORTANT INSTRUCTIONS:**
- DO NOT re-introduce yourself or restart the interview
- DO NOT say "it looks like we got disconnected" or similar - just continue naturally
- Review the above context and continue the conversation from where it left off
- If you were in the middle of explaining something, you may briefly summarize your last point then continue
- If the candidate was speaking, acknowledge what they said and respond appropriately
- Continue outputting Mermaid diagrams in code blocks to update the architecture
- If confused about conversation history, call read_transcript() to review more messages

Continue the interview naturally from this point.`;

        return contextMessage;
    }, []);

    const handleStart = useCallback(async () => {
        console.log("🚀 handleStart called, clientRef.current:", !!clientRef.current);

        if (!clientRef.current) {
            console.error("❌ System Design client not initialized!");
            return;
        }

        try {
            console.log(`📐 Starting system design interview for topic: ${selectedTopicId}`);

            // If this is a reconnection, we could inject context recovery
            // (Note: setReconnectionContext not available in base GeminiLiveClient)
            if (hasConnectedOnceRef.current) {
                console.log("🔄 This is a reconnection - context would be injected here");
            } else {
                console.log("🆕 This is the first connection");
            }

            console.log("🔌 Calling connect()...");
            await clientRef.current.connect();
            hasConnectedOnceRef.current = true;
            console.log("✅ Connect called successfully");
        } catch (err) {
            console.error("❌ Error in handleStart:", err);
        }
    }, [selectedTopicId, buildContextRecovery]);

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

    const handleLoadDemo = useCallback(() => {
        console.log('📊 Loading demo diagram');
        setMermaidDiagram(DEMO_DIAGRAM);
    }, [setMermaidDiagram]);

    // Auto-start ONCE when client is ready (not on reconnect loops)
    useEffect(() => {
        if (status === 'disconnected' && clientReady && clientRef.current && !hasConnectedOnceRef.current) {
            console.log("🚀 Auto-starting System Design Live (client ready, first connect)");
            handleStart();
        }
    }, [status, clientReady, handleStart]);

    return (
        <div id="agent-container" className="flex flex-col gap-4">
            {/* Demo Button */}
            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <TestTube className="w-4 h-4 text-blue-400" />
                        <span className="text-sm text-blue-400">Demo Mode</span>
                    </div>
                    <Button
                        onClick={handleLoadDemo}
                        size="sm"
                        variant="outline"
                        className="border-blue-500/30 hover:bg-blue-500/20"
                    >
                        Load Sample Diagram
                    </Button>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                    Click to preview what a complete system design diagram looks like
                </p>
            </div>

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
