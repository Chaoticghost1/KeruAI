import { useEffect } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { staggerCards } from "@/lib/animations";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gamepad2, Ship, Calculator, Languages, ArrowRight, Award, Flame, TrendingUp } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import type { StudentProfile } from "@/types/profile";
import { PageLayout } from "@/components/PageLayout";
import { FeatureCard } from "@/components/FeatureCard";

const games = [
  {
    key: "cruiseword",
    path: "/games/cruiseword",
    title: { en: "CruiseWord", es: "CruiseWord" },
    description: {
      en: "Travel and cruise vocabulary. 6 levels, bilingual.",
      es: "Vocabulario de viajes y cruceros. 6 niveles, bilingüe.",
    },
    icon: Ship,
    color: "text-blue-600",
    bgColor: "bg-blue-500/10",
  },
  {
    key: "mathmaster",
    path: "/games/mathmaster",
    title: { en: "MathMaster", es: "MathMaster" },
    description: {
      en: "Math from arithmetic to calculus. 6 levels, links to Math Buddy.",
      es: "Matemáticas de aritmética a cálculo. 6 niveles, enlace con Math Buddy.",
    },
    icon: Calculator,
    color: "text-emerald-600",
    bgColor: "bg-emerald-500/10",
  },
  {
    key: "linguaplay",
    path: "/games/linguaplay",
    title: { en: "LinguaPlay", es: "LinguaPlay" },
    description: {
      en: "Vocabulary, grammar, listening. 6 levels, 5 modes, bilingual.",
      es: "Vocabulario, gramática, comprensión auditiva. 6 niveles, 5 modos, bilingüe.",
    },
    icon: Languages,
    color: "text-violet-600",
    bgColor: "bg-violet-500/10",
  },
];

interface GameScoreRow {
  id: number;
  score: number;
  level: number;
  playedAt: string;
}

export default function GameHub() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const userId = user?.id;
  const lang = (language === "es" ? "es" : "en") as "en" | "es";

  const { data: profile } = useQuery<StudentProfile | null>({
    queryKey: ["/api/progress", "profile", userId],
    queryFn: async () => {
      if (!userId || user?.role !== "student") return null;
      try {
        const res = await apiRequest("GET", `/api/progress/profile/${userId}`);
        if (!res.ok) return null;
        return res.json();
      } catch {
        return null;
      }
    },
    enabled: !!userId && user?.role === "student",
  });

  const { data: scoresCruiseWord = [] } = useQuery<GameScoreRow[]>({
    queryKey: ["/api/games", "scores", userId, "CruiseWord"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/games/scores?game=CruiseWord");
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!userId,
  });
  const { data: scoresMathMaster = [] } = useQuery<GameScoreRow[]>({
    queryKey: ["/api/games", "scores", userId, "MathMaster"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/games/scores?game=MathMaster");
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!userId,
  });
  const { data: scoresLinguaPlay = [] } = useQuery<GameScoreRow[]>({
    queryKey: ["/api/games", "scores", userId, "LinguaPlay"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/games/scores?game=LinguaPlay");
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!userId,
  });

  const lastScoreByGame: Record<string, { score: number; level: number } | null> = {
    cruiseword: scoresCruiseWord.length > 0 ? { score: scoresCruiseWord[0].score, level: scoresCruiseWord[0].level } : null,
    mathmaster: scoresMathMaster.length > 0 ? { score: scoresMathMaster[0].score, level: scoresMathMaster[0].level } : null,
    linguaplay: scoresLinguaPlay.length > 0 ? { score: scoresLinguaPlay[0].score, level: scoresLinguaPlay[0].level } : null,
  };

  useEffect(() => {
    staggerCards('[data-animate="card"]');
  }, []);

  return (
    <PageLayout maxWidth="6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          {lang === "es" ? "Juegos y práctica" : "Games & Practice"}
        </h1>
        <p className="text-muted-foreground">
          {lang === "es"
            ? "Elige un juego para practicar y ganar XP."
            : "Choose a game to practice and earn XP."}
        </p>
      </div>

      {profile && user?.role === "student" && (
        <Card className="mb-8 rounded-youth-lg border-2 border-youth-muted/50 bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">
              {lang === "es" ? "Tu progreso" : "Your progress"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-youth-lg bg-youth-primary/20 flex items-center justify-center">
                  <Award className="h-5 w-5 text-youth-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-youth-primary">{profile.level}</p>
                  <p className="text-xs text-muted-foreground">{lang === "es" ? "Nivel" : "Level"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-youth-lg bg-youth-success/20 flex items-center justify-center">
                  <Flame className="h-5 w-5 text-youth-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-youth-success">{profile.currentStreak}</p>
                  <p className="text-xs text-muted-foreground">{lang === "es" ? "Racha" : "Streak"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-youth-lg bg-youth-accent/20 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-youth-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-youth-accent">{profile.totalPoints ?? 0}</p>
                  <p className="text-xs text-muted-foreground">{lang === "es" ? "Puntos" : "Points"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-youth-lg bg-muted flex items-center justify-center">
                  <Gamepad2 className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{profile.experiencePoints ?? 0}</p>
                  <p className="text-xs text-muted-foreground">XP</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {games.map((game) => {
          const Icon = game.icon;
          return (
            <FeatureCard
              key={game.key}
              href={game.path}
              icon={<Icon className={`h-6 w-6 ${game.color}`} />}
              title={game.title[lang]}
              description={game.description[lang]}
              iconBgClassName={game.bgColor}
              borderClassName="border-2 border-youth-muted/50 hover:border-youth-primary/50 rounded-youth-lg bg-card hover:shadow-lg"
              action={
                <Button variant="outline" className="w-full rounded-youth-lg">
                  {lang === "es" ? "Jugar" : "Play"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              }
              children={
                lastScoreByGame[game.key] ? (
                  <p className="text-xs text-muted-foreground mt-2">
                    {lang === "es" ? "Última puntuación" : "Last score"}: {lastScoreByGame[game.key]!.score} ({lang === "es" ? "nivel" : "level"} {lastScoreByGame[game.key]!.level})
                  </p>
                ) : undefined
              }
            />
          );
        })}
      </div>

      <div className="mt-8 flex justify-center">
        <Link href="/dashboard">
          <Button variant="ghost">{lang === "es" ? "Volver al inicio" : "Back to dashboard"}</Button>
        </Link>
      </div>
    </PageLayout>
  );
}
