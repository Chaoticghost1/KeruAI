/**
 * MathMaster 6-level metadata (Arithmetic → Calculus).
 */
export interface MathMasterLevel {
  id: number;
  name: { es: string; en: string };
  desc: { es: string; en: string };
  topic: string;
}

export const MATH_MASTER_LEVELS: MathMasterLevel[] = [
  { id: 1, name: { es: "Nivel 1: Aritmética Básica", en: "Level 1: Basic Arithmetic" }, desc: { es: "Suma, resta, multiplicación, división", en: "Addition, subtraction, multiplication, division" }, topic: "arithmetic" },
  { id: 2, name: { es: "Nivel 2: Fracciones y Decimales", en: "Level 2: Fractions & Decimals" }, desc: { es: "Fracciones simples y decimales", en: "Simple fractions and decimals" }, topic: "fractions" },
  { id: 3, name: { es: "Nivel 3: Álgebra Básica", en: "Level 3: Algebra Basics" }, desc: { es: "Ecuaciones lineales, variables", en: "Linear equations, variables" }, topic: "algebra" },
  { id: 4, name: { es: "Nivel 4: Geometría", en: "Level 4: Geometry" }, desc: { es: "Área, perímetro, teorema de Pitágoras", en: "Area, perimeter, Pythagorean theorem" }, topic: "geometry" },
  { id: 5, name: { es: "Nivel 5: Precálculo", en: "Level 5: Pre-Calculus" }, desc: { es: "Trigonometría, exponentes, logaritmos", en: "Trigonometry, exponents, logarithms" }, topic: "precalculus" },
  { id: 6, name: { es: "Nivel 6: Cálculo", en: "Level 6: Calculus" }, desc: { es: "Derivadas e integrales básicas", en: "Basic derivatives and integrals" }, topic: "calculus" },
];

export function getMathMasterLevelById(id: number): MathMasterLevel | undefined {
  return MATH_MASTER_LEVELS.find((l) => l.id === id);
}
