/**
 * Zustand store for LinguaPlay Duolingo-style lesson state.
 * Tracks hearts, XP, streak, completed lessons, and offline sync (mirrors cruiseWordStore).
 */
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface LinguaPlayState {
  lessonsCompleted: number;
  currentUnit: number;
  currentTile: number;
  xp: number;
  lingots: number;
  streak: number;
  hearts: number;
  maxHearts: number;
  completedLessons: Record<string, boolean>;

  increaseXp: (amount: number) => void;
  increaseLingots: (amount: number) => void;
  addToday: () => void;
  resetHearts: () => void;
  loseHeart: () => void;
  markLessonComplete: (unit: number, tile: number) => void;
  resetProgress: () => void;
}

export const useLinguaPlayStore = create<LinguaPlayState>()(
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

      increaseXp: (amount) => set((state) => ({ xp: state.xp + amount })),
      increaseLingots: (amount) => set((state) => ({ lingots: state.lingots + amount })),
      addToday: () => set((state) => ({ streak: state.streak + 1 })),
      resetHearts: () => set((state) => ({ hearts: state.maxHearts })),
      loseHeart: () => set((state) => ({ hearts: Math.max(0, state.hearts - 1) })),
      markLessonComplete: (unit, tile) =>
        set((state) => {
          const key = `${unit}-${tile}`;
          if (state.completedLessons[key]) return state;
          return {
            completedLessons: { ...state.completedLessons, [key]: true },
            lessonsCompleted: state.lessonsCompleted + 1,
          };
        }),
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
        }),
    }),
    {
      name: "linguaplay-progress",
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
