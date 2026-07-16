/**
 * Zustand store for CruiseWord Duolingo-style lesson state.
 * Tracks hearts, XP, streak, completed lessons, and offline sync.
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface LessonProgress {
  unitNumber: number;
  tileIndex: number;
  completed: boolean;
}

export interface QuestionResult {
  question: string;
  yourResponse: string;
  correctResponse: string;
  isCorrect: boolean;
}

interface CruiseWordState {
  // Progress
  lessonsCompleted: number;
  currentUnit: number;
  currentTile: number;

  // Currency / gamification
  xp: number;
  lingots: number; // Duolingo "gems"
  streak: number;
  hearts: number;
  maxHearts: number;

  // Session state
  completedLessons: Record<string, boolean>; // key: `${unit}-${tile}`
  questionResults: QuestionResult[];

  // Actions
  increaseXp: (amount: number) => void;
  increaseLingots: (amount: number) => void;
  increaseLessonsCompleted: (amount?: number) => void;
  addToday: () => void;
  jumpToUnit: (unitNumber: number) => void;
  resetHearts: () => void;
  loseHeart: () => void;
  markLessonComplete: (unit: number, tile: number) => void;
  addQuestionResult: (result: QuestionResult) => void;
  clearQuestionResults: () => void;
  resetProgress: () => void;
}

export const useCruiseWordStore = create<CruiseWordState>()(
  persist(
    (set) => ({
      lessonsCompleted: 0,
      currentUnit: 1,
      currentTile: 0,

      xp: 0,
      lingots: 0,
      streak: 0,
      hearts: 3,
      maxHearts: 3,

      completedLessons: {},
      questionResults: [],

      increaseXp: (amount) => set((state) => ({ xp: state.xp + amount })),

      increaseLingots: (amount) => set((state) => ({ lingots: state.lingots + amount })),

      increaseLessonsCompleted: (amount = 1) =>
        set((state) => ({ lessonsCompleted: state.lessonsCompleted + amount })),

      addToday: () => set((state) => ({ streak: state.streak + 1 })),

      jumpToUnit: (unitNumber) =>
        set({ currentUnit: unitNumber, currentTile: 0 }),

      resetHearts: () => set((state) => ({ hearts: state.maxHearts })),

      loseHeart: () =>
        set((state) => ({ hearts: Math.max(0, state.hearts - 1) })),

      markLessonComplete: (unit, tile) =>
        set((state) => {
          const key = `${unit}-${tile}`;
          if (state.completedLessons[key]) return state;
          return {
            completedLessons: { ...state.completedLessons, [key]: true },
            lessonsCompleted: state.lessonsCompleted + 1,
          };
        }),

      addQuestionResult: (result) =>
        set((state) => ({ questionResults: [...state.questionResults, result] })),

      clearQuestionResults: () => set({ questionResults: [] }),

      resetProgress: () =>
        set({
          lessonsCompleted: 0,
          currentUnit: 1,
          currentTile: 0,
          xp: 0,
          lingots: 0,
          streak: 0,
          hearts: 3,
          completedLessons: {},
          questionResults: [],
        }),
    }),
    {
      name: 'cruiseword-progress',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        lessonsCompleted: state.lessonsCompleted,
        currentUnit: state.currentUnit,
        xp: state.xp,
        lingots: state.lingots,
        streak: state.streak,
        completedLessons: state.completedLessons,
      }),
    },
  ),
);
