/**
 * Artkit.cc-inspired blur/gradient orbs for hero sections.
 * Creates soft, glassmorphism-style background blobs using youth design tokens.
 */
export function BlurOrbs() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      <div
        className="absolute -top-40 -right-40 w-[32rem] h-[32rem] rounded-full bg-youth-primary/15 opacity-80 blur-[60px] animate-pulse"
        aria-hidden
      />
      <div
        className="absolute -bottom-40 -left-40 w-[32rem] h-[32rem] rounded-full bg-youth-accent/20 opacity-70 blur-[60px] animate-pulse"
        style={{ animationDelay: '1s' }}
        aria-hidden
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[28rem] h-[28rem] rounded-full bg-youth-primary/10 opacity-60 blur-[50px] animate-pulse"
        style={{ animationDelay: '2s' }}
        aria-hidden
      />
    </div>
  );
}
