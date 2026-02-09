import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface TranscriptMessage {
  timestamp: number;
  speaker: 'agent' | 'user';
  message: string;
  type?: 'text' | 'audio';
}

interface BehavioralState {
  _hasHydrated: boolean;

  selectedTopicId: string | null;
  setSelectedTopicId: (id: string | null) => void;

  transcript: TranscriptMessage[];
  addTranscriptMessage: (speaker: 'agent' | 'user', message: string, type?: 'text' | 'audio') => void;
  clearTranscript: () => void;

  agentDisconnect: (() => void) | null;
  setAgentDisconnect: (fn: (() => void) | null) => void;
  onEndInterview: (() => void) | null;
  setOnEndInterview: (fn: (() => void) | null) => void;

  interviewStartTime: number | null;
  startSession: () => void;
  endSession: () => void;
}

export const useBehavioralStore = create<BehavioralState>()(
  persist(
    (set) => ({
      _hasHydrated: false,

      selectedTopicId: null,
      setSelectedTopicId: (selectedTopicId) => set({ selectedTopicId }),

      transcript: [],
      addTranscriptMessage: (speaker, message, type = 'audio') => set((state) => {
        const updated = [...state.transcript, {
          timestamp: Date.now(),
          speaker,
          message,
          type,
        }];
        return { transcript: updated.length > 500 ? updated.slice(-500) : updated };
      }),
      clearTranscript: () => set({ transcript: [] }),

      agentDisconnect: null,
      setAgentDisconnect: (fn) => set({ agentDisconnect: fn }),
      onEndInterview: null,
      setOnEndInterview: (fn) => set({ onEndInterview: fn }),

      interviewStartTime: null,
      startSession: () => set({ interviewStartTime: Date.now() }),
      endSession: () => set({ interviewStartTime: null }),
    }),
    {
      name: 'behavioral-storage',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        selectedTopicId: state.selectedTopicId,
        interviewStartTime: state.interviewStartTime,
      }),
      onRehydrateStorage: () => () => {
        useBehavioralStore.setState({ _hasHydrated: true });
      },
    }
  )
);
