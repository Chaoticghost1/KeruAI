/**
 * Bridges LinguaPlay DB problems (languageProblems rows) into the generic Duolingo
 * exercise model, so LinguaPlay gets the same Duolingo-style Learn Path as CruiseWord.
 */
import type { LanguageProblem } from "@shared/schema";
import type { DuoExercise } from "@/components/duolingo/types";
import { LINGUA_PLAY_MODES } from "@/data/linguaPlayLevels";

/** Convert a single language problem into a SELECT_1_OF_3 Duolingo exercise. */
export function problemToExercise(p: LanguageProblem): DuoExercise {
  const options = (p.options as string[]).map((text) => ({
    text,
    correct: text === p.correctAnswer,
  }));
  return {
    id: `lp-${p.id}`,
    type: "SELECT_1_OF_3",
    prompt: { es: p.promptEs, en: p.promptEn },
    options,
    correct: p.correctAnswer,
  };
}

export interface LinguaPlayUnitView {
  unitNumber: number;
  name: { es: string; en: string };
  description: { es: string; en: string };
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  tiles: {
    type: "lesson" | "treasure" | "review";
    title: string;
    problems: LanguageProblem[];
  }[];
}

const UNIT_COLORS = [
  { bg: "bg-[#58cc02]", text: "text-[#58cc02]", border: "border-[#46a302]" },
  { bg: "bg-[#ce82ff]", text: "text-[#ce82ff]", border: "border-[#a568cc]" },
  { bg: "bg-[#00cd9c]", text: "text-[#00cd9c]", border: "border-[#00a47d]" },
  { bg: "bg-[#ff9600]", text: "text-[#ff9600]", border: "border-[#cc7800]" },
  { bg: "bg-[#1cb0f6]", text: "text-[#1cb0f6]", border: "border-[#1487c2]" },
  { bg: "bg-[#ff4b4b]", text: "text-[#ff4b4b]", border: "border-[#cc3c3c]" },
];

/** Group DB language problems into 6 units (by level) building Duolingo path tiles. */
export function buildLinguaPlayUnits(
  problems: LanguageProblem[],
  mode: string,
): LinguaPlayUnitView[] {
  const units: LinguaPlayUnitView[] = [];
  const modeName =
    LINGUA_PLAY_MODES.find((m) => m.key === mode)?.name ?? { es: mode, en: mode };

  for (let level = 1; level <= 6; level++) {
    const levelProblems = problems.filter((p) => p.level === level);
    if (levelProblems.length === 0) continue;
    const colors = UNIT_COLORS[(level - 1) % UNIT_COLORS.length];
    const tiles: LinguaPlayUnitView["tiles"] = [];
    levelProblems.forEach((p, idx) => {
      tiles.push({ type: "lesson", title: `Lesson ${idx + 1}`, problems: [p] });
      if ((idx + 1) % 3 === 0 && idx < levelProblems.length - 1) {
        tiles.push({ type: "treasure", title: "Treasure", problems: [] });
      }
    });
    tiles.push({ type: "review", title: "Review", problems: [] });
    units.push({
      unitNumber: level,
      name: {
        es: `Unidad ${level}: ${modeName.es}`,
        en: `Unit ${level}: ${modeName.en}`,
      },
      description: {
        es: `${levelProblems.length} ejercicios de ${modeName.es}`,
        en: `${levelProblems.length} ${modeName.en} exercises`,
      },
      backgroundColor: colors.bg,
      textColor: colors.text,
      borderColor: colors.border,
      tiles,
    });
  }
  return units;
}

export function getLinguaPlayUnit(units: LinguaPlayUnitView[], unitNumber: number) {
  return units.find((u) => u.unitNumber === unitNumber);
}
