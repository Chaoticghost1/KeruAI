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
import { Loader2, BookOpen, FileText, Image, Brain, Send, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RevisionMaterial {
  assignmentId: number;
  contentId: number;
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
  const queryClient = useQueryClient();
  const [selectedMaterial, setSelectedMaterial] = useState<RevisionMaterial | null>(null);
  const [currentSession, setCurrentSession] = useState<string | null>(null);
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiConversation, setAiConversation] = useState<Array<{
    type: 'user' | 'ai';
    message: string;
    timestamp: string;
  }>>([]);

  // Fetch revision materials
  const { data: materials = [], isLoading: materialsLoading, error: materialsError } = useQuery<RevisionMaterial[]>({
    queryKey: ['revision-materials'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/revision/materials');
      if (!response.ok) {
        throw new Error('Failed to fetch revision materials');
      }
      return response.json();
    },
    enabled: !!user
  });

  // Start revision session mutation
  const startSessionMutation = useMutation({
    mutationFn: async ({ contentId, subject, topic }: { contentId: number; subject: string; topic?: string }) => {
      const response = await apiRequest('POST', '/api/revision/session/start', {
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
      const response = await apiRequest('POST', '/api/revision/ai-help', {
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

  if (materialsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading revision materials...</span>
      </div>
    );
  }

  if (materialsError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Error Loading Materials</h2>
          <p className="text-gray-600">Failed to load your revision materials. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Revision Materials</h1>
          <p className="mt-2 text-lg text-gray-600">
            Study your assigned materials with AI assistance
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Materials List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Your Materials</CardTitle>
                <CardDescription>
                  {materials.length} revision materials available
                </CardDescription>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          </div>

          {/* Content Viewer & AI Assistant */}
          <div className="lg:col-span-2">
            {selectedMaterial ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Content Viewer */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      {getContentIcon(selectedMaterial.content.contentType)}
                      <span>{selectedMaterial.content.title}</span>
                    </CardTitle>
                    <CardDescription>
                      {selectedMaterial.content.subject} • {selectedMaterial.content.contentType.toUpperCase()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedMaterial.content.description && (
                        <div>
                          <h4 className="font-semibold text-sm text-gray-700 mb-2">Description</h4>
                          <p className="text-sm text-gray-600">{selectedMaterial.content.description}</p>
                        </div>
                      )}
                      
                      {selectedMaterial.content.fileUrl && (
                        <div>
                          <h4 className="font-semibold text-sm text-gray-700 mb-2">File</h4>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.open(selectedMaterial.content.fileUrl, '_blank')}
                            data-testid="view-content-button"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Content
                          </Button>
                        </div>
                      )}
                      
                      {selectedMaterial.content.extractedText && (
                        <div>
                          <h4 className="font-semibold text-sm text-gray-700 mb-2">Content Preview</h4>
                          <ScrollArea className="h-32 bg-gray-50 p-3 rounded">
                            <p className="text-xs text-gray-600">
                              {selectedMaterial.content.extractedText.substring(0, 300)}
                              {selectedMaterial.content.extractedText.length > 300 && '...'}
                            </p>
                          </ScrollArea>
                        </div>
                      )}
                      
                      {selectedMaterial.content.tags.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-sm text-gray-700 mb-2">Tags</h4>
                          <div className="flex flex-wrap gap-1">
                            {selectedMaterial.content.tags.map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* AI Assistant */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Brain className="h-5 w-5" />
                      <span>AI Study Assistant</span>
                    </CardTitle>
                    <CardDescription>
                      Ask questions about the content to enhance your understanding
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Conversation History */}
                      <ScrollArea className="h-64 bg-gray-50 p-3 rounded">
                        {aiConversation.length === 0 ? (
                          <div className="text-center text-gray-500 text-sm">
                            Start by asking a question about the content
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {aiConversation.map((message, index) => (
                              <div key={index} className={`${
                                message.type === 'user' ? 'text-right' : 'text-left'
                              }`}>
                                <div className={`inline-block max-w-[80%] p-2 rounded text-sm ${
                                  message.type === 'user' 
                                    ? 'bg-blue-500 text-white' 
                                    : 'bg-white text-gray-800 border'
                                }`}>
                                  {message.message}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </ScrollArea>

                      {/* Question Input */}
                      <div className="space-y-2">
                        <Textarea
                          placeholder="Ask a question about the content..."
                          value={aiQuestion}
                          onChange={(e) => setAiQuestion(e.target.value)}
                          disabled={aiHelpMutation.isPending}
                          data-testid="ai-question-input"
                        />
                        <Button 
                          onClick={askAI}
                          disabled={!aiQuestion.trim() || aiHelpMutation.isPending}
                          className="w-full"
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
      </div>
    </div>
  );
}