import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Conversation transcript entry
interface TranscriptMessage {
  timestamp: number;
  speaker: 'agent' | 'user';
  message: string;
  type?: 'text' | 'audio';
}

interface SystemDesignState {
  // Topic Selection
  selectedTopicId: string | null;
  setSelectedTopicId: (id: string | null) => void;

  // Diagram State (Mermaid-based)
  mermaidDiagram: string;
  setMermaidDiagram: (diagram: string) => void;
  diagramHistory: string[];
  clearDiagram: () => void;

  // Conversation Transcript
  transcript: TranscriptMessage[];
  addTranscriptMessage: (speaker: 'agent' | 'user', message: string, type?: 'text' | 'audio') => void;
  clearTranscript: () => void;

  // Agent callbacks
  agentDisconnect: (() => void) | null;
  setAgentDisconnect: (fn: (() => void) | null) => void;
  onEndInterview: (() => void) | null;
  setOnEndInterview: (fn: (() => void) | null) => void;

  // Session
  interviewStartTime: number | null;
  startSession: () => void;
  endSession: () => void;
}

export const useSystemDesignStore = create<SystemDesignState>()(
  persist(
    (set) => ({
      // Topic Selection
      selectedTopicId: null,
      setSelectedTopicId: (selectedTopicId) => set({ selectedTopicId }),

      // Diagram State (Mermaid-based)
      mermaidDiagram: '',
      setMermaidDiagram: (diagram) => set((state) => ({
        mermaidDiagram: diagram,
        diagramHistory: [...state.diagramHistory, diagram]
      })),
      diagramHistory: [],
      clearDiagram: () => set({ mermaidDiagram: '', diagramHistory: [] }),

      // Conversation Transcript
      transcript: [],
      addTranscriptMessage: (speaker, message, type = 'audio') => set((state) => ({
        transcript: [...state.transcript, {
          timestamp: Date.now(),
          speaker,
          message,
          type
        }]
      })),
      clearTranscript: () => set({ transcript: [] }),

      // Agent callbacks
      agentDisconnect: null,
      setAgentDisconnect: (fn) => set({ agentDisconnect: fn }),
      onEndInterview: null,
      setOnEndInterview: (fn) => set({ onEndInterview: fn }),

      // Session
      interviewStartTime: null,
      startSession: () => set({ interviewStartTime: Date.now() }),
      endSession: () => set({ interviewStartTime: null }),
    }),
    {
      name: 'system-design-storage',
      version: 2,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        selectedTopicId: state.selectedTopicId,
        mermaidDiagram: state.mermaidDiagram,
        diagramHistory: state.diagramHistory,
        transcript: state.transcript,
      }),
      migrate: (persistedState: any, version: number) => {
        // Migration from v1 (nodes/edges) to v2 (mermaid)
        if (version < 2) {
          return {
            ...persistedState,
            mermaidDiagram: '',
            diagramHistory: [],
            // Remove old fields
            diagramNodes: undefined,
            diagramEdges: undefined,
          };
        }
        return persistedState;
      },
    }
  )
);
