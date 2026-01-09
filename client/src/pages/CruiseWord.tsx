import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Compass, Users, Shield, UtensilsCrossed, Calendar, Ship, Trophy, Zap, Target, Brain, Award } from 'lucide-react';

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
      challenge: "Speed Challenge"
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
    playAgain: "Play Again"
  },
  es: {
    title: "Entrenador de Vocabulario de Crucero",
    modes: {
      flashcard: "Tarjetas",
      quiz: "Quiz Rápido",
      memory: "Juego de Memoria",
      challenge: "Desafío de Velocidad"
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
    playAgain: "Jugar de Nuevo"
  }
};

const useLanguage = () => {
  const [language, setLanguage] = useState<Language>('en');
  return { language, setLanguage, t: translations[language] };
};

export default function CruiseWord() {
  const { language, setLanguage, t } = useLanguage();
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

  const cruiseWords = [
    {
      word: "Galley",
      definition: {
        es: "La cocina principal del barco donde se preparan las comidas para la tripulación y pasajeros.",
        en: "The main kitchen of the ship where meals are prepared for crew and passengers."
      },
      hint: { es: "🍳 Lugar donde se cocina", en: "🍳 Where cooking happens" },
      category: { es: 'Cocina', en: 'Kitchen' },
      icon: UtensilsCrossed,
      color: 'text-orange-600'
    },
    {
      word: "Muster",
      definition: {
        es: "Reunión obligatoria de la tripulación para simulacros de seguridad o emergencias.",
        en: "Mandatory crew meeting for safety drills or emergencies."
      },
      hint: { es: "⚠️ Reunión de emergencia", en: "⚠️ Emergency meeting" },
      category: { es: 'Seguridad', en: 'Safety' },
      icon: Shield,
      color: 'text-red-600'
    },
    {
      word: "Port",
      definition: {
        es: "El lado izquierdo del barco cuando miras hacia adelante.",
        en: "The left side of the ship when facing forward."
      },
      hint: { es: "⬅️ Lado izquierdo", en: "⬅️ Left side" },
      category: { es: 'Navegación', en: 'Navigation' },
      icon: Compass,
      color: 'text-blue-600'
    },
    {
      word: "Starboard",
      definition: {
        es: "El lado derecho del barco cuando miras hacia adelante.",
        en: "The right side of the ship when facing forward."
      },
      hint: { es: "➡️ Lado derecho", en: "➡️ Right side" },
      category: { es: 'Navegación', en: 'Navigation' },
      icon: Compass,
      color: 'text-blue-600'
    },
    {
      word: "Cabin Steward",
      definition: {
        es: "Personal encargado de limpiar y mantener los camarotes de los pasajeros.",
        en: "Staff responsible for cleaning and maintaining passenger cabins."
      },
      hint: { es: "🧹 Limpia cabinas", en: "🧹 Cleans cabins" },
      category: { es: 'Servicio', en: 'Service' },
      icon: Users,
      color: 'text-green-600'
    },
    {
      word: "Bridge",
      definition: {
        es: "El centro de control del barco donde el capitán y oficiales navegan.",
        en: "The ship's control center where the captain and officers navigate."
      },
      hint: { es: "🎯 Centro de control", en: "🎯 Control center" },
      category: { es: 'Navegación', en: 'Navigation' },
      icon: Compass,
      color: 'text-blue-600'
    },
    {
      word: "Tender",
      definition: {
        es: "Bote pequeño usado para transportar pasajeros del barco a la costa.",
        en: "Small boat used to transport passengers from ship to shore."
      },
      hint: { es: "🚤 Bote pequeño", en: "🚤 Small boat" },
      category: { es: 'Transporte', en: 'Transport' },
      icon: Ship,
      color: 'text-cyan-600'
    },
    {
      word: "FOH",
      definition: {
        es: "Front of House - Personal que trabaja directamente con los pasajeros.",
        en: "Front of House - Staff who work directly with passengers."
      },
      hint: { es: "👥 Cara al público", en: "👥 Faces customers" },
      category: { es: 'Servicio', en: 'Service' },
      icon: Users,
      color: 'text-green-600'
    }
  ];

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

  // Timer para Speed Challenge
  useEffect(() => {
    if (speedActive && speedTimer > 0) {
      const timer = setTimeout(() => setSpeedTimer(speedTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else if (speedTimer === 0) {
      setSpeedActive(false);
    }
  }, [speedTimer, speedActive]);

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
        setTimeout(() => {
          setMatchedPairs([...matchedPairs, first.matchId]);
          setFlippedMemory([]);
          setScore(score + 10);
          createParticles();
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
              <Icon className={`w-16 h-16 mx-auto mb-4 ${word.color}`} />
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
            <CardContent className="p-12 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
              <p className="text-2xl text-slate-700 dark:text-slate-200 mb-4">{word.definition[language as keyof typeof word.definition]}</p>
              <Badge variant="outline" className="dark:border-slate-700">{word.hint[language as keyof typeof word.hint]}</Badge>
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
          <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
            <p className="text-xl text-slate-700 dark:text-slate-300 mb-2">{word.definition[language as keyof typeof word.definition]}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{word.hint[language as keyof typeof word.hint]}</p>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4 md:p-6 relative overflow-hidden">
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

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-between items-center mb-4">
            <div className="flex-1"></div>
            <h1 className="text-5xl font-bold text-slate-900 dark:text-white flex-1">{t.title}</h1>
            <div className="flex-1 flex justify-end">
              <Button
                variant="outline"
                onClick={() => setLanguage(language === 'en' ? 'es' : 'en')}
              >
                {language === 'en' ? '🇪🇸 ES' : '🇺🇸 EN'}
              </Button>
            </div>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="grid grid-cols-4 gap-3 mb-8">
          {[
            { id: 'flashcard', icon: Star, color: 'blue' },
            { id: 'quiz', icon: Brain, color: 'green' },
            { id: 'memory', icon: Target, color: 'purple' },
            { id: 'challenge', icon: Zap, color: 'red' }
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}