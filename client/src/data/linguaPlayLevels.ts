/**
 * LinguaPlay 6 levels + 5 modes metadata.
 */
export interface LinguaPlayLevel {
  id: number;
  name: { es: string; en: string };
  desc: { es: string; en: string };
}

export const LINGUA_PLAY_LEVELS: LinguaPlayLevel[] = [
  { id: 1, name: { es: "Nivel 1: Vocabulario Básico", en: "Level 1: Basic Vocabulary" }, desc: { es: "Palabras cotidianas (100 palabras)", en: "Everyday words (100 words)" } },
  { id: 2, name: { es: "Nivel 2: Frases Comunes", en: "Level 2: Common Phrases" }, desc: { es: "Saludos, preguntas prácticas", en: "Greetings, practical questions" } },
  { id: 3, name: { es: "Nivel 3: Tiempo Presente", en: "Level 3: Present Tense" }, desc: { es: "Conjugación verbal, concordancia", en: "Verb conjugation, agreement" } },
  { id: 4, name: { es: "Nivel 4: Pasado y Futuro", en: "Level 4: Past & Future" }, desc: { es: "Verbos regulares e irregulares", en: "Regular and irregular verbs" } },
  { id: 5, name: { es: "Nivel 5: Gramática Avanzada", en: "Level 5: Advanced Grammar" }, desc: { es: "Subjuntivo, condicionales, phrasal verbs", en: "Subjunctive, conditionals, phrasal verbs" } },
  { id: 6, name: { es: "Nivel 6: Lenguaje Formal", en: "Level 6: Business & Academic" }, desc: { es: "Vocabulario profesional y formal", en: "Professional and formal vocabulary" } },
];

export const LINGUA_PLAY_MODES = [
  { key: "vocabulary", name: { es: "Vocabulario", en: "Vocabulary" } },
  { key: "grammar", name: { es: "Gramática", en: "Grammar" } },
  { key: "listening", name: { es: "Comprensión auditiva", en: "Listening" } },
  { key: "spelling", name: { es: "Ortografía", en: "Spelling" } },
  { key: "pronunciation", name: { es: "Pronunciación", en: "Pronunciation" } },
] as const;

export function getLinguaPlayLevelById(id: number): LinguaPlayLevel | undefined {
  return LINGUA_PLAY_LEVELS.find((l) => l.id === id);
}
