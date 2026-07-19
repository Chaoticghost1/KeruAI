// client/src/components/dao/ProposalDetailSheet.tsx
// Bottom-sheet "DAO modal": proposal details + one-user-one-vote (Aragon-inspired).
import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, MinusCircle } from "lucide-react";
import type { DaoProposal, DaoVoteChoice, DaoProposalTally } from "@/hooks/use-dao";
import { VoteBar } from "./VoteBar";

interface ProposalDetailSheetProps {
  proposal: DaoProposal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  language: "es" | "en";
  userVote: DaoVoteChoice | null;
  canVote: boolean;
  onVote: (choice: DaoVoteChoice) => void;
  isVoting?: boolean;
}

const VOTE_OPTIONS: { choice: DaoVoteChoice; label: { es: string; en: string }; icon: React.ReactNode; tone: string }[] = [
  { choice: "for", label: { es: "A favor", en: "For" }, icon: <ThumbsUp className="h-4 w-4" />, tone: "bg-emerald-500 hover:bg-emerald-600" },
  { choice: "against", label: { es: "En contra", en: "Against" }, icon: <ThumbsDown className="h-4 w-4" />, tone: "bg-rose-500 hover:bg-rose-600" },
  { choice: "abstain", label: { es: "Abstención", en: "Abstain" }, icon: <MinusCircle className="h-4 w-4" />, tone: "bg-slate-500 hover:bg-slate-600" },
];

export function ProposalDetailSheet({
  proposal,
  open,
  onOpenChange,
  language,
  userVote,
  canVote,
  onVote,
  isVoting,
}: ProposalDetailSheetProps) {
  if (!proposal) return null;
  const tally: DaoProposalTally =
    proposal.tally ?? { for: 0, against: 0, abstain: 0, total: 0 };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[88vh] overflow-y-auto rounded-t-2xl pb-[env(safe-area-inset-bottom)]"
      >
        <SheetHeader>
          <SheetTitle className="text-left">{proposal.title}</SheetTitle>
          <SheetDescription className="text-left">
            {proposal.category} • {language === "es" ? "Vence" : "Deadline"}:{" "}
            {new Date(proposal.deadline).toLocaleDateString(language === "es" ? "es-HN" : "en-US")}
          </SheetDescription>
        </SheetHeader>

        <p className="mt-4 whitespace-pre-line text-sm text-foreground">{proposal.description}</p>

        <div className="mt-4">
          <VoteBar tally={tally} language={language} />
        </div>

        {canVote ? (
          <div className="mt-5 space-y-2">
            <p className="text-sm font-medium text-foreground">
              {language === "es" ? "Tu voto (uno por persona)" : "Your vote (one per person)"}
            </p>
            <div className="grid grid-cols-3 gap-2">
              {VOTE_OPTIONS.map((opt) => {
                const active = userVote === opt.choice;
                return (
                  <Button
                    key={opt.choice}
                    disabled={isVoting}
                    onClick={() => onVote(opt.choice)}
                    className={`flex-col gap-1 text-white ${opt.tone} ${active ? "ring-2 ring-offset-2 ring-orange-400" : ""}`}
                  >
                    {opt.icon}
                    <span className="text-xs">{opt.label[language]}</span>
                  </Button>
                );
              })}
            </div>
            {userVote && (
              <p className="text-xs text-muted-foreground">
                {language === "es" ? "Ya votaste. Puedes cambiar tu voto hasta cerrar la votación." : "You have voted. You may change your vote until voting closes."}
              </p>
            )}
          </div>
        ) : (
          <p className="mt-5 rounded-lg bg-muted p-3 text-sm text-muted-foreground">
            {proposal.status !== "active"
              ? language === "es" ? "La votación está cerrada." : "Voting is closed."
              : language === "es" ? "La votación ha finalizado." : "Voting has ended."}
          </p>
        )}

        <SheetFooter className="mt-6">
          <Button variant="outline" className="w-full" onClick={() => onOpenChange(false)}>
            {language === "es" ? "Cerrar" : "Close"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
