import React from 'react';

const defaultSpacing = 'py-16';

/**
 * Shared section wrapper for landing and dense pages.
 * Consistent vertical spacing and optional centered title/subtitle.
 */
export function Section({
  title,
  subtitle,
  children,
  id,
  className = '',
  spacing = true,
  ...rest
}: {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  id?: string;
  className?: string;
  spacing?: boolean;
} & React.ComponentPropsWithoutRef<'section'>) {
  return (
    <section
      id={id}
      className={`${spacing ? defaultSpacing : ''} ${className}`.trim()}
      {...rest}
    >
      {(title != null || subtitle != null) && (
        <div className="text-center mb-12">
          {title != null && (
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              {title}
            </h2>
          )}
          {subtitle != null && (
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>
      )}
      {children}
    </section>
  );
}
