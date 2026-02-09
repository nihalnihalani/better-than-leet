import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// A single completed interview record
export interface CompletedInterview {
  id: string;
  timestamp: number;
  mode: 'coding' | 'practice' | 'system-design' | 'behavioral';
  topicOrProblem: string; // topic title or problem title
  score: number; // 0-100
  duration: number; // milliseconds
  categoryScores: {
    coding?: number;
    systemDesign?: number;
    behavioral?: number;
    communication?: number;
    problemSolving?: number;
  };
}

// Daily streak record
interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastPracticeDate: string; // YYYY-MM-DD
}

interface ProgressState {
  // All completed interviews
  completedInterviews: CompletedInterview[];
  addCompletedInterview: (interview: CompletedInterview) => void;

  // Streak tracking
  streak: StreakData;
  updateStreak: () => void;

  // XP points
  xp: number;
  addXp: (amount: number) => void;

  // Derived helpers (not persisted - computed on the fly)
}

function getTodayStr(): string {
  return new Date().toISOString().split('T')[0];
}

function getYesterdayStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set) => ({
      completedInterviews: [],
      addCompletedInterview: (interview) =>
        set((state) => ({
          completedInterviews: [...state.completedInterviews, interview].slice(-200),
        })),

      streak: {
        currentStreak: 0,
        longestStreak: 0,
        lastPracticeDate: '',
      },
      updateStreak: () => {
        const today = getTodayStr();
        const yesterday = getYesterdayStr();
        set((state) => {
          const { lastPracticeDate, currentStreak, longestStreak } = state.streak;

          if (lastPracticeDate === today) {
            // Already practiced today - no change
            return state;
          }

          let newStreak: number;
          if (lastPracticeDate === yesterday) {
            // Consecutive day
            newStreak = currentStreak + 1;
          } else {
            // Streak broken or first session
            newStreak = 1;
          }

          const newLongest = Math.max(longestStreak, newStreak);

          return {
            streak: {
              currentStreak: newStreak,
              longestStreak: newLongest,
              lastPracticeDate: today,
            },
          };
        });
      },

      xp: 0,
      addXp: (amount) =>
        set((state) => ({
          xp: state.xp + amount,
        })),
    }),
    {
      name: 'progress-storage',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        completedInterviews: state.completedInterviews,
        streak: state.streak,
        xp: state.xp,
      }),
    },
  ),
);

// --- Pure utility functions (not stored, computed from state) ---

export function getReadinessScore(interviews: CompletedInterview[]): number {
  if (interviews.length === 0) return 0;

  // Weight recent interviews more heavily (last 10)
  const recent = interviews.slice(-10);
  const avgScore = recent.reduce((sum, i) => sum + i.score, 0) / recent.length;

  // Breadth bonus: have they practiced multiple modes?
  const modes = new Set(recent.map((i) => i.mode));
  const breadthBonus = Math.min(15, modes.size * 5); // up to 15 points for 3 modes

  // Consistency bonus: more sessions = more ready (diminishing returns)
  const consistencyBonus = Math.min(10, Math.floor(Math.sqrt(interviews.length) * 2));

  return Math.min(100, Math.round(avgScore + breadthBonus + consistencyBonus));
}

export function getCategoryAverages(interviews: CompletedInterview[]): {
  coding: number;
  systemDesign: number;
  behavioral: number;
  communication: number;
} {
  const categories = { coding: [] as number[], systemDesign: [] as number[], behavioral: [] as number[], communication: [] as number[] };

  for (const i of interviews.slice(-20)) {
    if (i.categoryScores.coding != null) categories.coding.push(i.categoryScores.coding);
    if (i.categoryScores.systemDesign != null) categories.systemDesign.push(i.categoryScores.systemDesign);
    if (i.categoryScores.behavioral != null) categories.behavioral.push(i.categoryScores.behavioral);
    if (i.categoryScores.communication != null) categories.communication.push(i.categoryScores.communication);
  }

  const avg = (arr: number[]) => (arr.length === 0 ? 0 : Math.round(arr.reduce((s, v) => s + v, 0) / arr.length));

  return {
    coding: avg(categories.coding),
    systemDesign: avg(categories.systemDesign),
    behavioral: avg(categories.behavioral),
    communication: avg(categories.communication),
  };
}

export function getScoreTrend(interviews: CompletedInterview[]): number[] {
  return interviews.slice(-10).map((i) => i.score);
}

export function getWeakestCategory(interviews: CompletedInterview[]): string | null {
  const avgs = getCategoryAverages(interviews);
  const entries = Object.entries(avgs).filter(([, v]) => v > 0);
  if (entries.length === 0) return null;
  entries.sort((a, b) => a[1] - b[1]);
  return entries[0][0];
}

export function xpForSession(score: number, duration: number): number {
  // Base XP from score (0-100 maps to 10-100 XP)
  const scoreXp = Math.round(10 + (score / 100) * 90);
  // Duration bonus: up to 30 XP for 30+ min sessions
  const durationMin = duration / 60000;
  const durationXp = Math.min(30, Math.round(durationMin));
  return scoreXp + durationXp;
}
