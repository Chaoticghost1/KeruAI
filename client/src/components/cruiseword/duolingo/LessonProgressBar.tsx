import React from "react";
import { X, Heart } from "lucide-react";

interface LessonProgressBarProps {
  correctAnswerCount: number;
  totalCorrectAnswersNeeded: number;
  onQuit: () => void;
  hearts: number | null;
}

export const LessonProgressBar: React.FC<LessonProgressBarProps> = ({
  correctAnswerCount,
  totalCorrectAnswersNeeded,
  onQuit,
  hearts,
}) => {
  const pct = totalCorrectAnswersNeeded > 0
    ? (correctAnswerCount / totalCorrectAnswersNeeded) * 100
    : 0;

  return (
    <header className="flex items-center gap-4">
      <button
        className="text-gray-400 hover:text-gray-600 transition-colors"
        onClick={onQuit}
        aria-label="Exit lesson"
      >
        <X className="w-6 h-6" />
      </button>
      <div
        className="h-4 grow rounded-full bg-gray-200 overflow-hidden"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
      >
        <div
          className="h-full rounded-full bg-green-500 transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
      {hearts !== null &&
        [1, 2, 3].map((heart) => (
          <Heart
            key={heart}
            className={`w-6 h-6 ${heart <= hearts ? "text-red-500 fill-red-500" : "text-gray-300"}`}
          />
        ))}
    </header>
  );
};

export default LessonProgressBar;
