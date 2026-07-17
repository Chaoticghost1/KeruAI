import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../hooks/use-auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { apiRequest } from '@/lib/queryClient';
import { usePersonas } from '../hooks/use-personas';
import { SyncStatus } from '../components/SyncStatus';
import { PageLayout } from '@/components/PageLayout';
import type { StudentProfile } from '@/types/profile';
import { Send, GraduationCap, Sparkles, ChevronRight, Brain, Loader2 } from 'lucide-react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';

interface TutorAgent {
  id: number;
  agentKey: string;
  name: string;
  title: string;
  avatar: string;
  subjects: string[];
  description: string;
  isActive: boolean;
}

interface TutorSession {
  id: number;
  userId: number;
  agentId: number;
  subject: string;
  topic: string;
  difficultyLevel: number;
  isActive: boolean;
  startedAt: string;
}

interface TutorMessage {
  id: number;
  sessionId: number;
  sender: 'student' | 'agent';
  message: string;
  messageType: string;
  toolsUsed: string[];
  timestamp: string;
}

export default function StudyBuddy() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedAgent, setSelectedAgent] = useState<TutorAgent | null>(null);
  const [currentSession, setCurrentSession] = useState<TutorSession | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [curriculumMode, setCurriculumMode] = useState(false);
  const [difficultyLevel, setDifficultyLevel] = useState(2);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get authenticated user ID
  const userId = user?.id;

  // Fetch profile to prefill difficulty and show summary
  const { data: profile } = useQuery<StudentProfile | null>({
    queryKey: ['/api/progress', 'profile', userId],
    enabled: !!userId,
  });

  // Prefill session difficulty from profile when present
  useEffect(() => {
    if (profile?.preferredDifficulty != null && profile.preferredDifficulty >= 1 && profile.preferredDifficulty <= 5) {
      setDifficultyLevel(profile.preferredDifficulty);
    }
  }, [profile?.preferredDifficulty]);

  // Fetch available personas using shared hook
  const { data: personas = [], isLoading: personasLoading } = usePersonas();

  // Fetch session messages
  const { data: messages = [], isLoading: messagesLoading } = useQuery<TutorMessage[]>({
    queryKey: ['sessionMessages', currentSession?.id],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/tutors/sessions/${currentSession?.id}/messages`);
      return await response.json();
    },
    enabled: !!currentSession?.id
  });

  // Scroll chat to bottom when messages change so new messages appear just above the send button
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Create new tutor session
  const createSessionMutation = useMutation({
    mutationFn: async (sessionData: any) => {
      const response = await apiRequest('POST', '/api/tutors/sessions', sessionData);
      return await response.json();
    },
    onSuccess: (session) => {
      setCurrentSession(session);
      queryClient.invalidateQueries({ queryKey: ['tutorSessions'] });
    }
  });

  // Send message
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: any) => {
      const response = await apiRequest('POST', '/api/tutors/messages', messageData);
      return await response.json();
    },
    onSuccess: () => {
      setMessageInput('');
      queryClient.invalidateQueries({ 
        queryKey: ['sessionMessages', currentSession?.id] 
      });
    }
  });

  // End session (revoke session, then award progress/badges via session-complete)
  const endSessionMutation = useMutation({
    mutationFn: async (payload: { sessionId: number; userId: number; subject: string; messagesExchanged: number; difficulty: number }) => {
      const { sessionId, userId, subject, messagesExchanged, difficulty } = payload;
      const response = await apiRequest('PATCH', `/api/tutors/sessions/${sessionId}/end`);
      const ended = await response.json();
      try {
        await apiRequest('POST', `/api/progress/session-complete/${sessionId}`, {
          userId,
          subject,
          messagesExchanged,
          difficulty,
          duration: undefined,
        });
      } catch {
        // Best-effort: rewards not critical for UX
      }
      return ended;
    },
    onSuccess: () => {
      setCurrentSession(null);
      setSelectedAgent(null);
      queryClient.invalidateQueries({ queryKey: ['tutorSessions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/progress'] });
    }
  });

  // Generate a practice pack from the selected subject/topic, then go to revision.
  const generatePracticeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/study/practice', {
        subject: selectedSubject,
        topic: topic || undefined,
        difficulty: difficultyLevel,
        count: 5,
        language: t.language === 'en' ? 'en' : 'es',
      });
      if (!response.ok) throw new Error('Failed to generate practice');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/revision/packs'] });
      toast({
        title: t.language === 'es' ? 'Práctica generada' : 'Practice generated',
        description: t.language === 'es'
          ? 'Encuéntrala en la sección de Repaso.'
          : 'Find it in your Revision section.',
      });
      setLocation('/revision');
    },
    onError: () => {
      toast({
        title: t.language === 'es' ? 'Error' : 'Error',
        description: t.language === 'es'
          ? 'No se pudo generar la práctica.'
          : 'Could not generate practice.',
        variant: 'destructive',
      });
    },
  });

  const startSession = () => {
    if (!selectedAgent || !selectedSubject || !userId) return;

    createSessionMutation.mutate({
      userId,
      agentId: selectedAgent.id,
      subject: selectedSubject,
      topic: topic || null,
      gradeLevel: gradeLevel || undefined,
      curriculumMode,
      difficultyLevel,
      isActive: true,
      language: t.language // Include user's language preference
    });
  };

  const sendMessage = () => {
    if (!messageInput.trim() || !currentSession) return;

    sendMessageMutation.mutate({
      sessionId: currentSession.id,
      sender: 'student',
      message: messageInput.trim(),
      messageType: 'text',
      language: t.language, // Include user's language preference
      curriculumMode,
      gradeLevel: gradeLevel || undefined,
    });
  };

  const endSession = () => {
    if (!currentSession || !userId) return;
    endSessionMutation.mutate({
      sessionId: currentSession.id,
      userId,
      subject: currentSession.subject,
      messagesExchanged: messages?.length ?? 0,
      difficulty: difficultyLevel,
    });
  };

  if (personasLoading || !user) {
    return (
      <PageLayout>
        <div className="flex flex-col items-center justify-center py-24">
          <div className="h-12 w-12 rounded-full border-2 border-youth-primary/30 border-t-youth-primary animate-spin" />
          <p className="mt-4 text-muted-foreground text-sm">
            {t.language === 'es' ? 'Cargando tutores...' : 'Loading tutors...'}
          </p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
        <div className="flex flex-col items-center mb-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-youth-primary/15 text-youth-primary">
              <GraduationCap className="h-5 w-5" />
            </div>
            <Sparkles className="h-5 w-5 text-youth-accent" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-2">
            {t.studybuddy.title}
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl text-center leading-relaxed">
            {t.studybuddy.description}
          </p>
          <div className="mt-4 text-sm text-muted-foreground/80">
            <SyncStatus />
          </div>
        </div>

        {!currentSession ? (
          // Agent Selection View - Grid of tutor cards
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4">
                {t.language === 'es' ? 'Elige tu Tutor IA' : 'Choose Your AI Tutor'}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {personas.map((persona: TutorAgent) => {
                  const agentTr = (t.studybuddy as { agents?: Record<string, { name: string; title: string; longDescription: string }> }).agents?.[persona.agentKey];
                  const subjectLabels = (t.studybuddy as { subjectLabels?: Record<string, string> }).subjectLabels;
                  const displayName = agentTr?.name ?? persona.name;
                  const displayTitle = agentTr?.title ?? persona.title;
                  const isSelected = selectedAgent?.id === persona.id;
                  return (
                    <Card
                      key={persona.id}
                      className={`cursor-pointer transition-all duration-200 hover:shadow-md hover:border-youth-primary/50 ${
                        isSelected ? 'ring-2 ring-youth-primary border-youth-primary/50 shadow-md' : 'border-border/80'
                      }`}
                      onClick={() => setSelectedAgent(isSelected ? null : persona)}
                    >
                      <CardContent className="p-4 flex flex-col items-center text-center">
                        <div className="text-4xl mb-3" aria-hidden>{persona.avatar}</div>
                        <h3 className="font-semibold text-foreground mb-0.5">{displayName}</h3>
                        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{displayTitle}</p>
                        <div className="flex flex-wrap gap-1 justify-center mb-3">
                          {persona.subjects.slice(0, 3).map((subject: string) => (
                            <Badge key={subject} variant="secondary" className="text-[10px] px-1.5 py-0 bg-youth-primary/10 text-youth-primary border-0">
                              {subjectLabels?.[subject] ?? subject}
                            </Badge>
                          ))}
                          {persona.subjects.length > 3 && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-muted text-muted-foreground border-0">
                              +{persona.subjects.length - 3}
                            </Badge>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant={isSelected ? 'secondary' : 'default'}
                          className={`rounded-lg w-full ${!isSelected ? 'bg-youth-primary hover:bg-youth-primary/90 text-white' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAgent(isSelected ? null : persona);
                          }}
                        >
                          {isSelected
                            ? (t.language === 'es' ? 'Cambiar' : 'Change')
                            : ((t.studybuddy as { chooseThisTutor?: string }).chooseThisTutor ?? (t.language === 'es' ? 'Elegir' : 'Choose'))}
                          <ChevronRight className="ml-1 h-3 w-3" />
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {selectedAgent && (
              <Card className="rounded-2xl border border-border/80 overflow-hidden">
                <CardContent className="p-5">
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-youth-primary" />
                      {t.language === 'es' ? 'Configurar Sesión' : 'Session Setup'}
                    </h3>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-foreground">
                          {t.language === 'es' ? 'Materia' : 'Subject'}
                        </label>
                        <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                          <SelectTrigger className="rounded-lg">
                            <SelectValue placeholder={
                              t.language === 'es' ? 'Selecciona una materia' : 'Select a subject'
                            } />
                          </SelectTrigger>
                          <SelectContent>
                            {selectedAgent.subjects.map((subject: string) => (
                              <SelectItem key={subject} value={subject}>
                                {(t.studybuddy as { subjectLabels?: Record<string, string> }).subjectLabels?.[subject] ?? subject}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-foreground">
                          {t.language === 'es' ? 'Nivel de Dificultad' : 'Difficulty Level'}
                        </label>
                        <Select 
                          value={difficultyLevel.toString()} 
                          onValueChange={(value) => setDifficultyLevel(parseInt(value))}
                        >
                          <SelectTrigger className="rounded-lg">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">
                              {t.language === 'es' ? 'Principiante' : 'Beginner'}
                            </SelectItem>
                            <SelectItem value="2">
                              {t.language === 'es' ? 'Intermedio' : 'Intermediate'}
                            </SelectItem>
                            <SelectItem value="3">
                              {t.language === 'es' ? 'Avanzado' : 'Advanced'}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-foreground">
                        {t.language === 'es' ? 'Tema Específico (Opcional)' : 'Specific Topic (Optional)'}
                      </label>
                      <Input
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        className="rounded-lg"
                        placeholder={
                          t.language === 'es' 
                            ? 'ej. ecuaciones cuadráticas, biología celular' 
                            : 'e.g. quadratic equations, cell biology'
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-foreground">
                        {t.language === 'es' ? 'Grado (Opcional)' : 'Grade Level (Optional)'}
                      </label>
                      <Select value={gradeLevel} onValueChange={setGradeLevel}>
                        <SelectTrigger className="rounded-lg">
                          <SelectValue placeholder={t.language === 'es' ? 'Selecciona un grado' : 'Select a grade'} />
                        </SelectTrigger>
                        <SelectContent>
                          {['1','2','3','4','5','6','7','8','9','10','11','12'].map((g) => (
                            <SelectItem key={g} value={g}>{t.language === 'es' ? `Grado ${g}` : `Grade ${g}`}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2.5">
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {t.language === 'es' ? 'Modo Plan de Estudios' : 'Curriculum Mode'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t.language === 'es'
                            ? 'Usa el material subido por tus profesores como contexto'
                            : 'Use material uploaded by your teachers as context'}
                        </p>
                      </div>
                      <Switch checked={curriculumMode} onCheckedChange={setCurriculumMode} />
                    </div>

                    <Button 
                      onClick={startSession}
                      disabled={!selectedSubject || createSessionMutation.isPending}
                      className="w-full rounded-xl bg-youth-primary hover:bg-youth-primary/90 text-white py-5 text-base font-medium transition-all"
                    >
                      {createSessionMutation.isPending
                        ? (t.language === 'es' ? 'Iniciando...' : 'Starting...')
                        : (t.language === 'es' ? 'Comenzar Sesión de Tutoría' : 'Start Tutoring Session')
                      }
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => generatePracticeMutation.mutate()}
                      disabled={!selectedSubject || generatePracticeMutation.isPending}
                      className="w-full rounded-xl py-5 text-base font-medium"
                      data-testid="generate-practice-button"
                    >
                      {generatePracticeMutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Brain className="mr-2 h-4 w-4" />
                      )}
                      {t.language === 'es' ? 'Generar Práctica' : 'Generate Practice'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          // Active Session View
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Session Info Sidebar */}
            <div className="lg:col-span-1 order-2 lg:order-1">
              <Card className="rounded-2xl border border-border/80 shadow-sm overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">
                    {t.language === 'es' ? 'Sesión Activa' : 'Active Session'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col items-center text-center">
                    <div className="text-3xl mb-2" aria-hidden>{selectedAgent?.avatar}</div>
                    <h3 className="font-semibold text-foreground">
                      {selectedAgent ? ((t.studybuddy as { agents?: Record<string, { name: string }> }).agents?.[selectedAgent.agentKey]?.name ?? selectedAgent.name) : ''}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedAgent ? ((t.studybuddy as { agents?: Record<string, { title: string }> }).agents?.[selectedAgent.agentKey]?.title ?? selectedAgent.title) : ''}
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="font-medium text-foreground">{t.language === 'es' ? 'Materia:' : 'Subject:'}</span>
                      <p className="text-muted-foreground mt-0.5">{currentSession.subject}</p>
                    </div>
                    {currentSession.topic && (
                      <div>
                        <span className="font-medium text-foreground">{t.language === 'es' ? 'Tema:' : 'Topic:'}</span>
                        <p className="text-muted-foreground mt-0.5">{currentSession.topic}</p>
                      </div>
                    )}
                    <div>
                      <span className="font-medium text-foreground">{t.language === 'es' ? 'Nivel:' : 'Level:'}</span>
                      <p className="text-muted-foreground mt-0.5">
                        {currentSession.difficultyLevel === 1 
                          ? (t.language === 'es' ? 'Principiante' : 'Beginner')
                          : currentSession.difficultyLevel === 2
                          ? (t.language === 'es' ? 'Intermedio' : 'Intermediate')
                          : (t.language === 'es' ? 'Avanzado' : 'Advanced')
                        }
                      </p>
                    </div>
                  </div>

                  <Button 
                    variant="outline" 
                    onClick={endSession}
                    disabled={endSessionMutation.isPending}
                    className="w-full rounded-xl"
                  >
                    {t.language === 'es' ? 'Finalizar Sesión' : 'End Session'}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Chat Interface */}
            <div className="lg:col-span-3 order-1 lg:order-2">
              <Card className="min-h-[480px] lg:min-h-[560px] flex flex-col rounded-2xl border border-border/80 shadow-sm overflow-hidden">
                <CardHeader className="py-4 border-b bg-muted/20">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-youth-success animate-pulse" />
                    {t.language === 'es' ? 'Chat con tu Tutor' : 'Chat with your Tutor'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col p-0 min-h-0">
                  {/* Messages */}
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4 min-h-[200px]">
                      {messages.length === 0 && !sendMessageMutation.isPending ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                          <div className="rounded-full bg-youth-primary/10 p-4 mb-4">
                            <GraduationCap className="h-8 w-8 text-youth-primary" />
                          </div>
                          <p className="text-muted-foreground font-medium">
                            {t.language === 'es' ? '¡Empieza la conversación!' : 'Start the conversation!'}
                          </p>
                          <p className="text-sm text-muted-foreground/80 mt-1 max-w-xs">
                            {t.language === 'es' ? 'Escribe tu primera pregunta abajo' : 'Type your first question below'}
                          </p>
                        </div>
                      ) : (
                        <>
                          {messages.map((message: TutorMessage) => (
                            <div
                              key={message.id}
                              className={`flex ${
                                message.sender === 'student' ? 'justify-end' : 'justify-start'
                              }`}
                            >
                              <div
                                className={`max-w-[85%] px-4 py-2.5 rounded-2xl shadow-sm ${
                                  message.sender === 'student'
                                    ? 'bg-youth-primary text-white rounded-br-md'
                                    : 'bg-muted text-foreground rounded-bl-md'
                                }`}
                              >
                                <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{message.message}</p>
                                <p className={`text-xs mt-1.5 ${message.sender === 'student' ? 'opacity-80' : 'text-muted-foreground'}`}>
                                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                            </div>
                          ))}
                          {sendMessageMutation.isPending && (
                            <div className="flex justify-start">
                              <div className="bg-muted px-4 py-3 rounded-2xl rounded-bl-md shadow-sm">
                                <div className="flex gap-1">
                                  <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                  <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                  <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  {/* Message Input */}
                  <div className="p-4 border-t bg-muted/10">
                    <div className="flex gap-2 items-end">
                      <Textarea
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        placeholder={
                          t.language === 'es' 
                            ? 'Escribe tu pregunta aquí...' 
                            : 'Type your question here...'
                        }
                        className="flex-1 min-h-[44px] max-h-[120px] rounded-xl resize-none border-border bg-background"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                          }
                        }}
                      />
                      <Button 
                        onClick={sendMessage}
                        disabled={!messageInput.trim() || sendMessageMutation.isPending}
                        className="rounded-xl bg-youth-primary hover:bg-youth-primary/90 h-[44px] px-4 shrink-0"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
    </PageLayout>
  );
}