import { useState, useEffect, useMemo } from 'react';
import Joyride, { 
  CallBackProps, 
  STATUS, 
  EVENTS, 
  ACTIONS,
  Step,
  Styles
} from 'react-joyride';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  GraduationCap, 
  Wallet, 
  Globe, 
  Ship, 
  Bus, 
  MessageCircle, 
  Home,
  Play,
  Pause,
  RotateCcw,
  Check,
  ArrowRight,
  Users,
  BookOpen,
  Calculator
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/contexts/LanguageContext';
import { OFFLINE_ENABLED } from '@/lib/offline-config';
import { OfflineManager } from '@/lib/offline-storage';
import { apiRequest } from '@/lib/queryClient';
import { translations } from '@/data/content';

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

interface QuestionnaireState {
  learningStyle: string;
  preferredDifficulty: number;
  subjectsInput: string;
  strugglingAreasInput: string;
  revisionAssistantNameInput: string;
}

type SetQuestionnaire = React.Dispatch<React.SetStateAction<QuestionnaireState>>;

// Onboarding steps for Honduras educational platform (Option B: welcome + questionnaire for students, then tour)
const createOnboardingSteps = (
  userRole: string,
  lang: 'es' | 'en',
  questionnaire: QuestionnaireState,
  setQuestionnaire: SetQuestionnaire
): Step[] => {
  const isEs = lang === 'es';
  const t = {
    welcomeTitle: isEs ? '¡Bienvenido a Keru.ai Suite!' : 'Welcome to Keru.ai Suite!',
    welcomeBody: isEs
      ? 'Una plataforma educativa diseñada especialmente para Honduras. Te guiaremos paso a paso para que aproveches todas las herramientas.'
      : 'An educational platform designed especially for Honduras. We will guide you step by step so you can make the most of all the tools.',
    welcomeTag: isEs ? 'Diseñado para el sistema educativo hondureño' : 'Designed for the Honduran education system',
    platformTitle: isEs ? 'Plataforma Educativa Honduras' : 'Honduras Education Platform',
    learningStyleTitle: isEs ? '¿Cómo aprendes mejor?' : 'How do you learn best?',
    learningStyleLabel: isEs ? 'Estilo de aprendizaje' : 'Learning style',
    learningStylePlaceholder: isEs ? 'Elige uno (opcional)' : 'Choose one (optional)',
    difficultyTitle: isEs ? '¿Qué nivel prefieres?' : 'What level do you prefer?',
    difficultyLabel: isEs ? 'Dificultad preferida' : 'Preferred difficulty',
    subjectsTitle: isEs ? 'Materias que estudias' : 'Subjects you study',
    subjectsLabel: isEs ? 'Materias (separadas por coma)' : 'Subjects (comma-separated)',
    subjectsPlaceholder: isEs ? 'ej. Matemáticas, Ciencias, Español' : 'e.g. Math, Science, Language Arts',
    strugglingTitle: isEs ? 'Áreas con las que luchas' : 'Areas you struggle with',
    strugglingLabel: isEs ? 'Áreas (separadas por coma)' : 'Areas (comma-separated)',
    strugglingPlaceholder: isEs ? 'ej. Álgebra, Ortografía' : 'e.g. Algebra, Spelling',
  };
  const dashboardT = translations[lang].dashboard as {
    revisionAssistantNameLabel: string;
    revisionAssistantInlineLabel: string;
    revisionAssistantNameDesc: string;
    revisionAssistantNamePlaceholder: string;
  };

  const steps: Step[] = [
    {
      target: 'body',
      content: (
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">{t.welcomeTitle}</h2>
          <p className="text-slate-700">{t.welcomeBody}</p>
          <div className="flex items-center gap-2 text-sm text-blue-600">
            <GraduationCap className="h-4 w-4" />
            <span>{t.welcomeTag}</span>
          </div>
        </div>
      ),
      placement: 'center',
      title: t.platformTitle
    },
  ];

  // Option B: questionnaire steps for students (same questions as profile)
  if (userRole === 'student') {
    steps.push(
      {
        target: 'body',
        title: t.learningStyleTitle,
        content: (
          <div className="space-y-3 min-w-[280px]">
            <Label>{t.learningStyleLabel}</Label>
            <Select
              value={questionnaire.learningStyle || undefined}
              onValueChange={(v) => setQuestionnaire((prev) => ({ ...prev, learningStyle: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder={t.learningStylePlaceholder} />
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
        ),
        placement: 'center'
      },
      {
        target: 'body',
        title: t.difficultyTitle,
        content: (
          <div className="space-y-3 min-w-[280px]">
            <Label>{t.difficultyLabel}</Label>
            <Select
              value={String(questionnaire.preferredDifficulty)}
              onValueChange={(v) => setQuestionnaire((prev) => ({ ...prev, preferredDifficulty: Number(v) }))}
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
        ),
        placement: 'center'
      },
      {
        target: 'body',
        title: t.subjectsTitle,
        content: (
          <div className="space-y-3 min-w-[280px]">
            <Label>{t.subjectsLabel}</Label>
            <Input
              value={questionnaire.subjectsInput}
              onChange={(e) => setQuestionnaire((prev) => ({ ...prev, subjectsInput: e.target.value }))}
              placeholder={t.subjectsPlaceholder}
            />
          </div>
        ),
        placement: 'center'
      },
      {
        target: 'body',
        title: t.strugglingTitle,
        content: (
          <div className="space-y-3 min-w-[280px]">
            <Label>{t.strugglingLabel}</Label>
            <Input
              value={questionnaire.strugglingAreasInput}
              onChange={(e) => setQuestionnaire((prev) => ({ ...prev, strugglingAreasInput: e.target.value }))}
              placeholder={t.strugglingPlaceholder}
            />
          </div>
        ),
        placement: 'center'
      },
      {
        target: 'body',
        title: dashboardT.revisionAssistantNameLabel,
        content: (
          <div className="space-y-3 min-w-[280px]">
            <Label>{dashboardT.revisionAssistantInlineLabel}</Label>
            <p className="text-xs text-slate-600">
              {dashboardT.revisionAssistantNameDesc}
            </p>
            <Input
              value={questionnaire.revisionAssistantNameInput}
              onChange={(e) => setQuestionnaire((prev) => ({ ...prev, revisionAssistantNameInput: e.target.value }))}
              placeholder={dashboardT.revisionAssistantNamePlaceholder}
            />
          </div>
        ),
        placement: 'center'
      }
    );
  }

  // Tour steps (nav and rest)
  steps.push(
    {
      target: '[data-testid="nav-dashboard"]',
      content: (
        <div className="space-y-2">
          <h3 className="font-semibold">{isEs ? 'Panel Principal' : 'Main Panel'}</h3>
          <p>{isEs ? 'Tu punto de inicio. Aquí verás tu progreso, tareas pendientes y resumen de actividades.' : 'Your starting point. Here you will see your progress, pending tasks and activity summary.'}</p>
          <div className="flex items-center gap-1 text-xs text-green-600">
            <Home className="h-3 w-3" />
            <span>{isEs ? 'Siempre puedes volver aquí' : 'You can always return here'}</span>
          </div>
        </div>
      ),
      placement: 'right'
    },
    {
      target: '[data-testid="nav-studybuddy"]',
      content: (
        <div className="space-y-2">
          <h3 className="font-semibold flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Aprende Conmigo AI
          </h3>
          <p>Tu tutor personal inteligente. Te ayuda con matemáticas, ciencias, español y más materias del currículo hondureño.</p>
          <div className="text-xs text-slate-600 space-y-1">
            <div>• Explicaciones paso a paso</div>
            <div>• Ajusta la dificultad según tu nivel</div>
            <div>• Funciona sin internet una vez descargado</div>
          </div>
        </div>
      ),
      placement: 'right'
    },
    {
      target: '[data-testid="nav-budgetpal"]',
      content: (
        <div className="space-y-2">
          <h3 className="font-semibold flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            BudgetPal
          </h3>
          <p>Aprende a manejar dinero con ejemplos reales de Honduras. Usa Lempiras y precios locales.</p>
          <div className="text-xs text-slate-600 space-y-1">
            <div>• Presupuestos familiares hondureños</div>
            <div>• Calcula gastos en Lempiras (L)</div>
            <div>• Aprende educación financiera práctica</div>
          </div>
        </div>
      ),
      placement: 'right'
    },
    {
      target: '[data-testid="nav-blog"]',
      content: (
        <div className="space-y-2">
          <h3 className="font-semibold flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Explorar Mundo
          </h3>
          <p>Descubre destinos turísticos, aprende geografía y conoce sobre viajes desde la perspectiva centroamericana.</p>
        </div>
      ),
      placement: 'right'
    },
    {
      target: '[data-testid="nav-cruiseword"]',
      content: (
        <div className="space-y-2">
          <h3 className="font-semibold flex items-center gap-2">
            <Ship className="h-4 w-4" />
            CruiseWord
          </h3>
          <p>Juego educativo de palabras. Mejora tu vocabulario mientras te diviertes.</p>
          <div className="text-xs text-slate-600">
            Gana puntos y compite con otros estudiantes
          </div>
        </div>
      ),
      placement: 'right'
    }
  );

  // Add teacher-specific steps
  if (userRole === 'teacher' || userRole === 'superuser') {
    steps.push({
      target: '[data-testid="nav-admin"]',
      content: (
        <div className="space-y-2">
          <h3 className="font-semibold flex items-center gap-2">
            <Users className="h-4 w-4" />
            Panel de Profesor
          </h3>
          <p>Crea contenido, asigna tareas a estudiantes y revisa su progreso.</p>
          <div className="text-xs text-slate-600 space-y-1">
            <div>• Sube materiales educativos</div>
            <div>• Crea asignaciones personalizadas</div>
            <div>• Monitorea el progreso estudiantil</div>
          </div>
        </div>
      ),
      placement: 'right'
    });
  }

  // Add offline and data saver steps
  steps.push(
    {
      target: '[data-testid="toggle-data-saver"]',
      content: (
        <div className="space-y-2">
          <h3 className="font-semibold">Modo Ahorro de Datos</h3>
          <p>Muy importante para Honduras: activa esto si tienes conexión lenta o datos limitados.</p>
          <div className="text-xs text-slate-600 space-y-1">
            <div>• Reduce uso de datos móviles</div>
            <div>• Optimiza para conexiones 2G/3G</div>
            <div>• Descarga contenido con WiFi</div>
          </div>
        </div>
      ),
      placement: 'bottom'
    },
    {
      target: 'body',
      content: (
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">
            ¡Funciona Sin Internet!
          </h2>
          <p className="text-slate-700">
            Esta plataforma está diseñada para funcionar aunque tengas mala conexión. 
            Muchas funciones trabajan offline.
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-green-600">
              <Check className="h-4 w-4" />
              <span>Estudiar notas sin internet</span>
            </div>
            <div className="flex items-center gap-2 text-green-600">
              <Check className="h-4 w-4" />
              <span>Jugar CruiseWord offline</span>
            </div>
            <div className="flex items-center gap-2 text-green-600">
              <Check className="h-4 w-4" />
              <span>Manejar presupuesto sin conexión</span>
            </div>
          </div>
          <p className="text-xs text-slate-600">
            Los datos se sincronizan automáticamente cuando tengas internet
          </p>
        </div>
      ),
      placement: 'center',
      title: isEs ? 'Capacidades Offline' : 'Offline Capabilities'
    }
  );

  return steps;
};

// Custom Joyride styles for Honduras theme
const joyrideStyles: Partial<Styles> = {
  options: {
    primaryColor: '#3b82f6',
    textColor: '#334155',
    backgroundColor: '#ffffff',
    overlayColor: 'rgba(0, 0, 0, 0.4)',
    spotlightShadow: '0 0 15px rgba(0, 0, 0, 0.5)',
    width: 350,
    zIndex: 10000,
  },
  tooltip: {
    borderRadius: 8,
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
  },
  tooltipContainer: {
    textAlign: 'left' as const,
  },
  tooltipTitle: {
    fontSize: '1.1rem',
    fontWeight: 600,
    color: '#1e293b',
    marginBottom: '0.5rem',
  },
  tooltipContent: {
    fontSize: '0.9rem',
    lineHeight: 1.5,
    padding: '1rem',
  },
  buttonNext: {
    backgroundColor: '#3b82f6',
    borderRadius: 6,
    fontSize: '0.875rem',
    fontWeight: 500,
    padding: '0.5rem 1rem',
  },
  buttonBack: {
    backgroundColor: '#6b7280',
    borderRadius: 6,
    fontSize: '0.875rem',
    fontWeight: 500,
    padding: '0.5rem 1rem',
    marginRight: '0.5rem',
  },
  buttonSkip: {
    backgroundColor: 'transparent',
    color: '#6b7280',
    fontSize: '0.875rem',
    padding: '0.5rem',
  },
};

interface OnboardingFlowProps {
  autoStart?: boolean;
  onComplete?: () => void;
}

function parseList(value: string): string[] {
  return value.split(',').map((s) => s.trim()).filter(Boolean);
}

export function OnboardingFlow({ autoStart = false, onComplete }: OnboardingFlowProps) {
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const { user } = useAuth();
  const { language } = useLanguage();
  const [questionnaire, setQuestionnaire] = useState<QuestionnaireState>({
    learningStyle: '',
    preferredDifficulty: 2,
    subjectsInput: '',
    strugglingAreasInput: '',
    revisionAssistantNameInput: '',
  });

  const steps = useMemo(
    () => createOnboardingSteps(user?.role || 'student', language, questionnaire, setQuestionnaire),
    [user?.role, language, questionnaire]
  );

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        if (OFFLINE_ENABLED) {
          await OfflineManager.getSettings();
        }
        const hasCompletedOnboarding = localStorage.getItem('onboarding_completed') === 'true';

        if (!hasCompletedOnboarding && autoStart) {
          setRun(true);
        }
      } catch (error) {
        console.error('Failed to check onboarding status:', error);
      }
    };

    checkOnboardingStatus();
  }, [autoStart, user]);

  const saveProfileFromQuestionnaire = async () => {
    if (!user?.id) return;
    const payload = {
      userId: user.id,
      learningStyle: questionnaire.learningStyle || null,
      preferredDifficulty: questionnaire.preferredDifficulty,
      subjects: parseList(questionnaire.subjectsInput),
      strugglingAreas: parseList(questionnaire.strugglingAreasInput),
      revisionAssistantName: questionnaire.revisionAssistantNameInput.trim() || null,
    };
    try {
      const existing = await apiRequest('GET', `/api/progress/profile/${user.id}`).then((r) => (r.ok ? r.json() : null)).catch(() => null);
      if (existing) {
        await apiRequest('PUT', `/api/progress/profile/${user.id}`, payload);
      } else {
        await apiRequest('POST', '/api/progress/profile', payload);
      }
    } catch (e) {
      console.error('Failed to save onboarding profile', e);
    }
  };

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, type, index, action } = data;
    const isStudent = user?.role === 'student';
    const lastQuestionnaireIndex = isStudent ? 5 : 0; // 0=welcome, 1-5=questionnaire for student (5=assistant name)

    if (type === 'step:after' || type === 'error:target_not_found') {
      if (action === ACTIONS.NEXT && isStudent && index === lastQuestionnaireIndex) {
        saveProfileFromQuestionnaire();
      }
      setStepIndex(index + (action === ACTIONS.PREV ? -1 : 1));
    } else if (status === 'finished' || status === 'skipped') {
      if (isStudent) saveProfileFromQuestionnaire();
      setRun(false);
      setIsCompleted(true);
      localStorage.setItem('onboarding_completed', 'true');
      if (onComplete) onComplete();
    }
  };

  const startOnboarding = () => {
    setStepIndex(0);
    setRun(true);
    setIsCompleted(false);
  };

  const restartOnboarding = () => {
    localStorage.removeItem('onboarding_completed');
    startOnboarding();
  };

  return (
    <div className="space-y-4">
      <Joyride
        callback={handleJoyrideCallback}
        continuous={true}
        run={run}
        scrollToFirstStep={true}
        showProgress={true}
        showSkipButton={true}
        steps={steps}
        stepIndex={stepIndex}
        styles={joyrideStyles}
        locale={{
          back: language === 'es' ? 'Atrás' : 'Back',
          close: language === 'es' ? 'Cerrar' : 'Close',
          last: language === 'es' ? 'Finalizar' : 'Finish',
          next: language === 'es' ? 'Siguiente' : 'Next',
          open: language === 'es' ? 'Abrir diálogo' : 'Open dialog',
          skip: language === 'es' ? 'Saltar' : 'Skip',
        }}
        floaterProps={{
          disableAnimation: true,
        }}
      />

      {/* Onboarding Control Panel */}
      {!run && (
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {language === 'es' ? 'Guía de Inicio' : 'Getting Started Guide'}
            </CardTitle>
            <CardDescription>
              {isCompleted 
                ? (language === 'es' ? 'Has completado la guía de inicio' : 'You have completed the getting started guide')
                : (language === 'es' ? 'Aprende a usar la plataforma paso a paso' : 'Learn to use the platform step by step')
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {isCompleted ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-green-600">
                  <Check className="h-4 w-4" />
                  <span className="text-sm">{language === 'es' ? 'Guía completada' : 'Guide completed'}</span>
                </div>
                <Button 
                  onClick={restartOnboarding}
                  variant="outline" 
                  className="w-full"
                  data-testid="button-restart-onboarding"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  {language === 'es' ? 'Ver Guía Nuevamente' : 'View Guide Again'}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-sm text-slate-600">
                  {language === 'es' ? 'Te mostraremos las funciones principales de la plataforma educativa.' : 'We will show you the main features of the education platform.'}
                </div>
                <Button 
                  onClick={startOnboarding}
                  className="w-full"
                  data-testid="button-start-onboarding"
                >
                  <Play className="h-4 w-4 mr-2" />
                  {language === 'es' ? 'Comenzar Guía' : 'Start Guide'}
                </Button>
              </div>
            )}

            {/* Quick Stats */}
            <div className="pt-3 border-t space-y-2">
              <h4 className="text-sm font-medium">{language === 'es' ? 'Características Principales:' : 'Main Features:'}</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <GraduationCap className="h-3 w-3 text-blue-500" />
                  <span>{language === 'es' ? 'IA Educativa' : 'AI Education'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calculator className="h-3 w-3 text-green-500" />
                  <span>BudgetPal</span>
                </div>
                <div className="flex items-center gap-1">
                  <Ship className="h-3 w-3 text-purple-500" />
                  <span>{language === 'es' ? 'Juegos' : 'Games'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Globe className="h-3 w-3 text-orange-500" />
                  <span>{language === 'es' ? 'Exploración' : 'Explore'}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Quick Tips Component for contextual help
export function QuickTips() {
  const [isVisible, setIsVisible] = useState(false);
  const { user } = useAuth();

  const tips = [
    {
      icon: <GraduationCap className="h-4 w-4" />,
      title: "Estudia Sin Internet",
      description: "Descarga lecciones y estudia offline",
      color: "text-blue-600"
    },
    {
      icon: <Wallet className="h-4 w-4" />,
      title: "Presupuestos Reales",
      description: "Usa precios hondureños para aprender",
      color: "text-green-600"
    },
    {
      icon: <MessageCircle className="h-4 w-4" />,
      title: "Pregunta al AI",
      description: "Tu tutor virtual siempre disponible",
      color: "text-purple-600"
    }
  ];

  return (
    <div className="space-y-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsVisible(!isVisible)}
        className="text-xs"
        data-testid="button-toggle-tips"
      >
        💡 Consejos Rápidos
      </Button>
      
      {isVisible && (
        <div className="space-y-2 p-3 bg-blue-50 rounded-lg">
          {tips.map((tip, index) => (
            <div key={index} className="flex items-start gap-2">
              <div className={`${tip.color} mt-0.5`}>
                {tip.icon}
              </div>
              <div>
                <div className="text-sm font-medium">{tip.title}</div>
                <div className="text-xs text-slate-600">
                  {tip.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Hook for programmatic onboarding control
export function useOnboarding() {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem('onboarding_completed') === 'true';
    setHasCompletedOnboarding(completed);
  }, []);

  const markCompleted = () => {
    localStorage.setItem('onboarding_completed', 'true');
    setHasCompletedOnboarding(true);
  };

  const reset = () => {
    localStorage.removeItem('onboarding_completed');
    setHasCompletedOnboarding(false);
  };

  return {
    hasCompletedOnboarding,
    markCompleted,
    reset
  };
}