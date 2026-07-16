import React from "react";
import type { SelectExercise } from "@/data/cruiseWordUnits";
import { LessonProgressBar } from "./LessonProgressBar";
import { CheckAnswer } from "./CheckAnswer";

interface ProblemSelect1Of3Props {
  problem: SelectExercise;
  correctAnswerCount: number;
  totalCorrectAnswersNeeded: number;
  selectedAnswer: number | null;
  setSelectedAnswer: React.Dispatch<React.SetStateAction<number | null>>;
  correctAnswerShown: boolean;
  isAnswerCorrect: boolean;
  onCheckAnswer: () => void;
  onFinish: () => void;
  onSkip: () => void;
  hearts: number | null;
  onQuit: () => void;
}

export const ProblemSelect1Of3: React.FC<ProblemSelect1Of3Props> = ({
  problem,
  correctAnswerCount,
  totalCorrectAnswersNeeded,
  selectedAnswer,
  setSelectedAnswer,
  correctAnswerShown,
  isAnswerCorrect,
  onCheckAnswer,
  onFinish,
  onSkip,
  hearts,
  onQuit,
}) => {
  const { prompt, options } = problem;
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
        <section className="flex max-w-2xl grow flex-col gap-5 self-center sm:items-center sm:justify-center sm:gap-24 sm:px-5">
          <h1 className="self-start text-2xl font-bold sm:text-3xl">
            {prompt[lang as "es" | "en"]}
          </h1>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3" role="radiogroup">
            {options.map((answer, i) => {
              const isSelected = i === selectedAnswer;
              const isCorrectOption = answer.correct;
              let className =
                "cursor-pointer rounded-xl border-2 border-b-4 p-6 text-center font-bold transition-all ";
              if (correctAnswerShown) {
                if (isCorrectOption) {
                  className += "border-green-300 bg-green-100 text-green-700 ";
                } else if (isSelected) {
                  className += "border-red-300 bg-red-100 text-red-700 ";
                } else {
                  className += "border-gray-200 bg-white text-gray-500 ";
                }
              } else if (isSelected) {
                className += "border-blue-300 bg-blue-100 text-blue-700 ";
              } else {
                className += "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 ";
              }
              return (
                <div
                  key={i}
                  className={className}
                  role="radio"
                  aria-checked={isSelected}
                  tabIndex={0}
                  onClick={() => !correctAnswerShown && setSelectedAnswer(i)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !correctAnswerShown) setSelectedAnswer(i);
                  }}
                >
                  <h2 className="text-lg">{answer.text}</h2>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <CheckAnswer
        correctAnswer={options.find((o) => o.correct)?.text ?? ""}
        correctAnswerShown={correctAnswerShown}
        isAnswerCorrect={isAnswerCorrect}
        isAnswerSelected={selectedAnswer !== null}
        onCheckAnswer={onCheckAnswer}
        onFinish={onFinish}
        onSkip={onSkip}
      />
    </div>
  );
};

export default ProblemSelect1Of3;
