import React from "react";
import { Trophy, Clock, Star } from "lucide-react";
import type { DuoQuestionResult } from "./types";

interface LessonCompleteProps {
  correctAnswerCount: number;
  incorrectAnswerCount: number;
  totalQuestions: number;
  xpEarned: number;
  onContinue: () => void;
  onReview: () => void;
}

export const LessonComplete: React.FC<LessonCompleteProps> = ({
  correctAnswerCount,
  incorrectAnswerCount,
  totalQuestions,
  xpEarned,
  onContinue,
  onReview,
}) => {
  const pct = totalQuestions > 0
    ? Math.round((correctAnswerCount / totalQuestions) * 100)
    : 0;

  return (
    <div className="flex min-h-screen flex-col gap-5 px-4 py-5 sm:px-0 sm:py-0">
      <div className="flex grow flex-col items-center justify-center gap-8 font-bold">
        <h1 className="text-center text-3xl text-yellow-500">Lesson Complete!</h1>
        <div className="flex flex-wrap justify-center gap-5">
          <div className="min-w-[110px] rounded-xl border-2 border-yellow-400">
            <h2 className="py-1 text-center text-white bg-yellow-400 rounded-t-xl">Total XP</h2>
            <div className="flex justify-center py-4 text-yellow-500 bg-white rounded-b-xl">
              {xpEarned}
            </div>
          </div>
          <div className="min-w-[110px] rounded-xl border-2 border-blue-400">
            <h2 className="py-1 text-center text-white bg-blue-400 rounded-t-xl">Correct</h2>
            <div className="flex justify-center py-4 text-blue-500 bg-white rounded-b-xl">
              {correctAnswerCount}/{totalQuestions}
            </div>
          </div>
          <div className="min-w-[110px] rounded-xl border-2 border-green-400">
            <h2 className="py-1 text-center text-white bg-green-400 rounded-t-xl">Accuracy</h2>
            <div className="flex justify-center py-4 text-green-500 bg-white rounded-b-xl">
              {pct}%
            </div>
          </div>
        </div>
      </div>
      <section className="border-gray-200 sm:border-t-2 sm:p-10">
        <div className="mx-auto flex max-w-5xl sm:justify-between">
          <button
            className="hidden rounded-2xl border-2 border-b-4 border-gray-200 bg-white p-3 font-bold uppercase text-gray-400 transition hover:border-gray-300 hover:bg-gray-200 sm:block sm:min-w-[150px] sm:max-w-fit"
            onClick={onReview}
          >
            Review
          </button>
          <button
            className="flex w-full items-center justify-center rounded-2xl border-b-4 border-green-600 bg-green-500 p-3 font-bold uppercase text-white transition hover:brightness-105 sm:min-w-[150px] sm:max-w-fit"
            onClick={onContinue}
          >
            Continue
          </button>
        </div>
      </section>
    </div>
  );
};

export default LessonComplete;
