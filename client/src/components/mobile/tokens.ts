// client/src/components/mobile/tokens.ts
// Mobile-first visual tokens + breakpoint + typography mapping.
// Use these as the single source of truth for spacing/breakpoints/font-sizes.

/** Breakpoints (Tailwind defaults; documented here for reference). */
export const BREAKPOINTS = {
  compact: 0, // 0–639px  → phones (one-hand)
  comfortable: 640, // 640–1023px → large phones / small tablets
  wide: 1024, // ≥1024px → tablets / desktop
} as const;

export type LayoutVariant = "compact" | "comfortable" | "wide";

/** Spacing scale (rem). Tight on phones, airy on wide. */
export const SPACING = {
  xs: "0.25rem", // 4px
  sm: "0.5rem", // 8px
  md: "0.75rem", // 12px
  lg: "1rem", // 16px
  xl: "1.5rem", // 24px
  "2xl": "2rem", // 32px
} as const;

/** Font scale per layout variant (rem). */
export const FONT_SCALE: Record<LayoutVariant, { base: string; sm: string; lg: string; xl: string }> = {
  compact: { base: "0.875rem", sm: "0.75rem", lg: "1rem", xl: "1.25rem" },
  comfortable: { base: "1rem", sm: "0.875rem", lg: "1.125rem", xl: "1.5rem" },
  wide: { base: "1.0625rem", sm: "0.9375rem", lg: "1.25rem", xl: "1.75rem" },
};

/** Tap-target minimums for accessibility (WCAG 2.5.8, min 44x44 CSS px). */
export const TAP_TARGET = {
  min: "44px",
  comfortable: "48px",
} as const;

/** Recommended Tailwind class shortcuts for the three flows. */
export const STYLE_TOKENS = {
  // Bottom CTA bar — keeps primary action within thumb reach on phones.
  bottomCtaBar:
    "fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur supports-[padding:env(safe-area-inset-bottom)]:pb-[env(safe-area-inset-bottom)] p-3 sm:p-4",
  // FAB bottom-right for one-hand primary action.
  fab:
    "fixed bottom-20 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg sm:bottom-6 sm:right-6",
  // Pill chips (key concepts, subjects).
  pill: "inline-flex max-w-full items-center truncate rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-foreground",
  // Card shell that breathes more on wide screens.
  cardShell: "rounded-xl border border-border bg-card p-3 sm:p-4 lg:p-6",
  // Skeleton shimmer.
  skeleton: "animate-pulse rounded-md bg-muted",
  // Composer safe-area bottom padding.
  composerSafe: "pb-[env(safe-area-inset-bottom)]",
} as const;
