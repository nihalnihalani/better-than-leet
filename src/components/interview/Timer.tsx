'use client';

import { useEffect, useState } from 'react';
import { useInterviewStore } from '@/lib/store';
import { Clock } from 'lucide-react';

export function Timer() {
  const { interviewStartTime } = useInterviewStore();
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
