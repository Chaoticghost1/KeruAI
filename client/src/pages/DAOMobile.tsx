// client/src/pages/DAOMobile.tsx
// Mobile-first DAO governance experience (Aragon OSx-inspired), wired to /api/dao.
import * as React from "react";
import { PageLayout } from "@/components/PageLayout";
import { PageHeader } from "@/components/PageHeader";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/use-auth";
import { useDaoProposals, type DaoProposal, type DaoVoteChoice } from "@/hooks/use-dao";
import { ProposalCard } from "@/components/dao/ProposalCard";
import { ProposalDetailSheet } from "@/components/dao/ProposalDetailSheet";
import { ProposalForm } from "@/components/dao/ProposalForm";
import { DaoFab } from "@/components/dao/DaoFab";
import { Users } from "lucide-react";

export default function DAOMobile() {
  const { language, t } = useLanguage();
  const { user } = useAuth();
  const {
    proposals,
    isLoading,
    createProposal,
    isCreating,
    vote,
    isVoting,
    closeProposal,
    isClosing,
    isOpen,
  } = useDaoProposals();

  const [selected, setSelected] = React.useState<DaoProposal | null>(null);
  const [userVote, setUserVote] = React.useState<DaoVoteChoice | null>(null);
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [formOpen, setFormOpen] = React.useState(false);

  const isTeacherOrSuperuser = user?.role === "teacher" || user?.role === "superuser";

  const openDetail = (proposal: DaoProposal) => {
    setSelected(proposal);
    setUserVote(null);
    setDetailOpen(true);
  };

  const handleVote = async (choice: DaoVoteChoice) => {
    if (!selected) return;
    await vote({ id: selected.id, choice });
    setUserVote(choice);
    const updated = proposals.find((p) => p.id === selected.id);
    if (updated) setSelected(updated);
  };

  const handleCreate = async (data: Parameters<typeof createProposal>[0]) => {
    await createProposal(data);
    setFormOpen(false);
  };

  const activeCount = proposals.filter((p) => isOpen(p)).length;
  const memberCount = proposals.reduce((sum, p) => sum + (p.tally?.total ?? 0), 0);

  return (
    <PageLayout maxWidth="6xl">
      <PageHeader
        title={t.santarita.title}
        subtitle={language === "es" ? "Gobernanza de la comunidad" : "Community governance"}
      />

      <div className="mb-4 flex items-center gap-4 rounded-xl border border-border bg-card p-3">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span className="font-semibold text-orange-600">{activeCount}</span>
          {language === "es" ? "activas" : "active"}
        </div>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span className="font-semibold text-orange-600">{memberCount}</span>
          {language === "es" ? "votos" : "votes"}
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">{language === "es" ? "Cargando…" : "Loading…"}</p>
      ) : proposals.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          {language === "es" ? "Aún no hay propuestas. Crea la primera." : "No proposals yet. Create the first one."}
        </div>
      ) : (
        <div className="space-y-3">
          {proposals.map((proposal) => (
            <ProposalCard
              key={proposal.id}
              proposal={proposal}
              language={language}
              onOpen={openDetail}
              isTeacherOrSuperuser={isTeacherOrSuperuser}
              onClose={closeProposal}
              isClosing={isClosing}
            />
          ))}
        </div>
      )}

      <DaoFab onClick={() => setFormOpen(true)} label={language === "es" ? "Nueva propuesta" : "New proposal"} />

      <ProposalDetailSheet
        proposal={selected}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        language={language}
        userVote={userVote}
        canVote={!!selected && isOpen(selected)}
        onVote={handleVote}
        isVoting={isVoting}
      />

      <ProposalForm
        open={formOpen}
        onOpenChange={setFormOpen}
        language={language}
        onSubmit={handleCreate}
        isSubmitting={isCreating}
      />
    </PageLayout>
  );
}
