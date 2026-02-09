import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CodeEditor } from './CodeEditor';

// Mock next/dynamic
vi.mock('next/dynamic', () => ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  default: (_importFunc: () => Promise<unknown>) => {
    // We can just return a simple component here that mocks the editor
    // ignoring the importFunc since we don't want to deal with async imports in tests
    const MockEditor = ({ onChange, defaultValue }: { onChange: (v: string) => void; defaultValue: string }) => (
      <textarea
        data-testid="monaco-editor-mock"
        defaultValue={defaultValue}
        onChange={(e) => onChange(e.target.value)}
      />
    );
    return MockEditor;
  },
}));

// Mock the store
const mockAddBlurEvent = vi.fn();
const mockAddPasteEvent = vi.fn();

vi.mock('@/lib/store', () => ({
  useInterviewStore: () => ({
    addBlurEvent: mockAddBlurEvent,
    addPasteEvent: mockAddPasteEvent,
  }),
}));

describe('CodeEditor', () => {
  it('renders correctly', () => {
    render(<CodeEditor />);
    expect(screen.getByText('Run')).toBeDefined();
    expect(screen.getByTestId('monaco-editor-mock')).toBeDefined();
  });

  it('calls onRun when Run button is clicked', () => {
    const handleRun = vi.fn();
    render(<CodeEditor onRun={handleRun} initialCode="console.log('test')" />);
    
    const runButton = screen.getByText('Run');
    fireEvent.click(runButton);

    expect(handleRun).toHaveBeenCalledWith("console.log('test')");
  });

  it('updates internal state and calls onChange when editor content changes', () => {
    const handleChange = vi.fn();
    render(<CodeEditor onChange={handleChange} />);
    
    const editor = screen.getByTestId('monaco-editor-mock');
    fireEvent.change(editor, { target: { value: 'new code' } });

    expect(handleChange).toHaveBeenCalledWith('new code');
  });

  it('disables Run button when isRunning is true', () => {
    render(<CodeEditor isRunning={true} />);
    
    const runButton = screen.getByRole('button', { name: /running/i });
    expect(runButton.getAttribute('disabled')).toBeDefined();
    expect(screen.getByText('Running...')).toBeDefined();
  });
});
