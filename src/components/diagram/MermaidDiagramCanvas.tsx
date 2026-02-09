'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import mermaid from 'mermaid';
import { useSystemDesignStore } from '@/lib/system-design-store';
import { Button } from '@/components/ui/button';
import {
  Undo2,
  Redo2,
  Download,
  Copy,
  Code2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Layers,
  AlertTriangle,
} from 'lucide-react';

function detectDarkMode(): boolean {
  if (typeof document === 'undefined') return false;
  return document.documentElement.classList.contains('dark');
}

function initializeMermaid() {
  const isDark = detectDarkMode();
  mermaid.initialize({
    startOnLoad: false,
    theme: isDark ? 'dark' : 'default',
    securityLevel: 'strict',
    fontFamily: 'ui-sans-serif, system-ui, sans-serif',
    fontSize: 14,
    flowchart: {
      useMaxWidth: true,
      htmlLabels: true,
      curve: 'basis',
    },
  });
}

export default function MermaidDiagramCanvas() {
  const mermaidDiagram = useSystemDesignStore((s) => s.mermaidDiagram);
  const setMermaidDiagram = useSystemDesignStore((s) => s.setMermaidDiagram);
  const undoDiagram = useSystemDesignStore((s) => s.undoDiagram);
  const redoDiagram = useSystemDesignStore((s) => s.redoDiagram);
  const diagramHistoryIndex = useSystemDesignStore((s) => s.diagramHistoryIndex);
  const diagramHistoryLength = useSystemDesignStore((s) => s.diagramHistory.length);

  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [error, setError] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [showSource, setShowSource] = useState(false);
  const [editSource, setEditSource] = useState('');
  const [copyFeedback, setCopyFeedback] = useState(false);

  // Track dark mode changes and re-initialize mermaid
  useEffect(() => {
    initializeMermaid();

    const observer = new MutationObserver(() => {
      initializeMermaid();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  // Render diagram
  useEffect(() => {
    if (!mermaidDiagram || !containerRef.current) {
      return;
    }

    const renderDiagram = async () => {
      setIsRendering(true);
      setError(null);

      try {
        const id = `mermaid-${Date.now()}`;

        if (containerRef.current) {
          containerRef.current.innerHTML = '';
        }

        // Re-initialize before each render to pick up theme changes
        initializeMermaid();

        const { svg } = await mermaid.render(id, mermaidDiagram);

        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to render diagram');
      } finally {
        setIsRendering(false);
      }
    };

    renderDiagram();
  }, [mermaidDiagram]);

  // Sync edit source when opening editor
  useEffect(() => {
    if (showSource) {
      setEditSource(mermaidDiagram);
    }
  }, [showSource, mermaidDiagram]);

  // --- Toolbar actions ---

  const handleZoomIn = useCallback(() => {
    setZoom((z) => Math.min(z + 0.25, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((z) => Math.max(z - 0.25, 0.25));
  }, []);

  const handleFitToScreen = useCallback(() => {
    setZoom(1);
  }, []);

  const handleCopySource = useCallback(async () => {
    if (!mermaidDiagram) return;
    try {
      await navigator.clipboard.writeText(mermaidDiagram);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = mermaidDiagram;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    }
  }, [mermaidDiagram]);

  const handleExportSVG = useCallback(() => {
    if (!containerRef.current) return;
    const svgEl = containerRef.current.querySelector('svg');
    if (!svgEl) return;

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgEl);
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'diagram.svg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  const handleExportPNG = useCallback(() => {
    if (!containerRef.current) return;
    const svgEl = containerRef.current.querySelector('svg');
    if (!svgEl) return;

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgEl);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      const scale = 2; // retina export
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth * scale;
      canvas.height = img.naturalHeight * scale;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      canvas.toBlob((blob) => {
        if (!blob) return;
        const pngUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = pngUrl;
        link.download = 'diagram.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(pngUrl);
      }, 'image/png');
    };
    img.src = url;
  }, []);

  const handleSaveSource = useCallback(() => {
    if (editSource.trim() && editSource !== mermaidDiagram) {
      setMermaidDiagram(editSource.trim());
    }
    setShowSource(false);
  }, [editSource, mermaidDiagram, setMermaidDiagram]);

  const canUndo = diagramHistoryIndex > 0;
  const canRedo = diagramHistoryIndex < diagramHistoryLength - 1;

  // --- Toolbar component ---
  const Toolbar = () => (
    <div className="absolute top-3 right-3 z-20 flex items-center gap-1 rounded-lg border bg-card/95 backdrop-blur-sm p-1 shadow-md">
      {/* Undo / Redo */}
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        onClick={undoDiagram}
        disabled={!canUndo}
        title="Undo"
      >
        <Undo2 className="h-3.5 w-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        onClick={redoDiagram}
        disabled={!canRedo}
        title="Redo"
      >
        <Redo2 className="h-3.5 w-3.5" />
      </Button>

      <div className="mx-0.5 h-4 w-px bg-border" />

      {/* Zoom controls */}
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        onClick={handleZoomOut}
        disabled={zoom <= 0.25}
        title="Zoom out"
      >
        <ZoomOut className="h-3.5 w-3.5" />
      </Button>
      <span className="text-[10px] font-medium text-muted-foreground w-8 text-center tabular-nums">
        {Math.round(zoom * 100)}%
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        onClick={handleZoomIn}
        disabled={zoom >= 3}
        title="Zoom in"
      >
        <ZoomIn className="h-3.5 w-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        onClick={handleFitToScreen}
        title="Fit to screen"
      >
        <Maximize2 className="h-3.5 w-3.5" />
      </Button>

      <div className="mx-0.5 h-4 w-px bg-border" />

      {/* Export / Copy */}
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        onClick={handleExportSVG}
        title="Export SVG"
      >
        <Download className="h-3.5 w-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        onClick={handleExportPNG}
        title="Export PNG"
      >
        <Download className="h-3.5 w-3.5 text-muted-foreground" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 relative"
        onClick={handleCopySource}
        title="Copy Mermaid source"
      >
        <Copy className="h-3.5 w-3.5" />
        {copyFeedback && (
          <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-medium text-green-500 whitespace-nowrap">
            Copied!
          </span>
        )}
      </Button>

      <div className="mx-0.5 h-4 w-px bg-border" />

      {/* Edit source toggle */}
      <Button
        variant={showSource ? 'secondary' : 'ghost'}
        size="icon"
        className="h-7 w-7"
        onClick={() => setShowSource((v) => !v)}
        title="Edit source"
      >
        <Code2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );

  // ==================== EMPTY STATE ====================
  if (!mermaidDiagram) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-background">
        <div className="text-center max-w-sm px-6">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Layers className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Architecture Diagram
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-6">
            Start talking to Alexis to generate an architecture diagram. As you discuss
            components, databases, and services, the diagram will build automatically.
          </p>
          {/* Ghosted example diagram */}
          <div className="rounded-lg border border-dashed border-border/60 bg-muted/30 p-6 opacity-50">
            <svg
              viewBox="0 0 280 120"
              className="w-full h-auto text-muted-foreground/40"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              {/* Client box */}
              <rect x="10" y="10" width="60" height="30" rx="4" />
              <text x="40" y="29" textAnchor="middle" fontSize="8" fill="currentColor" stroke="none">Client</text>
              {/* API box */}
              <rect x="110" y="10" width="60" height="30" rx="4" />
              <text x="140" y="29" textAnchor="middle" fontSize="8" fill="currentColor" stroke="none">API</text>
              {/* DB cylinder */}
              <rect x="210" y="10" width="60" height="30" rx="4" />
              <text x="240" y="29" textAnchor="middle" fontSize="8" fill="currentColor" stroke="none">Database</text>
              {/* Cache box */}
              <rect x="110" y="75" width="60" height="30" rx="4" />
              <text x="140" y="94" textAnchor="middle" fontSize="8" fill="currentColor" stroke="none">Cache</text>
              {/* Arrows */}
              <line x1="70" y1="25" x2="110" y2="25" markerEnd="url(#arrowhead)" />
              <line x1="170" y1="25" x2="210" y2="25" markerEnd="url(#arrowhead)" />
              <line x1="140" y1="40" x2="140" y2="75" markerEnd="url(#arrowhead)" />
              <defs>
                <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                  <polygon points="0 0, 8 3, 0 6" fill="currentColor" />
                </marker>
              </defs>
            </svg>
          </div>
          <p className="text-xs text-muted-foreground/60 mt-3">
            Example: A typical web service architecture
          </p>
        </div>
      </div>
    );
  }

  // ==================== ERROR STATE ====================
  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-background">
        <div className="max-w-md text-center px-6">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Diagram Rendering Error
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {error}
          </p>
          <div className="flex items-center justify-center gap-2 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                undoDiagram();
                setError(null);
              }}
              disabled={!canUndo}
            >
              <Undo2 className="h-3.5 w-3.5 mr-1.5" />
              Revert to Previous
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setError(null)}
            >
              Dismiss
            </Button>
          </div>
          <details className="text-xs text-left rounded-lg border bg-muted/50 p-3">
            <summary className="cursor-pointer font-medium text-muted-foreground mb-2">
              Diagram Source
            </summary>
            <pre className="whitespace-pre-wrap overflow-auto max-h-40 text-foreground/70 font-mono">
              {mermaidDiagram}
            </pre>
          </details>
        </div>
      </div>
    );
  }

  // ==================== MAIN RENDER ====================
  return (
    <div className="relative h-full w-full overflow-hidden bg-background" ref={wrapperRef}>
      {/* Toolbar */}
      <Toolbar />

      {/* Loading overlay */}
      {isRendering && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
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

      {/* Source editor panel */}
      {showSource && (
        <div className="absolute bottom-0 left-0 right-0 z-20 border-t bg-card p-3 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Mermaid Source
            </span>
            <div className="flex items-center gap-1.5">
              <Button variant="ghost" size="sm" onClick={() => setShowSource(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSaveSource}
                disabled={editSource.trim() === mermaidDiagram}
              >
                Apply Changes
              </Button>
            </div>
          </div>
          <textarea
            className="w-full h-36 rounded-md border bg-background p-3 font-mono text-xs text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-ring"
            value={editSource}
            onChange={(e) => setEditSource(e.target.value)}
            spellCheck={false}
          />
        </div>
      )}

      {/* Diagram container with zoom */}
      <div className="h-full w-full overflow-auto">
        <div
          ref={containerRef}
          className="flex items-center justify-center min-h-full p-8 origin-top-left"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'center center',
          }}
        />
      </div>
    </div>
  );
}
