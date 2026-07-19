import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { LanguageProblem } from "@shared/schema";
import {
  buildLinguaPlayUnits,
  getLinguaPlayUnit,
  problemToExercise,
} from "@/data/linguaPlayFeeder";
import { DuoLessonScreen } from "@/components/duolingo/DuoLessonScreen";
import { useLinguaPlayStore } from "@/stores/linguaPlayStore";

export default function LinguaPlayLesson() {
  const [location, navigate] = useLocation();
  const search = new URLSearchParams(window.location.search);
  const mode = search.get("mode") ?? "vocabulary";
  const unitNumber = Number(search.get("unit") ?? "1");
  const tileIndex = Number(search.get("tile") ?? "0");

  const store = useLinguaPlayStore();

  const { data: problems = [], isLoading } = useQuery<LanguageProblem[]>({
    queryKey: ["/api/games/problems/linguaplay/all", mode],
    queryFn: async () => {
      const res = await apiRequest(
        "GET",
        `/api/games/problems/linguaplay/all?mode=${encodeURIComponent(mode)}`,
      );
      if (!res.ok) return [];
      return res.json();
    },
  });

  const units = buildLinguaPlayUnits(problems, mode);
  const unit = getLinguaPlayUnit(units, unitNumber);
  const tile = unit?.tiles[tileIndex];

  const handleExit = () => navigate("/games/linguaplay/learn");

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-400">Loading…</p>
      </div>
    );
  }

  if (!unit || !tile || tile.type !== "lesson") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Lesson not found</p>
      </div>
    );
  }

  const exercises = tile.problems.map(problemToExercise);

  return (
    <DuoLessonScreen
      exercises={exercises}
      hearts={store.hearts}
      onExit={handleExit}
      header={{
        writeIcon: "🗣️",
        writeLabel: { es: "Escribe la respuesta", en: "Write the answer" },
        onCorrect: () => store.increaseXp(10),
        onIncorrect: () => store.loseHeart(),
        onLessonComplete: () => {
          store.markLessonComplete(unit.unitNumber, tileIndex);
          store.increaseLingots(1);
          store.addToday();
        },
      }}
    />
  );
}
