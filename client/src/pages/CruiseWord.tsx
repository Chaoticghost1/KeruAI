import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Ship, Trophy, Zap, Target, Brain, Award, Upload, ListOrdered, Layers, ArrowRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest } from '@/lib/queryClient';
import { OFFLINE_ENABLED } from '@/lib/offline-config';
import { OfflineManager } from '@/lib/offline-storage';
import { useCruiseWordStore } from '@/stores/cruiseWordStore';
import type { CruiseWordWord } from '@shared/schema';
import { PageLayout } from '@/components/PageLayout';

/** Shape used by the Level Challenge renderer (prompt + options + correct). */
interface GeoChallengeWord {
  prompt: { es: string; en: string };
  options: string[];
  correct: string;
}
interface GeoLevel {
  id: number;
  name: { es: string; en: string };
  desc: { es: string; en: string };
  words: GeoChallengeWord[];
}

const GAME_NAME = 'CruiseWord';

type Language = 'en' | 'es';

interface MemoryCard {
  id: string;
  content: string;
  type: 'word' | 'definition';
  matchId: number;
}

interface SpeedOption {
  text: string;
  correct: boolean;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  delay: number;
}

const translations = {
  en: {
    title: "Cruise Vocabulary Trainer",
    modes: {
      flashcard: "Flashcard",
      quiz: "Quick Quiz",
      memory: "Memory Game",
      challenge: "Speed Challenge",
      levels: "Level Challenge"
    } as Record<string, string>,
    startQuiz: "Start Quiz",
    checkAnswer: "Check Answer",
    nextQuestion: "Next Question",
    correct: "Correct!",
    incorrect: "Incorrect",
    yourAnswer: "Your answer",
    correctAnswer: "Correct answer",
    score: "Score",
    timeLeft: "Time Left",
    streak: "Streak",
    clickToReveal: "Click to reveal",
    matchPairs: "Match the pairs",
    speedRound: "Speed Round!",
    selectCorrect: "Select the correct definition",
    congrats: "Congratulations!",
    perfectScore: "Perfect Score!",
    tryAgain: "Try Again",
    playAgain: "Play Again",
    myScores: "My recent scores",
    leaderboard: "Leaderboard",
    submitScore: "Submit score",
    scoreSaved: "Score saved!",
    savedOffline: "Saved offline; will sync when online.",
    xpEarned: "+{n} XP",
    newBadge: "New badge!",
    levelUp: "Level up!",
    noScoresYet: "No scores yet. Play and submit!",
    rank: "Rank",
    noLeaderboard: "No entries yet.",
    startLevelChallenge: "Start Level Challenge",
    question: "Question",
    backToModes: "Back",
    playAgainLevel: "Play again",
    learnPath: "📚 Learn Path",
    learnPathDesc: "Structured Duolingo-style lessons",
    learnPathProgress: "Learn Path progress",
    continueLearning: "Continue Learning",
    startLearning: "Start Learning"
  },
  es: {
    title: "Entrenador de Vocabulario de Crucero",
    modes: {
      flashcard: "Tarjetas",
      quiz: "Quiz Rápido",
      memory: "Juego de Memoria",
      challenge: "Desafío de Velocidad",
      levels: "Desafío por Niveles"
    } as Record<string, string>,
    startQuiz: "Iniciar Quiz",
    checkAnswer: "Verificar",
    nextQuestion: "Siguiente",
    correct: "¡Correcto!",
    incorrect: "Incorrecto",
    yourAnswer: "Tu respuesta",
    correctAnswer: "Respuesta correcta",
    score: "Puntuación",
    timeLeft: "Tiempo",
    streak: "Racha",
    clickToReveal: "Clic para revelar",
    matchPairs: "Empareja los pares",
    speedRound: "¡Ronda Rápida!",
    selectCorrect: "Selecciona la definición correcta",
    congrats: "¡Felicitaciones!",
    perfectScore: "¡Puntuación Perfecta!",
    tryAgain: "Intentar de Nuevo",
    playAgain: "Jugar de Nuevo",
    myScores: "Mis puntuaciones recientes",
    leaderboard: "Tabla de líderes",
    submitScore: "Enviar puntuación",
    scoreSaved: "¡Puntuación guardada!",
    savedOffline: "Guardado sin conexión; se sincronizará al estar en línea.",
    xpEarned: "+{n} XP",
    newBadge: "¡Nueva insignia!",
    levelUp: "¡Subiste de nivel!",
    noScoresYet: "Aún no hay puntuaciones. ¡Juega y envía!",
    rank: "Posición",
    noLeaderboard: "Aún no hay entradas.",
    startLevelChallenge: "Iniciar Desafío por Niveles",
    question: "Pregunta",
    backToModes: "Atrás",
    playAgainLevel: "Jugar de nuevo",
    learnPath: "📚 Ruta de Aprendizaje",
    learnPathDesc: "Lecciones estructuradas estilo Duolingo",
    learnPathProgress: "Progreso de la ruta",
    continueLearning: "Continuar Aprendiendo",
    startLearning: "Empezar a Aprender"
  }
};

interface GameScoreRow {
  id: number;
  userId: number;
  gameName: string;
  score: number;
  level: number;
  completed: boolean;
  playedAt: string;
  displayName?: string;
}

interface SubmitRewards {
  pointsEarned: number;
  badgesEarned: { name: string; icon: string }[];
  levelUp: boolean;
}

export default function CruiseWord() {
  const { language, setLanguage } = useLanguage();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id;
  const { data: dbWords = [] } = useQuery<CruiseWordWord[]>({
    queryKey: ['/api/games/problems/cruiseword'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/games/problems/cruiseword');
      if (!res.ok) return [];
      return res.json();
    },
  });
  const lessonsCompleted = useCruiseWordStore((s) => s.lessonsCompleted);
  const cruiseXp = useCruiseWordStore((s) => s.xp);
  const learnProgressPct = dbWords.length ? Math.round((Math.min(lessonsCompleted, dbWords.length) / dbWords.length) * 100) : 0;
  const t = translations[language as Language] || translations.en;
  const [mode, setMode] = useState('flashcard');
  const [currentWord, setCurrentWord] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [quizAnswer, setQuizAnswer] = useState('');
  const [quizResult, setQuizResult] = useState<boolean | null>(null);
  const [memoryCards, setMemoryCards] = useState<MemoryCard[]>([]);
  const [flippedMemory, setFlippedMemory] = useState<string[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number[]>([]);
  const [speedTimer, setSpeedTimer] = useState(30);
  const [speedScore, setSpeedScore] = useState(0);
  const [speedActive, setSpeedActive] = useState(false);
  const [speedOptions, setSpeedOptions] = useState<SpeedOption[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const speedRoundSubmitted = useRef(false);
  const [lastSubmitResult, setLastSubmitResult] = useState<'ok' | 'offline' | null>(null);
  const [lastSubmitRewards, setLastSubmitRewards] = useState<SubmitRewards | null>(null);
  const [sessionLevel, setSessionLevel] = useState<number | null>(null);
  const [sessionLevelData, setSessionLevelData] = useState<GeoLevel | null>(null);
  const [levelAnswers, setLevelAnswers] = useState<Record<number, string>>({});

  const { data: myScores = [] } = useQuery<GameScoreRow[]>({
    queryKey: ['/api/games', 'scores', userId, GAME_NAME],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/games/scores?game=${GAME_NAME}`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!userId,
  });

  const { data: leaderboard = [] } = useQuery<(GameScoreRow & { displayName: string })[]>({
    queryKey: ['/api/games', 'leaderboard', GAME_NAME],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/games/leaderboard/${GAME_NAME}?limit=10`);
      if (!res.ok) return [];
      return res.json();
    },
  });

  const { data: gameProgress } = useQuery<{ level: number }>({
    queryKey: ['/api/games', 'progress', GAME_NAME],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/games/progress/${GAME_NAME}`);
      if (!res.ok) return { level: 1 };
      return res.json();
    },
    enabled: mode === 'levels' && !!userId,
  });

  const submitScoreMutation = useMutation({
    mutationFn: async (payload: { score: number; level?: number; completed?: boolean }) => {
      const body = {
        gameName: GAME_NAME,
        score: payload.score,
        level: payload.level ?? 1,
        completed: payload.completed ?? true,
      };
      if (OFFLINE_ENABLED && !navigator.onLine && userId) {
        await OfflineManager.saveGameScoreOffline({
          userId,
          gameName: GAME_NAME,
          score: payload.score,
          level: body.level,
          completed: body.completed ?? true,
          playedAt: new Date().toISOString(),
        });
        return { offline: true };
      }
      try {
        const res = await apiRequest('POST', '/api/games/scores', body);
        if (!res.ok) throw new Error('Failed to save score');
        return res.json();
      } catch (err) {
        if (OFFLINE_ENABLED && userId && !navigator.onLine) {
          await OfflineManager.saveGameScoreOffline({
            userId,
            gameName: GAME_NAME,
            score: payload.score,
            level: body.level,
            completed: body.completed ?? true,
            playedAt: new Date().toISOString(),
          });
          return { offline: true };
        }
        throw err;
      }
    },
    onSuccess: (data) => {
      if (data && (data as { offline?: boolean }).offline) {
        setLastSubmitResult('offline');
        setLastSubmitRewards(null);
        setTimeout(() => setLastSubmitResult(null), 4000);
        return;
      }
      setLastSubmitResult('ok');
      const rewards = (data as { rewards?: SubmitRewards })?.rewards;
      setLastSubmitRewards(rewards ?? null);
      setTimeout(() => setLastSubmitRewards(null), 5000);
      setTimeout(() => setLastSubmitResult(null), 3000);
      queryClient.invalidateQueries({ queryKey: ['/api/games', 'scores', userId, GAME_NAME] });
      queryClient.invalidateQueries({ queryKey: ['/api/games', 'leaderboard', GAME_NAME] });
      queryClient.invalidateQueries({ queryKey: ['/api/games', 'progress', GAME_NAME] });
      queryClient.invalidateQueries({ queryKey: ['/api/progress'] });
    },
  });

  const submitScore = (value: number, level?: number) => {
    if (!userId || value < 0) return;
    submitScoreMutation.mutate({ score: value, level: level ?? 1, completed: true });
  };

  const startLevelChallenge = () => {
    const reachedLevel = gameProgress?.level ?? 1;
    // Pick a level within the reached band (±1), clamped to 1–6, from DB-fed words.
    const band = [reachedLevel - 1, reachedLevel, reachedLevel + 1]
      .filter((l) => l >= 1 && l <= 6);
    const chosen = band[Math.floor(Math.random() * band.length)];
    const levelWords = dbWords.filter((w) => w.level === chosen);
    if (levelWords.length === 0) return;
    const words: GeoChallengeWord[] = levelWords.map((w) => {
      const pool = levelWords.filter((o) => o.word !== w.word).map((o) => o.word);
      const options = [w.word, pool[0], pool[1]].filter(Boolean);
      for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
      }
      return {
        prompt: { es: w.promptEs, en: w.promptEn },
        options,
        correct: w.word,
      };
    });
    const levelData: GeoLevel = {
      id: chosen,
      name: { es: `Nivel ${chosen}`, en: `Level ${chosen}` },
      desc: {
        es: `Geografía mundial — ${levelWords[0].country ?? ''}`,
        en: `World geography — ${levelWords[0].country ?? ''}`,
      },
      words,
    };
    setSessionLevel(chosen);
    setSessionLevelData(levelData);
    setLevelAnswers({});
    setScore(0);
  };

  const backLevelChallenge = () => {
    setSessionLevel(null);
    setSessionLevelData(null);
    setLevelAnswers({});
  };

  useEffect(() => {
    if (mode !== 'levels') {
      setSessionLevel(null);
      setSessionLevelData(null);
      setLevelAnswers({});
    }
  }, [mode]);

  const CATEGORY_COLOR: Record<string, string> = {
    geography: 'text-blue-600',
    capital: 'text-purple-600',
    food: 'text-orange-600',
    music: 'text-pink-600',
    landmark: 'text-cyan-600',
    language: 'text-green-600',
  };
  const CATEGORY_LABEL: Record<string, { es: string; en: string }> = {
    geography: { es: 'Geografía', en: 'Geography' },
    capital: { es: 'Capital', en: 'Capital' },
    food: { es: 'Comida', en: 'Food' },
    music: { es: 'Música', en: 'Music' },
    landmark: { es: 'Lugar famoso', en: 'Landmark' },
    language: { es: 'Idioma', en: 'Language' },
  };

  // Map DB-fed geography words into the shape the quick Play modes expect.
  // Falls back to a placeholder when no words are loaded yet.
  const cruiseWords = (dbWords.length > 0 ? dbWords : []).map((w) => {
    const EmojiIcon = () => <span className="text-3xl">{w.emoji ?? '🌍'}</span>;
    return {
      word: w.word,
      definition: { es: w.promptEs, en: w.promptEn },
      hint: { es: w.hintEs ?? w.translationEs, en: w.hintEn ?? w.translationEs },
      category: CATEGORY_LABEL[w.category] ?? { es: w.category, en: w.category },
      icon: EmojiIcon,
      color: CATEGORY_COLOR[w.category] ?? 'text-blue-600',
    };
  });

  // Inicializar Memory Game
  const initMemoryGame = () => {
    const cards: MemoryCard[] = [];
    const selectedWords = cruiseWords.slice(0, 6);
    selectedWords.forEach((word, idx) => {
      cards.push({ id: `word-${idx}`, content: word.word, type: 'word', matchId: idx });
      cards.push({ id: `def-${idx}`, content: word.definition[language as keyof typeof word.definition], type: 'definition', matchId: idx });
    });
    setMemoryCards(cards.sort(() => Math.random() - 0.5));
    setFlippedMemory([]);
    setMatchedPairs([]);
  };

  // Inicializar Speed Challenge
  const initSpeedChallenge = () => {
    setSpeedTimer(30);
    setSpeedScore(0);
    setSpeedActive(true);
    generateSpeedQuestion();
  };

  const generateSpeedQuestion = () => {
    const correctWord = cruiseWords[Math.floor(Math.random() * cruiseWords.length)];
    const wrongWords = cruiseWords.filter(w => w.word !== correctWord.word);
    const langKey = language as keyof typeof correctWord.definition;
    const options: SpeedOption[] = [
      { text: correctWord.definition[langKey], correct: true },
      { text: wrongWords[0].definition[langKey], correct: false },
      { text: wrongWords[1].definition[langKey], correct: false },
      { text: wrongWords[2].definition[langKey], correct: false }
    ].sort(() => Math.random() - 0.5);

    setCurrentWord(cruiseWords.indexOf(correctWord));
    setSpeedOptions(options);
  };

  // Timer para Speed Challenge; submit score when round ends
  useEffect(() => {
    if (speedActive && speedTimer > 0) {
      const timer = setTimeout(() => setSpeedTimer(speedTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else if (speedTimer === 0 && speedActive) {
      setSpeedActive(false);
      if (!speedRoundSubmitted.current && speedScore > 0) {
        speedRoundSubmitted.current = true;
        submitScore(speedScore);
      }
    }
  }, [speedTimer, speedActive, speedScore]);

  // Reset speed submit ref when starting a new speed round
  useEffect(() => {
    if (speedActive) speedRoundSubmitted.current = false;
  }, [speedActive]);

  // Partículas de celebración
  const createParticles = () => {
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 0.5
    }));
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 2000);
  };

  const handleQuizCheck = () => {
    const correct = quizAnswer.toLowerCase().trim() === cruiseWords[currentWord].word.toLowerCase();
    setQuizResult(correct);
    if (correct) {
      setScore(score + 1);
      setStreak(streak + 1);
      createParticles();
    } else {
      setStreak(0);
    }
  };

  const handleMemoryClick = (card: MemoryCard) => {
    if (flippedMemory.length === 2 || matchedPairs.includes(card.matchId) || flippedMemory.includes(card.id)) return;

    const newFlipped = [...flippedMemory, card.id];
    setFlippedMemory(newFlipped);

    if (newFlipped.length === 2) {
      const first = memoryCards.find(c => c.id === newFlipped[0]);
      const second = memoryCards.find(c => c.id === newFlipped[1]);
      if (first && second && first.matchId === second.matchId) {
        const newScore = score + 10;
        const newMatched = [...matchedPairs, first.matchId];
        setTimeout(() => {
          setMatchedPairs(newMatched);
          setFlippedMemory([]);
          setScore(newScore);
          createParticles();
          if (newMatched.length === 6 && newScore > 0) submitScore(newScore);
        }, 500);
      } else {
        setTimeout(() => setFlippedMemory([]), 1000);
      }
    }
  };

  const handleSpeedAnswer = (correct: boolean) => {
    if (correct) {
      setSpeedScore(speedScore + 1);
      setScore(score + 2);
      createParticles();
    }
    setTimeout(generateSpeedQuestion, 300);
  };

  const renderFlashcardMode = () => {
    const word = cruiseWords[currentWord];
    const Icon = word.icon;

    return (
      <div className="space-y-6">
        <Card
          className="cursor-pointer transform transition-all duration-500 hover:scale-105"
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
          }}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <div style={{ backfaceVisibility: 'hidden' }}>
            <CardContent className="p-12 text-center">
              <div className={`mb-4 ${word.color}`}><Icon /></div>
              <h2 className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-4">
                {word.word}
              </h2>
              <p className="text-slate-400">{t.clickToReveal}</p>
            </CardContent>
          </div>
          <div 
            style={{ 
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%'
            }}
          >
            <CardContent className="p-12 bg-gradient-to-br from-blue-50 to-cyan-50">
              <p className="text-2xl text-slate-700 mb-4">{word.definition[language as keyof typeof word.definition]}</p>
              <Badge variant="outline" className="border-slate-200">{word.hint[language as keyof typeof word.hint]}</Badge>
            </CardContent>
          </div>
        </Card>

        <div className="flex gap-3 justify-center">
          <Button onClick={() => setCurrentWord((currentWord - 1 + cruiseWords.length) % cruiseWords.length)}>
            ← Prev
          </Button>
          <Button onClick={() => setCurrentWord((currentWord + 1) % cruiseWords.length)}>
            Next →
          </Button>
        </div>
      </div>
    );
  };

  const renderQuizMode = () => {
    const word = cruiseWords[currentWord];

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{t.modes.quiz}</span>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-lg">
                <Trophy className="w-4 h-4 mr-1" />
                {score}
              </Badge>
              <Badge variant="outline" className="text-lg">
                <Zap className="w-4 h-4 mr-1" />
                {streak}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-50 p-6 rounded-lg">
            <p className="text-xl text-slate-700 mb-2">{word.definition[language as keyof typeof word.definition]}</p>
            <p className="text-sm text-slate-500">{word.hint[language as keyof typeof word.hint]}</p>
          </div>

          {quizResult === null ? (
            <>
              <input
                type="text"
                value={quizAnswer}
                onChange={(e) => setQuizAnswer(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleQuizCheck()}
                placeholder={language === 'es' ? 'Escribe la palabra...' : 'Type the word...'}
                className="w-full p-4 text-xl border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none"
                autoFocus
              />
              <Button onClick={handleQuizCheck} className="w-full" size="lg">
                {t.checkAnswer}
              </Button>
            </>
          ) : (
            <div className={`p-6 rounded-lg ${quizResult ? 'bg-green-50 border-2 border-green-500' : 'bg-red-50 border-2 border-red-500'}`}>
              <p className={`text-2xl font-bold mb-2 ${quizResult ? 'text-green-700' : 'text-red-700'}`}>
                {quizResult ? '✓ ' + t.correct : '✗ ' + t.incorrect}
              </p>
              {!quizResult && (
                <>
                  <p className="text-slate-600">{t.yourAnswer}: <span className="font-semibold">{quizAnswer}</span></p>
                  <p className="text-slate-600">{t.correctAnswer}: <span className="font-semibold">{word.word}</span></p>
                </>
              )}
              <Button 
                onClick={() => {
                  setQuizAnswer('');
                  setQuizResult(null);
                  setCurrentWord((currentWord + 1) % cruiseWords.length);
                }}
                className="w-full mt-4"
              >
                {t.nextQuestion}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderMemoryMode = () => {
    if (memoryCards.length === 0) {
      return (
        <Card>
          <CardContent className="p-12 text-center">
            <Brain className="w-20 h-20 mx-auto mb-4 text-purple-600" />
            <h3 className="text-2xl font-bold mb-4">{t.modes.memory}</h3>
            <p className="text-slate-600 mb-6">{t.matchPairs}</p>
            <Button onClick={initMemoryGame} size="lg">
              {language === 'es' ? 'Iniciar Juego' : 'Start Game'}
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{t.modes.memory}</span>
              <Badge variant="outline" className="text-lg">
                <Trophy className="w-4 h-4 mr-1" />
                {score}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {memoryCards.map((card) => {
                const isFlipped = flippedMemory.includes(card.id) || matchedPairs.includes(card.matchId);
                return (
                  <div
                    key={card.id}
                    onClick={() => handleMemoryClick(card)}
                    className={`aspect-square cursor-pointer transition-all duration-300 rounded-lg ${
                      isFlipped 
                        ? matchedPairs.includes(card.matchId)
                          ? 'bg-green-100 border-2 border-green-500'
                          : 'bg-blue-100 border-2 border-blue-500'
                        : 'bg-slate-200 hover:bg-slate-300'
                    }`}
                  >
                    <div className="h-full flex items-center justify-center p-2">
                      {isFlipped ? (
                        <p className={`text-center ${card.type === 'word' ? 'text-xl font-bold' : 'text-sm'}`}>
                          {card.content}
                        </p>
                      ) : (
                        <Ship className="w-8 h-8 text-slate-400" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {matchedPairs.length === 6 && (
              <div className="mt-6 text-center">
                <Award className="w-16 h-16 mx-auto text-yellow-500 mb-2" />
                <p className="text-2xl font-bold text-green-600 mb-4">{t.perfectScore}</p>
                <Button onClick={initMemoryGame}>{t.playAgain}</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderSpeedMode = () => {
    if (!speedActive && speedScore === 0) {
      return (
        <Card>
          <CardContent className="p-12 text-center">
            <Target className="w-20 h-20 mx-auto mb-4 text-red-600" />
            <h3 className="text-2xl font-bold mb-4">{t.speedRound}</h3>
            <p className="text-slate-600 mb-6">{t.selectCorrect}</p>
            <Button onClick={initSpeedChallenge} size="lg" className="bg-red-600 hover:bg-red-700">
              {language === 'es' ? 'Iniciar Desafío' : 'Start Challenge'}
            </Button>
          </CardContent>
        </Card>
      );
    }

    const word = cruiseWords[currentWord];

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{t.modes.challenge}</span>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-lg">
                ⏱️ {speedTimer}s
              </Badge>
              <Badge variant="outline" className="text-lg">
                <Trophy className="w-4 h-4 mr-1" />
                {speedScore}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {speedActive ? (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-red-50 to-orange-50 p-6 rounded-lg border-2 border-red-200">
                <h3 className="text-3xl font-bold text-center mb-2">{word.word}</h3>
                <p className="text-center text-slate-600">{t.selectCorrect}</p>
              </div>

              <div className="grid gap-3">
                {speedOptions.map((option, idx) => (
                  <Button
                    key={idx}
                    onClick={() => handleSpeedAnswer(option.correct)}
                    variant="outline"
                    className="h-auto p-4 text-left hover:bg-blue-50"
                  >
                    {option.text}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Trophy className="w-20 h-20 mx-auto mb-4 text-yellow-500" />
              <p className="text-2xl font-bold mb-2">{t.congrats}</p>
              <p className="text-4xl font-bold text-blue-600 mb-6">{speedScore}</p>
              <Button onClick={initSpeedChallenge}>{t.playAgain}</Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderLevelChallengeMode = () => {
    const lang = language as 'en' | 'es';
    if (!sessionLevelData) {
      return (
        <Card>
          <CardContent className="p-12 text-center">
            <Layers className="w-20 h-20 mx-auto mb-4 text-violet-600" />
            <h3 className="text-2xl font-bold mb-4">{t.modes.levels}</h3>
            <p className="text-slate-600 mb-6">
              {language === 'es'
                ? 'Se te asignará un nivel al azar según tu progreso (nivel actual ± 1).'
                : 'You will be assigned a random level based on your progress (current level ± 1).'}
            </p>
            <Button onClick={startLevelChallenge} size="lg" className="bg-violet-600 hover:bg-violet-700">
              {t.startLevelChallenge}
            </Button>
          </CardContent>
        </Card>
      );
    }
    const totalQuestions = sessionLevelData.words.length;
    const answered = Object.keys(levelAnswers).length;
    const progressPct = totalQuestions ? (answered / totalQuestions) * 100 : 0;
    const levelScore = sessionLevelData.words.reduce(
      (acc, w, i) => acc + (levelAnswers[i] === w.correct ? 100 : 0),
      0
    );

    const selectLevelAnswer = (index: number, option: string, correct: string) => {
      if (levelAnswers[index] !== undefined) return;
      setLevelAnswers((prev) => ({ ...prev, [index]: option }));
    };

    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>{sessionLevelData.name[lang]}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{sessionLevelData.desc[lang]}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={backLevelChallenge}>
              {t.backToModes}
            </Button>
            {answered === totalQuestions && (
              <Button
                size="sm"
                onClick={() => submitScore(levelScore, sessionLevel ?? undefined)}
                disabled={!userId || submitScoreMutation.isPending}
              >
                {submitScoreMutation.isPending ? (language === 'es' ? 'Guardando...' : 'Saving...') : t.submitScore}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-violet-600 transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="rounded-lg border bg-slate-50 dark:bg-slate-900/50 p-4 text-center">
            <span className="text-sm text-muted-foreground">{t.score}</span>
            <p className="text-2xl font-bold text-violet-600">{levelScore}</p>
          </div>
          <div className="space-y-6">
            {sessionLevelData.words.map((word, index) => (
              <div key={index} className="space-y-2">
                <div className="rounded-lg bg-slate-100 dark:bg-slate-800 p-3">
                  <span className="text-xs text-muted-foreground">{t.question} {index + 1}</span>
                  <p className="font-medium text-slate-800 dark:text-slate-200">{word.prompt[lang]}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {word.options.map((opt) => (
                    <Button
                      key={opt}
                      variant={levelAnswers[index] === opt ? 'default' : 'outline'}
                      className="h-auto py-3 text-left justify-start"
                      onClick={() => selectLevelAnswer(index, opt, word.correct)}
                      disabled={levelAnswers[index] !== undefined}
                    >
                      {opt}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {answered === totalQuestions && (
            <div className="flex justify-center gap-2 pt-4">
              <Button variant="outline" onClick={startLevelChallenge}>
                {t.playAgainLevel}
              </Button>
              {userId && (
                <Button
                  onClick={() => submitScore(levelScore, sessionLevel ?? undefined)}
                  disabled={submitScoreMutation.isPending}
                >
                  {submitScoreMutation.isPending ? (language === 'es' ? 'Guardando...' : 'Saving...') : t.submitScore}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <PageLayout maxWidth="6xl" className="relative overflow-hidden">
      {/* Partículas de celebración */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-3 h-3 bg-yellow-400 rounded-full animate-ping"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animationDelay: `${particle.delay}s`
          }}
        />
      ))}

      <div className="max-w-4xl mx-auto relative">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-between items-center mb-4">
            <div className="flex-1"></div>
            <h1 className="text-5xl font-bold text-slate-900 flex-1">{t.title}</h1>
            <div className="flex-1 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setLanguage(language === 'en' ? 'es' : 'en')}
              >
                {language === 'en' ? '🇪🇸 ES' : '🇺🇸 EN'}
              </Button>
            </div>
          </div>
        </div>

        {/* Prominent Learn Path banner */}
        <Card className="mb-8 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white border-none shadow-lg">
          <CardContent className="p-5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-1">{t.learnPath}</h2>
                <p className="text-sm text-violet-100">{t.learnPathDesc}</p>
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex-1 h-2.5 bg-white/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 transition-all duration-500"
                      style={{ width: `${learnProgressPct}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold whitespace-nowrap">
                    {lessonsCompleted}/{dbWords.length} · {learnProgressPct}%
                  </span>
                </div>
                <p className="text-xs text-violet-100 mt-2">
                  {t.learnPathProgress} · ⚡ {cruiseXp} XP
                </p>
              </div>
              <Button
                variant="secondary"
                size="lg"
                className="shrink-0 font-bold"
                onClick={() => window.location.href = '/games/cruiseword/learn'}
              >
                {lessonsCompleted > 0 ? t.continueLearning : t.startLearning}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Mode Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-8">
          {[
            { id: 'flashcard', icon: Star, color: 'blue' },
            { id: 'quiz', icon: Brain, color: 'green' },
            { id: 'memory', icon: Target, color: 'purple' },
            { id: 'challenge', icon: Zap, color: 'red' },
            { id: 'levels', icon: Layers, color: 'violet' }
          ].map((modeOption) => {
            const Icon = modeOption.icon;
            return (
              <Button
                key={modeOption.id}
                onClick={() => setMode(modeOption.id)}
                variant={mode === modeOption.id ? 'default' : 'outline'}
                className={`h-20 flex-col gap-2 ${mode === modeOption.id ? `bg-${modeOption.color}-600` : ''}`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs">{t.modes[modeOption.id]}</span>
              </Button>
            );
          })}
        </div>

        {/* Render Mode */}
        {mode === 'flashcard' && renderFlashcardMode()}
        {mode === 'quiz' && renderQuizMode()}
        {mode === 'memory' && renderMemoryMode()}
        {mode === 'challenge' && renderSpeedMode()}
        {mode === 'levels' && renderLevelChallengeMode()}

        {/* Global Stats */}
        <Card className="mt-8 bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-none">
          <CardContent className="p-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <Trophy className="w-8 h-8 mx-auto mb-2" />
                <p className="text-3xl font-bold">{score}</p>
                <p className="text-sm text-blue-100">{t.score}</p>
              </div>
              <div>
                <Zap className="w-8 h-8 mx-auto mb-2" />
                <p className="text-3xl font-bold">{streak}</p>
                <p className="text-sm text-blue-100">{t.streak}</p>
              </div>
              <div>
                <Award className="w-8 h-8 mx-auto mb-2" />
                <p className="text-3xl font-bold">{matchedPairs.length}</p>
                <p className="text-sm text-blue-100">Matches</p>
              </div>
            </div>
            {userId && (
              <div className="mt-4 flex flex-col items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => submitScore(score)}
                  disabled={score <= 0 || submitScoreMutation.isPending}
                  className="gap-2"
                >
                  <Upload className="w-4 h-4" />
                  {submitScoreMutation.isPending ? (language === 'es' ? 'Guardando...' : 'Saving...') : t.submitScore}
                </Button>
                {lastSubmitResult === 'ok' && <p className="text-sm text-blue-100">{t.scoreSaved}</p>}
                {lastSubmitResult === 'offline' && <p className="text-sm text-amber-200">{t.savedOffline}</p>}
                {lastSubmitRewards && (
                  <p className="text-sm text-blue-100 mt-1">
                    {t.xpEarned.replace('{n}', String(lastSubmitRewards.pointsEarned))}
                    {lastSubmitRewards.levelUp && ` · ${t.levelUp}`}
                    {lastSubmitRewards.badgesEarned.length > 0 && ` · ${t.newBadge} ${lastSubmitRewards.badgesEarned.map((b) => b.icon).join(' ')}`}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* My recent scores */}
        {userId && (
          <Card className="mt-6">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <ListOrdered className="w-5 h-5" />
                {t.myScores}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {myScores.length === 0 ? (
                <p className="text-muted-foreground text-sm">{t.noScoresYet}</p>
              ) : (
                <ul className="space-y-1 text-sm">
                  {myScores.slice(0, 5).map((row, i) => (
                    <li key={row.id} className="flex justify-between">
                      <span>{row.score} pts</span>
                      <span className="text-muted-foreground">
                        {row.playedAt ? new Date(row.playedAt).toLocaleDateString(language === 'es' ? 'es-HN' : 'en-US', { dateStyle: 'short' }) : ''}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        )}

        {/* Leaderboard */}
        <Card className="mt-6">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Trophy className="w-5 h-5" />
              {t.leaderboard}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {leaderboard.length === 0 ? (
              <p className="text-muted-foreground text-sm">{t.noLeaderboard}</p>
            ) : (
              <ul className="space-y-2">
                {leaderboard.map((row, i) => (
                  <li key={row.id} className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
                    <span className="font-medium text-muted-foreground w-6">{i + 1}</span>
                    <span className="flex-1 truncate">{row.displayName ?? `User ${row.userId}`}</span>
                    <Badge variant="secondary">{row.score}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}