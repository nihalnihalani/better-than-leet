'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { playSound } from '@/lib/sounds';
import { cn } from '@/lib/utils';

interface CountdownTimerProps {
  /** Total duration in minutes */
  totalMinutes: number;
  /** Unix timestamp when the interview started */
  startTime: number | null;
  /** Callback when time runs out */
  onTimeUp?: () => void;
}

export function CountdownTimer({ totalMinutes, startTime, onTimeUp }: CountdownTimerProps) {
  const [remaining, setRemaining] = useState(totalMinutes * 60);
  const warnedRef = useRef(false);
  const timeUpRef = useRef(false);
  const onTimeUpRef = useRef(onTimeUp);
  onTimeUpRef.current = onTimeUp;

  useEffect(() => {
    if (!startTime) {
      setRemaining(totalMinutes * 60);
      warnedRef.current = false;
      timeUpRef.current = false;
      return;
    }

    const tick = () => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const left = Math.max(0, totalMinutes * 60 - elapsed);
      setRemaining(left);

      // Warning at 5 minutes
      if (left <= 300 && left > 0 && !warnedRef.current) {
        warnedRef.current = true;
        playSound('warning');
      }

      // Time's up
      if (left === 0 && !timeUpRef.current) {
        timeUpRef.current = true;
        playSound('complete');
        onTimeUpRef.current?.();
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [startTime, totalMinutes]);

  if (!startTime) return null;

  const totalSeconds = totalMinutes * 60;
  const progress = totalSeconds > 0 ? ((totalSeconds - remaining) / totalSeconds) * 100 : 100;

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const isWarning = remaining <= 300 && remaining > 0;
  const isExpired = remaining === 0;

  const barColor = isExpired
    ? 'bg-red-500'
    : isWarning
      ? 'bg-yellow-500'
      : 'bg-green-500';

  const textColor = isExpired
    ? 'text-red-500'
    : isWarning
      ? 'text-yellow-500'
      : 'text-muted-foreground';

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5">
        {isWarning || isExpired ? (
          <AlertTriangle className={cn('w-3.5 h-3.5', textColor, isWarning && 'animate-pulse')} />
        ) : (
          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
        )}
        <span className={cn('text-sm font-mono', textColor)}>
          {isExpired ? "Time's up" : display}
        </span>
      </div>
      <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden hidden sm:block">
        <div
          className={cn('h-full rounded-full transition-all duration-1000', barColor)}
          style={{ width: `${Math.min(100, progress)}%` }}
        />
      </div>
    </div>
  );
}

/** Small preset picker for selecting timer duration before/during interview */
export function TimerPresetSelector({
  value,
  onChange,
}: {
  value: number;
  onChange: (minutes: number) => void;
}) {
  const presets = [30, 45, 60];

  const handleChange = useCallback(
    (minutes: number) => onChange(minutes),
    [onChange],
  );

  return (
    <div className="flex items-center gap-1.5">
      <Clock className="w-3.5 h-3.5 text-muted-foreground" />
      <span className="text-xs text-muted-foreground mr-1">Timer:</span>
      {presets.map((m) => (
        <button
          key={m}
          onClick={() => handleChange(m)}
          className={cn(
            'px-2 py-0.5 rounded text-xs font-medium transition-colors',
            value === m
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80',
          )}
        >
          {m}m
        </button>
      ))}
    </div>
  );
}
