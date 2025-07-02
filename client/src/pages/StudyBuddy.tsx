import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { apiRequest } from '@/lib/queryClient';

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
  const queryClient = useQueryClient();
  const [selectedAgent, setSelectedAgent] = useState<TutorAgent | null>(null);
  const [currentSession, setCurrentSession] = useState<TutorSession | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [difficultyLevel, setDifficultyLevel] = useState(2);

  // Mock user ID for demo - in real app this would come from auth
  const userId = 1;

  // Fetch available tutor agents
  const { data: agents = [], isLoading: agentsLoading } = useQuery<TutorAgent[]>({
    queryKey: ['tutors'],
    queryFn: () => apiRequest('/api/tutors'),
    enabled: true
  });

  // Fetch session messages
  const { data: messages = [], isLoading: messagesLoading } = useQuery<TutorMessage[]>({
    queryKey: ['sessionMessages', currentSession?.id],
    queryFn: () => apiRequest(`/api/tutors/sessions/${currentSession?.id}/messages`),
    enabled: !!currentSession?.id
  });

  // Create new tutor session
  const createSessionMutation = useMutation({
    mutationFn: async (sessionData: any) => {
      return apiRequest('/api/tutors/sessions', {
        method: 'POST',
        body: JSON.stringify(sessionData)
      });
    },
    onSuccess: (session) => {
      setCurrentSession(session);
      queryClient.invalidateQueries({ queryKey: ['tutorSessions'] });
    }
  });

  // Send message
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: any) => {
      return apiRequest('/api/tutors/messages', {
        method: 'POST',
        body: JSON.stringify(messageData)
      });
    },
    onSuccess: () => {
      setMessageInput('');
      queryClient.invalidateQueries({ 
        queryKey: ['sessionMessages', currentSession?.id] 
      });
    }
  });

  // End session
  const endSessionMutation = useMutation({
    mutationFn: async (sessionId: number) => {
      return apiRequest(`/api/tutors/sessions/${sessionId}/end`, {
        method: 'PATCH'
      });
    },
    onSuccess: () => {
      setCurrentSession(null);
      setSelectedAgent(null);
      queryClient.invalidateQueries({ queryKey: ['tutorSessions'] });
    }
  });

  const startSession = () => {
    if (!selectedAgent || !selectedSubject) return;

    createSessionMutation.mutate({
      userId,
      agentId: selectedAgent.id,
      subject: selectedSubject,
      topic: topic || null,
      difficultyLevel,
      isActive: true
    });
  };

  const sendMessage = () => {
    if (!messageInput.trim() || !currentSession) return;

    sendMessageMutation.mutate({
      sessionId: currentSession.id,
      sender: 'student',
      message: messageInput.trim(),
      messageType: 'text'
    });
  };

  const endSession = () => {
    if (!currentSession) return;
    endSessionMutation.mutate(currentSession.id);
  };

  if (agentsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-slate-600">
              {t.language === 'es' ? 'Cargando tutores...' : 'Loading tutors...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            {t.studybuddy.title}
          </h1>
          <p className="text-xl text-slate-600">
            {t.studybuddy.description}
          </p>
        </div>

        {!currentSession ? (
          // Agent Selection View
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  {t.language === 'es' ? 'Elige tu Tutor IA' : 'Choose Your AI Tutor'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  {agents.map((agent: TutorAgent) => (
                    <Card 
                      key={agent.id}
                      className={`cursor-pointer transition-all hover:shadow-lg ${
                        selectedAgent?.id === agent.id 
                          ? 'ring-2 ring-blue-500 bg-blue-50' 
                          : 'hover:bg-slate-50'
                      }`}
                      onClick={() => setSelectedAgent(agent)}
                    >
                      <CardContent className="p-4">
                        <div className="text-center">
                          <div className="text-3xl mb-2">{agent.avatar}</div>
                          <h3 className="font-semibold text-lg">{agent.name}</h3>
                          <p className="text-sm text-slate-600 mb-3">{agent.title}</p>
                          <div className="flex flex-wrap gap-1 justify-center mb-3">
                            {agent.subjects.map((subject: string) => (
                              <Badge key={subject} variant="secondary" className="text-xs">
                                {subject}
                              </Badge>
                            ))}
                          </div>
                          <p className="text-xs text-slate-500">{agent.description}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {selectedAgent && (
                  <div className="space-y-4 p-4 bg-white rounded-lg border">
                    <h3 className="font-semibold">
                      {t.language === 'es' ? 'Configurar Sesión' : 'Session Setup'}
                    </h3>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          {t.language === 'es' ? 'Materia' : 'Subject'}
                        </label>
                        <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                          <SelectTrigger>
                            <SelectValue placeholder={
                              t.language === 'es' ? 'Selecciona una materia' : 'Select a subject'
                            } />
                          </SelectTrigger>
                          <SelectContent>
                            {selectedAgent.subjects.map((subject: string) => (
                              <SelectItem key={subject} value={subject}>
                                {subject}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          {t.language === 'es' ? 'Nivel de Dificultad' : 'Difficulty Level'}
                        </label>
                        <Select 
                          value={difficultyLevel.toString()} 
                          onValueChange={(value) => setDifficultyLevel(parseInt(value))}
                        >
                          <SelectTrigger>
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

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {t.language === 'es' ? 'Tema Específico (Opcional)' : 'Specific Topic (Optional)'}
                      </label>
                      <Input
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder={
                          t.language === 'es' 
                            ? 'ej. ecuaciones cuadráticas, biología celular' 
                            : 'e.g. quadratic equations, cell biology'
                        }
                      />
                    </div>

                    <Button 
                      onClick={startSession}
                      disabled={!selectedSubject || createSessionMutation.isPending}
                      className="w-full"
                    >
                      {createSessionMutation.isPending
                        ? (t.language === 'es' ? 'Iniciando...' : 'Starting...')
                        : (t.language === 'es' ? 'Comenzar Sesión de Tutoría' : 'Start Tutoring Session')
                      }
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          // Active Session View
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Session Info */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {t.language === 'es' ? 'Sesión Activa' : 'Active Session'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl mb-2">{selectedAgent?.avatar}</div>
                    <h3 className="font-semibold">{selectedAgent?.name}</h3>
                    <p className="text-sm text-slate-600">{selectedAgent?.title}</p>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">
                        {t.language === 'es' ? 'Materia:' : 'Subject:'}
                      </span>
                      <p className="text-slate-600">{currentSession.subject}</p>
                    </div>
                    {currentSession.topic && (
                      <div>
                        <span className="font-medium">
                          {t.language === 'es' ? 'Tema:' : 'Topic:'}
                        </span>
                        <p className="text-slate-600">{currentSession.topic}</p>
                      </div>
                    )}
                    <div>
                      <span className="font-medium">
                        {t.language === 'es' ? 'Nivel:' : 'Level:'}
                      </span>
                      <p className="text-slate-600">
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
                    className="w-full"
                  >
                    {t.language === 'es' ? 'Finalizar Sesión' : 'End Session'}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Chat Interface */}
            <div className="lg:col-span-3">
              <Card className="h-[600px] flex flex-col">
                <CardHeader>
                  <CardTitle>
                    {t.language === 'es' ? 'Chat con tu Tutor' : 'Chat with your Tutor'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col p-0">
                  {/* Messages */}
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {messages.map((message: TutorMessage) => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.sender === 'student' ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <div
                            className={`max-w-[80%] p-3 rounded-lg ${
                              message.sender === 'student'
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-100 text-slate-900'
                            }`}
                          >
                            <p className="whitespace-pre-wrap">{message.message}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))}
                      {sendMessageMutation.isPending && (
                        <div className="flex justify-start">
                          <div className="bg-slate-100 p-3 rounded-lg">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>

                  {/* Message Input */}
                  <div className="p-4 border-t">
                    <div className="flex space-x-2">
                      <Textarea
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        placeholder={
                          t.language === 'es' 
                            ? 'Escribe tu pregunta aquí...' 
                            : 'Type your question here...'
                        }
                        className="flex-1 min-h-[40px] max-h-[120px]"
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
                      >
                        {t.language === 'es' ? 'Enviar' : 'Send'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}