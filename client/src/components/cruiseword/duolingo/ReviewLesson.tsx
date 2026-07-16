import React, { useState } from "react";
import { Check, X } from "lucide-react";
import type { QuestionResult } from "@/stores/cruiseWordStore";

interface ReviewLessonProps {
  reviewShown: boolean;
  onClose: () => void;
  questionResults: QuestionResult[];
}

export const ReviewLesson: React.FC<ReviewLessonProps> = ({
  reviewShown,
  onClose,
  questionResults,
}) => {
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionResult | null>(null);

  return (
    <div
      className={[
        "fixed inset-0 flex items-center justify-center p-5 transition duration-300 z-50",
        reviewShown ? "" : "pointer-events-none opacity-0",
      ].join(" ")}
    >
      <div
        className={[
          "absolute inset-0 bg-black",
          reviewShown ? "opacity-75" : "pointer-events-none opacity-0",
        ].join(" ")}
        onClick={onClose}
      />
      <div className="relative flex w-full max-w-4xl flex-col gap-5 rounded-2xl border-2 border-gray-200 bg-white p-8">
        <button
          className="absolute -right-5 -top-5 rounded-full border-2 border-gray-200 bg-gray-100 p-1 text-gray-400 hover:brightness-90"
          onClick={onClose}
          aria-label="Close"
        >
          <X className="h-8 w-8" />
        </button>
        <h2 className="text-center text-3xl font-bold">Check out your scorecard!</h2>
        <p className="text-center text-xl text-gray-400">
          Click the tiles below to reveal the solutions
        </p>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 max-h-[60vh] overflow-y-auto">
          {questionResults.map((result, i) => (
            <button
              key={i}
              className={[
                "relative flex flex-col items-stretch gap-3 rounded-xl p-5 text-left transition",
                result.isCorrect
                  ? "bg-yellow-100 text-yellow-600"
                  : "bg-red-100 text-red-500",
              ].join(" ")}
              onClick={() =>
                setSelectedQuestion((prev) =>
                  prev === result ? null : result,
                )
              }
            >
              <div className="flex justify-between gap-2">
                <h3 className="font-bold text-sm">{result.question}</h3>
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white">
                  {result.isCorrect ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <X className="h-5 w-5" />
                  )}
                </div>
              </div>
              <div className="text-sm">{result.yourResponse}</div>
              {selectedQuestion === result && (
                <div className="absolute left-1 right-1 top-20 z-10 rounded-2xl border-2 border-gray-200 bg-white p-3 text-sm">
                  <div
                    className="absolute -top-2 h-3 w-3 rotate-45 border-l-2 border-t-2 border-gray-200 bg-white"
                    style={{ left: "calc(50% - 6px)" }}
                  />
                  <div className="font-bold uppercase text-gray-400">Your response:</div>
                  <div className="mb-3 text-gray-700">{result.yourResponse}</div>
                  <div className="font-bold uppercase text-gray-400">Correct response:</div>
                  <div className="text-gray-700">{result.correctResponse}</div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReviewLesson;
