import React from "react";
import type { WriteExercise } from "@/data/cruiseWordUnits";
import { LessonProgressBar } from "./LessonProgressBar";
import { CheckAnswer } from "./CheckAnswer";

interface ProblemWriteInEnglishProps {
  problem: WriteExercise;
  correctAnswerCount: number;
  totalCorrectAnswersNeeded: number;
  selectedAnswers: number[];
  setSelectedAnswers: React.Dispatch<React.SetStateAction<number[]>>;
  correctAnswerShown: boolean;
  isAnswerCorrect: boolean;
  onCheckAnswer: () => void;
  onFinish: () => void;
  onSkip: () => void;
  hearts: number | null;
  onQuit: () => void;
}

export const ProblemWriteInEnglish: React.FC<ProblemWriteInEnglishProps> = ({
  problem,
  correctAnswerCount,
  totalCorrectAnswersNeeded,
  selectedAnswers,
  setSelectedAnswers,
  correctAnswerShown,
  isAnswerCorrect,
  onCheckAnswer,
  onFinish,
  onSkip,
  hearts,
  onQuit,
}) => {
  const { prompt, answerTiles, correctOrder } = problem;
  const lang = document.documentElement.lang === "es" ? "es" : "en";

  return (
    <div className="flex min-h-screen flex-col gap-5 px-4 py-5 sm:px-0 sm:py-0">
      <div className="flex grow flex-col items-center gap-5">
        <div className="w-full max-w-5xl sm:mt-8 sm:px-5">
          <LessonProgressBar
            correctAnswerCount={correctAnswerCount}
            totalCorrectAnswersNeeded={totalCorrectAnswersNeeded}
            onQuit={onQuit}
            hearts={hearts}
          />
        </div>
        <section className="flex max-w-2xl grow flex-col gap-5 self-center sm:items-center sm:justify-center sm:gap-24">
          <h1 className="mb-2 text-2xl font-bold sm:text-3xl">
            {lang === "es" ? "Escribe esto en inglés" : "Write this in English"}
          </h1>

          <div className="w-full">
            <div className="flex items-center gap-2 px-2">
              <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-2xl">
                {"🚢"}
              </div>
              <div className="relative ml-2 w-fit rounded-2xl border-2 border-gray-200 p-4">
                {prompt[lang as "es" | "en"]}
                <div
                  className="absolute h-4 w-4 rotate-45 border-b-2 border-l-2 border-gray-200 bg-white"
                  style={{ top: "calc(50% - 8px)", left: "-10px" }}
                ></div>
              </div>
            </div>

            {/* Selected answer tray */}
            <div className="flex min-h-[60px] flex-wrap gap-1 border-b-2 border-t-2 border-gray-200 py-1 mt-4">
              {selectedAnswers.map((i) => (
                <button
                  key={i}
                  className="rounded-2xl border-2 border-b-4 border-gray-200 bg-white p-2 text-gray-700 hover:bg-gray-50 transition"
                  onClick={() =>
                    !correctAnswerShown &&
                    setSelectedAnswers((prev) => prev.filter((x) => x !== i))
                  }
                >
                  {answerTiles[i]}
                </button>
              ))}
            </div>
          </div>

          {/* Word bank */}
          <div className="flex flex-wrap justify-center gap-1">
            {answerTiles.map((tile, i) => (
              <button
                key={i}
                className={
                  selectedAnswers.includes(i)
                    ? "rounded-2xl border-2 border-b-4 border-gray-200 bg-gray-200 p-2 text-gray-200 cursor-not-allowed"
                    : "rounded-2xl border-2 border-b-4 border-gray-200 bg-white p-2 text-gray-700 hover:bg-gray-50 transition"
                }
                disabled={selectedAnswers.includes(i)}
                onClick={() =>
                  !correctAnswerShown &&
                  setSelectedAnswers((prev) =>
                    prev.includes(i) ? prev : [...prev, i],
                  )
                }
              >
                {tile}
              </button>
            ))}
          </div>
        </section>
      </div>

      <CheckAnswer
        correctAnswer={correctOrder.map((i) => answerTiles[i]).join(" ")}
        correctAnswerShown={correctAnswerShown}
        isAnswerCorrect={isAnswerCorrect}
        isAnswerSelected={selectedAnswers.length > 0}
        onCheckAnswer={onCheckAnswer}
        onFinish={onFinish}
        onSkip={onSkip}
      />
    </div>
  );
};

export default ProblemWriteInEnglish;
