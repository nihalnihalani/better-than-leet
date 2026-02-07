'use client';

import React, { useEffect, useRef, useState } from 'react';

export function Visualizer({ isSpeaking, volume = 0 }: { isSpeaking: boolean, volume?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  
  // Use a ref to store the latest volume so the animation loop can access it
  // without needing to be recreated on every render
  const volumeRef = useRef(volume);
  
  // Update ref when prop changes
  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);

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
    // Smoothed volume for animation
    let currentLevel = 0;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Determine target level:
      // If speaking, use the real volume (boosted slightly for visibility).
      // If not speaking, idle at 0.
      const targetLevel = isSpeaking ? (volumeRef.current * 2.5) : 0; // Boost factor
      
      // Smooth interpolation (attack/decay)
      // Attack fast, decay slightly slower
      const lerpFactor = targetLevel > currentLevel ? 0.3 : 0.1;
      currentLevel += (targetLevel - currentLevel) * lerpFactor;
      
      // Ensure we have some minimum movement if "speaking" but volume is low, to show activity
      // Or just rely on the volume. Let's add a tiny noise floor if speaking.
      const displayLevel = isSpeaking ? Math.max(currentLevel, 0.05) : currentLevel;

      const isDark = document.documentElement.classList.contains('dark');
      ctx.fillStyle = isSpeaking ? '#a855f7' : (isDark ? '#374151' : '#d1d5db'); // Purple-500 if speaking, Gray adapts to theme

      const bars = Math.max(20, Math.floor(canvas.width / 6)); // More bars for smoother look
      const spacing = 2;
      const totalBarWidth = canvas.width - (bars - 1) * spacing;
      const barWidth = totalBarWidth / bars;
      const centerY = canvas.height / 2;

      for (let i = 0; i < bars; i++) {
        // Create a symmetric wave shape
        // Center bars are taller, edges are shorter
        const normalizeX = i / (bars - 1); // 0 to 1
        const window = Math.sin(normalizeX * Math.PI); // 0 -> 1 -> 0 (Bell curve shape)
        
        // Add some random jitter for "voice" texture
        const jitter = Math.random() * 0.2 + 0.8; 
        
        // Calculate height based on volume and window
        const maxHeight = canvas.height * 0.9;
        const barHeight = Math.max(4, displayLevel * maxHeight * window * jitter);

        const x = i * (barWidth + spacing);
        const y = centerY - barHeight / 2;
        
        // Draw rounded rect
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 4);
        ctx.fill();
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => cancelAnimationFrame(animationId);
  }, [isSpeaking, dimensions]); // Removed volume from deps to avoid re-effecting

  return (
    <div ref={containerRef} className="w-full h-[96px] relative">
      <canvas
        ref={canvasRef}
        className="rounded-md bg-black/20 w-full h-full block"
        role="img"
        aria-label={isSpeaking ? "Audio visualizer: Agent is speaking" : "Audio visualizer: Agent is silent"}
      />
    </div>
  );
}
