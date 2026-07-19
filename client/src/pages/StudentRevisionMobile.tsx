// client/src/pages/StudentRevisionMobile.tsx
// Mobile-first Student Lesson Viewer & Revision Pack screen.
// Phone-optimized alternative to StudentRevision.tsx, built on the
// components/mobile library (LessonViewer / LessonHeader / SwipeToDismiss).
//
// Data comes from the same REST APIs used by the desktop flow:
//   GET  /api/revision/packs            -> list
//   GET  /api/revision/packs/:id        -> pack + items (questions + scheduling)
//   POST /api/revision/packs/:id/items/:itemId/review  -> spaced-repetition review

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { PageLayout } from "@/components/PageLayout";
import { LessonViewer, type Flashcard, type PracticeQuestion } from "@/components/mobile/LessonViewer";
import { Loader2, Brain } from "lucide-react";

type ReviewDifficulty = "easy" | "medium" | "hard";

interface PackListItem {
  id: number;
  subject: string;
  topic?: string | null;
  title?: string | null;
  itemCount: number;
  offlineReady: boolean;
}
interface PackDetail extends PackListItem {
  items: {
    id: number;
    question: { structuredQuestion?: { question?: string; options?: string[]; answer?: string; explanation?: string } | null } | null;
  }[];
}

function toCards(pack: PackDetail): Flashcard[] {
  return pack.items
    .filter((it) => it.question?.structuredQuestion?.question)
    .map((it, i) => ({
      id: it.id,
      front: it.question!.structuredQuestion!.question!,
      back: it.question!.structuredQuestion!.answer ?? "",
    }));
}
function toPractice(pack: PackDetail): PracticeQuestion[] {
  return pack.items
    .filter((it) => it.question?.structuredQuestion?.question)
    .map((it) => {
      const q = it.question!.structuredQuestion!;
      return { id: it.id, question: q.question!, options: q.options, answer: q.answer ?? "", explanation: q.explanation };
    });
}

export default function StudentRevisionMobile() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [openId, setOpenId] = React.useState<number | null>(null);

  const { data: packs = [], isLoading } = useQuery<PackListItem[]>({
    queryKey: ["/api/revision/packs"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/revision/packs");
      if (!res.ok) throw new Error("Failed to load revision packs");
      return res.json();
    },
  });

  const { data: pack } = useQuery<PackDetail>({
    queryKey: ["/api/revision/packs", openId],
    enabled: openId != null,
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/revision/packs/${openId}`);
      if (!res.ok) throw new Error("Failed to load pack");
      return res.json();
    },
  });

  const reviewMutation = useMutation({
    mutationFn: async ({ itemId, difficulty }: { itemId: number; difficulty: ReviewDifficulty }) => {
      const res = await apiRequest("POST", `/api/revision/packs/${openId}/items/${itemId}/review`, { difficulty });
      if (!res.ok) throw new Error("Failed to record review");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/revision/packs", openId] }),
    onError: () => toast({ title: "No se pudo guardar la revisión", variant: "destructive" }),
  });

  if (openId != null && pack) {
    return (
      <PageLayout maxWidth="6xl">
        <LessonViewer
          title={pack.title || pack.subject}
          subtitle={pack.topic || undefined}
          concepts={[pack.subject, ...(pack.topic ? [pack.topic] : [])]}
          summary={pack.items.map((i) => i.question?.structuredQuestion?.explanation).filter(Boolean).join("\n\n") || undefined}
          flashcards={toCards(pack)}
          practice={toPractice(pack)}
          onReview={(itemId, difficulty) => reviewMutation.mutate({ itemId, difficulty })}
          onQuickRevision={() => toast({ title: "Repaso rápido iniciado" })}
        />
        <button
          onClick={() => setOpenId(null)}
          className="fixed left-4 top-4 z-40 rounded-full bg-background/90 px-3 py-1.5 text-sm shadow"
        >
          ← Paquetes
        </button>
      </PageLayout>
    );
  }

  return (
    <PageLayout maxWidth="6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Mis paquetes de repaso</h1>
        <p className="mt-1 text-sm text-muted-foreground">Estudia tus materiales en cualquier lugar, incluso sin conexión.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : packs.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <Brain className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
          <p className="font-medium">Aún no tienes paquetes de repaso</p>
          <p className="mt-1 text-sm text-muted-foreground">Genera práctica desde el Study Buddy o juega — las preguntas fallidas se guardan aquí.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {packs.map((p) => (
            <button
              key={p.id}
              onClick={() => setOpenId(p.id)}
              className="flex w-full items-center justify-between rounded-xl border border-border bg-card p-4 text-left active:scale-[0.99]"
            >
              <div>
                <p className="font-medium">{p.title || p.subject}</p>
                {p.topic && <p className="text-sm text-muted-foreground">{p.topic}</p>}
              </div>
              <span className="text-sm text-muted-foreground">{p.itemCount} preguntas</span>
            </button>
          ))}
        </div>
      )}
    </PageLayout>
  );
}
