import React from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const defaultIconBg = 'bg-youth-primary/20';
const defaultBorder = 'border-2 border-youth-muted/50 hover:border-youth-primary rounded-youth-lg bg-card';

export interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  href?: string;
  action?: React.ReactNode;
  children?: React.ReactNode;
  iconBgClassName?: string;
  borderClassName?: string;
  className?: string;
  dataTestId?: string;
}

/**
 * Shared feature/tool card: icon, title, description, action (e.g. Button), optional children.
 * Use youth tokens by default; override iconBgClassName/borderClassName for variants (e.g. game colors).
 */
export function FeatureCard({
  icon,
  title,
  description,
  href,
  action,
  children,
  iconBgClassName = defaultIconBg,
  borderClassName = defaultBorder,
  className = '',
  dataTestId,
}: FeatureCardProps) {
  const cardContent = (
    <>
      <CardHeader className="pb-4">
        <div className={`w-14 h-14 rounded-youth-lg flex items-center justify-center mb-4 ${iconBgClassName}`}>
          {icon}
        </div>
        <CardTitle className="text-xl font-semibold text-foreground">{title}</CardTitle>
        <CardDescription className="text-muted-foreground">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {action != null && action}
        {children}
      </CardContent>
    </>
  );

  const cardClass = `h-full transition-all duration-300 cursor-pointer hover:shadow-xl ${borderClassName} ${className}`.trim();

  if (href) {
    return (
      <Link href={href}>
        <Card data-animate="card" className={cardClass} data-testid={dataTestId}>
          {cardContent}
        </Card>
      </Link>
    );
  }

  return (
    <Card data-animate="card" className={cardClass} data-testid={dataTestId}>
      {cardContent}
    </Card>
  );
}
