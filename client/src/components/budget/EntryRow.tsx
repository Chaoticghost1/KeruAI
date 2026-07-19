// client/src/components/budget/EntryRow.tsx
// Ported/adapted from needim/gider.im-pwa (entry-row.tsx).
// Mobile-first transaction row: 44px tap targets, paid toggle, amount +/-, recurring badge, tag chip.
import * as React from "react";
import { motion } from "framer-motion";
import { Repeat } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency, type Currency } from "@/lib/currency-formatter";
import { useLanguage } from "@/contexts/LanguageContext";
import { Tag } from "./Tag";

export interface BudgetEntryView {
  id: number;
  description: string;
  amount: number; // positive magnitude
  currency: Currency;
  type: "income" | "expense";
  date: string;
  paid: boolean;
  categoryName?: string;
  groupName?: string;
  tagName?: string;
  tagColor?: string;
  recurring?: boolean;
  recurringIndex?: number | null;
  recurringTotal?: number | null;
}

interface EntryRowProps {
  entry: BudgetEntryView;
  onOpen: (entry: BudgetEntryView) => void;
  onTogglePaid: (entry: BudgetEntryView) => void;
}

function formatDateShort(date: string, language: "es" | "en") {
  const d = new Date(date);
  return d.toLocaleDateString(language === "es" ? "es-HN" : "en-US", { day: "numeric", month: "short" });
}

export function EntryRow({ entry, onOpen, onTogglePaid }: EntryRowProps) {
  const { language } = useLanguage();
  const isExpense = entry.type === "expense";

  return (
    <motion.div
      className={cn(
        "flex items-center border-b border-border",
        !entry.paid && "opacity-70"
      )}
    >
      <button
        type="button"
        aria-label={entry.paid ? "Mark as unpaid" : "Mark as paid"}
        onClick={(e) => {
          e.stopPropagation();
          onTogglePaid(entry);
        }}
        className="flex h-14 w-14 shrink-0 items-center justify-center border-r border-border"
      >
        <span
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded border-2",
            entry.paid
              ? "border-emerald-500 bg-emerald-500 text-white"
              : "border-muted-foreground bg-transparent"
          )}
        >
          {entry.paid && "✓"}
        </span>
      </button>

      <button
        type="button"
        onClick={() => onOpen(entry)}
        className="flex min-h-[56px] flex-1 items-center justify-between gap-3 px-3 py-2 text-left"
      >
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-medium">
            {entry.groupName && <span className="text-muted-foreground">{entry.groupName} </span>}
            {entry.description}
          </span>
          <span className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
            <span>{formatDateShort(entry.date, language)}</span>
            {entry.categoryName && <span>· {entry.categoryName}</span>}
            {entry.tagName && <Tag name={entry.tagName} color={entry.tagColor} />}
          </span>
        </div>

        <div className="flex flex-col items-end">
          <span
            className={cn(
              "font-semibold tabular-nums",
              isExpense ? "text-rose-600" : "text-emerald-600"
            )}
          >
            {isExpense ? "−" : "+"}
            {formatCurrency(entry.amount, entry.currency, language)}
          </span>
          {entry.recurring && (
            <span className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
              <Repeat className="h-3 w-3" />
              {entry.recurringIndex != null && entry.recurringTotal
                ? `${entry.recurringIndex}/${entry.recurringTotal}`
                : ""}
            </span>
          )}
        </div>
      </button>
    </motion.div>
  );
}
