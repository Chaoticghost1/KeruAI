// client/src/components/mobile/MobileToast.tsx
// Accessible success/info toast for mobile flows (teacher upload success, etc.)
// Uses role="status" aria-live="polite" so it is announced without stealing focus.

import * as React from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, X } from "lucide-react";

export interface MobileToastProps {
  open: boolean;
  message: string;
  variant?: "success" | "info" | "error";
  onClose?: () => void;
  duration?: number;
}

const VARIANT = {
  success: "bg-youth-success/15 text-youth-success border-youth-success/30",
  info: "bg-muted text-foreground border-border",
  error: "bg-destructive/10 text-destructive border-destructive/30",
} as const;

export function MobileToast({
  open,
  message,
  variant = "success",
  onClose,
  duration = 4000,
}: MobileToastProps) {
  React.useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => onClose?.(), duration);
    return () => clearTimeout(t);
  }, [open, duration, onClose]);

  if (!open) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "fixed inset-x-0 bottom-24 z-40 mx-auto flex max-w-sm items-center gap-2 rounded-xl border px-4 py-3 text-sm shadow-lg",
        VARIANT[variant],
      )}
    >
      {variant === "success" && <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden />}
      <span className="flex-1">{message}</span>
      <button
        type="button"
        aria-label="Cerrar aviso"
        onClick={onClose}
        className="rounded p-1 hover:bg-background/50"
      >
        <X className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}

export default MobileToast;
