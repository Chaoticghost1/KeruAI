// client/src/components/mobile/SwipeToDismiss.tsx
// Lightweight swipe-to-dismiss wrapper (pointer events) for chat messages /
// cards on touch. Supports keyboard: Delete/Backspace triggers onDismiss.
// Provides aria role + keyboard handler for accessibility.

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SwipeToDismissProps {
  onDismiss: () => void;
  children: React.ReactNode;
  className?: string;
  /** px threshold to trigger dismiss */
  threshold?: number;
}

export function SwipeToDismiss({
  onDismiss,
  children,
  className,
  threshold = 80,
}: SwipeToDismissProps) {
  const [dx, setDx] = React.useState(0);
  const startX = React.useRef<number | null>(null);

  function onPointerDown(e: React.PointerEvent) {
    startX.current = e.clientX;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent) {
    if (startX.current === null) return;
    setDx(Math.min(0, e.clientX - startX.current));
  }
  function onPointerUp() {
    if (dx <= -threshold) onDismiss();
    setDx(0);
    startX.current = null;
  }

  return (
    <div
      role="group"
      tabIndex={0}
      aria-label="Desliza para descartar"
      className={cn("touch-none transition-transform", className)}
      style={{ transform: `translateX(${dx}px)` }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onKeyDown={(e) => {
        if (e.key === "Delete" || e.key === "Backspace") {
          e.preventDefault();
          onDismiss();
        }
      }}
    >
      {children}
    </div>
  );
}

export default SwipeToDismiss;
