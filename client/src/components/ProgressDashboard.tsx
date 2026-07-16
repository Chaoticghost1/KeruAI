import React from 'react';
import { Link } from 'wouter';
import { useLanguage } from '../contexts/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { StudentProfile } from '@/types/profile';

/**
 * Level progress card for the welcome/dashboard page (after login).
 * Badges are shown on the profile page.
 */
export function ProgressDashboard({ userId }: { userId: number }) {
  const { t } = useLanguage();

  const { data: profile } = useQuery<StudentProfile>({
    queryKey: ['/api/progress', 'profile', userId],
  });

  const getXPProgress = (profile: StudentProfile) => {
    const currentLevel = profile.level;
    const nextLevelXP = Math.pow(currentLevel, 2) * 50;
    const currentLevelXP = currentLevel === 1 ? 0 : Math.pow(currentLevel - 1, 2) * 50;
    const neededXP = nextLevelXP - currentLevelXP;
    const currentXP = profile.experiencePoints - currentLevelXP;

    return {
      current: currentXP,
      needed: neededXP,
      progress: Math.round((currentXP / neededXP) * 100),
    };
  };

  const progress = profile ? getXPProgress(profile) : null;

  return (
    <div className="grid grid-cols-1 gap-6 mb-8">
      {/* Level Progress */}
      <Card className="rounded-youth-lg border-2 border-youth-muted/50 bg-youth-surface">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-youth-primary">
            🎯 {t.language === 'es' ? 'Progreso del Nivel' : 'Level Progress'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {profile ? (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-youth-primary">{profile.level}</div>
                <p className="text-sm text-muted-foreground">
                  {t.language === 'es' ? 'Nivel Actual' : 'Current Level'}
                </p>
              </div>

              {progress && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span>{progress.current} XP</span>
                    <span>{progress.needed} XP</span>
                  </div>
                  <div className="w-full youth-progress-bar h-3 overflow-hidden">
                    <div
                      className="youth-progress-fill h-3 transition-all duration-500 ease-out"
                      style={{ width: `${progress.progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-center text-muted-foreground">
                    {progress.progress}% {t.language === 'es' ? 'al siguiente nivel' : 'to next level'}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div className="text-center p-2 rounded-youth-lg bg-youth-muted/50">
                  <div className="text-xl font-bold text-youth-success">{profile.currentStreak}</div>
                  <p className="text-xs text-muted-foreground">
                    {t.language === 'es' ? 'Racha Actual' : 'Current Streak'}
                  </p>
                </div>
                <div className="text-center p-2 rounded-youth-lg bg-youth-muted/50">
                  <div className="text-xl font-bold text-amber-500">{profile.longestStreak ?? 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {t.language === 'es' ? 'Mejor Racha' : 'Longest Streak'}
                  </p>
                </div>
                <div className="text-center p-2 rounded-youth-lg bg-youth-muted/50">
                  <div className="text-xl font-bold text-youth-primary">{profile.totalSessionsCompleted}</div>
                  <p className="text-xs text-muted-foreground">
                    {t.language === 'es' ? 'Sesiones' : 'Sessions'}
                  </p>
                </div>
                <div className="text-center p-2 rounded-youth-lg bg-youth-muted/50">
                  <div className="text-xl font-bold text-youth-accent">{profile.totalPoints ?? 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {t.language === 'es' ? 'Puntos' : 'Points'}
                  </p>
                </div>
              </div>
              {(profile.learningStyle || profile.subjects?.length || profile.strugglingAreas?.length) ? (
                <div className="pt-4 border-t space-y-2 text-sm">
                  {profile.learningStyle && (
                    <p>
                      <span className="font-medium text-slate-600">{t.language === 'es' ? 'Estilo: ' : 'Style: '}</span>
                      <span className="capitalize">{profile.learningStyle}</span>
                    </p>
                  )}
                  {profile.subjects?.length ? (
                    <p>
                      <span className="font-medium text-slate-600">{t.language === 'es' ? 'Materias: ' : 'Subjects: '}</span>
                      {profile.subjects.join(', ')}
                    </p>
                  ) : null}
                  {profile.strugglingAreas?.length ? (
                    <p>
                      <span className="font-medium text-slate-600">{t.language === 'es' ? 'Áreas a mejorar: ' : 'Struggling: '}</span>
                      {profile.strugglingAreas.join(', ')}
                    </p>
                  ) : null}
                  <Link href="/profile" className="text-youth-primary text-sm font-medium hover:underline">
                    {t.language === 'es' ? 'Editar perfil' : 'Edit profile'}
                  </Link>
                </div>
              ) : null}
              {!(profile.learningStyle || profile.subjects?.length || profile.strugglingAreas?.length) && (
                <div className="pt-4 border-t">
                  <Link href="/profile" className="text-youth-primary text-sm font-medium hover:underline">
                    {t.language === 'es' ? 'Completa tu perfil de estudio' : 'Complete your study profile'}
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">
              {t.language === 'es' ? 'Comienza tu primera sesión para ver tu progreso' : 'Start your first session to see progress'}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
