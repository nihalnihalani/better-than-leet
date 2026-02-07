import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { CodeRabbitReview } from './coderabbit';
import { LARGE_PASTE_THRESHOLD } from './constants';

interface ReviewResult {
  score: number;
  security_score?: number;
  complexity: string;
  issues: string[];
  security_issues?: string[];
  reasoning_trace: string;
}

// Conversation transcript entry
interface TranscriptMessage {
  timestamp: number;
  speaker: 'agent' | 'user';
  message: string;
  type?: 'text' | 'audio';
}

// Test execution result
interface TestResult {
  timestamp: number;
  problemId: string;
  testsPassed: number;
  testsTotal: number;
  executionTime?: number;
  details: any;
}

// Practice session for practice interviews
interface PracticeSession {
  id: string;
  timestamp: number;
  companyId: string;
  problemId: string;
  score: number;
  skillLevel: string;
  improvementAreas: string[];
  duration: number;
}

// Custom problem imported from LeetCode or manually added
export interface CustomProblem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  examples: { input: string; output: string; explanation?: string }[];
  constraints: string[];
  starterCode: string;
  functionName: string;
  testCases: { inputs: any[]; expected: any }[];
  tags: string[];
  hints: string[];
  leetcodeUrl?: string;
  addedAt: number;
  category?: string;
}

// Workspace status types
export type WorkspaceStatus = 'idle' | 'creating' | 'installing' | 'ready' | 'error';

interface WorkspaceProgress {
  step: string;
  progress: number;
}

interface InterviewState {
  // Session
  status: 'idle' | 'active' | 'completed';
  interviewStartTime: number | null;
  startSession: () => void;
  endSession: () => void;
  setStatus: (status: 'idle' | 'active' | 'completed') => void;

  // Code
  language: string;
  code: string;
  workspaceId: string | null;
  currentProblemId: string | null;
  setCode: (code: string) => void;
  setLanguage: (lang: string) => void;
  setWorkspaceId: (id: string | null) => void;
  setCurrentProblemId: (id: string | null) => void;

  // Workspace Status (for progress indicator)
  workspaceStatus: WorkspaceStatus;
  workspaceProgress: WorkspaceProgress;
  workspaceError: string | null;
  setWorkspaceStatus: (status: WorkspaceStatus) => void;
  setWorkspaceProgress: (progress: WorkspaceProgress) => void;
  setWorkspaceError: (error: string | null) => void;

  // Console
  consoleOutput: { type: 'stdout' | 'stderr' | 'system' | 'agent'; content: string }[];
  addLog: (log: string, type?: 'stdout' | 'stderr' | 'system' | 'agent') => void;
  clearLogs: () => void;

  // Analysis
  latestReview: ReviewResult | null;
  setReview: (review: ReviewResult | null) => void;

  // CodeRabbit Analysis
  coderabbitReview: CodeRabbitReview | null;
  setCodeRabbitReview: (review: CodeRabbitReview | null) => void;

  // Integrity
  integrity: {
    blurCount: number;
    pasteCount: number;
    largePasteEvents: { timestamp: number, length: number }[];
  };
  addBlurEvent: () => void;
  addPasteEvent: (length: number) => void;
  getIntegrityReport: () => string;

  // Conversation Transcript
  transcript: TranscriptMessage[];
  addTranscriptMessage: (speaker: 'agent' | 'user', message: string, type?: 'text' | 'audio') => void;
  clearTranscript: () => void;

  // Test Results
  testResults: TestResult[];
  addTestResult: (result: TestResult) => void;
  clearTestResults: () => void;

  // Demo / Wizard Mode
  isWizardMode: boolean;
  toggleWizardMode: () => void;

  // Practice Interview Mode
  interviewMode: 'real' | 'practice' | 'system-design';
  setInterviewMode: (mode: 'real' | 'practice' | 'system-design') => void;
  selectedCompanyId: string | null;
  setSelectedCompanyId: (id: string | null) => void;
  practiceHistory: PracticeSession[];
  addPracticeSession: (session: PracticeSession) => void;
  clearPracticeHistory: () => void;

  // System Design (minimal - just for routing)
  selectedTopicId: string | null;
  setSelectedTopicId: (id: string | null) => void;

  // Custom Problems (LeetCode import / manual)
  customProblems: CustomProblem[];
  addCustomProblem: (problem: CustomProblem) => void;
  removeCustomProblem: (id: string) => void;
  updateCustomProblem: (id: string, updates: Partial<CustomProblem>) => void;

  // Agent disconnect callback (for stopping Gemini Live when ending interview)
  agentDisconnect: (() => void) | null;
  setAgentDisconnect: (fn: (() => void) | null) => void;

  // End interview callback (for agent-triggered interview ending)
  onEndInterview: (() => void) | null;
  setOnEndInterview: (fn: (() => void) | null) => void;
}

export const useInterviewStore = create<InterviewState>()(
  persist(
    (set, get) => ({
      // Session
      status: 'idle',
      interviewStartTime: null,
      startSession: () => set({ status: 'active', interviewStartTime: Date.now() }),
      endSession: () => set({ status: 'completed' }),
      setStatus: (status) => set({ status }),

      // Code
      language: 'python',
      code: "# Write your solution here\nprint('Hello World')",
      workspaceId: null,
      currentProblemId: null,
      setCode: (code) => set({ code }),
      setLanguage: (language) => set({ language }),
      setWorkspaceId: (id) => set({ workspaceId: id }),
      setCurrentProblemId: (id) => set({ currentProblemId: id }),

      // Workspace Status
      workspaceStatus: 'idle',
      workspaceProgress: { step: '', progress: 0 },
      workspaceError: null,
      setWorkspaceStatus: (workspaceStatus) => set({ workspaceStatus }),
      setWorkspaceProgress: (workspaceProgress) => set({ workspaceProgress }),
      setWorkspaceError: (workspaceError) => set({ workspaceError }),

      // Console
      consoleOutput: [],
      addLog: (log, type = 'system') => set((state) => ({
        consoleOutput: [...state.consoleOutput, { type, content: log }]
      })),
      clearLogs: () => set({ consoleOutput: [] }),

      // Analysis
      latestReview: null,
      setReview: (review) => set({ latestReview: review }),

      // CodeRabbit Analysis
      coderabbitReview: null,
      setCodeRabbitReview: (review) => set({ coderabbitReview: review }),

      // Integrity
      integrity: {
        blurCount: 0,
        pasteCount: 0,
        largePasteEvents: []
      },
      addBlurEvent: () => set((state) => ({
        integrity: {
          ...state.integrity,
          blurCount: state.integrity.blurCount + 1
        }
      })),
      addPasteEvent: (length) => set((state) => {
        const isLarge = length > LARGE_PASTE_THRESHOLD;
        return {
          integrity: {
            ...state.integrity,
            pasteCount: state.integrity.pasteCount + 1,
            largePasteEvents: isLarge
              ? [...state.integrity.largePasteEvents, { timestamp: Date.now(), length }]
              : state.integrity.largePasteEvents
          }
        };
      }),
      getIntegrityReport: () => {
        const state = get();
        const { blurCount, pasteCount, largePasteEvents } = state.integrity;
        return `Integrity Report: User has left the tab ${blurCount} times. Detected ${pasteCount} paste events, with ${largePasteEvents.length} large pastes (>${LARGE_PASTE_THRESHOLD} chars).`;
      },

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

      // Test Results
      testResults: [],
      addTestResult: (result) => set((state) => ({
        testResults: [...state.testResults, result]
      })),
      clearTestResults: () => set({ testResults: [] }),

      // Wizard Mode
      isWizardMode: false,
      toggleWizardMode: () => set((state) => ({ isWizardMode: !state.isWizardMode })),

      // Practice Interview Mode
      interviewMode: 'real',
      setInterviewMode: (interviewMode) => set({ interviewMode }),
      selectedCompanyId: null,
      setSelectedCompanyId: (selectedCompanyId) => set({ selectedCompanyId }),
      practiceHistory: [],
      addPracticeSession: (session) => set((state) => ({
        practiceHistory: [...state.practiceHistory, session]
      })),
      clearPracticeHistory: () => set({ practiceHistory: [] }),

      // System Design (minimal - just for routing)
      selectedTopicId: null,
      setSelectedTopicId: (selectedTopicId) => set({ selectedTopicId }),

      // Custom Problems
      customProblems: [],
      addCustomProblem: (problem) => set((state) => ({
        customProblems: [...state.customProblems, problem]
      })),
      removeCustomProblem: (id) => set((state) => ({
        customProblems: state.customProblems.filter(p => p.id !== id)
      })),
      updateCustomProblem: (id, updates) => set((state) => ({
        customProblems: state.customProblems.map(p =>
          p.id === id ? { ...p, ...updates } : p
        )
      })),

      // Agent disconnect callback
      agentDisconnect: null,
      setAgentDisconnect: (fn) => set({ agentDisconnect: fn }),

      // End interview callback
      onEndInterview: null,
      setOnEndInterview: (fn) => set({ onEndInterview: fn }),
    }),
    {
      name: 'interview-storage',
      version: 5,
      storage: createJSONStorage(() => localStorage),
      migrate: (persistedState: unknown, version: number) => {
        const state = persistedState as Partial<InterviewState>;
        if (version === 0) {
          // Migrate from version 0 (no integrity field)
          return {
            ...state,
            integrity: state.integrity || {
              blurCount: 0,
              pasteCount: 0,
              largePasteEvents: []
            }
          };
        }
        if (version === 1) {
          // Migrate from version 1: Fix JavaScript comments in Python code
          const code = state.code || '';
          const language = state.language || 'python';
          if (language === 'python' && code.includes('// Write your solution here')) {
            return {
              ...state,
              code: "# Write your solution here\nprint('Hello World')"
            };
          }
        }
        if (version === 2) {
          // Migrate from version 2: Add workspace status fields
          return {
            ...state,
            workspaceStatus: 'idle',
            workspaceProgress: { step: '', progress: 0 },
            workspaceError: null
          };
        }
        if (version === 3) {
          // Migrate from version 3: Add practice interview mode fields
          return {
            ...state,
            interviewMode: 'real',
            selectedCompanyId: null,
            practiceHistory: []
          };
        }
        if (version === 4) {
          // Migrate from version 4: Add custom problems for LeetCode import
          return {
            ...state,
            customProblems: []
          };
        }
        return state as InterviewState;
      },
      partialize: (state) => ({
        code: state.code,
        language: state.language,
        isWizardMode: state.isWizardMode, // Persist wizard mode preference
        interviewMode: state.interviewMode, // Persist interview mode preference
        selectedCompanyId: state.selectedCompanyId, // Persist selected company for practice mode
        currentProblemId: state.currentProblemId, // Persist current problem
        practiceHistory: state.practiceHistory, // Persist practice history
        customProblems: state.customProblems, // Persist custom problems
        selectedTopicId: state.selectedTopicId, // Persist selected topic for system design routing
      }),
    }
  )
);
