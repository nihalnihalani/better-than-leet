'use client';

import { useEffect, useState } from 'react';
import { useInterviewStore } from '@/lib/store';
import { useSystemDesignStore } from '@/lib/system-design-store';
import { useBehavioralStore } from '@/lib/behavioral-store';
import { Clock } from 'lucide-react';

interface TimerProps {
  mode?: 'coding' | 'system-design' | 'behavioral';
}

export function Timer({ mode = 'coding' }: TimerProps) {
  const codingStartTime = useInterviewStore((s) => s.interviewStartTime);
  const sdStartTime = useSystemDesignStore((s) => s.interviewStartTime);
  const behavioralStartTime = useBehavioralStore((s) => s.interviewStartTime);
  const interviewStartTime = mode === 'system-design' ? sdStartTime : mode === 'behavioral' ? behavioralStartTime : codingStartTime;
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!interviewStartTime) return;

    // Initialize with current elapsed time
    setElapsed(Math.floor((Date.now() - interviewStartTime) / 1000));

    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - interviewStartTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [interviewStartTime]);

  if (!interviewStartTime) return null;

  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;
  const display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <span className="text-sm font-mono text-muted-foreground flex items-center gap-1.5">
      <Clock className="w-3.5 h-3.5" />
      {display}
    </span>
  );
}
