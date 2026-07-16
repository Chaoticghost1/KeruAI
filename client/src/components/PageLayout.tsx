import React from 'react';

/**
 * Shared page shell for app routes (Dashboard, StudyBuddy, Blog, etc.).
 * Renders inside App's main (sidebar + main). Keeps the same UI/UX feel:
 * - min-h-screen bg-youth-surface
 * - Centered content with consistent max-width and padding
 * See docs/DESIGN_YOUTH_UI.md for design tokens.
 */
export function PageLayout({
  children,
  className = '',
  maxWidth = '6xl',
}: {
  children: React.ReactNode;
  className?: string;
  /** '6xl' = 72rem (default); '7xl' = 80rem for wider content */
  maxWidth?: '6xl' | '7xl';
}) {
  const maxWidthClass = maxWidth === '7xl' ? 'max-w-7xl' : 'max-w-6xl';

  return (
    <div className={`min-h-screen bg-youth-surface ${className}`.trim()}>
      <div className={`${maxWidthClass} mx-auto px-4 sm:px-6 lg:px-8 py-6`}>
        {children}
      </div>
    </div>
  );
}
