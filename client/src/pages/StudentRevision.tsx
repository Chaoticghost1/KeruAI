import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Loader2, BookOpen, FileText, Image, Brain, Send, Eye, GraduationCap, Minimize2, MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'wouter';
import { PageLayout } from '@/components/PageLayout';

interface RevisionMaterial {
  assignmentId: number;
  contentId: number;
  teacherId?: number;
  status: string;
  assignedAt: string;
  dueDate?: string;
  grade?: number;
  content: {
    id: number;
    title: string;
    description?: string;
    contentType: string;
    subject: string;
    gradeLevel?: string;
    tags: string[];
    fileUrl?: string;
    extractedText?: string;
    htmlContent?: string;
  };
}

interface AIResponse {
  message: string;
  toolsUsed: string[];
  difficulty: number;
  engagement: number;
  contentContext: {
    title: string;
    subject: string;
    hasExtractedText: boolean;
  };
  sessionId?: string;
}

export default function StudentRevision() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [selectedMaterial, setSelectedMaterial] = useState<RevisionMaterial | null>(null);
  const [currentSession, setCurrentSession] = useState<string | null>(null);
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiConversation, setAiConversation] = useState<Array<{
    type: 'user' | 'ai';
    message: string;
    timestamp: string;
  }>>([]);
  const [chatMinimized, setChatMinimized] = useState(true);
  const [promptDismissed, setPromptDismissed] = useState(() =>
    typeof localStorage !== 'undefined' ? localStorage.getItem('revision_assistant_name_prompt_dismissed') === 'true' : false
  );
  const [showInlineSetName, setShowInlineSetName] = useState(false);
  const [inlineAssistantName, setInlineAssistantName] = useState('');

  const { data: selectedTeachers = [] } = useQuery<{ id: number }[]>({
    queryKey: ['/api/students/teachers'],
    enabled: !!user,
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/students/teachers');
      return res.json();
    },
  });

  const { data: studentClassesData = [] } = useQuery<{ member?: { status?: string } }[]>({
    queryKey: ['/api/classes/student', user?.id],
    enabled: !!user && user?.role === 'student',
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/classes/student');
      return res.json();
    },
  });

  const { data: studentProfile } = useQuery<{ revisionAssistantName?: string | null } | null>({
    queryKey: ['/api/progress', 'profile', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/progress/profile/${user!.id}`);
      if (!res.ok) return null;
      return res.json();
    },
  });

  const hasTeachers = selectedTeachers.length > 0;
  const hasApprovedClass = studentClassesData.some(
    (item) => item?.member?.status === 'approved'
  );
  const showPrerequisites = hasTeachers === false || hasApprovedClass === false;

  const { data: materials = [], isLoading: materialsLoading, error: materialsError } = useQuery<RevisionMaterial[]>({
    queryKey: ['revision-materials'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/assignments/revision/materials');
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        const message = (body && typeof body.error === 'string') ? body.error : 'Failed to fetch revision materials';
        const err = new Error(message) as Error & { status?: number };
        err.status = response.status;
        throw err;
      }
      return response.json();
    },
    enabled: !!user && hasApprovedClass
  });

  // Start revision session mutation
  const startSessionMutation = useMutation({
    mutationFn: async ({ contentId, subject, topic }: { contentId: number; subject: string; topic?: string }) => {
      const response = await apiRequest('POST', '/api/assignments/revision/session/start', {
        contentId,
        subject,
        topic: topic || 'General Review'
      });
      if (!response.ok) {
        throw new Error('Failed to start revision session');
      }
      return response.json();
    },
    onSuccess: (session) => {
      setCurrentSession(session.sessionId);
      toast({
        title: "Revision session started",
        description: `Started studying ${selectedMaterial?.content.title}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to start revision session",
        variant: "destructive"
      });
    }
  });

  // AI help mutation
  const aiHelpMutation = useMutation({
    mutationFn: async ({ contentId, question, sessionId }: { contentId: number; question: string; sessionId?: string }) => {
      const response = await apiRequest('POST', '/api/assignments/revision/ai-help', {
        contentId,
        question,
        sessionId
      });
      if (!response.ok) {
        throw new Error('Failed to get AI assistance');
      }
      return response.json();
    },
    onSuccess: (aiResponse: AIResponse) => {
      setAiConversation(prev => [
        ...prev,
        {
          type: 'user',
          message: aiQuestion,
          timestamp: new Date().toISOString()
        },
        {
          type: 'ai',
          message: aiResponse.message,
          timestamp: new Date().toISOString()
        }
      ]);
      setAiQuestion('');
      toast({
        title: "AI Assistant",
        description: "Got response from your study assistant",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to get AI assistance",
        variant: "destructive"
      });
    }
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (revisionAssistantName: string | null) => {
      const res = await apiRequest('PUT', `/api/progress/profile/${user!.id}`, { revisionAssistantName });
      if (!res.ok) throw new Error('Failed to update profile');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/progress', 'profile', user?.id] });
      setShowInlineSetName(false);
      setInlineAssistantName('');
      toast({
        title: t.dashboard.revisionAssistantNameSaved,
        description: t.dashboard.revisionAssistantNameSavedDesc,
      });
    },
    onError: () => {
      toast({
        title: t.dashboard.revisionAssistantSaveFailed,
        variant: 'destructive',
      });
    },
  });

  const handleDismissAssistantNamePrompt = () => {
    localStorage.setItem('revision_assistant_name_prompt_dismissed', 'true');
    setPromptDismissed(true);
  };

  const startRevisionSession = (material: RevisionMaterial) => {
    setSelectedMaterial(material);
    setAiConversation([]);
    startSessionMutation.mutate({
      contentId: material.contentId,
      subject: material.content.subject,
      topic: material.content.title
    });
  };

  const askAI = () => {
    if (!aiQuestion.trim() || !selectedMaterial) return;
    
    aiHelpMutation.mutate({
      contentId: selectedMaterial.contentId,
      question: aiQuestion,
      sessionId: currentSession || undefined
    });
  };

  const getContentIcon = (contentType: string) => {
    switch (contentType.toLowerCase()) {
      case 'pdf':
        return <FileText className="h-5 w-5" />;
      case 'image':
      case 'jpg':
      case 'jpeg':
      case 'png':
        return <Image className="h-5 w-5" />;
      default:
        return <BookOpen className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'assigned':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'reviewed':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const is403 = materialsError && (materialsError as Error & { status?: number }).status === 403;
  const errorMessage = materialsError instanceof Error ? materialsError.message : '';

  if (showPrerequisites) {
    return (
      <PageLayout maxWidth="7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">{t.nav.revision}</h1>
          <p className="mt-2 text-lg text-muted-foreground">{t.dashboard.revisionMaterialsDesc}</p>
        </div>
        <Card className="border-2 border-youth-primary/50 bg-youth-primary/5 rounded-youth-lg mb-8">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <GraduationCap className="h-5 w-5 text-youth-primary" />
              {t.dashboard.getStarted}
            </CardTitle>
            <CardDescription>
              {!hasTeachers
                ? t.dashboard.getStartedNoTeachersClass
                : !hasApprovedClass
                  ? t.dashboard.getStartedNoApprovedClass
                  : t.dashboard.getStartedNoTeachers}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="rounded-youth-lg bg-youth-primary hover:opacity-90 text-white">
              <Link href="/classes">{t.dashboard.revisionGoToClasses}</Link>
            </Button>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  if (materialsLoading) {
    return (
      <PageLayout maxWidth="7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">{t.nav.revision}</h1>
          <p className="mt-2 text-lg text-muted-foreground">{t.dashboard.revisionMaterialsDesc}</p>
        </div>
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">{t.dashboard.revisionLoading}</span>
        </div>
      </PageLayout>
    );
  }

  if (materialsError && (is403 || errorMessage.toLowerCase().includes('approve') || errorMessage.toLowerCase().includes('class'))) {
    return (
      <PageLayout maxWidth="7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">{t.nav.revision}</h1>
          <p className="mt-2 text-lg text-muted-foreground">{t.dashboard.revisionMaterialsDesc}</p>
        </div>
        <Card className="border-2 border-youth-primary/50 bg-youth-primary/5 rounded-youth-lg mb-8">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <GraduationCap className="h-5 w-5 text-youth-primary" />
              {t.dashboard.revisionErrorTitle}
            </CardTitle>
            <CardDescription>{errorMessage}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="rounded-youth-lg bg-youth-primary hover:opacity-90 text-white">
              <Link href="/classes">{t.dashboard.revisionGoToClasses}</Link>
            </Button>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  if (materialsError) {
    return (
      <PageLayout maxWidth="7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">{t.nav.revision}</h1>
          <p className="mt-2 text-lg text-muted-foreground">{t.dashboard.revisionMaterialsDesc}</p>
        </div>
        <Card className="border-2 border-destructive/30 bg-destructive/5 rounded-youth-lg">
          <CardHeader className="pb-2">
            <CardTitle>{t.dashboard.revisionErrorTitle}</CardTitle>
            <CardDescription>
              {materialsError instanceof Error ? materialsError.message : 'Unknown error'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href="/classes">{t.dashboard.revisionGoToClasses}</Link>
            </Button>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  return (
    <PageLayout maxWidth="7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">{t.nav.revision}</h1>
        <p className="mt-2 text-lg text-muted-foreground">{t.dashboard.revisionMaterialsDesc}</p>
        {hasTeachers && (
          <p className="mt-2 text-sm text-muted-foreground">
            <Link href="/classes" className="underline hover:text-youth-primary">
              {t.dashboard.revisionYourTeachersClasses}
            </Link>
            {' '}({selectedTeachers.length} {t.dashboard.revisionTeachersLabel},{' '}
            {studentClassesData.filter((c) => c?.member?.status === 'approved').length} {t.dashboard.revisionClassesLabel})
          </p>
        )}
      </div>

      {materials.length > 0 && studentProfile != null && !studentProfile.revisionAssistantName?.trim() && !promptDismissed && (
        <Card className="mb-6 border-youth-primary/30 bg-youth-primary/5">
          <CardContent className="pt-6">
            {!showInlineSetName ? (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <p className="text-sm text-foreground">
                  {t.dashboard.revisionAssistantPromptMessage}
                </p>
                <div className="flex gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleDismissAssistantNamePrompt}
                  >
                    {t.dashboard.revisionAssistantLater}
                  </Button>
                  <Button
                    size="sm"
                    className="bg-youth-primary hover:opacity-90"
                    onClick={() => setShowInlineSetName(true)}
                  >
                    {t.dashboard.revisionAssistantSetName}
                  </Button>
                  <Button size="sm" variant="ghost" asChild>
                    <Link href="/profile">{t.dashboard.revisionAssistantGoToProfile}</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-end gap-3">
                <div className="flex-1 space-y-1">
                  <label className="text-sm font-medium">
                    {t.dashboard.revisionAssistantInlineLabel}
                  </label>
                  <Input
                    value={inlineAssistantName}
                    onChange={(e) => setInlineAssistantName(e.target.value)}
                    placeholder={t.dashboard.revisionAssistantNamePlaceholder}
                    className="max-w-xs"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => { setShowInlineSetName(false); setInlineAssistantName(''); }}
                  >
                    {t.dashboard.revisionAssistantCancel}
                  </Button>
                  <Button
                    size="sm"
                    className="bg-youth-primary hover:opacity-90"
                    onClick={() => updateProfileMutation.mutate(inlineAssistantName.trim() || null)}
                    disabled={updateProfileMutation.isPending}
                  >
                    {updateProfileMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      t.dashboard.revisionAssistantSave
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Materials List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>{t.dashboard.revisionYourMaterials}</CardTitle>
                <CardDescription>
                  {materials.length} {t.dashboard.revisionCountAvailable}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {materials.length === 0 && selectedTeachers.length === 0 && !materialsLoading && (
                  <div className="py-8 text-center space-y-4">
                    <GraduationCap className="w-12 h-12 mx-auto text-slate-400" />
                    <p className="text-slate-600 font-medium">
                      {t.dashboard.revisionStartHere}
                    </p>
                    <p className="text-slate-600 text-sm">
                      {t.dashboard.revisionEmptyAddTeacherFirst}
                    </p>
                    <Button asChild variant="default">
                      <Link href="/classes">{t.dashboard.revisionGoToClasses}</Link>
                    </Button>
                  </div>
                )}
                {materials.length === 0 && selectedTeachers.length > 0 && !materialsLoading && (
                  <div className="py-8 text-center space-y-2 text-slate-600">
                    <p>{t.dashboard.revisionEmptyTeacherNotAssigned}</p>
                    <p className="text-sm">{t.dashboard.revisionEmptyJoinAndAsk}</p>
                  </div>
                )}
                {materials.length > 0 && (
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {materials.map((material) => (
                      <Card 
                        key={material.assignmentId}
                        className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                          selectedMaterial?.assignmentId === material.assignmentId ? 'ring-2 ring-blue-500' : ''
                        }`}
                        onClick={() => startRevisionSession(material)}
                        data-testid={`material-card-${material.contentId}`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                              {getContentIcon(material.content.contentType)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-medium text-gray-900 truncate">
                                {material.content.title}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {material.content.subject}
                              </p>
                              <div className="flex items-center space-x-2 mt-2">
                                <Badge className={getStatusColor(material.status)}>
                                  {material.status.replace('_', ' ')}
                                </Badge>
                                {material.grade && (
                                  <Badge variant="outline">
                                    Grade: {material.grade}%
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Book: full width (screen-wide). Chat is floating + minimizable. */}
          <div className="lg:col-span-2">
            {selectedMaterial ? (
              <>
                <section className="w-full rounded-xl shadow-lg border border-stone-200/80 bg-amber-50/40 overflow-hidden relative">
                  <div className="px-6 sm:px-8 py-5 border-b border-stone-200/60 bg-white/60 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        {getContentIcon(selectedMaterial.content.contentType)}
                        <h2 className="text-xl font-bold text-foreground">
                          {selectedMaterial.content.title}
                        </h2>
                        <span className="text-sm text-muted-foreground">
                          {selectedMaterial.content.subject} • {selectedMaterial.content.contentType.toUpperCase()}
                        </span>
                      </div>
                      {selectedMaterial.content.description && (
                        <p className="mt-2 text-sm text-muted-foreground max-w-3xl">
                          {selectedMaterial.content.description}
                        </p>
                      )}
                      {selectedMaterial.content.fileUrl && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-2 -ml-2 text-muted-foreground hover:text-foreground"
                          onClick={() => window.open(selectedMaterial.content.fileUrl, '_blank')}
                          data-testid="view-content-button"
                        >
                          <Eye className="h-4 w-4 mr-1.5" />
                          Open in new tab
                        </Button>
                      )}
                    </div>
                    {/* Chat trigger and panel: top-right of book header */}
                    <div className="relative flex-shrink-0">
                      {chatMinimized ? (
                        <Button
                          size="lg"
                          className="h-11 w-11 rounded-full shadow-md bg-youth-primary hover:opacity-90 text-white p-0"
                          onClick={() => setChatMinimized(false)}
                          title="Ask about this material"
                        >
                          <MessageCircle className="h-5 w-5" />
                        </Button>
                      ) : (
                        <div className="absolute top-0 right-0 z-10 w-[320px] sm:w-[360px] rounded-youth-lg border-2 border-youth-muted/50 bg-card shadow-xl">
                          <Card className="rounded-youth-lg border-0 shadow-none">
                            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                              <div>
                                <CardTitle className="flex items-center space-x-2 text-base">
                                  <Brain className="h-5 w-5 text-youth-primary" />
                                  <span>Ask about this material</span>
                                </CardTitle>
                                <CardDescription className="text-xs">
                                  Questions about the content
                                </CardDescription>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 shrink-0"
                                onClick={() => setChatMinimized(true)}
                                title="Minimize"
                              >
                                <Minimize2 className="h-4 w-4" />
                              </Button>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3">
                                <ScrollArea className="h-56 bg-youth-muted/30 p-2 rounded-lg">
                                  {aiConversation.length === 0 ? (
                                    <div className="text-center text-muted-foreground text-xs py-6">
                                      Start by asking a question about the content
                                    </div>
                                  ) : (
                                    <div className="space-y-2">
                                      {aiConversation.map((message, index) => (
                                        <div
                                          key={index}
                                          className={
                                            message.type === 'user' ? 'text-right' : 'text-left'
                                          }
                                        >
                                          <div
                                            className={`inline-block max-w-[90%] p-2 rounded-lg text-xs ${
                                              message.type === 'user'
                                                ? 'bg-youth-primary text-white'
                                                : 'bg-background text-foreground border'
                                            }`}
                                          >
                                            {message.message}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </ScrollArea>
                                <div className="space-y-1.5">
                                  <Textarea
                                    placeholder="Ask a question..."
                                    value={aiQuestion}
                                    onChange={(e) => setAiQuestion(e.target.value)}
                                    disabled={aiHelpMutation.isPending}
                                    className="min-h-[72px] text-sm"
                                    data-testid="ai-question-input"
                                  />
                                  <Button
                                    onClick={askAI}
                                    disabled={!aiQuestion.trim() || aiHelpMutation.isPending}
                                    className="w-full rounded-youth-lg bg-youth-primary hover:opacity-90 text-sm"
                                    data-testid="ask-ai-button"
                                  >
                                    {aiHelpMutation.isPending ? (
                                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    ) : (
                                      <Send className="h-4 w-4 mr-2" />
                                    )}
                                    Ask AI Assistant
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="min-h-[60vh]">
                    {selectedMaterial.content.fileUrl &&
                     (selectedMaterial.content.contentType || '').toLowerCase() === 'pdf' ? (
                      <iframe
                        title={selectedMaterial.content.title}
                        src={selectedMaterial.content.fileUrl}
                        className="w-full min-h-[70vh] border-0"
                      />
                    ) : selectedMaterial.content.extractedText ? (
                      <ScrollArea className="h-[70vh]">
                        <div className="px-6 sm:px-8 py-6 max-w-3xl mx-auto">
                          <p className="text-base leading-relaxed text-stone-700 whitespace-pre-wrap font-[inherit]">
                            {selectedMaterial.content.extractedText}
                          </p>
                          {Array.isArray(selectedMaterial.content.tags) &&
                           selectedMaterial.content.tags.length > 0 && (
                            <div className="mt-8 pt-4 border-t border-stone-200 flex flex-wrap gap-1.5">
                              {selectedMaterial.content.tags.map((tag, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    ) : (
                      <div className="px-6 sm:px-8 py-12 text-center text-muted-foreground">
                        {selectedMaterial.content.fileUrl ? (
                          <>
                            <p className="mb-4">This file cannot be embedded. Open it in a new tab to read.</p>
                            <Button
                              variant="outline"
                              onClick={() => window.open(selectedMaterial.content.fileUrl, '_blank')}
                              data-testid="view-content-button"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Content
                            </Button>
                          </>
                        ) : (
                          <p>No text content available for this material.</p>
                        )}
                      </div>
                    )}
                  </div>
                </section>
              </>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-96">
                  <div className="text-center">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Material</h3>
                    <p className="text-gray-600">
                      Choose a revision material from the list to start studying with AI assistance
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
    </PageLayout>
  );
}