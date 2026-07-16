import { useCallback, useState } from "react";
import {
  CruiseWordExercise,
  CruiseWordTile,
  CruiseWordUnit,
} from "@/data/cruiseWordUnits";
import { useCruiseWordStore, QuestionResult } from "@/stores/cruiseWordStore";

export interface UseCruiseWordLessonReturn {
  // State
  currentExerciseIndex: number;
  selectedAnswer: number | null;
  selectedAnswers: number[];
  correctAnswerShown: boolean;
  correctAnswerCount: number;
  incorrectAnswerCount: number;
  isAnswerCorrect: boolean;
  reviewShown: boolean;
  questionResults: QuestionResult[];
  isComplete: boolean;
  currentExercise: CruiseWordExercise | null;
  totalExercises: number;

  // Actions
  onSelectAnswer: (index: number) => void;
  onToggleTile: (index: number) => void;
  onCheckAnswer: () => void;
  onFinish: () => void;
  onSkip: () => void;
  onQuit: () => void;
  onReview: () => void;
  onContinue: () => void;
}

/**
 * Core lesson logic hook for CruiseWord Duolingo-style exercises.
 * Manages exercise progression, answer validation, hearts, and XP.
 */
export function useCruiseWordLesson(
  unit: CruiseWordUnit,
  tile: CruiseWordTile,
  onExit: () => void,
): UseCruiseWordLessonReturn {
  const exercises = tile.exercises;
  const totalExercises = exercises.length;

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [correctAnswerShown, setCorrectAnswerShown] = useState(false);
  const [correctAnswerCount, setCorrectAnswerCount] = useState(0);
  const [incorrectAnswerCount, setIncorrectAnswerCount] = useState(0);
  const [reviewShown, setReviewShown] = useState(false);
  const [questionResults, setQuestionResults] = useState<QuestionResult[]>([]);

  const store = useCruiseWordStore();

  const currentExercise = exercises[currentExerciseIndex] ?? null;
  const isComplete =
    correctAnswerCount + incorrectAnswerCount >= totalExercises &&
    correctAnswerShown;

  const resetExerciseState = useCallback(() => {
    setSelectedAnswer(null);
    setSelectedAnswers([]);
    setCorrectAnswerShown(false);
  }, []);

  const computeIsCorrect = useCallback((): boolean => {
    if (!currentExercise) return false;
    if (currentExercise.type === "SELECT_1_OF_3") {
      const opt = currentExercise.options[selectedAnswer ?? -1];
      return !!opt?.correct;
    } else {
      // WRITE_TRANSLATION
      const joined = selectedAnswers
        .map((i) => currentExercise.answerTiles[i])
        .join(" ");
      return joined === currentExercise.answer;
    }
  }, [currentExercise, selectedAnswer, selectedAnswers]);

  const isAnswerCorrect = computeIsCorrect();

  const recordResult = useCallback(() => {
    if (!currentExercise) return;
    const yourResponse =
      currentExercise.type === "SELECT_1_OF_3"
        ? currentExercise.options[selectedAnswer ?? 0]?.text ?? ""
        : selectedAnswers
            .map((i) => currentExercise.answerTiles[i])
            .join(" ");
    const correctResponse =
      currentExercise.type === "SELECT_1_OF_3"
        ? currentExercise.correct
        : currentExercise.answer;

    const result: QuestionResult = {
      question:
        currentExercise.prompt[
          (document.documentElement.lang === "es" ? "es" : "en") as "es" | "en"
        ],
      yourResponse,
      correctResponse,
      isCorrect: isAnswerCorrect,
    };
    setQuestionResults((prev) => [...prev, result]);
    store.addQuestionResult(result);
  }, [currentExercise, selectedAnswer, selectedAnswers, isAnswerCorrect, store]);

  const onCheckAnswer = useCallback(() => {
    if (!currentExercise) return;
    setCorrectAnswerShown(true);
    if (isAnswerCorrect) {
      setCorrectAnswerCount((c) => c + 1);
      store.increaseXp(10);
    } else {
      setIncorrectAnswerCount((c) => c + 1);
      store.loseHeart();
    }
    recordResult();
  }, [currentExercise, isAnswerCorrect, store, recordResult]);

  const onFinish = useCallback(() => {
    if (currentExerciseIndex + 1 < totalExercises) {
      setCurrentExerciseIndex((i) => i + 1);
      resetExerciseState();
    } else {
      // Lesson finished
      if (isAnswerCorrect || incorrectAnswerCount > 0) {
        store.markLessonComplete(unit.unitNumber, tile.title.length);
        store.increaseLingots(1);
        store.addToday();
      }
    }
  }, [
    currentExerciseIndex,
    totalExercises,
    resetExerciseState,
    isAnswerCorrect,
    incorrectAnswerCount,
    store,
    unit.unitNumber,
    tile.title,
  ]);

  const onSkip = useCallback(() => {
    setCorrectAnswerShown(true);
    store.loseHeart();
  }, [store]);

  const onQuit = useCallback(() => {
    onExit();
  }, [onExit]);

  const onReview = useCallback(() => setReviewShown(true), []);
  const onContinue = useCallback(() => {
    setReviewShown(false);
    onExit();
  }, [onExit]);

  const onSelectAnswer = useCallback(
    (index: number) => {
      if (!correctAnswerShown) setSelectedAnswer(index);
    },
    [correctAnswerShown],
  );

  const onToggleTile = useCallback(
    (index: number) => {
      if (correctAnswerShown) return;
      setSelectedAnswers((prev) =>
        prev.includes(index)
          ? prev.filter((x) => x !== index)
          : [...prev, index],
      );
    },
    [correctAnswerShown],
  );

  return {
    currentExerciseIndex,
    selectedAnswer,
    selectedAnswers,
    correctAnswerShown,
    correctAnswerCount,
    incorrectAnswerCount,
    isAnswerCorrect,
    reviewShown,
    questionResults,
    isComplete,
    currentExercise,
    totalExercises,
    onSelectAnswer,
    onToggleTile,
    onCheckAnswer,
    onFinish,
    onSkip,
    onQuit,
    onReview,
    onContinue,
  };
}

export default useCruiseWordLesson;
