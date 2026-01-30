'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import type { editor } from 'monaco-editor';
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
  const { addBlurEvent, addPasteEvent } = useInterviewStore();

  // Tab switching detection via visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        addBlurEvent();
        console.log("Tab focus lost - Integrity Check");
      }
    };

    window.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [addBlurEvent]);

  // Handle Monaco editor mount and attach paste event listener
  const handleEditorMount = (editorInstance: editor.IStandaloneCodeEditor) => {
    editorRef.current = editorInstance;

    // Use Monaco's native onDidPaste event for accurate paste detection
    editorInstance.onDidPaste((e) => {
      const pastedTextLength = e.range.endColumn - e.range.startColumn +
        (e.range.endLineNumber - e.range.startLineNumber) * 50; // Approximate length for multi-line pastes

      // Get the actual pasted text length from the model
      const model = editorInstance.getModel();
      if (model) {
        const pastedText = model.getValueInRange(e.range);
        const actualLength = pastedText.length;

        if (actualLength >= PASTE_CHAR_THRESHOLD) {
          addPasteEvent(actualLength);
          console.log(`Paste detected - ${actualLength} characters`);
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
    <div className="flex flex-col h-full border rounded-md overflow-hidden bg-[#1e1e1e]">
      <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-[#333]">
        <span className="text-sm text-gray-400 font-mono">{language}</span>
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
      <div className="flex-1">
        <Editor
          height="100%"
          defaultLanguage={language}
          defaultValue={initialCode}
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
