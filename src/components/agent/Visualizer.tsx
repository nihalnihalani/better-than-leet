'use client';

import React, { useEffect, useRef, useState } from 'react';

export function Visualizer({ isSpeaking }: { isSpeaking: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ width, height });
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dimensions.width === 0) return;

    // Set canvas internal dimensions to match displayed dimensions
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = isSpeaking ? '#4ade80' : '#374151'; // Green if speaking, Gray if not

      const bars = Math.max(10, Math.floor(canvas.width / 10)); // Dynamic bar count based on width
      const spacing = 2;
      const barWidth = (canvas.width - (bars - 1) * spacing) / bars;

      for (let i = 0; i < bars; i++) {
        const height = isSpeaking
          ? Math.random() * canvas.height * 0.8 + 5
          : 5;

        ctx.fillRect(i * (barWidth + spacing), canvas.height / 2 - height / 2, barWidth, height);
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => cancelAnimationFrame(animationId);
  }, [isSpeaking, dimensions]);

  return (
    <div ref={containerRef} className="w-full h-[50px] relative">
      <canvas
        ref={canvasRef}
        className="rounded-md bg-black/20 w-full h-full block"
        role="img"
        aria-label={isSpeaking ? "Audio visualizer: Agent is speaking" : "Audio visualizer: Agent is silent"}
      />
    </div>
  );
}
