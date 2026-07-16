/**
 * CruiseWord 6-level vocabulary suite.
 * Used by Level Challenge mode: progress determines band (reachedLevel ± 1); one level is picked at random from the band.
 */
export interface LevelWord {
  /** Prompt (definition or description) in es/en; key in data is 'cruise' from original spec. */
  prompt: { es: string; en: string };
  options: string[];
  correct: string;
}

export interface CruiseWordLevel {
  id: number;
  name: { es: string; en: string };
  desc: { es: string; en: string };
  difficulty: string;
  difficultyClass: string;
  words: LevelWord[];
}

export const CRUISEWORD_LEVELS: CruiseWordLevel[] = [
  {
    id: 1,
    name: { es: "Nivel 1: Muy Fácil", en: "Level 1: Very Easy" },
    desc: { es: "Vocabulario básico del crucero", en: "Basic cruise vocabulary" },
    difficulty: "Very Easy",
    difficultyClass: "difficulty-1",
    words: [
      { prompt: { es: "Barco grande de pasajeros", en: "Large passenger ship" }, options: ["Crucero", "Autobús", "Tren"], correct: "Crucero" },
      { prompt: { es: "Agua salada del océano", en: "Salty ocean water" }, options: ["Sal", "Océano", "Playa"], correct: "Océano" },
      { prompt: { es: "Capitán del barco", en: "Ship captain" }, options: ["Cocinero", "Capitán", "Mesero"], correct: "Capitán" },
      { prompt: { es: "Vacaciones en el mar", en: "Vacation at sea" }, options: ["Camping", "Crucero", "Hotel"], correct: "Crucero" },
      { prompt: { es: "Lugar para dormir en el barco", en: "Place to sleep on ship" }, options: ["Camarote", "Cocina", "Puente"], correct: "Camarote" },
    ],
  },
  {
    id: 2,
    name: { es: "Nivel 2: Fácil", en: "Level 2: Easy" },
    desc: { es: "Términos comunes de cruceros", en: "Common cruise terms" },
    difficulty: "Easy",
    difficultyClass: "difficulty-2",
    words: [
      { prompt: { es: "Lado derecho del barco", en: "Right side of ship" }, options: ["Proa", "Estribor", "Popa"], correct: "Estribor" },
      { prompt: { es: "Salón de baile del crucero", en: "Dance hall on cruise" }, options: ["Biblioteca", "Discoteca", "Gimnasio"], correct: "Discoteca" },
      { prompt: { es: "Tipo de comida elegante", en: "Fancy dinner" }, options: ["Almuerzo", "Gala", "Desayuno"], correct: "Gala" },
      { prompt: { es: "Actividades de entretenimiento", en: "Entertainment activities" }, options: ["Eventos", "Eventos de ocio", "Espectáculos"], correct: "Espectáculos" },
      { prompt: { es: "Turista en el crucero", en: "Tourist on cruise" }, options: ["Pasajero", "Tripulante", "Oficial"], correct: "Pasajero" },
      { prompt: { es: "Pequeño bote de escape", en: "Small rescue boat" }, options: ["Bote salvavidas", "Ancla", "Vela"], correct: "Bote salvavidas" },
    ],
  },
  {
    id: 3,
    name: { es: "Nivel 3: Intermedio", en: "Level 3: Intermediate" },
    desc: { es: "Vocabulario técnico de navíos", en: "Technical maritime vocabulary" },
    difficulty: "Intermediate",
    difficultyClass: "difficulty-3",
    words: [
      { prompt: { es: "Puerta estanca del barco", en: "Watertight door on ship" }, options: ["Escotilla", "Mampara", "Compuerta"], correct: "Mampara" },
      { prompt: { es: "Parte frontal del barco", en: "Front part of ship" }, options: ["Popa", "Proa", "Babor"], correct: "Proa" },
      { prompt: { es: "Sistema de distribución de agua", en: "Water distribution system" }, options: ["Tuberías", "Acueducto", "Fontanería"], correct: "Tuberías" },
      { prompt: { es: "Plataforma elevada del barco", en: "Elevated platform on ship" }, options: ["Puente", "Cubierta", "Muelle"], correct: "Puente" },
      { prompt: { es: "Reunión de seguridad antes de zarpar", en: "Safety meeting before departure" }, options: ["Simulacro", "Briefing", "Formación"], correct: "Simulacro" },
      { prompt: { es: "Depósito de combustible", en: "Fuel storage" }, options: ["Carbonera", "Tanque", "Bodega"], correct: "Carbonera" },
      { prompt: { es: "Velocidad del barco medida en nudos", en: "Ship speed in knots" }, options: ["Velocidad", "Nudo", "Marcha"], correct: "Nudo" },
    ],
  },
  {
    id: 4,
    name: { es: "Nivel 4: Difícil", en: "Level 4: Hard" },
    desc: { es: "Terminología avanzada de navegación", en: "Advanced navigation terminology" },
    difficulty: "Hard",
    difficultyClass: "difficulty-4",
    words: [
      { prompt: { es: "Sistema de navegación por satélite", en: "Satellite navigation system" }, options: ["SONAR", "GPS", "Radar"], correct: "GPS" },
      { prompt: { es: "Instrumentación meteorológica del barco", en: "Ship weather instruments" }, options: ["Barómetro", "Anemómetro", "Estación meteorológica"], correct: "Estación meteorológica" },
      { prompt: { es: "Procedimiento de amarre en puerto", en: "Docking procedure" }, options: ["Eslora", "Atraque", "Deriva"], correct: "Atraque" },
      { prompt: { es: "Desviación de la ruta planeada", en: "Deviation from planned route" }, options: ["Abatimiento", "Desvío", "Demora"], correct: "Abatimiento" },
      { prompt: { es: "Corriente submarina", en: "Underwater current" }, options: ["Resaca", "Contracorriente", "Contraflujo"], correct: "Contracorriente" },
      { prompt: { es: "Técnica de navegación sin instrumentos", en: "Navigation without instruments" }, options: ["Estima", "Brújula", "Orientación"], correct: "Estima" },
    ],
  },
  {
    id: 5,
    name: { es: "Nivel 5: Muy Difícil", en: "Level 5: Very Hard" },
    desc: { es: "Vocabulario especializado marítimo", en: "Specialized maritime vocabulary" },
    difficulty: "Very Hard",
    difficultyClass: "difficulty-5",
    words: [
      { prompt: { es: "Resistencia del casco al agua", en: "Hull resistance in water" }, options: ["Fricción", "Resistencia hidrodinámica", "Arrastre"], correct: "Resistencia hidrodinámica" },
      { prompt: { es: "Equilibrio de cargas en el barco", en: "Load distribution balance" }, options: ["Estabilidad", "Trimado", "Escora"], correct: "Trimado" },
      { prompt: { es: "Centro de gravedad del buque", en: "Ship center of gravity" }, options: ["Metacentro", "Centro de boyantez", "Línea de agua"], correct: "Metacentro" },
      { prompt: { es: "Fuerza restauradora en estabilidad", en: "Restoring force in stability" }, options: ["Momento adrizante", "Asiento", "Eslora"], correct: "Momento adrizante" },
      { prompt: { es: "Diagrama de curvas de estabilidad", en: "Stability curve diagram" }, options: ["Gráfico de escora", "Curva de Bonjean", "Polígono"], correct: "Curva de Bonjean" },
    ],
  },
  {
    id: 6,
    name: { es: "Nivel 6: Extremadamente Difícil", en: "Level 6: Extremely Hard" },
    desc: { es: "Ingeniería naval avanzada", en: "Advanced naval engineering" },
    difficulty: "Extremely Hard",
    difficultyClass: "difficulty-6",
    words: [
      { prompt: { es: "Coeficiente de finura del casco", en: "Hull fineness coefficient" }, options: ["Índice de forma", "Coeficiente de bloque", "Factor de forma"], correct: "Coeficiente de bloque" },
      { prompt: { es: "Propulsión mediante sistemas híbridos", en: "Hybrid propulsion systems" }, options: ["Dual fuel", "Propulsión híbrida", "Sistema combinado"], correct: "Propulsión híbrida" },
      { prompt: { es: "Cálculo de potencia requerida", en: "Required power calculation" }, options: ["Propulsión", "Resistencia al avance", "Empuje"], correct: "Resistencia al avance" },
      { prompt: { es: "Análisis dinámico de estructuras navales", en: "Dynamic analysis of naval structures" }, options: ["FEA", "Análisis modal", "Elementos finitos"], correct: "Análisis modal" },
      { prompt: { es: "Optimización de consumo energético", en: "Energy consumption optimization" }, options: ["ECO Speed", "Eco mode", "Gestión inteligente de combustible"], correct: "Gestión inteligente de combustible" },
    ],
  },
];

/** Get level by id (1–6). */
export function getCruiseWordLevelById(id: number): CruiseWordLevel | undefined {
  return CRUISEWORD_LEVELS.find((l) => l.id === id);
}

/** Compute allowed level band: [reachedLevel - 1, reachedLevel, reachedLevel + 1] clamped to 1–6. */
export function getLevelBand(reachedLevel: number): number[] {
  const min = Math.max(1, reachedLevel - 1);
  const max = Math.min(6, reachedLevel + 1);
  const band: number[] = [];
  for (let i = min; i <= max; i++) band.push(i);
  return band;
}

/** Pick one level at random from the band. */
export function pickRandomLevelFromBand(reachedLevel: number): number {
  const band = getLevelBand(reachedLevel);
  return band[Math.floor(Math.random() * band.length)];
}
