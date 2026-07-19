/**
 * Bridges the DB-fed CruiseWord vocabulary (CruiseWordWord rows from /api/games/problems/cruiseword)
 * into the generic Duolingo exercise model (DuoExercise) and the Learn Path unit structure.
 *
 * The same vocabulary powers both the Duolingo Learn Path and the quick Play modes,
 * all sourced from the database (cruise_word_words table).
 */
import type { CruiseWordWord } from "@shared/schema";
import type { DuoExercise } from "@/components/duolingo/types";

const UNIT_COLORS = [
  { bg: "bg-[#58cc02]", text: "text-[#58cc02]", border: "border-[#46a302]" },
  { bg: "bg-[#ce82ff]", text: "text-[#ce82ff]", border: "border-[#a568cc]" },
  { bg: "bg-[#00cd9c]", text: "text-[#00cd9c]", border: "border-[#00a47d]" },
  { bg: "bg-[#ff9600]", text: "text-[#ff9600]", border: "border-[#cc7800]" },
  { bg: "bg-[#1cb0f6]", text: "text-[#1cb0f6]", border: "border-[#1487c2]" },
  { bg: "bg-[#ff4b4b]", text: "text-[#ff4b4b]", border: "border-[#cc3c3c]" },
];

const CATEGORY_LABEL: Record<string, { es: string; en: string }> = {
  geography: { es: "Geografía", en: "Geography" },
  capital: { es: "Capital", en: "Capital" },
  food: { es: "Comida", en: "Food" },
  music: { es: "Música", en: "Music" },
  landmark: { es: "Lugar famoso", en: "Landmark" },
  language: { es: "Idioma", en: "Language" },
};

/** Build a SELECT_1_OF_3 exercise from a word + a pool of distractors (other words). */
function buildSelect(word: CruiseWordWord, pool: CruiseWordWord[]): DuoExercise {
  const distractors = pool
    .filter((w) => w.word !== word.word)
    .slice(0, 2)
    .map((w) => ({ text: w.word, correct: false }));
  const options = [
    { text: word.word, correct: true },
    ...distractors,
  ];
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  return {
    id: `sel-${word.id}`,
    type: "SELECT_1_OF_3",
    prompt: { es: word.promptEs, en: word.promptEn },
    options,
    correct: word.word,
  };
}

/** Build a WRITE_TRANSLATION exercise (translate the prompt into the English word). */
function buildWrite(word: CruiseWordWord): DuoExercise {
  const words = word.word.split(" ");
  const answerTiles = [...words];
  const distractors = ["the", "of", "is", "a", "city", "country"].filter(
    (d) => !words.includes(d),
  );
  for (let i = 0; i < Math.min(2, distractors.length); i++) {
    answerTiles.push(distractors[i]);
  }
  for (let i = answerTiles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [answerTiles[i], answerTiles[j]] = [answerTiles[j], answerTiles[i]];
  }
  const correctOrder = words.map((w) => answerTiles.indexOf(w));
  return {
    id: `writ-${word.id}`,
    type: "WRITE_TRANSLATION",
    prompt: { es: word.promptEs, en: word.promptEn },
    answer: word.word,
    answerTiles,
    correctOrder,
  };
}

/** Convert a list of words (one level) into a set of exercises for a lesson tile. */
export function wordsToExercises(words: CruiseWordWord[]): DuoExercise[] {
  return words.flatMap((w) => [buildSelect(w, words), buildWrite(w)]);
}

export interface CruiseWordUnitView {
  unitNumber: number;
  name: { es: string; en: string };
  description: { es: string; en: string };
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  tiles: { type: "lesson" | "treasure" | "review"; title: string; words: CruiseWordWord[] }[];
}

/** Group DB words into 6 units (by level) and build the Duolingo path tiles. */
export function buildCruiseWordUnits(words: CruiseWordWord[]): CruiseWordUnitView[] {
  const units: CruiseWordUnitView[] = [];
  for (let level = 1; level <= 6; level++) {
    const levelWords = words.filter((w) => w.level === level);
    if (levelWords.length === 0) continue;
    const colors = UNIT_COLORS[(level - 1) % UNIT_COLORS.length];
    const tiles: CruiseWordUnitView["tiles"] = [];
    levelWords.forEach((w, idx) => {
      tiles.push({ type: "lesson", title: `Lesson ${idx + 1}`, words: [w] });
      if ((idx + 1) % 3 === 0 && idx < levelWords.length - 1) {
        tiles.push({ type: "treasure", title: "Treasure", words: [] });
      }
    });
    tiles.push({ type: "review", title: "Review", words: [] });
    units.push({
      unitNumber: level,
      name: {
        es: `Unidad ${level}: ${levelWords[0]?.country ?? "Mundo"}`,
        en: `Unit ${level}: ${levelWords[0]?.country ?? "World"}`,
      },
      description: {
        es: `${levelWords.length} palabras de ${CATEGORY_LABEL[levelWords[0]?.category]?.es ?? "geografía"}`,
        en: `${levelWords.length} words of ${CATEGORY_LABEL[levelWords[0]?.category]?.en ?? "geography"}`,
      },
      backgroundColor: colors.bg,
      textColor: colors.text,
      borderColor: colors.border,
      tiles,
    });
  }
  return units;
}

export function getUnit(units: CruiseWordUnitView[], unitNumber: number) {
  return units.find((u) => u.unitNumber === unitNumber);
}

export function getTotalLessons(units: CruiseWordUnitView[]): number {
  return units.reduce(
    (acc, u) => acc + u.tiles.filter((t) => t.type === "lesson").length,
    0,
  );
}
