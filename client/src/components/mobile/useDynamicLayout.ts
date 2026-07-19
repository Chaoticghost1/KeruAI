// client/src/components/mobile/useDynamicLayout.ts
// Returns the current layout variant (compact | comfortable | wide) and
// safe-area insets, reacting to viewport resizes. SSR-safe (guards window).

import { useEffect, useState } from "react";
import { BREAKPOINTS, type LayoutVariant } from "./tokens";

export interface DynamicLayout {
  variant: LayoutVariant;
  isCompact: boolean;
  isComfortable: boolean;
  isWide: boolean;
  width: number;
  safeAreaInset: { top: number; bottom: number; left: number; right: number };
}

function readSafeArea(): DynamicLayout["safeAreaInset"] {
  if (typeof window === "undefined" || !window.getComputedStyle) {
    return { top: 0, bottom: 0, left: 0, right: 0 };
  }
  const cs = getComputedStyle(document.documentElement);
  const num = (v: string) => parseFloat(v) || 0;
  return {
    top: num(cs.getPropertyValue("env(safe-area-inset-top)")),
    bottom: num(cs.getPropertyValue("env(safe-area-inset-bottom)")),
    left: num(cs.getPropertyValue("env(safe-area-inset-left)")),
    right: num(cs.getPropertyValue("env(safe-area-inset-right)")),
  };
}

function resolveVariant(w: number): LayoutVariant {
  if (w >= BREAKPOINTS.wide) return "wide";
  if (w >= BREAKPOINTS.comfortable) return "comfortable";
  return "compact";
}

export function useDynamicLayout(): DynamicLayout {
  const [width, setWidth] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth : BREAKPOINTS.comfortable,
  );

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const variant = resolveVariant(width);
  return {
    variant,
    isCompact: variant === "compact",
    isComfortable: variant === "comfortable",
    isWide: variant === "wide",
    width,
    safeAreaInset: readSafeArea(),
  };
}
