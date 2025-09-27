import { useState, useEffect } from 'react';
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
import { OfflineManager } from '@/lib/offline-storage';

// Onboarding steps for Honduras educational platform
const createOnboardingSteps = (userRole: string = 'student'): Step[] => {
  const baseSteps: Step[] = [
    {
      target: 'body',
      content: (
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">
            ¡Bienvenido a Keru.ai Suite!
          </h2>
          <p className="text-slate-700">
            Una plataforma educativa diseñada especialmente para Honduras. 
            Te guiaremos paso a paso para que aproveches todas las herramientas.
          </p>
          <div className="flex items-center gap-2 text-sm text-blue-600">
            <GraduationCap className="h-4 w-4" />
            <span>Diseñado para el sistema educativo hondureño</span>
          </div>
        </div>
      ),
      placement: 'center',
      title: 'Plataforma Educativa Honduras'
    },
    {
      target: '[data-testid="nav-dashboard"]',
      content: (
        <div className="space-y-2">
          <h3 className="font-semibold">Panel Principal</h3>
          <p>Tu punto de inicio. Aquí verás tu progreso, tareas pendientes y resumen de actividades.</p>
          <div className="flex items-center gap-1 text-xs text-green-600">
            <Home className="h-3 w-3" />
            <span>Siempre puedes volver aquí</span>
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
  ];

  // Add teacher-specific steps
  if (userRole === 'teacher' || userRole === 'superuser') {
    baseSteps.push({
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
  baseSteps.push(
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
      title: 'Capacidades Offline'
    }
  );

  return baseSteps;
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

export function OnboardingFlow({ autoStart = false, onComplete }: OnboardingFlowProps) {
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const { user } = useAuth();
  const [steps, setSteps] = useState<Step[]>([]);

  useEffect(() => {
    // Check if user has completed onboarding
    const checkOnboardingStatus = async () => {
      try {
        const settings = await OfflineManager.getSettings();
        const hasCompletedOnboarding = localStorage.getItem('onboarding_completed') === 'true';
        
        if (!hasCompletedOnboarding && autoStart) {
          setSteps(createOnboardingSteps(user?.role || 'student'));
          setRun(true);
        }
      } catch (error) {
        console.error('Failed to check onboarding status:', error);
      }
    };

    checkOnboardingStatus();
  }, [autoStart, user]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, type, index, action } = data;

    if (type === 'step:after' || type === 'error:target_not_found') {
      setStepIndex(index + (action === ACTIONS.PREV ? -1 : 1));
    } else if (status === 'finished' || status === 'skipped') {
      setRun(false);
      setIsCompleted(true);
      
      // Mark onboarding as completed
      localStorage.setItem('onboarding_completed', 'true');
      
      if (onComplete) {
        onComplete();
      }
    }
  };

  const startOnboarding = () => {
    setSteps(createOnboardingSteps(user?.role || 'student'));
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
          back: 'Atrás',
          close: 'Cerrar',
          last: 'Finalizar',
          next: 'Siguiente',
          open: 'Abrir diálogo',
          skip: 'Saltar',
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
              Guía de Inicio
            </CardTitle>
            <CardDescription>
              {isCompleted 
                ? 'Has completado la guía de inicio' 
                : 'Aprende a usar la plataforma paso a paso'
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {isCompleted ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-green-600">
                  <Check className="h-4 w-4" />
                  <span className="text-sm">Guía completada</span>
                </div>
                <Button 
                  onClick={restartOnboarding}
                  variant="outline" 
                  className="w-full"
                  data-testid="button-restart-onboarding"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Ver Guía Nuevamente
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-sm text-slate-600">
                  Te mostraremos las funciones principales de la plataforma educativa.
                </div>
                <Button 
                  onClick={startOnboarding}
                  className="w-full"
                  data-testid="button-start-onboarding"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Comenzar Guía
                </Button>
              </div>
            )}

            {/* Quick Stats */}
            <div className="pt-3 border-t space-y-2">
              <h4 className="text-sm font-medium">Características Principales:</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <GraduationCap className="h-3 w-3 text-blue-500" />
                  <span>IA Educativa</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calculator className="h-3 w-3 text-green-500" />
                  <span>BudgetPal</span>
                </div>
                <div className="flex items-center gap-1">
                  <Ship className="h-3 w-3 text-purple-500" />
                  <span>Juegos</span>
                </div>
                <div className="flex items-center gap-1">
                  <Globe className="h-3 w-3 text-orange-500" />
                  <span>Exploración</span>
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
        <div className="space-y-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          {tips.map((tip, index) => (
            <div key={index} className="flex items-start gap-2">
              <div className={`${tip.color} mt-0.5`}>
                {tip.icon}
              </div>
              <div>
                <div className="text-sm font-medium">{tip.title}</div>
                <div className="text-xs text-slate-600 dark:text-slate-400">
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