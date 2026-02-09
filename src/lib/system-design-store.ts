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
  diagramHistoryIndex: number;
  undoDiagram: () => void;
  redoDiagram: () => void;
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
    (set, get) => ({
      // Topic Selection
      selectedTopicId: null,
      setSelectedTopicId: (selectedTopicId) => set({ selectedTopicId }),

      // Diagram State (Mermaid-based)
      mermaidDiagram: '',
      setMermaidDiagram: (diagram) => {
        const state = get();
        // Truncate any forward history on new edit, cap at 50
        const newHistory = [...state.diagramHistory.slice(0, state.diagramHistoryIndex + 1), diagram].slice(-50);
        set({
          mermaidDiagram: diagram,
          diagramHistory: newHistory,
          diagramHistoryIndex: newHistory.length - 1,
        });
      },
      diagramHistory: [],
      diagramHistoryIndex: -1,
      undoDiagram: () => {
        const state = get();
        if (state.diagramHistoryIndex > 0) {
          const newIndex = state.diagramHistoryIndex - 1;
          set({
            mermaidDiagram: state.diagramHistory[newIndex],
            diagramHistoryIndex: newIndex,
          });
        }
      },
      redoDiagram: () => {
        const state = get();
        if (state.diagramHistoryIndex < state.diagramHistory.length - 1) {
          const newIndex = state.diagramHistoryIndex + 1;
          set({
            mermaidDiagram: state.diagramHistory[newIndex],
            diagramHistoryIndex: newIndex,
          });
        }
      },
      clearDiagram: () => set({ mermaidDiagram: '', diagramHistory: [], diagramHistoryIndex: -1 }),

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
      version: 3,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        selectedTopicId: state.selectedTopicId,
        mermaidDiagram: state.mermaidDiagram,
        diagramHistory: state.diagramHistory,
        diagramHistoryIndex: state.diagramHistoryIndex,
        transcript: state.transcript,
        interviewStartTime: state.interviewStartTime,
      }),
      migrate: (persistedState: any, version: number) => {
        if (version < 2) {
          return {
            ...persistedState,
            mermaidDiagram: '',
            diagramHistory: [],
            diagramHistoryIndex: -1,
            diagramNodes: undefined,
            diagramEdges: undefined,
          };
        }
        if (version < 3) {
          return {
            ...persistedState,
            diagramHistoryIndex: (persistedState.diagramHistory?.length ?? 0) - 1,
          };
        }
        return persistedState;
      },
    }
  )
);
