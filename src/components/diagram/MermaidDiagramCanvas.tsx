'use client';

import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { useSystemDesignStore } from '@/lib/system-design-store';

export default function MermaidDiagramCanvas() {
  const mermaidDiagram = useSystemDesignStore((state) => state.mermaidDiagram);
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);

  // Debug logging
  useEffect(() => {
    console.log('🎨 MermaidDiagramCanvas - mermaidDiagram updated:', mermaidDiagram ? `${mermaidDiagram.substring(0, 50)}...` : 'empty');
  }, [mermaidDiagram]);

  useEffect(() => {
    // Initialize Mermaid with configuration
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose',
      fontFamily: 'ui-sans-serif, system-ui, sans-serif',
      fontSize: 14,
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: 'basis',
      },
    });
  }, []);

  useEffect(() => {
    if (!mermaidDiagram || !containerRef.current) {
      return;
    }

    const renderDiagram = async () => {
      console.log('🎨 Starting Mermaid render...');
      setIsRendering(true);
      setError(null);

      try {
        // Generate unique ID for this render
        const id = `mermaid-${Date.now()}`;

        console.log('🎨 Rendering Mermaid diagram with ID:', id);
        console.log('🎨 Diagram content:', mermaidDiagram.substring(0, 100));

        // Clear previous content
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
        }

        // Render the diagram
        const { svg } = await mermaid.render(id, mermaidDiagram);

        console.log('✅ Mermaid render successful, SVG length:', svg.length);

        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
          console.log('✅ SVG inserted into DOM');
        }
      } catch (err) {
        console.error('❌ Mermaid rendering error:', err);
        console.error('❌ Failed diagram:', mermaidDiagram);
        setError(err instanceof Error ? err.message : 'Failed to render diagram');
      } finally {
        setIsRendering(false);
      }
    };

    renderDiagram();
  }, [mermaidDiagram]);

  if (!mermaidDiagram) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <svg
            className="mx-auto h-12 w-12 mb-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-sm">
            Waiting for system design diagram...
          </p>
          <p className="text-xs mt-2 text-gray-400">
            The AI will generate an architecture diagram as you discuss
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md text-center">
          <div className="text-red-500 mb-4">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Diagram Rendering Error
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {error}
          </p>
          <details className="text-xs text-left bg-gray-100 dark:bg-gray-800 p-3 rounded">
            <summary className="cursor-pointer font-medium mb-2">
              Diagram Source
            </summary>
            <pre className="whitespace-pre-wrap overflow-auto max-h-40">
              {mermaidDiagram}
            </pre>
          </details>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-auto bg-white dark:bg-gray-950">
      {isRendering && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-gray-950/50 z-10">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <svg
              className="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Rendering diagram...</span>
          </div>
        </div>
      )}
      <div
        ref={containerRef}
        className="flex items-center justify-center min-h-full p-8"
      />
    </div>
  );
}
