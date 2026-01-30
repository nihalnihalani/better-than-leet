import React from 'react';

interface CodeEditorProps {
  code: string;
  onChange: (newCode: string) => void;
  onPaste: () => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ code, onChange, onPaste }) => {
  return (
    <div className="relative w-full h-full font-mono text-sm bg-slate-900 rounded-lg border border-slate-700 overflow-hidden flex flex-col">
      <div className="bg-slate-800 px-4 py-2 border-b border-slate-700 flex items-center justify-between">
        <span className="text-slate-400 text-xs">solution.js</span>
      </div>
      <textarea
        value={code}
        onChange={(e) => onChange(e.target.value)}
        onPaste={onPaste}
        className="w-full flex-1 bg-slate-900 p-4 text-slate-200 outline-none resize-none font-mono leading-relaxed"
        spellCheck={false}
        autoComplete="off"
        autoCapitalize="off"
      />
    </div>
  );
};

export default CodeEditor;