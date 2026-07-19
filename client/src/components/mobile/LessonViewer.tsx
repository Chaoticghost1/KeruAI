// client/src/components/mobile/LessonViewer.tsx
// Mobile-first Student Lesson Viewer & Revision Pack screen.
// Composes LessonHeader (title + concept pills + quick-revision CTA) with:
//  - Summary (incremental reveal)
//  - Flashcards (swipe to navigate, tap to flip)
//  - Practice (one question at a time, full-width options)
//
// Adapts: compact = stacked single column; comfortable/wide = summary + side
// panel. Offline-ready: accepts preloaded pack data (no network needed).

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LessonHeader } from "./LessonHeader";
import { SwipeToDismiss } from "./SwipeToDismiss";
import { STYLE_TOKENS } from "./tokens";
import { useDynamicLayout } from "./useDynamicLayout";
import { ChevronLeft, ChevronRight, RotateCcw, CheckCircle2, Lightbulb } from "lucide-react";

export interface Flashcard {
  id: number;
  front: string;
  back: string;
}

export interface PracticeQuestion {
  id: number;
  question: string;
  options?: string[];
  answer: string;
  explanation?: string;
}

export interface LessonViewerProps {
  title: string;
  subtitle?: string;
  concepts?: string[];
  summary?: string;
  flashcards?: Flashcard[];
  practice?: PracticeQuestion[];
  onQuickRevision?: () => void;
  onReview?: (itemId: number, difficulty: "easy" | "medium" | "hard") => void;
  className?: string;
}

type Tab = "summary" | "cards" | "practice";

export function LessonViewer({
  title,
  subtitle,
  concepts = [],
  summary,
  flashcards = [],
  practice = [],
  onQuickRevision,
  onReview,
  className,
}: LessonViewerProps) {
  const { isCompact } = useDynamicLayout();
  const [tab, setTab] = React.useState<Tab>("summary");
  const [expanded, setExpanded] = React.useState(!summary || summary.length < 240);
  const [cardIdx, setCardIdx] = React.useState(0);
  const [flipped, setFlipped] = React.useState(false);
  const [practiceIdx, setPracticeIdx] = React.useState(0);
  const [selected, setSelected] = React.useState<string | null>(null);
  const [correct, setCorrect] = React.useState<boolean | null>(null);

  const card = flashcards[cardIdx];
  const pq = practice[practiceIdx];

  function nextCard() {
    setFlipped(false);
    setCardIdx((i) => Math.min(i + 1, flashcards.length - 1));
  }
  function prevCard() {
    setFlipped(false);
    setCardIdx((i) => Math.max(i - 1, 0));
  }
  function answer(opt: string) {
    if (!pq) return;
    setSelected(opt);
    setCorrect(opt === pq.answer);
    if (onReview && pq.id) onReview(pq.id, opt === pq.answer ? "easy" : "hard");
  }
  function nextPractice() {
    setSelected(null);
    setCorrect(null);
    setPracticeIdx((i) => Math.min(i + 1, practice.length - 1));
  }

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: "summary", label: "Resumen" },
    { key: "cards", label: "Tarjetas", count: flashcards.length },
    { key: "practice", label: "Práctica", count: practice.length },
  ];

  return (
    <div className={cn("mx-auto flex w-full max-w-3xl flex-col gap-4 pb-28", className)}>
      <LessonHeader
        title={title}
        subtitle={subtitle}
        concepts={concepts}
        onQuickRevision={onQuickRevision}
        quickRevisionLabel="Repaso rápido"
      />

      {/* Tab bar */}
      <div role="tablist" aria-label="Secciones de la lección" className="flex gap-1 rounded-full bg-muted p-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "flex-1 rounded-full px-3 py-2 text-sm font-medium transition-colors",
              tab === t.key ? "bg-background text-foreground shadow" : "text-muted-foreground",
            )}
          >
            {t.label}
            {t.count != null && t.count > 0 ? ` (${t.count})` : ""}
          </button>
        ))}
      </div>

      {/* Summary */}
      {tab === "summary" && (
        <div className={STYLE_TOKENS.cardShell}>
          <h2 className="mb-2 text-base font-semibold">Resumen</h2>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
            {expanded ? summary : summary?.slice(0, 240)}
            {!expanded && summary && summary.length > 240 && "…"}
          </p>
          {!expanded && summary && summary.length > 240 && (
            <button onClick={() => setExpanded(true)} className="mt-2 text-sm font-medium text-primary">
              Leer más
            </button>
          )}
        </div>
      )}

      {/* Flashcards */}
      {tab === "cards" && (
        <div className="space-y-3">
          {flashcards.length === 0 ? (
            <p className="rounded-lg bg-muted p-4 text-center text-sm text-muted-foreground">
              Sin tarjetas para este paquete.
            </p>
          ) : (
            <>
              <SwipeToDismiss
                onDismiss={nextCard}
                className="touch-none"
              >
                <button
                  onClick={() => setFlipped((f) => !f)}
                  className="flex h-56 w-full items-center justify-center rounded-xl border border-border bg-card p-6 text-center text-base font-medium shadow-sm active:scale-[0.99]"
                  aria-label={flipped ? "Voltear a la pregunta" : "Voltear a la respuesta"}
                >
                  {flipped ? card.back : card.front}
                </button>
              </SwipeToDismiss>
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="icon" onClick={prevCard} disabled={cardIdx === 0} aria-label="Tarjeta anterior">
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  {cardIdx + 1} / {flashcards.length}
                </span>
                <Button variant="ghost" size="icon" onClick={nextCard} disabled={cardIdx === flashcards.length - 1} aria-label="Siguiente tarjeta">
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
              <Button variant="outline" className="w-full" onClick={() => setFlipped((f) => !f)}>
                <RotateCcw className="h-4 w-4" /> Voltear
              </Button>
            </>
          )}
        </div>
      )}

      {/* Practice */}
      {tab === "practice" && (
        <div className="space-y-3">
          {practice.length === 0 ? (
            <p className="rounded-lg bg-muted p-4 text-center text-sm text-muted-foreground">
              Sin preguntas de práctica aún.
            </p>
          ) : (
            <div className={STYLE_TOKENS.cardShell}>
              <p className="mb-3 text-base font-medium">{pq.question}</p>
              <div className="space-y-2">
                {(pq.options && pq.options.length
                  ? pq.options
                  : [pq.answer]
                ).map((opt, i) => {
                  const isSel = selected === opt;
                  const isCorrectOpt = opt === pq.answer;
                  return (
                    <button
                      key={i}
                      onClick={() => answer(opt)}
                      disabled={selected !== null}
                      className={cn(
                        "flex min-h-[48px] w-full items-center rounded-lg border px-4 text-left text-sm transition-colors",
                        isSel && correct ? "border-youth-success bg-youth-success/10" : "",
                        isSel && !correct ? "border-destructive bg-destructive/10" : "",
                        !isSel && selected !== null && isCorrectOpt ? "border-youth-success bg-youth-success/10" : "",
                        selected === null ? "border-border hover:bg-accent" : "border-border opacity-70",
                      )}
                    >
                      {isSel && correct && <CheckCircle2 className="mr-2 h-4 w-4 text-youth-success" />}
                      {opt}
                    </button>
                  );
                })}
              </div>
              {selected !== null && pq.explanation && (
                <p className="mt-3 flex items-start gap-2 rounded-lg bg-muted p-3 text-sm">
                  <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {pq.explanation}
                </p>
              )}
              {selected !== null && (
                <Button className="mt-3 w-full" onClick={nextPractice} disabled={practiceIdx === practice.length - 1}>
                  {practiceIdx === practice.length - 1 ? "Finalizar" : "Siguiente"}
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Bottom CTA — quick revision on compact screens */}
      {isCompact && onQuickRevision && (
        <div className={STYLE_TOKENS.bottomCtaBar}>
          <Button onClick={onQuickRevision} className="mx-auto flex w-full max-w-3xl items-center justify-center">
            <CheckCircle2 className="h-4 w-4" /> Repaso rápido
          </Button>
        </div>
      )}
    </div>
  );
}

export default LessonViewer;
