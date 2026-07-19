/**
 * Generic Duolingo lesson screen. Reused by every game (CruiseWord, LinguaPlay, ...).
 * It owns the lesson loop: render exercise -> check -> continue -> complete/review.
 * Game-specific theming is passed via `header` (icon + labels) and gamification
 * callbacks (onCorrect/onIncorrect/onLessonComplete).
 */
import React from "react";
import { useDuoLesson } from "./useDuoLesson";
import type { DuoExercise, DuoHeaderConfig, DuoQuestionResult } from "./types";
import { DuoSelectExerciseView } from "./DuoSelectExercise";
import { DuoWriteExerciseView } from "./DuoWriteExercise";
import { LessonComplete } from "./LessonComplete";
import { ReviewLesson } from "./ReviewLesson";

interface DuoLessonScreenProps {
  exercises: DuoExercise[];
  header: DuoHeaderConfig;
  onExit: () => void;
  hearts?: number | null;
}

export const DuoLessonScreen: React.FC<DuoLessonScreenProps> = ({
  exercises,
  header,
  onExit,
  hearts = null,
}) => {
  const lesson = useDuoLesson({
    exercises,
    onCorrect: header.onCorrect,
    onIncorrect: header.onIncorrect,
    onLessonComplete: header.onLessonComplete,
    onExit,
  });

  if (lesson.isComplete) {
    return (
      <LessonComplete
        correctAnswerCount={lesson.correctAnswerCount}
        incorrectAnswerCount={lesson.incorrectAnswerCount}
        totalQuestions={lesson.totalExercises}
        xpEarned={lesson.correctAnswerCount * 10}
        onContinue={lesson.onContinue}
        onReview={lesson.onReview}
      />
    );
  }

  if (lesson.reviewShown) {
    return (
      <ReviewLesson
        reviewShown={lesson.reviewShown}
        onClose={lesson.onContinue}
        questionResults={lesson.questionResults}
      />
    );
  }

  const exercise = lesson.currentExercise;
  if (!exercise) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">No exercises</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {exercise.type === "SELECT_1_OF_3" ? (
        <DuoSelectExerciseView
          problem={exercise}
          correctAnswerCount={lesson.correctAnswerCount}
          totalCorrectAnswersNeeded={lesson.totalExercises}
          selectedAnswer={lesson.selectedAnswer}
          setSelectedAnswer={lesson.onSelectAnswer}
          correctAnswerShown={lesson.correctAnswerShown}
          isAnswerCorrect={lesson.isAnswerCorrect}
          onCheckAnswer={lesson.onCheckAnswer}
          onFinish={lesson.onFinish}
          onSkip={lesson.onSkip}
          hearts={hearts}
          onQuit={lesson.onQuit}
        />
      ) : (
        <DuoWriteExerciseView
          problem={exercise}
          correctAnswerCount={lesson.correctAnswerCount}
          totalCorrectAnswersNeeded={lesson.totalExercises}
          selectedAnswers={lesson.selectedAnswers}
          setSelectedAnswers={lesson.onToggleTile}
          correctAnswerShown={lesson.correctAnswerShown}
          isAnswerCorrect={lesson.isAnswerCorrect}
          onCheckAnswer={lesson.onCheckAnswer}
          onFinish={lesson.onFinish}
          onSkip={lesson.onSkip}
          hearts={hearts}
          onQuit={lesson.onQuit}
          writeIcon={header.writeIcon}
          writeLabel={header.writeLabel}
        />
      )}
    </div>
  );
};

export default DuoLessonScreen;
