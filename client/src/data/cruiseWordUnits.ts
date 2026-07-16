/**
 * CruiseWord Duolingo-style units structure.
 * Transforms CRUISEWORD_LEVELS into a Duolingo learning path:
 * 6 levels -> 6 units, each level's words -> tiles (lessons).
 *
 * Exercise types:
 *  - SELECT_1_OF_3: Show definition, pick correct word from 3 options
 *  - WRITE_IN_ENGLISH: Show Spanish/English prompt, build translation from tiles
 */
import { CRUISEWORD_LEVELS } from "./cruiseWordLevels";

export type ExerciseType = "SELECT_1_OF_3" | "WRITE_TRANSLATION";

export interface SelectExercise {
  id: string;
  type: "SELECT_1_OF_3";
  /** The definition/prompt shown to the user */
  prompt: { es: string; en: string };
  /** The 3 options (one correct + 2 distractors) */
  options: { text: string; correct: boolean }[];
  correct: string;
}

export interface WriteExercise {
  id: string;
  type: "WRITE_TRANSLATION";
  /** Prompt shown (source language) */
  prompt: { es: string; en: string };
  /** Target word to build */
  answer: string;
  /** Word tiles available to the user */
  answerTiles: string[];
  /** Correct tile order (indices into answerTiles) */
  correctOrder: number[];
}

export type CruiseWordExercise = SelectExercise | WriteExercise;

export interface CruiseWordTile {
  type: "lesson" | "treasure" | "review";
  title: string;
  exercises: CruiseWordExercise[];
}

export interface CruiseWordUnit {
  unitNumber: number;
  name: { es: string; en: string };
  description: { es: string; en: string };
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  tiles: CruiseWordTile[];
}

const UNIT_COLORS = [
  { bg: "bg-[#58cc02]", text: "text-[#58cc02]", border: "border-[#46a302]" },
  { bg: "bg-[#ce82ff]", text: "text-[#ce82ff]", border: "border-[#a568cc]" },
  { bg: "bg-[#00cd9c]", text: "text-[#00cd9c]", border: "border-[#00a47d]" },
  { bg: "bg-[#ff9600]", text: "text-[#ff9600]", border: "border-[#cc7800]" },
  { bg: "bg-[#1cb0f6]", text: "text-[#1cb0f6]", border: "border-[#1487c2]" },
  { bg: "bg-[#ff4b4b]", text: "text-[#ff4b4b]", border: "border-[#cc3c3c]" },
];

/** Build a SELECT_1_OF_3 exercise from a level word. */
function buildSelect(question: { es: string; en: string }, correct: string, pool: string[]): SelectExercise {
  const distractors = pool.filter((p) => p !== correct).slice(0, 2);
  const options = [{ text: correct, correct: true }, ...distractors.map((d) => ({ text: d, correct: false }))];
  // Shuffle options
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  return {
    id: `sel-${correct}`,
    type: "SELECT_1_OF_3",
    prompt: question,
    options,
    correct,
  };
}

/** Build a WRITE_TRANSLATION exercise from a level word. */
function buildWrite(question: { es: string; en: string }, answer: string): WriteExercise {
  const words = answer.split(" ");
  const answerTiles = [...words];
  // Add 1-2 distractor tiles
  const distractors = ["el", "la", "un", "una", "buque", "mar"].filter((d) => !words.includes(d));
  for (let i = 0; i < Math.min(2, distractors.length); i++) {
    answerTiles.push(distractors[i]);
  }
  // Shuffle tiles
  for (let i = answerTiles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [answerTiles[i], answerTiles[j]] = [answerTiles[j], answerTiles[i]];
  }
  const correctOrder = words.map((w) => answerTiles.indexOf(w));
  return {
    id: `writ-${answer}`,
    type: "WRITE_TRANSLATION",
    prompt: question,
    answer,
    answerTiles,
    correctOrder,
  };
}

/** Generate a lesson tile (mix of SELECT and WRITE exercises) from level words. */
function buildTile(levelIndex: number, wordIndex: number, word: { prompt: { es: string; en: string }; options: string[]; correct: string }): CruiseWordTile {
  const pool = CRUISEWORD_LEVELS[levelIndex].words.map((w) => w.correct);
  const exercises: CruiseWordExercise[] = [
    buildSelect(word.prompt, word.correct, pool),
    buildWrite(word.prompt, word.correct),
  ];
  return {
    type: "lesson",
    title: `Lesson ${wordIndex + 1}`,
    exercises,
  };
}

/** Generate the full units structure from CRUISEWORD_LEVELS. */
export function buildCruiseWordUnits(): CruiseWordUnit[] {
  return CRUISEWORD_LEVELS.map((level, levelIdx) => {
    const colors = UNIT_COLORS[(levelIdx) % UNIT_COLORS.length];
    const tiles: CruiseWordTile[] = [];

    level.words.forEach((word, wordIdx) => {
      tiles.push(buildTile(levelIdx, wordIdx, word));
      // Add a treasure tile after every 3 lessons
      if ((wordIdx + 1) % 3 === 0 && wordIdx < level.words.length - 1) {
        tiles.push({ type: "treasure", title: "Treasure", exercises: [] });
      }
    });

    // Add review tile at end
    tiles.push({ type: "review", title: "Review", exercises: [] });

    return {
      unitNumber: level.id,
      name: level.name,
      description: level.desc,
      backgroundColor: colors.bg,
      textColor: colors.text,
      borderColor: colors.border,
      tiles,
    };
  });
}

export const CRUISEWORD_UNITS: CruiseWordUnit[] = buildCruiseWordUnits();

/** Get unit by number (1-based). */
export function getUnit(unitNumber: number): CruiseWordUnit | undefined {
  return CRUISEWORD_UNITS.find((u) => u.unitNumber === unitNumber);
}

/** Count total lessons across all units. */
export function getTotalLessons(): number {
  return CRUISEWORD_UNITS.reduce(
    (acc, u) => acc + u.tiles.filter((t) => t.type === "lesson").length,
    0,
  );
}

/** Get flat lesson index for tile status calculation. */
export function getLessonsCompletedUntil(unitNumber: number): number {
  let count = 0;
  for (const u of CRUISEWORD_UNITS) {
    if (u.unitNumber < unitNumber) {
      count += u.tiles.filter((t) => t.type === "lesson").length;
    }
  }
  return count;
}
