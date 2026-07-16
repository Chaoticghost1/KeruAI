import { useLocation } from "wouter";
import { useCruiseWordStore } from "@/stores/cruiseWordStore";
import { getUnit } from "@/data/cruiseWordUnits";
import { useCruiseWordLesson } from "@/hooks/useCruiseWordLesson";
import {
  ProblemSelect1Of3,
  ProblemWriteInEnglish,
  LessonComplete,
  ReviewLesson,
} from "@/components/cruiseword/duolingo";

export default function CruiseWordLesson() {
  const [location, navigate] = useLocation();
  const search = new URLSearchParams(window.location.search);
  const unitNumber = Number(search.get("unit") ?? "1");
  const tileIndex = Number(search.get("tile") ?? "0");

  const unit = getUnit(unitNumber);
  const store = useCruiseWordStore();

  const handleExit = () => {
    navigate("/games/cruiseword/learn");
  };

  if (!unit || !unit.tiles[tileIndex]) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Lesson not found</p>
      </div>
    );
  }

  const tile = unit.tiles[tileIndex];
  const lesson = useCruiseWordLesson(unit, tile, handleExit);

  // Lesson complete screen
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

  // Review modal
  if (lesson.reviewShown) {
    return (
      <ReviewLesson
        reviewShown={lesson.reviewShown}
        onClose={() => lesson.onContinue()}
        questionResults={lesson.questionResults}
      />
    );
  }

  // Exercise screens
  if (!lesson.currentExercise) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">No exercises</p>
      </div>
    );
  }

  const exercise = lesson.currentExercise;

  return (
    <div className="min-h-screen bg-gray-50">
      {exercise.type === "SELECT_1_OF_3" ? (
        <ProblemSelect1Of3
          problem={exercise}
          correctAnswerCount={lesson.correctAnswerCount}
          totalCorrectAnswersNeeded={lesson.totalExercises}
          selectedAnswer={lesson.selectedAnswer}
          setSelectedAnswer={lesson.onSelectAnswer as any}
          correctAnswerShown={lesson.correctAnswerShown}
          isAnswerCorrect={lesson.isAnswerCorrect}
          onCheckAnswer={lesson.onCheckAnswer}
          onFinish={lesson.onFinish}
          onSkip={lesson.onSkip}
          hearts={store.hearts}
          onQuit={lesson.onQuit}
        />
      ) : (
        <ProblemWriteInEnglish
          problem={exercise}
          correctAnswerCount={lesson.correctAnswerCount}
          totalCorrectAnswersNeeded={lesson.totalExercises}
          selectedAnswers={lesson.selectedAnswers}
          setSelectedAnswers={lesson.onToggleTile as any}
          correctAnswerShown={lesson.correctAnswerShown}
          isAnswerCorrect={lesson.isAnswerCorrect}
          onCheckAnswer={lesson.onCheckAnswer}
          onFinish={lesson.onFinish}
          onSkip={lesson.onSkip}
          hearts={store.hearts}
          onQuit={lesson.onQuit}
        />
      )}
    </div>
  );
}
