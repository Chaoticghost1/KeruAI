// client/src/components/mobile/useKeyboardSafeView.ts
// Keeps a composer / input region above the on-screen keyboard on iOS/Android.
// Uses the VisualViewport API when available (best for iOS), and falls back to
// a window resize listener. Returns a style object to apply to the composer
// wrapper so it translates up by the occluded amount.

import { useEffect, useState } from "react";

export interface KeyboardSafeState {
  /** Pixels the keyboard is occluding the viewport from the bottom. */
  keyboardHeight: number;
  /** Inline style to keep the composer above the keyboard. */
  style: React.CSSProperties;
  isKeyboardOpen: boolean;
}

export function useKeyboardSafeView(extraPadding = 8): KeyboardSafeState {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const vv = typeof window !== "undefined" ? window.visualViewport : null;

    const computeFromViewport = () => {
      if (!vv) return;
      const offset = window.innerHeight - (vv.offsetTop + vv.height);
      setKeyboardHeight(offset > 0 ? offset + extraPadding : 0);
    };

    const computeFromResize = () => {
      // Fallback: compare a stored layout viewport height.
      const stored = (window as any).__lastInnerHeight || window.innerHeight;
      const diff = stored - window.innerHeight;
      setKeyboardHeight(diff > 100 ? diff + extraPadding : 0);
    };

    if (vv && typeof vv.addEventListener === "function") {
      vv.addEventListener("resize", computeFromViewport);
      vv.addEventListener("scroll", computeFromViewport);
      computeFromViewport();
      return () => {
        vv.removeEventListener("resize", computeFromViewport);
        vv.removeEventListener("scroll", computeFromViewport);
      };
    }

    (window as any).__lastInnerHeight = window.innerHeight;
    const onResize = () => {
      computeFromResize();
      (window as any).__lastInnerHeight = window.innerHeight;
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [extraPadding]);

  return {
    keyboardHeight,
    isKeyboardOpen: keyboardHeight > 0,
    style: keyboardHeight > 0 ? { paddingBottom: keyboardHeight } : {},
  };
}
