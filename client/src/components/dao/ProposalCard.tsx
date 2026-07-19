// client/src/components/dao/ProposalCard.tsx
// Compact proposal summary card used in the mobile-first DAO list.
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Vote, CheckCircle2, XCircle, Clock } from "lucide-react";
import type { DaoProposal, DaoProposalStatus } from "@/hooks/use-dao";
import { VoteBar } from "./VoteBar";

interface ProposalCardProps {
  proposal: DaoProposal;
  language: "es" | "en";
  onOpen: (proposal: DaoProposal) => void;
  isTeacherOrSuperuser?: boolean;
  onClose?: (id: number) => void;
  isClosing?: boolean;
}

const STATUS_META: Record<DaoProposalStatus, { label: { es: string; en: string }; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  draft: { label: { es: "Borrador", en: "Draft" }, variant: "outline" },
  active: { label: { es: "Votación activa", en: "Active voting" }, variant: "default" },
  passed: { label: { es: "Aprobada", en: "Passed" }, variant: "secondary" },
  rejected: { label: { es: "Rechazada", en: "Rejected" }, variant: "destructive" },
  executed: { label: { es: "Ejecutada", en: "Executed" }, variant: "secondary" },
};

function daysLeft(deadline: string): number {
  const ms = new Date(deadline).getTime() - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

export function ProposalCard({ proposal, language, onOpen, isTeacherOrSuperuser, onClose, isClosing }: ProposalCardProps) {
  const meta = STATUS_META[proposal.status];
  const open = proposal.status === "active" && daysLeft(proposal.deadline) >= 0;
  const left = daysLeft(proposal.deadline);

  return (
    <div className="rounded-xl border border-border bg-card p-3 sm:p-4">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <Badge variant={meta.variant}>{meta.label[language]}</Badge>
        <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200">
          {proposal.category}
        </Badge>
        {open && (
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            {left === 0
              ? language === "es" ? "Vence hoy" : "Ends today"
              : language === "es" ? `Faltan ${left} d` : `${left}d left`}
          </span>
        )}
      </div>

      <h3 className="text-base font-semibold text-foreground">{proposal.title}</h3>
      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{proposal.description}</p>

      {proposal.tally && <div className="mt-3"><VoteBar tally={proposal.tally} language={language} /></div>}

      <div className="mt-3 flex gap-2">
        <Button variant="outline" size="sm" className="flex-1" onClick={() => onOpen(proposal)}>
          {language === "es" ? "Ver detalles" : "View details"}
        </Button>
        {open && (
          <Button size="sm" className="flex-1 bg-orange-500 hover:bg-orange-600 text-white" onClick={() => onOpen(proposal)}>
            <Vote className="mr-1 h-4 w-4" />
            {language === "es" ? "Votar" : "Vote"}
          </Button>
        )}
        {isTeacherOrSuperuser && proposal.status === "active" && (
          <Button
            variant="secondary"
            size="sm"
            disabled={isClosing}
            onClick={() => onClose?.(proposal.id)}
          >
            {isClosing ? (language === "es" ? "Cerrando…" : "Closing…") : language === "es" ? "Cerrar" : "Close"}
          </Button>
        )}
      </div>

      {proposal.status === "passed" && (
        <p className="mt-2 inline-flex items-center gap-1 text-xs text-emerald-600">
          <CheckCircle2 className="h-3.5 w-3.5" /> {language === "es" ? "Aprobada por mayoría" : "Passed by majority"}
        </p>
      )}
      {proposal.status === "rejected" && (
        <p className="mt-2 inline-flex items-center gap-1 text-xs text-rose-600">
          <XCircle className="h-3.5 w-3.5" /> {language === "es" ? "Rechazada" : "Rejected"}
        </p>
      )}
    </div>
  );
}
