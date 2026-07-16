import React from 'react';

const stripBase =
  'border-b border-youth-muted/50 bg-card shadow-sm';
const stripSticky =
  'backdrop-blur-2xl bg-card/90 sticky top-0 z-50 -mx-4 sm:-mx-6 lg:-mx-8 -mt-6';
const innerPaddingDefault = 'px-4 sm:px-6 lg:px-8 py-8';
const innerPaddingCompact = 'px-4 sm:px-6 lg:px-8 py-3';

export function PageHeader({
  title,
  subtitle,
  actions,
  sticky = false,
  size = 'default',
  className = '',
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  sticky?: boolean;
  size?: 'default' | 'compact';
  className?: string;
}) {
  const stripClasses = [stripBase, sticky ? stripSticky : '', className].filter(Boolean).join(' ');
  const paddingClass = size === 'compact' ? innerPaddingCompact : innerPaddingDefault;

  return (
    <div className={stripClasses}>
      <div className={paddingClass}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            {title}
            {subtitle != null && <div className="mt-2">{subtitle}</div>}
          </div>
          {actions != null && <div className="flex items-center space-x-2">{actions}</div>}
        </div>
      </div>
    </div>
  );
}
