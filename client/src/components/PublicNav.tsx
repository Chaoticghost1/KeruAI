import React from 'react';
import { Link } from 'wouter';
import { BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LanguageToggle } from '@/components/LanguageToggle';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowLeft } from 'lucide-react';

export type PublicNavVariant = 'landing' | 'back' | 'auth';

interface PublicNavProps {
  variant: PublicNavVariant;
  /** For variant "back": label for the back button (e.g. "Back to home") */
  backLabel?: string;
}

/**
 * Shared nav for public pages. Same structure everywhere; content varies by variant.
 */
export function PublicNav({ variant, backLabel }: PublicNavProps) {
  const { t } = useLanguage();
  const defaultBackLabel = t.language === 'es' ? 'Volver al inicio' : 'Back to home';
  const label = backLabel ?? defaultBackLabel;

  return (
    <nav className="border-b border-youth-muted/50 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2" data-testid="nav-logo">
            <div className="h-8 w-8 rounded-youth-lg bg-youth-primary flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-youth-primary">
              {t.landingPage?.brandName ?? 'Keru.ai'}
            </span>
          </Link>

          <div className="flex items-center space-x-4">
            {variant === 'landing' && (
              <>
                <LanguageToggle />
                <Link href="/auth">
                  <Button variant="ghost" className="rounded-youth-lg" data-testid="button-signin">
                    {t.auth?.signIn ?? 'Sign in'}
                  </Button>
                </Link>
                <Link href="/auth">
                  <Button
                    className="rounded-youth-lg bg-youth-primary hover:opacity-90"
                    data-testid="button-getstarted"
                  >
                    {t.auth?.getStarted ?? 'Get started'}
                  </Button>
                </Link>
              </>
            )}
            {(variant === 'back' || variant === 'auth') && (
              <>
                <LanguageToggle />
                <Link href="/">
                  <Button variant="ghost" size="sm" className="rounded-youth-lg">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    {label}
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
