import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { PageLayout } from "@/components/PageLayout";
import { apiRequest } from "@/lib/queryClient";
import type { LanguageProblem } from "@shared/schema";
import {
  buildLinguaPlayUnits,
  getLinguaPlayUnit,
  type LinguaPlayUnitView,
} from "@/data/linguaPlayFeeder";
import { LINGUA_PLAY_MODES } from "@/data/linguaPlayLevels";
import { useLinguaPlayStore } from "@/stores/linguaPlayStore";
import { Star, BookOpen, Trophy, Lock, Check } from "lucide-react";

type TileStatus = "LOCKED" | "ACTIVE" | "COMPLETE";

function tileStatus(
  unit: LinguaPlayUnitView,
  tileIndex: number,
  lessonsCompleted: number,
): TileStatus {
  const tiles = unit.tiles;
  const tilePosition = tiles
    .slice(0, tileIndex + 1)
    .filter((t) => t.type === "lesson").length;
  if (tilePosition <= lessonsCompleted) return "COMPLETE";
  if (tilePosition === lessonsCompleted + 1) return "ACTIVE";
  return "LOCKED";
}

function TileIcon({ tileType, status }: { tileType: string; status: TileStatus }) {
  if (status === "COMPLETE") return <Check className="w-6 h-6 text-white" />;
  if (status === "LOCKED") return <Lock className="w-6 h-6 text-gray-400" />;
  switch (tileType) {
    case "lesson":
      return <BookOpen className="w-6 h-6" />;
    case "review":
      return <Trophy className="w-6 h-6" />;
    case "treasure":
      return <Star className="w-6 h-6" />;
  }
  return null;
}

function UnitSection({
  unit,
  lessonsCompleted,
  onStartTile,
}: {
  unit: LinguaPlayUnitView;
  lessonsCompleted: number;
  onStartTile: (unitNumber: number, tileIndex: number) => void;
}) {
  const lang = document.documentElement.lang === "es" ? "es" : "en";
  return (
    <>
      <article className={`max-w-2xl text-white sm:rounded-xl ${unit.backgroundColor}`}>
        <header className="flex items-center justify-between gap-4 p-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-bold">{unit.name[lang]}</h2>
            <p className="text-lg">{unit.description[lang]}</p>
          </div>
        </header>
      </article>
      <div className="relative mb-8 mt-[67px] flex max-w-2xl flex-col items-center gap-4">
        {unit.tiles.map((tile, i) => {
          const status = tileStatus(unit, i, lessonsCompleted);
          const isLocked = status === "LOCKED";
          const isActive = status === "ACTIVE";
          const colors =
            status === "COMPLETE"
              ? "border-yellow-500 bg-yellow-400"
              : isLocked
                ? "border-[#b7b7b7] bg-[#e5e5e5]"
                : `${unit.borderColor} ${unit.backgroundColor}`;
          return (
            <div key={i} className="relative -mb-4 h-[93px] w-[98px]">
              {isActive && (
                <div className="absolute z-10 -top-6 left-1/2 -translate-x-1/2 animate-bounce rounded-lg border-2 border-gray-200 bg-white px-3 py-2 font-bold uppercase text-gray-600">
                  {lang === "es" ? "Empezar" : "Start"}
                </div>
              )}
              <button
                className={`absolute m-3 rounded-full border-b-8 p-4 ${colors} transition hover:brightness-95`}
                disabled={isLocked}
                onClick={() => !isLocked && onStartTile(unit.unitNumber, i)}
                aria-label={tile.title}
              >
                <TileIcon tileType={tile.type} status={status} />
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
}

export default function LinguaPlayLearn() {
  const [_, navigate] = useLocation();
  const [mode, setMode] = useState<string>("vocabulary");
  const lessonsCompleted = useLinguaPlayStore((s) => s.lessonsCompleted);

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

  const handleStartTile = (unitNumber: number, tileIndex: number) => {
    navigate(`/games/linguaplay/lesson?mode=${mode}&unit=${unitNumber}&tile=${tileIndex}`);
  };

  const lang = document.documentElement.lang === "es" ? "es" : "en";

  return (
    <PageLayout maxWidth="7xl">
      <div className="max-w-2xl mx-auto py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          {lang === "es" ? "Aprende Idiomas" : "Learn Languages"}
        </h1>
        <p className="text-gray-500 mb-4">
          {lang === "es"
            ? "Elige un modo y completa lecciones estilo Duolingo"
            : "Pick a mode and complete Duolingo-style lessons"}
        </p>

        <div className="flex flex-wrap gap-2 mb-8">
          {LINGUA_PLAY_MODES.map((m) => (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              className={`rounded-full border-2 px-4 py-2 text-sm font-bold transition ${
                mode === m.key
                  ? "border-[#1cb0f6] bg-[#1cb0f6] text-white"
                  : "border-gray-300 text-gray-600 hover:bg-gray-100"
              }`}
            >
              {m.name[lang]}
            </button>
          ))}
        </div>

        {isLoading ? (
          <p className="text-center text-gray-400">Loading…</p>
        ) : units.length === 0 ? (
          <p className="text-center text-gray-400">
            {lang === "es"
              ? "Sin ejercicios para este modo."
              : "No exercises for this mode yet."}
          </p>
        ) : (
          units.map((unit) => (
            <UnitSection
              key={unit.unitNumber}
              unit={unit}
              lessonsCompleted={lessonsCompleted}
              onStartTile={handleStartTile}
            />
          ))
        )}
      </div>
    </PageLayout>
  );
}
