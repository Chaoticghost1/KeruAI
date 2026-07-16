import React from 'react';

/**
 * Shared layout for public pages (landing, auth, mentor-apply).
 * Same bg-youth-surface so all public pages share one shell.
 */
export function PublicLayout({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`min-h-screen bg-youth-surface ${className}`.trim()}>
      {children}
    </div>
  );
}
