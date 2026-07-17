import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Brain, ChevronLeft, Download, CheckCircle2, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { saveRevisionPackOffline } from '@/lib/offline-storage';

type ReviewDifficulty = 'easy' | 'medium' | 'hard';

interface StructuredQuestion {
  question?: string;
  options?: string[];
  answer?: string;
  explanation?: string;
}

interface PackItem {
  id: number;
  packId: number;
  type: string;
  schedulingInfo?: { nextReviewAt?: string; difficulty?: string } | null;
  question: {
    id: number;
    subject: string;
    topic?: string | null;
    structuredQuestion?: StructuredQuestion | null;
  } | null;
}

interface RevisionPack {
  id: number;
  subject: string;
  topic?: string | null;
  title?: string | null;
  itemCount: number;
  offlineReady: boolean;
  createdAt: string;
}

interface RevisionPackDetail extends RevisionPack {
  items: PackItem[];
}

export function RevisionPacks() {
  const [openPackId, setOpenPackId] = useState<number | null>(null);

  const { data: packs = [], isLoading } = useQuery<RevisionPack[]>({
    queryKey: ['/api/revision/packs'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/revision/packs');
      if (!res.ok) throw new Error('Failed to load revision packs');
      return res.json();
    },
  });

  const packsBySubject = useMemo(() => {
    const grouped: Record<string, RevisionPack[]> = {};
    for (const pack of packs) {
      const key = pack.subject || 'general';
      (grouped[key] ??= []).push(pack);
    }
    return grouped;
  }, [packs]);

  if (openPackId != null) {
    return <PackStudy packId={openPackId} onBack={() => setOpenPackId(null)} />;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (packs.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Brain className="h-10 w-10 text-muted-foreground mb-3" />
          <h3 className="text-lg font-medium">No practice packs yet</h3>
          <p className="text-sm text-muted-foreground max-w-sm mt-1">
            Generate practice from the Study Buddy, or play a game — missed questions
            automatically become revision packs here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(packsBySubject).map(([subject, subjectPacks]) => (
        <div key={subject}>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2">
            {subject}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {subjectPacks.map((pack) => (
              <Card
                key={pack.id}
                className="cursor-pointer transition-colors hover:bg-muted/40"
                onClick={() => setOpenPackId(pack.id)}
                data-testid={`revision-pack-${pack.id}`}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-base truncate">{pack.title || pack.subject}</CardTitle>
                  {pack.topic && <CardDescription className="truncate">{pack.topic}</CardDescription>}
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <Badge variant="secondary">{pack.itemCount} questions</Badge>
                  {pack.offlineReady && (
                    <Badge variant="outline" className="gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Offline
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function PackStudy({ packId, onBack }: { packId: number; onBack: () => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const { data: pack, isLoading } = useQuery<RevisionPackDetail>({
    queryKey: ['/api/revision/packs', packId],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/revision/packs/${packId}`);
      if (!res.ok) throw new Error('Failed to load pack');
      return res.json();
    },
  });

  const reviewMutation = useMutation({
    mutationFn: async ({ itemId, difficulty }: { itemId: number; difficulty: ReviewDifficulty }) => {
      const res = await apiRequest('POST', `/api/revision/packs/${packId}/items/${itemId}/review`, {
        difficulty,
      });
      if (!res.ok) throw new Error('Failed to record review');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/revision/packs', packId] });
    },
  });

  const offlineMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', `/api/revision/packs/${packId}/offline`, {});
      if (!res.ok) throw new Error('Failed to mark offline');
      return res.json();
    },
    onSuccess: async () => {
      if (pack) await saveRevisionPackOffline(pack);
      queryClient.invalidateQueries({ queryKey: ['/api/revision/packs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/revision/packs', packId] });
      toast({ title: 'Saved for offline study' });
    },
    onError: () => toast({ title: 'Could not save offline', variant: 'destructive' }),
  });

  if (isLoading || !pack) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const items = pack.items ?? [];
  const item = items[index];
  const q = item?.question?.structuredQuestion ?? null;

  const rate = (difficulty: ReviewDifficulty) => {
    if (!item) return;
    reviewMutation.mutate({ itemId: item.id, difficulty });
    setRevealed(false);
    setIndex((i) => Math.min(i + 1, items.length));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack} data-testid="pack-back">
          <ChevronLeft className="h-4 w-4 mr-1" /> Back to packs
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => offlineMutation.mutate()}
          disabled={offlineMutation.isPending || pack.offlineReady}
          data-testid="pack-offline"
        >
          {offlineMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
          ) : (
            <Download className="h-4 w-4 mr-1.5" />
          )}
          {pack.offlineReady ? 'Available offline' : 'Download for offline study'}
        </Button>
      </div>

      <div>
        <h2 className="text-xl font-bold">{pack.title || pack.subject}</h2>
        <p className="text-sm text-muted-foreground">
          {pack.subject}
          {pack.topic ? ` • ${pack.topic}` : ''}
        </p>
      </div>

      {index >= items.length ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <CheckCircle2 className="h-10 w-10 text-green-600 mb-3" />
            <h3 className="text-lg font-medium">Session complete!</h3>
            <p className="text-sm text-muted-foreground mt-1">
              You reviewed all {items.length} questions.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => { setIndex(0); setRevealed(false); }}
            >
              <RefreshCw className="h-4 w-4 mr-1.5" /> Study again
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription>
                Card {index + 1} of {items.length}
              </CardDescription>
              {item?.schedulingInfo?.difficulty && (
                <Badge variant="outline" className="capitalize">
                  {item.schedulingInfo.difficulty}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-base font-medium" data-testid="flashcard-question">
              {q?.question ?? 'No question text'}
            </p>

            {Array.isArray(q?.options) && q.options.length > 0 && (
              <ul className="space-y-1.5">
                {q.options.map((opt, i) => (
                  <li key={i} className="rounded-md border px-3 py-2 text-sm">
                    {opt}
                  </li>
                ))}
              </ul>
            )}

            {!revealed ? (
              <Button
                className="w-full"
                onClick={() => setRevealed(true)}
                data-testid="reveal-answer"
              >
                Reveal answer
              </Button>
            ) : (
              <ScrollArea className="max-h-56">
                <div className="rounded-md bg-muted/50 p-3 space-y-2">
                  <p className="text-sm font-semibold">Answer</p>
                  <p className="text-sm" data-testid="flashcard-answer">
                    {q?.answer ?? '—'}
                  </p>
                  {q?.explanation && (
                    <p className="text-sm text-muted-foreground">{q.explanation}</p>
                  )}
                </div>
              </ScrollArea>
            )}

            {revealed && (
              <div className="grid grid-cols-3 gap-2 pt-2">
                <Button
                  variant="outline"
                  className="border-red-300 text-red-700 hover:bg-red-50"
                  onClick={() => rate('hard')}
                  disabled={reviewMutation.isPending}
                  data-testid="rate-hard"
                >
                  Hard
                </Button>
                <Button
                  variant="outline"
                  className="border-amber-300 text-amber-700 hover:bg-amber-50"
                  onClick={() => rate('medium')}
                  disabled={reviewMutation.isPending}
                  data-testid="rate-medium"
                >
                  Medium
                </Button>
                <Button
                  variant="outline"
                  className="border-green-300 text-green-700 hover:bg-green-50"
                  onClick={() => rate('easy')}
                  disabled={reviewMutation.isPending}
                  data-testid="rate-easy"
                >
                  Easy
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
