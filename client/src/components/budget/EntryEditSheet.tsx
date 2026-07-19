// client/src/components/budget/EntryEditSheet.tsx
// Bottom-sheet create/edit form for a transaction (ported concept from gider entry-edit-dialog).
import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Currency } from "@/lib/currency-formatter";
import { MoneyInput } from "./MoneyInput";
import { CurrencySelector } from "./CurrencySelector";
import type { BudgetEntryView } from "./EntryRow";

export interface EntryFormState {
  id?: number;
  description: string;
  amount: string;
  currency: Currency;
  type: "income" | "expense";
  date: string;
  paid: boolean;
  categoryId: number;
  // Phase 2 (optional; sent only when available)
  groupId?: number | null;
  tagId?: number | null;
  recurring?: {
    frequency: "week" | "month" | "year";
    interval: number;
    every: number;
    startDate: string;
    endDate?: string | null;
  } | null;
}

interface EntryEditSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: BudgetEntryView | null;
  categories: { id: number; name: string }[];
  onSubmit: (state: EntryFormState) => void;
  isSaving?: boolean;
}

function toFormState(
  initial: BudgetEntryView | null,
  categories: { id: number; name: string }[],
  language: "es" | "en"
): EntryFormState {
  if (initial) {
    return {
      id: initial.id,
      description: initial.description,
      amount: String(initial.amount),
      currency: initial.currency,
      type: initial.type,
      date: new Date(initial.date).toISOString().split("T")[0],
      paid: initial.paid,
      categoryId: 0, // resolved by parent via map
    };
  }
  return {
    description: "",
    amount: "",
    currency: "HNL",
    type: "expense",
    date: new Date().toISOString().split("T")[0],
    paid: true,
    categoryId: categories[0]?.id ?? 0,
  };
}

export function EntryEditSheet({
  open,
  onOpenChange,
  initial,
  categories,
  onSubmit,
  isSaving,
}: EntryEditSheetProps) {
  const { language } = useLanguage();
  const [form, setForm] = React.useState<EntryFormState>(() =>
    toFormState(initial ?? null, categories, language)
  );

  React.useEffect(() => {
    if (open) setForm(toFormState(initial ?? null, categories, language));
  }, [open, initial, categories, language]);

  const set = <K extends keyof EntryFormState>(key: K, value: EntryFormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const canSubmit =
    form.description.trim() !== "" && form.amount !== "" && form.categoryId > 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[90vh] overflow-y-auto rounded-t-2xl pb-[env(safe-area-inset-bottom)]"
      >
        <SheetHeader>
          <SheetTitle>{initial ? "Edit transaction" : "New transaction"}</SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={form.type === "expense" ? "default" : "outline"}
              className="h-11"
              onClick={() => set("type", "expense")}
            >
              Expense
            </Button>
            <Button
              type="button"
              variant={form.type === "income" ? "default" : "outline"}
              className="h-11"
              onClick={() => set("type", "income")}
            >
              Income
            </Button>
          </div>

          <div>
            <Label htmlFor="entry-amount">Amount</Label>
            <MoneyInput
              id="entry-amount"
              value={form.amount}
              onValueChange={(v) => set("amount", v)}
              currency={form.currency}
              className="mt-1"
            />
          </div>

          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Label htmlFor="entry-currency">Currency</Label>
              <CurrencySelector
                id="entry-currency"
                value={form.currency}
                onChange={(c) => set("currency", c)}
                className="mt-1 w-full"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="entry-desc">Description</Label>
            <Input
              id="entry-desc"
              className="mt-1"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder={language === "es" ? "Ej: Almuerzo" : "E.g. Lunch"}
            />
          </div>

          <div>
            <Label htmlFor="entry-category">Category</Label>
            <select
              id="entry-category"
              value={form.categoryId}
              onChange={(e) => set("categoryId", parseInt(e.target.value, 10))}
              className="mt-1 h-11 w-full rounded-lg border border-input bg-background px-3 outline-none focus:ring-2 focus:ring-ring"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
              {categories.length === 0 && <option value={0}>No categories</option>}
            </select>
          </div>

          <div>
            <Label htmlFor="entry-date">Date</Label>
            <Input
              id="entry-date"
              type="date"
              className="mt-1"
              value={form.date}
              onChange={(e) => set("date", e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
            <span className="text-sm font-medium">Paid</span>
            <Switch checked={form.paid} onCheckedChange={(v) => set("paid", v)} />
          </div>
        </div>

        <SheetFooter className="mt-6">
          <Button
            className="h-12 w-full"
            disabled={!canSubmit || isSaving}
            onClick={() => onSubmit(form)}
          >
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initial ? "Save changes" : "Add transaction"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
