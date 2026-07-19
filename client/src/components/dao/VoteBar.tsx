// client/src/components/dao/VoteBar.tsx
// Animated tally bar for a proposal (for / against / abstain), Aragon-style transparency.
import * as React from "react";
import { motion } from "framer-motion";
import type { DaoProposalTally } from "@/hooks/use-dao";

interface VoteBarProps {
  tally: DaoProposalTally;
  language?: "es" | "en";
}

export function VoteBar({ tally, language = "es" }: VoteBarProps) {
  const total = tally.total || 1;
  const forPct = (tally.for / total) * 100;
  const againstPct = (tally.against / total) * 100;
  const abstainPct = (tally.abstain / total) * 100;

  return (
    <div className="space-y-2">
      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
        <motion.div
          className="h-full bg-emerald-500"
          initial={{ width: 0 }}
          animate={{ width: `${forPct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
        <motion.div
          className="h-full bg-rose-500"
          initial={{ width: 0 }}
          animate={{ width: `${againstPct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
        <motion.div
          className="h-full bg-slate-400"
          initial={{ width: 0 }}
          animate={{ width: `${abstainPct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      <div className="grid grid-cols-3 gap-2 text-xs">
        <Stat label={language === "es" ? "A favor" : "For"} value={tally.for} tone="text-emerald-600" />
        <Stat label={language === "es" ? "En contra" : "Against"} value={tally.against} tone="text-rose-600" />
        <Stat label={language === "es" ? "Abstención" : "Abstain"} value={tally.abstain} tone="text-slate-500" />
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="text-center">
      <div className={`font-semibold ${tone}`}>{value}</div>
      <div className="text-muted-foreground">{label}</div>
    </div>
  );
}
