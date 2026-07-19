/**
 * Generic Duolingo-style exercise types shared by all games (CruiseWord, LinguaPlay, etc.).
 * These are intentionally decoupled from any specific game's data so the same UI can be reused.
 */
import type { ReactNode } from "react";

export type DuoLang = "es" | "en";

/** A "pick 1 of N" choice question. */
export interface DuoSelectExercise {
  id: string;
  type: "SELECT_1_OF_3";
  /** Prompt shown to the user, per language. */
  prompt: { es: string; en: string };
  /** Choices; exactly one has correct=true. */
  options: { text: string; correct: boolean }[];
  correct: string;
}

/** A "build the translation from word tiles" question. */
export interface DuoWriteExercise {
  id: string;
  type: "WRITE_TRANSLATION";
  prompt: { es: string; en: string };
  /** The target word/phrase the user must build. */
  answer: string;
  /** Tiles available in the word bank. */
  answerTiles: string[];
  /** Correct tile order (indices into answerTiles). */
  correctOrder: number[];
}

export type DuoExercise = DuoSelectExercise | DuoWriteExercise;

export interface DuoQuestionResult {
  question: string;
  yourResponse: string;
  correctResponse: string;
  isCorrect: boolean;
}

/** Result returned by the generic lesson hook. */
export interface DuoLessonState {
  currentExerciseIndex: number;
  selectedAnswer: number | null;
  selectedAnswers: number[];
  correctAnswerShown: boolean;
  correctAnswerCount: number;
  incorrectAnswerCount: number;
  isAnswerCorrect: boolean;
  reviewShown: boolean;
  questionResults: DuoQuestionResult[];
  isComplete: boolean;
  currentExercise: DuoExercise | null;
  totalExercises: number;

  onSelectAnswer: (index: number) => void;
  onToggleTile: (index: number) => void;
  onCheckAnswer: () => void;
  onFinish: () => void;
  onSkip: () => void;
  onQuit: () => void;
  onReview: () => void;
  onContinue: () => void;
}

export interface DuoHeaderConfig {
  /** Emoji/glyph shown on the WRITE_TRANSLATION bubble (per game, e.g. 🚢 or 🗣️). */
  writeIcon: ReactNode;
  /** Label above the WRITE_TRANSLATION prompt, per language. */
  writeLabel: { es: string; en: string };
  /** Called when a question is answered correctly (for XP/hearts/gamification). */
  onCorrect?: () => void;
  /** Called when a question is answered incorrectly. */
  onIncorrect?: () => void;
  /** Called when a lesson is fully completed. */
  onLessonComplete?: (results: DuoQuestionResult[]) => void;
}

export const DUO_SELECT_TYPE = "SELECT_1_OF_3" as const;
export const DUO_WRITE_TYPE = "WRITE_TRANSLATION" as const;
