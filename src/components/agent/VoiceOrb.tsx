'use client';

import { useEffect, useRef, useMemo } from 'react';
import { Zap } from 'lucide-react';

type OrbState = 'disconnected' | 'connecting' | 'listening' | 'userSpeaking' | 'agentSpeaking' | 'thinking' | 'error';

interface VoiceOrbProps {
  status: string;
  isSpeaking: boolean;
  isModelSpeaking: boolean;
  volume: number;
  isThinking: boolean;
  currentAction?: string;
}

const STATE_CONFIG: Record<OrbState, { color: string; glow: string; label: string }> = {
  disconnected: {
    color: 'bg-slate-400 dark:bg-slate-500',
    glow: 'shadow-[0_0_20px_4px_rgba(148,163,184,0.15)]',
    label: 'Offline',
  },
  connecting: {
    color: 'bg-amber-400',
    glow: 'shadow-[0_0_30px_8px_rgba(251,191,36,0.25)]',
    label: 'Connecting...',
  },
  listening: {
    color: 'bg-emerald-400',
    glow: 'shadow-[0_0_30px_8px_rgba(52,211,153,0.2)]',
    label: 'Listening...',
  },
  userSpeaking: {
    color: 'bg-emerald-400',
    glow: 'shadow-[0_0_40px_12px_rgba(52,211,153,0.35)]',
    label: 'Hearing you...',
  },
  agentSpeaking: {
    color: 'bg-purple-500',
    glow: 'shadow-[0_0_40px_12px_rgba(168,85,247,0.35)]',
    label: 'Alexis speaking...',
  },
  thinking: {
    color: 'bg-blue-500',
    glow: 'shadow-[0_0_35px_10px_rgba(59,130,246,0.3)]',
    label: 'Thinking...',
  },
  error: {
    color: 'bg-red-500',
    glow: 'shadow-[0_0_25px_6px_rgba(239,68,68,0.2)]',
    label: 'Error',
  },
};

const ORB_COLORS: Record<OrbState, string> = {
  disconnected: '#94a3b8',
  connecting: '#fbbf24',
  listening: '#34d399',
  userSpeaking: '#34d399',
  agentSpeaking: '#a855f7',
  thinking: '#3b82f6',
  error: '#ef4444',
};

function deriveState(status: string, isSpeaking: boolean, isModelSpeaking: boolean, isThinking: boolean): OrbState {
  if (status === 'error') return 'error';
  if (status === 'connecting') return 'connecting';
  if (status === 'disconnected' || status === 'disconnecting') return 'disconnected';
  // connected states
  if (isThinking) return 'thinking';
  if (isModelSpeaking) return 'agentSpeaking';
  if (isSpeaking) return 'userSpeaking';
  return 'listening';
}

// ──── Mini Waveform ────
function MiniWaveform({ active, volume, color }: { active: boolean; volume: number; color: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const volumeRef = useRef(0);
  const levelRef = useRef(0);

  useEffect(() => { volumeRef.current = volume; }, [volume]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf: number;
    const draw = () => {
      const w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const target = active ? Math.max(volumeRef.current * 3, 0.08) : 0;
      const lerp = target > levelRef.current ? 0.25 : 0.08;
      levelRef.current += (target - levelRef.current) * lerp;

      const bars = 16;
      const gap = 2;
      const barW = (w - (bars - 1) * gap) / bars;
      const cy = h / 2;

      ctx.fillStyle = color;

      for (let i = 0; i < bars; i++) {
        const nx = i / (bars - 1);
        const win = Math.sin(nx * Math.PI);
        const jitter = 0.85 + Math.random() * 0.15;
        const barH = Math.max(2, levelRef.current * h * 0.85 * win * jitter);
        const x = i * (barW + gap);
        ctx.beginPath();
        ctx.roundRect(x, cy - barH / 2, barW, barH, 1.5);
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [active, color]);

  return (
    <canvas
      ref={canvasRef}
      width={160}
      height={24}
      className="w-40 h-6 opacity-70"
      aria-hidden
    />
  );
}

// ──── VoiceOrb ────
export function VoiceOrb({ status, isSpeaking, isModelSpeaking, volume, isThinking, currentAction }: VoiceOrbProps) {
  const state = deriveState(status, isSpeaking, isModelSpeaking, isThinking);
  const config = STATE_CONFIG[state];
  const orbColor = ORB_COLORS[state];

  // Compute orb scale from volume
  const scale = useMemo(() => {
    if (state === 'userSpeaking' || state === 'agentSpeaking') {
      return 1 + Math.min(volume * 1.5, 0.15);
    }
    return 1;
  }, [state, volume]);

  const isActive = state !== 'disconnected' && state !== 'error';
  const showWaveform = status === 'connected';
  const animClass = state === 'listening' ? 'animate-breathe' :
                    state === 'connecting' ? 'animate-pulse' : '';

  return (
    <div className="flex flex-col items-center gap-3 py-2 select-none">
      {/* Orb */}
      <div className="relative flex items-center justify-center">
        {/* Outer glow ring */}
        {isActive && (
          <div
            className={`absolute w-24 h-24 rounded-full opacity-20 blur-xl transition-colors duration-500 ${config.color}`}
          />
        )}

        {/* Main orb */}
        <div
          className={`
            relative w-16 h-16 rounded-full transition-all duration-300 ease-out
            ${config.color} ${config.glow} ${animClass}
          `}
          style={{
            transform: `scale(${scale})`,
          }}
        >
          {/* Inner highlight */}
          <div className="absolute inset-[6px] rounded-full bg-white/20" />

          {/* Center bright spot */}
          <div className="absolute inset-[16px] rounded-full bg-white/15 blur-[2px]" />
        </div>
      </div>

      {/* Status label */}
      <span className="text-xs font-medium text-muted-foreground tracking-wide">
        {config.label}
      </span>

      {/* Mini waveform */}
      {showWaveform && (
        <MiniWaveform
          active={isSpeaking || isModelSpeaking}
          volume={volume}
          color={orbColor}
        />
      )}

      {/* Inline thinking indicator */}
      {isThinking && currentAction && (
        <div className="flex items-center gap-1.5 text-xs text-blue-400 animate-pulse">
          <Zap className="w-3 h-3" />
          <span>{currentAction}</span>
        </div>
      )}
    </div>
  );
}
