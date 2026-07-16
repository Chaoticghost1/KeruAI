import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../hooks/use-auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { StudentProfile as StudentProfileType, StudentProfileUpdate } from '@/types/profile';
import { User, CheckCircle2, Calendar, Clock, Camera, Trophy } from 'lucide-react';
import { PageLayout } from '@/components/PageLayout';

const API_BASE = import.meta.env.VITE_API_URL || '';

interface Badge {
  id: number;
  badgeKey: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  rarity: string;
  points: number;
}

interface UserBadge {
  id: number;
  userId: number;
  badgeId: number;
  earnedAt: string;
  progress: number;
  isNew: boolean;
}

const BADGE_RARITY_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  common: { bg: 'bg-slate-100', border: 'border-slate-300', text: 'text-slate-700' },
  rare: { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-700' },
  epic: { bg: 'bg-purple-50', border: 'border-purple-400', text: 'text-purple-700' },
  legendary: { bg: 'bg-amber-50', border: 'border-amber-400', text: 'text-amber-800' },
};

const UNEARNED_STYLE = 'bg-slate-100/60 border-slate-200 text-slate-400 opacity-60 grayscale';

/** Fireworks/confetti burst overlay when a new badge is earned */
function BadgeCelebrationOverlay({ onComplete }: { onComplete: () => void }) {
  const particles = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    angle: (i / 40) * 360 + Math.random() * 20,
    delay: Math.random() * 0.2,
    color: ['#f59e0b', '#8b5cf6', '#06b6d4', '#10b981', '#ef4444', '#ec4899'][i % 6],
    size: 6 + Math.random() * 8,
  }));

  useEffect(() => {
    const t = setTimeout(onComplete, 2500);
    return () => clearTimeout(t);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[45] pointer-events-none"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ delay: 2, duration: 0.5 }}
    >
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full"
            style={{
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              left: '50%',
              top: '50%',
            }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{
              x: Math.cos((p.angle * Math.PI) / 180) * 400,
              y: Math.sin((p.angle * Math.PI) / 180) * 400,
              opacity: 0,
              scale: 0,
            }}
            transition={{
              delay: p.delay,
              duration: 1.5,
              ease: 'easeOut',
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}

const LEARNING_STYLES = [
  { value: 'visual', labelEn: 'Visual', labelEs: 'Visual' },
  { value: 'auditory', labelEn: 'Auditory', labelEs: 'Auditorio' },
  { value: 'kinesthetic', labelEn: 'Kinesthetic', labelEs: 'Kinestésico' },
];

const DIFFICULTY_LEVELS = [
  { value: 1, labelEn: 'Beginner', labelEs: 'Principiante' },
  { value: 2, labelEn: 'Intermediate', labelEs: 'Intermedio' },
  { value: 3, labelEn: 'Advanced', labelEs: 'Avanzado' },
];

function parseList(value: string): string[] {
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function formatList(arr: string[] | null | undefined): string {
  if (!arr || !arr.length) return '';
  return arr.join(', ');
}

export default function StudentProfilePage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id;
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: profile, isLoading } = useQuery<StudentProfileType | null>({
    queryKey: ['/api/progress', 'profile', userId],
    queryFn: async () => {
      try {
        const res = await apiRequest('GET', `/api/progress/profile/${userId}`);
        return await res.json();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes('404')) return null;
        throw err;
      }
    },
    enabled: !!userId,
  });

  const { data: userBadges } = useQuery<UserBadge[]>({
    queryKey: ['/api/progress', 'user-badges', userId],
    enabled: !!userId,
  });

  const { data: allBadges } = useQuery<Badge[]>({
    queryKey: ['/api/progress', 'badges'],
  });

  const earnedBadgeIds = new Set(userBadges?.map((ub) => ub.badgeId) || []);
  const userBadgeMap = new Map(userBadges?.map((ub) => [ub.badgeId, ub]) || []);
  const earnedBadges = allBadges?.filter((b) => earnedBadgeIds.has(b.id)) || [];
  const newBadges = earnedBadges.filter((b) => userBadgeMap.get(b.id)?.isNew);

  const [celebrationShown, setCelebrationShown] = useState(false);
  const [newBadgeDialogOpen, setNewBadgeDialogOpen] = useState(false);
  const hasShownCelebration = useRef(false);

  useEffect(() => {
    if (newBadges.length > 0 && !hasShownCelebration.current) {
      hasShownCelebration.current = true;
      setCelebrationShown(true);
      setNewBadgeDialogOpen(true);
    }
  }, [newBadges.length]);

  const handleDismissNewBadges = async () => {
    setNewBadgeDialogOpen(false);
    setCelebrationShown(false);
    for (const ub of userBadges ?? []) {
      if (ub.isNew && userId) {
        try {
          await apiRequest('POST', `/api/progress/user-badges/${userId}/${ub.badgeId}/view`);
        } catch {
          /* ignore */
        }
      }
    }
    queryClient.invalidateQueries({ queryKey: ['/api/progress', 'user-badges', userId] });
  };

  const { toast } = useToast();
  const photoUploadMutation = useMutation({
    mutationFn: async () => {
      if (!selectedFile || !termsAccepted) throw new Error('Select a file and accept terms');
      const formData = new FormData();
      formData.append('photo', selectedFile);
      formData.append('acceptedTerms', 'true');
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${API_BASE}/api/auth/profile-image`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Upload failed');
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['/api/auth/me'], data.user);
      setPhotoDialogOpen(false);
      setTermsAccepted(false);
      setSelectedFile(null);
      toast({ title: isEs ? 'Foto actualizada' : 'Photo updated' });
    },
    onError: (err) => {
      toast({ title: isEs ? 'Error al subir' : 'Upload failed', description: err.message, variant: 'destructive' });
    },
  });

  const [learningStyle, setLearningStyle] = useState<string>('');
  const [preferredDifficulty, setPreferredDifficulty] = useState<number>(2);
  const [subjectsInput, setSubjectsInput] = useState('');
  const [strugglingAreasInput, setStrugglingAreasInput] = useState('');
  const [revisionAssistantName, setRevisionAssistantName] = useState('');

  useEffect(() => {
    if (profile) {
      setLearningStyle(profile.learningStyle || '');
      setPreferredDifficulty(profile.preferredDifficulty ?? 2);
      setSubjectsInput(formatList(profile.subjects));
      setStrugglingAreasInput(formatList(profile.strugglingAreas));
      setRevisionAssistantName(profile.revisionAssistantName ?? '');
    } else if (!isLoading) {
      setLearningStyle('');
      setPreferredDifficulty(2);
      setSubjectsInput('');
      setStrugglingAreasInput('');
      setRevisionAssistantName('');
    }
  }, [profile, isLoading]);

  const saveMutation = useMutation({
    mutationFn: async (payload: StudentProfileUpdate & { userId: number }) => {
      const { userId: uid, ...updates } = payload;
      if (profile) {
        const res = await apiRequest('PUT', `/api/progress/profile/${uid}`, updates);
        return res.json();
      } else {
        const res = await apiRequest('POST', '/api/progress/profile', {
          userId: uid,
          ...updates,
        });
        return res.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/progress', 'profile', userId] });
    },
  });

  const handleSave = () => {
    if (!userId) return;
    const subjects = parseList(subjectsInput);
    const strugglingAreas = parseList(strugglingAreasInput);
    saveMutation.mutate({
      userId,
      learningStyle: learningStyle || null,
      preferredDifficulty,
      subjects,
      strugglingAreas,
      revisionAssistantName: revisionAssistantName.trim() || null,
    });
  };

  const isEs = t.language === 'es';

  if (!user) {
    return (
      <PageLayout maxWidth="6xl">
        <div className="flex min-h-[60vh] items-center justify-center p-6">
          <p className="text-muted-foreground">
            {isEs ? 'Inicia sesión para ver tu perfil.' : 'Sign in to view your profile.'}
          </p>
        </div>
      </PageLayout>
    );
  }

  const profileImageUrl = user?.profileImage ? `${API_BASE}${user.profileImage}` : null;

  return (
    <PageLayout maxWidth="6xl">
      <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <div className="relative group">
          <Avatar className="w-20 h-20 border-2 border-youth-muted/50">
            <AvatarImage src={profileImageUrl || undefined} alt="" />
            <AvatarFallback className="bg-primary/10">
              <User className="w-10 h-10 text-primary" />
            </AvatarFallback>
          </Avatar>
          <button
            type="button"
            onClick={() => setPhotoDialogOpen(true)}
            className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
            title={isEs ? 'Subir foto de perfil' : 'Upload profile photo'}
          >
            <Camera className="w-8 h-8 text-white" />
          </button>
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">
            {isEs ? 'Mi perfil de estudio' : 'My study profile'}
          </h1>
          <p className="text-muted-foreground">
            {user.firstName} {user.lastName}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => setPhotoDialogOpen(true)}
          >
            <Camera className="w-4 h-4 mr-2" />
            {isEs ? 'Subir foto' : 'Upload photo'}
          </Button>
        </div>
      </div>

      <Dialog open={photoDialogOpen} onOpenChange={setPhotoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEs ? 'Subir foto de perfil' : 'Upload profile photo'}
            </DialogTitle>
            <DialogDescription>
              {isEs
                ? 'Tu foto será visible en toda la plataforma (sidebar, perfil, clases). Acepta las condiciones para continuar.'
                : 'Your photo will be visible across the platform (sidebar, profile, classes). Accept the conditions to continue.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                checked={termsAccepted}
                onCheckedChange={(v) => setTermsAccepted(!!v)}
              />
              <Label htmlFor="terms" className="text-sm font-normal cursor-pointer">
                {isEs ? (
                  <>Acepto que mi foto de perfil sea visible para todos los usuarios de la plataforma (estudiantes, profesores, compañeros de clase).</>
                ) : (
                  <>I accept that my profile photo will be visible to all platform users (students, teachers, classmates).</>
                )}
              </Label>
            </div>
            <div>
              <Label>{isEs ? 'Seleccionar imagen (JPG, PNG, GIF, WebP, máx. 5MB)' : 'Select image (JPG, PNG, GIF, WebP, max 5MB)'}</Label>
              <Input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                className="mt-2"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPhotoDialogOpen(false)}>
              {isEs ? 'Cancelar' : 'Cancel'}
            </Button>
            <Button
              onClick={() => photoUploadMutation.mutate()}
              disabled={!termsAccepted || !selectedFile || photoUploadMutation.isPending}
            >
              {photoUploadMutation.isPending ? (isEs ? 'Subiendo...' : 'Uploading...') : (isEs ? 'Subir' : 'Upload')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>
            {isEs ? 'Preferencias de aprendizaje' : 'Learning preferences'}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {isEs
              ? 'Estos datos se usan para personalizar Aprende conmigo AI y los materiales que sube tu profesor, adaptados a tu forma de aprender.'
              : 'This information is used to personalize Aprende conmigo AI and materials uploaded by your teacher, tailored to your way of learning.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>
              {isEs ? 'Estilo de aprendizaje' : 'Learning style'}
            </Label>
            <Select value={learningStyle || undefined} onValueChange={setLearningStyle}>
              <SelectTrigger>
                <SelectValue placeholder={isEs ? 'Elige uno (opcional)' : 'Choose one (optional)'} />
              </SelectTrigger>
              <SelectContent>
                {LEARNING_STYLES.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {isEs ? opt.labelEs : opt.labelEn}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>
              {isEs ? 'Dificultad preferida' : 'Preferred difficulty'}
            </Label>
            <Select
              value={String(preferredDifficulty)}
              onValueChange={(v) => setPreferredDifficulty(Number(v))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DIFFICULTY_LEVELS.map((opt) => (
                  <SelectItem key={opt.value} value={String(opt.value)}>
                    {isEs ? opt.labelEs : opt.labelEn}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>
              {isEs ? 'Materias que estudias (separadas por coma)' : 'Subjects you study (comma-separated)'}
            </Label>
            <Input
              value={subjectsInput}
              onChange={(e) => setSubjectsInput(e.target.value)}
              placeholder={isEs ? 'ej. Matemáticas, Ciencias, Español' : 'e.g. Math, Science, Language Arts'}
            />
          </div>

          <div className="space-y-2">
            <Label>
              {isEs ? 'Áreas con las que luchas (separadas por coma)' : 'Areas you struggle with (comma-separated)'}
            </Label>
            <Input
              value={strugglingAreasInput}
              onChange={(e) => setStrugglingAreasInput(e.target.value)}
              placeholder={isEs ? 'ej. álgebra, redacción' : 'e.g. algebra, essay writing'}
            />
          </div>

          <div className="space-y-2">
            <Label>
              {t.dashboard.revisionAssistantNameLabel}
            </Label>
            <p className="text-xs text-muted-foreground">
              {t.dashboard.revisionAssistantNameDesc}
            </p>
            <Input
              value={revisionAssistantName}
              onChange={(e) => setRevisionAssistantName(e.target.value)}
              placeholder={t.dashboard.revisionAssistantNamePlaceholder}
            />
          </div>

          <Button
            onClick={handleSave}
            disabled={saveMutation.isPending}
          >
            {saveMutation.isPending
              ? (isEs ? 'Guardando...' : 'Saving...')
              : (isEs ? 'Guardar perfil' : 'Save profile')}
          </Button>
          {saveMutation.isSuccess && (
            <p className="text-sm text-green-600">
              {isEs ? 'Perfil guardado.' : 'Profile saved.'}
            </p>
          )}
          {saveMutation.isError && (
            <p className="text-sm text-destructive">
              {isEs ? 'Error al guardar.' : 'Failed to save.'}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Fireworks when new badge earned */}
      <AnimatePresence>
        {celebrationShown && newBadges.length > 0 && (
          <BadgeCelebrationOverlay onComplete={() => setCelebrationShown(false)} />
        )}
      </AnimatePresence>

      {/* New badge explanation dialog */}
      <Dialog open={newBadgeDialogOpen} onOpenChange={(open) => !open && handleDismissNewBadges()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-amber-500" />
              {isEs ? '¡Nueva insignia desbloqueada!' : 'New badge unlocked!'}
            </DialogTitle>
            <DialogDescription>
              {isEs ? 'Felicidades. Obtuviste esta insignia porque:' : 'Congratulations! You earned this badge because:'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {newBadges.map((badge) => {
              const colors = BADGE_RARITY_COLORS[badge.rarity] ?? BADGE_RARITY_COLORS.common;
              return (
                <div
                  key={badge.id}
                  className={`flex items-center gap-4 p-4 rounded-lg border-2 ${colors.bg} ${colors.border}`}
                >
                  <span className="text-4xl">{badge.icon}</span>
                  <div>
                    <p className="font-semibold text-foreground">{badge.name}</p>
                    <p className="text-sm text-muted-foreground mt-1">{badge.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <DialogFooter>
            <Button onClick={handleDismissNewBadges}>
              {isEs ? '¡Genial!' : 'Awesome!'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Insignias - all badges, earned (full color) vs unearned (greyed out) */}
      <Card className="rounded-youth-lg border-2 border-youth-muted/50 bg-youth-surface">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-youth-primary">
            <Trophy className="w-5 h-5" />
            {isEs ? 'Insignias' : 'Badges'} ({earnedBadges.length}/{allBadges?.length ?? 0})
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {isEs
              ? 'Logros desbloqueados al completar sesiones, rachas y actividades. Las insignias en gris aún no las tienes.'
              : 'Achievements unlocked by completing sessions, streaks, and activities. Greyed badges are not yet earned.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {allBadges && allBadges.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {allBadges.map((badge) => {
                const earned = earnedBadgeIds.has(badge.id);
                const colors = earned ? (BADGE_RARITY_COLORS[badge.rarity] ?? BADGE_RARITY_COLORS.common) : null;
                return (
                  <div
                    key={badge.id}
                    className={`flex items-center gap-3 p-3 rounded-youth-lg border-2 transition-transform hover:scale-[1.02] ${
                      earned
                        ? `${colors!.bg} ${colors!.border} ${colors!.text}`
                        : UNEARNED_STYLE
                    }`}
                    title={badge.description}
                  >
                    <span className="text-2xl">{badge.icon}</span>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">{badge.name}</p>
                      <p className={`text-xs capitalize ${earned ? 'opacity-80' : ''}`}>{badge.rarity}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">
              {isEs ? 'Completa sesiones de tutoría y actividades para ganar insignias.' : 'Complete tutoring sessions and activities to earn badges.'}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats footer */}
      <div className="pt-8 mt-8 border-t border-youth-muted/50">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          {isEs ? 'Resumen de cuenta' : 'Quick Stats'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="rounded-youth-lg bg-card border-2 border-youth-muted/50" data-testid="card-account-status">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">
                {isEs ? 'Estado de cuenta' : 'Account Status'}
              </CardTitle>
              <CheckCircle2 className="h-5 w-5 text-youth-success" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-youth-success">Active</div>
              <p className="text-xs text-muted-foreground">
                {user.isVerified ? t.dashboard.verifiedAccount : t.dashboard.verificationPending}
              </p>
            </CardContent>
          </Card>
          <Card className="rounded-youth-lg bg-card border-2 border-youth-muted/50" data-testid="card-member-since">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">
                {isEs ? 'Miembro desde' : 'Member Since'}
              </CardTitle>
              <Calendar className="h-5 w-5 text-youth-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-foreground" data-testid="text-member-date">
                {new Date(user.createdAt).toLocaleDateString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {isEs ? 'Fecha de registro' : 'Registration date'}
              </p>
            </CardContent>
          </Card>
          <Card className="rounded-youth-lg bg-card border-2 border-youth-muted/50" data-testid="card-last-active">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">
                {isEs ? 'Última actividad' : 'Last Active'}
              </CardTitle>
              <Clock className="h-5 w-5 text-youth-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-foreground" data-testid="text-last-active">
                {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : (isEs ? 'Hoy' : 'Today')}
              </div>
              <p className="text-xs text-muted-foreground">
                {isEs ? 'Último inicio de sesión' : 'Last login'}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </PageLayout>
  );
}
