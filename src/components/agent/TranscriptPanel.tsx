'use client';

import { useEffect, useRef, useState } from 'react';
import { useInterviewStore } from '@/lib/store';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Mic, Type } from 'lucide-react';

function formatRelativeTime(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 10) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  return `${Math.floor(minutes / 60)}h ago`;
}

interface GroupedMessage {
  speaker: 'agent' | 'user';
  messages: { text: string; type?: 'text' | 'audio'; timestamp: number }[];
  firstTimestamp: number;
}

function groupTranscript(transcript: { speaker: 'agent' | 'user'; message: string; type?: 'text' | 'audio'; timestamp: number }[]): GroupedMessage[] {
  const groups: GroupedMessage[] = [];
  for (const msg of transcript) {
    const last = groups[groups.length - 1];
    // Group consecutive messages from the same speaker within 30 seconds
    if (last && last.speaker === msg.speaker && (msg.timestamp - last.messages[last.messages.length - 1].timestamp) < 30000) {
      last.messages.push({ text: msg.message, type: msg.type, timestamp: msg.timestamp });
    } else {
      groups.push({
        speaker: msg.speaker,
        messages: [{ text: msg.message, type: msg.type, timestamp: msg.timestamp }],
        firstTimestamp: msg.timestamp,
      });
    }
  }
  return groups;
}

export function TranscriptPanel() {
  const transcript = useInterviewStore((s) => s.transcript);
  const endRef = useRef<HTMLDivElement>(null);
  const [, setTick] = useState(0);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  // Update relative timestamps every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 15000);
    return () => clearInterval(interval);
  }, []);

  const groups = groupTranscript(transcript);

  // Show speaking indicator if last message was from agent and very recent
  const lastMsg = transcript[transcript.length - 1];
  const isAgentSpeaking = lastMsg && lastMsg.speaker === 'agent' && (Date.now() - lastMsg.timestamp) < 4000;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-2 border-b text-xs font-medium text-muted-foreground select-none">
        <MessageSquare className="w-3 h-3" />
        Transcript
        {transcript.length > 0 && (
          <span className="ml-auto text-[10px] opacity-60">{transcript.length}</span>
        )}
      </div>
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {groups.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6 opacity-50">
              Conversation will appear here...
            </p>
          ) : (
            groups.map((group, gi) => (
              <div
                key={gi}
                className={`text-xs rounded-lg px-3 py-2 ${
                  group.speaker === 'agent'
                    ? 'bg-purple-500/10 text-purple-800 dark:text-purple-200 border border-purple-500/20'
                    : 'bg-blue-500/10 text-blue-800 dark:text-blue-200 border border-blue-500/20'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1 font-medium opacity-80">
                  <span>{group.speaker === 'agent' ? 'Alexis' : 'You'}</span>
                  {group.messages[0].type === 'audio' ? (
                    <Mic className="w-2.5 h-2.5 opacity-50" />
                  ) : (
                    <Type className="w-2.5 h-2.5 opacity-50" />
                  )}
                  <span className="ml-auto text-[10px] opacity-40 font-normal">
                    {formatRelativeTime(group.firstTimestamp)}
                  </span>
                </div>
                <p className="leading-relaxed whitespace-pre-wrap">
                  {group.messages.map((m) => m.text).join(' ')}
                </p>
              </div>
            ))
          )}
          {isAgentSpeaking && (
            <div className="text-xs text-purple-300/60 px-3 py-1 flex items-center gap-1.5">
              <span className="flex gap-0.5">
                <span className="w-1 h-1 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1 h-1 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1 h-1 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
              Alexis is speaking...
            </div>
          )}
          <div ref={endRef} />
        </div>
      </ScrollArea>
    </div>
  );
}
