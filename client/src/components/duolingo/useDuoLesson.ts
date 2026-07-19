/**
 * Generic Duolingo lesson engine. Game-agnostic: takes a list of DuoExercise plus
 * optional gamification callbacks, and returns UI-ready state/actions.
 *
 * Reused by every game (CruiseWord, LinguaPlay, ...) so they share the exact same
 * Duolingo experience without duplication.
 */
import { useCallback, useState } from "react";
import type {
  DuoExercise,
  DuoLang,
  DuoLessonState,
  DuoQuestionResult,
} from "./types";

function currentLang(): DuoLang {
  return (document.documentElement.lang === "es" ? "es" : "en") as DuoLang;
}

export interface UseDuoLessonArgs {
  exercises: DuoExercise[];
  onCorrect?: () => void;
  onIncorrect?: () => void;
  onLessonComplete?: (results: DuoQuestionResult[]) => void;
  onExit: () => void;
}

export function useDuoLesson({
  exercises,
  onCorrect,
  onIncorrect,
  onLessonComplete,
  onExit,
}: UseDuoLessonArgs): DuoLessonState {
  const totalExercises = exercises.length;

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [correctAnswerShown, setCorrectAnswerShown] = useState(false);
  const [correctAnswerCount, setCorrectAnswerCount] = useState(0);
  const [incorrectAnswerCount, setIncorrectAnswerCount] = useState(0);
  const [reviewShown, setReviewShown] = useState(false);
  const [questionResults, setQuestionResults] = useState<DuoQuestionResult[]>([]);

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
    }
    const joined = selectedAnswers
      .map((i) => currentExercise.answerTiles[i])
      .join(" ");
    return joined === currentExercise.answer;
  }, [currentExercise, selectedAnswer, selectedAnswers]);

  const isAnswerCorrect = computeIsCorrect();

  const recordResult = useCallback(() => {
    if (!currentExercise) return;
    const lang = currentLang();
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
    const result: DuoQuestionResult = {
      question: currentExercise.prompt[lang],
      yourResponse,
      correctResponse,
      isCorrect: isAnswerCorrect,
    };
    setQuestionResults((prev) => [...prev, result]);
  }, [currentExercise, selectedAnswer, selectedAnswers, isAnswerCorrect]);

  const onCheckAnswer = useCallback(() => {
    if (!currentExercise) return;
    setCorrectAnswerShown(true);
    if (isAnswerCorrect) {
      setCorrectAnswerCount((c) => c + 1);
      onCorrect?.();
    } else {
      setIncorrectAnswerCount((c) => c + 1);
      onIncorrect?.();
    }
    recordResult();
  }, [currentExercise, isAnswerCorrect, onCorrect, onIncorrect, recordResult]);

  const onFinish = useCallback(() => {
    if (currentExerciseIndex + 1 < totalExercises) {
      setCurrentExerciseIndex((i) => i + 1);
      resetExerciseState();
    } else if (isAnswerCorrect || incorrectAnswerCount > 0) {
      onLessonComplete?.(questionResults);
    }
  }, [
    currentExerciseIndex,
    totalExercises,
    resetExerciseState,
    isAnswerCorrect,
    incorrectAnswerCount,
    onLessonComplete,
    questionResults,
  ]);

  const onSkip = useCallback(() => {
    setCorrectAnswerShown(true);
    onIncorrect?.();
  }, [onIncorrect]);

  const onQuit = useCallback(() => onExit(), [onExit]);

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

export default useDuoLesson;
