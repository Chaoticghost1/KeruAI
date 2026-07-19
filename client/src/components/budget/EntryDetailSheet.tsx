// client/src/components/budget/EntryDetailSheet.tsx
// Bottom-sheet detail view for a transaction (ported concept from gider entry-detail-drawer).
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
import { Pencil, Trash2 } from "lucide-react";
import { formatCurrency, type Currency } from "@/lib/currency-formatter";
import { useLanguage } from "@/contexts/LanguageContext";
import type { BudgetEntryView } from "./EntryRow";
import { Tag } from "./Tag";

interface EntryDetailSheetProps {
  entry: BudgetEntryView | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (entry: BudgetEntryView) => void;
  onDelete: (entry: BudgetEntryView) => void;
}

export function EntryDetailSheet({
  entry,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: EntryDetailSheetProps) {
  const { language } = useLanguage();
  if (!entry) return null;
  const isExpense = entry.type === "expense";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-2xl pb-[env(safe-area-inset-bottom)]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <span className={isExpense ? "text-rose-600" : "text-emerald-600"}>
              {isExpense ? "−" : "+"}
              {formatCurrency(entry.amount, entry.currency as Currency, language)}
            </span>
            {!entry.paid && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                Unpaid
              </span>
            )}
          </SheetTitle>
          <SheetDescription>{entry.description}</SheetDescription>
        </SheetHeader>

        <dl className="mt-4 space-y-2 text-sm">
          <Row label="Category" value={entry.categoryName} />
          {entry.groupName && <Row label="Group" value={entry.groupName} />}
          <Row label="Date" value={new Date(entry.date).toLocaleDateString(language === "es" ? "es-HN" : "en-US")} />
          <Row label="Currency" value={entry.currency} />
          {entry.tagName && (
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Tag</dt>
              <dd>
                <Tag name={entry.tagName} color={entry.tagColor} />
              </dd>
            </div>
          )}
        </dl>

        <SheetFooter className="mt-6 flex-row gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onEdit(entry)}
          >
            <Pencil className="mr-2 h-4 w-4" /> Edit
          </Button>
          <Button
            variant="destructive"
            className="flex-1"
            onClick={() => onDelete(entry)}
          >
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value || "—"}</dd>
    </div>
  );
}
