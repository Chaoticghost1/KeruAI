import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/use-auth";
import { OFFLINE_ENABLED } from "@/lib/offline-config";
import { apiRequest } from "@/lib/queryClient";
import { OfflineManager } from "@/lib/offline-storage";
import { LINGUA_PLAY_LEVELS, LINGUA_PLAY_MODES, getLinguaPlayLevelById } from "@/data/linguaPlayLevels";
import { PageLayout } from "@/components/PageLayout";

const GAME_NAME = "LinguaPlay";
type Language = "en" | "es";

interface LanguageProblem {
  id: number;
  level: number;
  mode: string;
  promptEs: string;
  promptEn: string;
  options: string[];
  correctAnswer: string;
  explanationEs: string | null;
  explanationEn: string | null;
  audioUrl: string | null;
}

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

const t = {
  en: {
    title: "LinguaPlay",
    selectLevel: "Select level",
    selectMode: "Select mode",
    play: "Play",
    back: "Back",
    correct: "Correct!",
    incorrect: "Incorrect",
    correctAnswer: "Correct answer",
    next: "Next",
    finish: "Finish",
    yourScore: "Your score",
    submitScore: "Submit score",
    myScores: "My recent scores",
    leaderboard: "Leaderboard",
    noProblems: "No problems for this level and mode yet. Try another combination.",
    scoreSaved: "Score saved!",
    savedOffline: "Saved offline; will sync when online.",
    xpEarned: "+{n} XP",
    newBadge: "New badge!",
    levelUp: "Level up!",
  },
  es: {
    title: "LinguaPlay",
    selectLevel: "Elige nivel",
    selectMode: "Elige modo",
    play: "Jugar",
    back: "Atrás",
    correct: "¡Correcto!",
    incorrect: "Incorrecto",
    correctAnswer: "Respuesta correcta",
    next: "Siguiente",
    finish: "Terminar",
    yourScore: "Tu puntuación",
    submitScore: "Enviar puntuación",
    myScores: "Mis puntuaciones recientes",
    leaderboard: "Tabla de líderes",
    noProblems: "Aún no hay problemas para este nivel y modo. Prueba otra combinación.",
    scoreSaved: "¡Puntuación guardada!",
    savedOffline: "Guardado sin conexión; se sincronizará al estar en línea.",
    xpEarned: "+{n} XP",
    newBadge: "¡Nueva insignia!",
    levelUp: "¡Subiste de nivel!",
  },
};

interface SubmitRewards {
  pointsEarned: number;
  badgesEarned: { name: string; icon: string }[];
  levelUp: boolean;
}

export default function LinguaPlay() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id;
  const lang = (language === "es" ? "es" : "en") as Language;
  const text = t[lang];

  const [pickedLevel, setPickedLevel] = useState<number | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [selectedMode, setSelectedMode] = useState<string>("vocabulary");
  const [problems, setProblems] = useState<LanguageProblem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [lastSubmitResult, setLastSubmitResult] = useState<"ok" | "offline" | null>(null);
  const [lastSubmitRewards, setLastSubmitRewards] = useState<SubmitRewards | null>(null);

  const { data: problemsData, isLoading: problemsLoading, isError: problemsError, error: problemsErrorDetail } = useQuery<LanguageProblem[]>({
    queryKey: ["/api/games/problems/linguaplay", selectedLevel, selectedMode],
    queryFn: async () => {
      if (selectedLevel == null) return [];
      const res = await apiRequest("GET", `/api/games/problems/linguaplay/${selectedLevel}?mode=${encodeURIComponent(selectedMode)}`);
      if (!res.ok) {
        const text = await res.text();
        let errBody: { hint?: string } = {};
        try { errBody = JSON.parse(text); } catch { /* ignore */ }
        throw new Error(errBody.hint || `${res.status}: ${text}`);
      }
      return res.json();
    },
    enabled: selectedLevel != null,
    retry: (_, error) => !String(error?.message).includes("setup:games"),
  });

  const { data: myScores = [] } = useQuery<GameScoreRow[]>({
    queryKey: ["/api/games", "scores", userId, GAME_NAME],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/games/scores?game=${GAME_NAME}`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!userId,
  });

  const { data: leaderboard = [] } = useQuery<(GameScoreRow & { displayName: string })[]>({
    queryKey: ["/api/games", "leaderboard", GAME_NAME],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/games/leaderboard/${GAME_NAME}?limit=10`);
      if (!res.ok) return [];
      return res.json();
    },
  });

  const submitScoreMutation = useMutation({
    mutationFn: async (payload: { score: number; level: number; completed: boolean }) => {
      const body = { gameName: GAME_NAME, score: payload.score, level: payload.level, completed: payload.completed };
      if (OFFLINE_ENABLED && !navigator.onLine && userId) {
        await OfflineManager.saveGameScoreOffline({
          userId,
          gameName: GAME_NAME,
          score: payload.score,
          level: payload.level,
          completed: payload.completed,
          playedAt: new Date().toISOString(),
        });
        return { offline: true };
      }
      try {
        const res = await apiRequest("POST", "/api/games/scores", body);
        if (!res.ok) throw new Error("Failed to save score");
        return res.json();
      } catch (err) {
        if (OFFLINE_ENABLED && userId && !navigator.onLine) {
          await OfflineManager.saveGameScoreOffline({
            userId,
            gameName: GAME_NAME,
            score: payload.score,
            level: payload.level,
            completed: payload.completed,
            playedAt: new Date().toISOString(),
          });
          return { offline: true };
        }
        throw err;
      }
    },
    onSuccess: (data) => {
      if (data && (data as { offline?: boolean }).offline) {
        setLastSubmitResult("offline");
        setLastSubmitRewards(null);
      } else {
        setLastSubmitResult("ok");
        const rewards = (data as { rewards?: SubmitRewards })?.rewards;
        setLastSubmitRewards(rewards ?? null);
        setTimeout(() => setLastSubmitRewards(null), 5000);
      }
      setTimeout(() => setLastSubmitResult(null), 3000);
      queryClient.invalidateQueries({ queryKey: ["/api/games", "scores", userId, GAME_NAME] });
      queryClient.invalidateQueries({ queryKey: ["/api/games", "leaderboard", GAME_NAME] });
      queryClient.invalidateQueries({ queryKey: ["/api/progress"] });
    },
  });

  const startLevel = (level: number, mode: string) => {
    setSelectedLevel(level);
    setSelectedMode(mode);
    setPickedLevel(null);
    setCurrentIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setProblems([]);
  };

  useEffect(() => {
    if (selectedLevel != null && problemsData && problemsData.length > 0 && problems.length === 0) {
      setProblems([...problemsData]);
    }
  }, [selectedLevel, problemsData, problems.length]);

  const currentProblem = problems[currentIndex];
  const prompt = lang === "es" ? (currentProblem?.promptEs ?? "") : (currentProblem?.promptEn ?? "");
  const explanation = lang === "es" ? (currentProblem?.explanationEs ?? "") : (currentProblem?.explanationEn ?? "");

  const handleAnswer = (answer: string) => {
    if (showResult || !currentProblem) return;
    setSelectedAnswer(answer);
    setShowResult(true);
    if (answer === currentProblem.correctAnswer) {
      setScore((s) => s + 10);
    }
  };

  const handleNext = () => {
    if (currentIndex < problems.length - 1) {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  const handleFinish = () => {
    if (selectedLevel == null || !userId) return;
    submitScoreMutation.mutate({ score, level: selectedLevel, completed: true });
    setSelectedLevel(null);
    setProblems([]);
    setCurrentIndex(0);
    setScore(0);
  };

  const levelMeta = selectedLevel != null ? getLinguaPlayLevelById(selectedLevel) : null;
  const modeMeta = LINGUA_PLAY_MODES.find((m) => m.key === selectedMode);

  return (
    <PageLayout maxWidth="6xl">
      <div className="max-w-2xl mx-auto">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/games">
          <Button variant="ghost" size="sm">{text.back}</Button>
        </Link>
        <h1 className="text-2xl font-bold text-foreground">{text.title}</h1>
      </div>

      {selectedLevel == null && pickedLevel == null && lastSubmitRewards && (
        <Card className="mb-6 border-green-500/50 bg-green-500/5">
          <CardContent className="py-4">
            <p className="text-sm font-medium text-green-700 dark:text-green-400">{text.scoreSaved}</p>
            <p className="text-sm text-foreground mt-1">{text.xpEarned.replace("{n}", String(lastSubmitRewards.pointsEarned))}</p>
            {lastSubmitRewards.levelUp && <p className="text-sm font-medium text-youth-primary mt-1">{text.levelUp}</p>}
            {lastSubmitRewards.badgesEarned.length > 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                {text.newBadge} {lastSubmitRewards.badgesEarned.map((b) => b.icon).join(" ")} {lastSubmitRewards.badgesEarned.map((b) => b.name).join(", ")}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {selectedLevel == null && pickedLevel == null && (
        <>
          <p className="text-muted-foreground mb-2">{text.selectLevel}</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {LINGUA_PLAY_LEVELS.map((level) => (
              <Card
                key={level.id}
                className="cursor-pointer hover:shadow-md transition-all border-2 border-muted/50 hover:border-primary/50"
                onClick={() => setPickedLevel(level.id)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{level.name[lang]}</CardTitle>
                  <CardDescription className="text-sm">{level.desc[lang]}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </>
      )}

      {pickedLevel != null && selectedLevel == null && (
        <>
          <p className="text-muted-foreground mb-2">{text.selectMode}</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {LINGUA_PLAY_MODES.map((mode) => (
              <Button
                key={mode.key}
                variant={selectedMode === mode.key ? "default" : "outline"}
                size="sm"
                onClick={() => startLevel(pickedLevel, mode.key)}
              >
                {mode.name[lang]}
              </Button>
            ))}
          </div>
          <Button variant="ghost" onClick={() => setPickedLevel(null)}>{text.back}</Button>
        </>
      )}

      {selectedLevel != null && problemsLoading && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Loading problems…
          </CardContent>
        </Card>
      )}

      {selectedLevel != null && !problemsLoading && (problemsError || (problemsData?.length === 0 && problems.length === 0)) && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {problemsError ? (
              <>
                <p className="text-destructive font-medium">{lang === "es" ? "No se pudieron cargar los problemas." : "Could not load problems."}</p>
                <p className="mt-2 text-sm">{(problemsErrorDetail as Error)?.message || ""}</p>
                <p className="mt-2 text-sm">{lang === "es" ? "En la terminal del proyecto ejecuta: npm run setup:games" : "In the project terminal run: npm run setup:games"}</p>
              </>
            ) : (
              text.noProblems
            )}
            <div className="mt-4">
              <Button onClick={() => { setSelectedLevel(null); setProblems([]); }}>{text.back}</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedLevel != null && problems.length > 0 && currentProblem && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {levelMeta?.name[lang]} — {modeMeta?.name[lang]} — {currentIndex + 1} / {problems.length}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-foreground font-medium">{prompt}</p>
            <div className="grid gap-2">
              {(currentProblem.options as string[]).map((opt) => (
                <Button
                  key={opt}
                  variant={selectedAnswer === opt ? (opt === currentProblem.correctAnswer ? "default" : "destructive") : "outline"}
                  className="justify-start text-left"
                  onClick={() => handleAnswer(opt)}
                  disabled={showResult}
                >
                  {opt}
                </Button>
              ))}
            </div>
            {showResult && explanation && (
              <p className="text-sm text-muted-foreground border-t pt-2">{explanation}</p>
            )}
            <div className="flex justify-between pt-4">
              <span className="text-sm text-muted-foreground">{text.yourScore}: {score}</span>
              {currentIndex < problems.length - 1 ? (
                <Button onClick={handleNext}>{text.next}</Button>
              ) : (
                <Button
                  onClick={handleFinish}
                  disabled={submitScoreMutation.isPending}
                >
                  {text.finish} — {text.submitScore}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {selectedLevel != null && problems.length > 0 && !currentProblem && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-foreground font-medium">{text.yourScore}: {score}</p>
            <Button className="mt-4" onClick={handleFinish} disabled={submitScoreMutation.isPending}>
              {text.submitScore}
            </Button>
            {lastSubmitResult === "ok" && <p className="mt-2 text-sm text-green-600">{text.scoreSaved}</p>}
            {lastSubmitResult === "offline" && <p className="mt-2 text-sm text-amber-600">{text.savedOffline}</p>}
          </CardContent>
        </Card>
      )}

      <div className="mt-8 grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{text.myScores}</CardTitle>
          </CardHeader>
          <CardContent>
            {myScores.length === 0 ? (
              <p className="text-sm text-muted-foreground">{lang === "es" ? "Aún no hay puntuaciones." : "No scores yet."}</p>
            ) : (
              <ul className="text-sm space-y-1">
                {myScores.slice(0, 5).map((s) => (
                  <li key={s.id}>Level {s.level}: {s.score} — {new Date(s.playedAt).toLocaleDateString()}</li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{text.leaderboard}</CardTitle>
          </CardHeader>
          <CardContent>
            {leaderboard.length === 0 ? (
              <p className="text-sm text-muted-foreground">{lang === "es" ? "Aún no hay entradas." : "No entries yet."}</p>
            ) : (
              <ul className="text-sm space-y-1">
                {leaderboard.map((s, i) => (
                  <li key={s.id}>{i + 1}. {s.displayName ?? `User ${s.userId}`}: {s.score}</li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
      </div>
    </PageLayout>
  );
}
