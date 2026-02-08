'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import type { editor } from 'monaco-editor';
import type { Monaco } from '@monaco-editor/react';
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { useInterviewStore } from '@/lib/store';

const Editor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

// Minimum character threshold for paste events to be recorded
const PASTE_CHAR_THRESHOLD = 50;

interface CodeEditorProps {
  initialCode?: string;
  language?: string;
  onChange?: (value: string | undefined) => void;
  onRun?: (code: string) => void;
  isRunning?: boolean;
}

export function CodeEditor({
  initialCode = "// Write your code here",
  language = "javascript",
  onChange,
  onRun,
  isRunning = false
}: CodeEditorProps) {
  const [code, setCode] = useState(initialCode);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const onRunRef = useRef(onRun);
  const { addBlurEvent, addPasteEvent, interviewMode } = useInterviewStore();

  // Keep onRun ref current to avoid stale closure in Monaco action
  useEffect(() => {
    onRunRef.current = onRun;
  }, [onRun]);

  // Tab switching detection via visibility change (real + practice, not system-design)
  useEffect(() => {
    if (interviewMode === 'system-design') return; // Skip for system-design only

    const handleVisibilityChange = () => {
      if (document.hidden) {
        addBlurEvent();
        console.log("⚠️ Tab focus lost - Integrity Check");
      }
    };

    window.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [addBlurEvent, interviewMode]);

  // Handle Monaco editor mount and attach paste event listener
  const handleEditorMount = (editorInstance: editor.IStandaloneCodeEditor, monaco: Monaco) => {
    editorRef.current = editorInstance;

    // Register Ctrl+Enter / Cmd+Enter to run code
    editorInstance.addAction({
      id: 'run-code',
      label: 'Run Code',
      keybindings: [
        monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
      ],
      run: () => {
        const currentCode = editorInstance.getValue();
        onRunRef.current?.(currentCode);
      },
    });

    // Use Monaco's native onDidPaste event for accurate paste detection (real + practice, not system-design)
    editorInstance.onDidPaste((e) => {
      const pastedTextLength = e.range.endColumn - e.range.startColumn +
        (e.range.endLineNumber - e.range.startLineNumber) * 50; // Approximate length for multi-line pastes

      // Get the actual pasted text length from the model
      const model = editorInstance.getModel();
      if (model) {
        const pastedText = model.getValueInRange(e.range);
        const actualLength = pastedText.length;

        // Track in both real and practice modes
        const currentMode = useInterviewStore.getState().interviewMode;
        if (actualLength >= PASTE_CHAR_THRESHOLD && currentMode !== 'system-design') {
          addPasteEvent(actualLength);
          console.log(`⚠️ Paste detected - ${actualLength} characters`);
        }
      }
    });
  };

  const handleEditorChange = (value: string | undefined) => {
    setCode(value || "");
    onChange?.(value);
  };

  const handleRun = () => {
    onRun?.(code);
  };

  return (
    <div className="flex flex-col h-full border rounded-md overflow-hidden bg-card">
      <div className="flex items-center justify-between px-4 py-2 bg-muted border-b border-border">
        <span className="text-sm text-muted-foreground font-mono">{language}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground hidden sm:inline">
            {typeof navigator !== 'undefined' && /Mac/.test(navigator.userAgent) ? '\u2318' : 'Ctrl'}+Enter to run
          </span>
          <Button
            size="sm"
            variant="secondary"
            onClick={handleRun}
            disabled={isRunning}
            className="h-7 text-xs gap-1 bg-green-600 hover:bg-green-700 text-white border-0"
          >
            <Play className="w-3 h-3" fill="currentColor" />
            {isRunning ? "Running..." : "Run"}
          </Button>
        </div>
      </div>
      <div className="flex-1">
        <Editor
          height="100%"
          language={language}
          value={initialCode}
          theme="vs-dark"
          onChange={handleEditorChange}
          onMount={handleEditorMount}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            padding: { top: 16 },
            scrollBeyondLastLine: false,
          }}
        />
      </div>
    </div>
  );
}
