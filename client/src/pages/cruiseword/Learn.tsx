import { useState } from "react";
import { useLocation } from "wouter";
import { PageLayout } from "@/components/PageLayout";
import { CRUISEWORD_UNITS, getUnit, CruiseWordTile, CruiseWordUnit } from "@/data/cruiseWordUnits";
import { useCruiseWordStore } from "@/stores/cruiseWordStore";
import {
  Star,
  BookOpen,
  Dumbbell,
  Trophy,
  Lock,
  Check,
} from "lucide-react";

type TileStatus = "LOCKED" | "ACTIVE" | "COMPLETE";

function tileStatus(
  unit: CruiseWordUnit,
  tileIndex: number,
  lessonsCompleted: number,
): TileStatus {
  const lessonsPerTile = 1;
  const tilesCompleted = Math.floor(lessonsCompleted / lessonsPerTile);
  const tiles = unit.tiles;
  const tilePosition = tiles
    .slice(0, tileIndex + 1)
    .filter((t) => t.type === "lesson").length;

  if (tilePosition <= tilesCompleted) return "COMPLETE";
  if (tilePosition === tilesCompleted + 1) return "ACTIVE";
  return "LOCKED";
}

function TileIcon({
  tileType,
  status,
}: {
  tileType: CruiseWordTile["type"];
  status: TileStatus;
}) {
  if (status === "COMPLETE") return <Check className="w-6 h-6 text-white" />;
  if (status === "LOCKED") return <Lock className="w-6 h-6 text-gray-400" />;
  // ACTIVE
  switch (tileType) {
    case "lesson":
      return <BookOpen className="w-6 h-6" />;
    case "review":
      return <Trophy className="w-6 h-6" />;
    case "treasure":
      return <Star className="w-6 h-6" />;
  }
}

function UnitHeader({
  unit,
}: {
  unit: CruiseWordUnit;
}) {
  const lang = document.documentElement.lang === "es" ? "es" : "en";
  return (
    <article className={`max-w-2xl text-white sm:rounded-xl ${unit.backgroundColor}`}>
      <header className="flex items-center justify-between gap-4 p-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold">
            {lang === "es" ? `Unidad ${unit.unitNumber}` : `Unit ${unit.unitNumber}`}
          </h2>
          <p className="text-lg">{unit.description[lang as "es" | "en"]}</p>
        </div>
      </header>
    </article>
  );
}

function UnitSection({
  unit,
  lessonsCompleted,
  onStartTile,
}: {
  unit: CruiseWordUnit;
  lessonsCompleted: number;
  onStartTile: (unitNumber: number, tileIndex: number) => void;
}) {
  const lang = document.documentElement.lang === "es" ? "es" : "en";
  const [selectedTile, setSelectedTile] = useState<number | null>(null);

  return (
    <>
      <UnitHeader unit={unit} />
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

export default function CruiseWordLearn() {
  const [_, navigate] = useLocation();
  const lessonsCompleted = useCruiseWordStore((s) => s.lessonsCompleted);

  const handleStartTile = (unitNumber: number, tileIndex: number) => {
    navigate(`/games/cruiseword/lesson?unit=${unitNumber}&tile=${tileIndex}`);
  };

  return (
    <PageLayout maxWidth="7xl">
      <div className="max-w-2xl mx-auto py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          {document.documentElement.lang === "es" ? "Aprende Crucero" : "Learn Cruise Words"}
        </h1>
        <p className="text-gray-500 mb-8">
          {document.documentElement.lang === "es"
            ? "Completa lecciones para subir de nivel"
            : "Complete lessons to level up"}
        </p>

        {CRUISEWORD_UNITS.map((unit) => (
          <UnitSection
            key={unit.unitNumber}
            unit={unit}
            lessonsCompleted={lessonsCompleted}
            onStartTile={handleStartTile}
          />
        ))}
      </div>
    </PageLayout>
  );
}
