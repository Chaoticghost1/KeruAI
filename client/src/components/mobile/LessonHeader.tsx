// client/src/components/mobile/LessonHeader.tsx
// Canonical lesson header for the Student lesson viewer & revision pack:
//  - title
//  - horizontally scrollable key-concept pills
//  - quick-revision CTA
//
// Adapts: compact = stacked + scroll pills (thumb swipe); comfortable/wide =
// pills wrap and CTA moves inline. Pills scroll is keyboard-accessible
// (arrow keys / tab) and labeled with aria-label.

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { STYLE_TOKENS } from "./tokens";
import { Sparkles, ChevronRight } from "lucide-react";

export interface LessonHeaderProps {
  title: string;
  subtitle?: string;
  concepts?: string[];
  onQuickRevision?: () => void;
  quickRevisionLabel?: string;
  className?: string;
}

export function LessonHeader({
  title,
  subtitle,
  concepts = [],
  onQuickRevision,
  quickRevisionLabel = "Repaso rápido",
  className,
}: LessonHeaderProps) {
  const scrollerRef = React.useRef<HTMLDivElement>(null);

  function scrollBy(dir: 1 | -1) {
    scrollerRef.current?.scrollBy({ left: dir * 160, behavior: "smooth" });
  }

  return (
    <header className={cn("w-full", className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold sm:text-xl lg:text-2xl">{title}</h1>
          {subtitle && <p className="mt-0.5 truncate text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        {onQuickRevision && (
          <Button onClick={onQuickRevision} className="min-h-[44px] shrink-0 sm:w-auto">
            <Sparkles className="h-4 w-4" aria-hidden /> {quickRevisionLabel}
          </Button>
        )}
      </div>

      {concepts.length > 0 && (
        <div className="relative mt-3">
          {/* prev/next affordances on comfortable+ only */}
          <button
            type="button"
            aria-label="Desplazar conceptos a la izquierda"
            onClick={() => scrollBy(-1)}
            className="absolute left-0 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-background/80 p-1 shadow sm:block"
          >
            <ChevronRight className="h-4 w-4 rotate-180" aria-hidden />
          </button>
          <div
            ref={scrollerRef}
            className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            aria-label="Conceptos clave"
            tabIndex={0}
            role="group"
          >
            {concepts.map((c, i) => (
              <span key={`${c}-${i}`} className={cn(STYLE_TOKENS.pill, "shrink-0")}>
                {c}
              </span>
            ))}
          </div>
          <button
            type="button"
            aria-label="Desplazar conceptos a la derecha"
            onClick={() => scrollBy(1)}
            className="absolute right-0 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-background/80 p-1 shadow sm:block"
          >
            <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
      )}
    </header>
  );
}

export default LessonHeader;
