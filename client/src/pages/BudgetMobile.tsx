// client/src/pages/BudgetMobile.tsx
// Mobile-first budget experience (ported UI patterns from needim/gider.im-pwa),
// wired to our existing /api/budget/* backend.
import * as React from "react";
import { PageLayout } from "@/components/PageLayout";
import { PageHeader } from "@/components/PageHeader";
import { useLanguage } from "@/contexts/LanguageContext";
import { useKeyboardSafeView } from "@/components/mobile/useKeyboardSafeView";
import { useDynamicLayout } from "@/components/mobile/useDynamicLayout";
import {
  useBudgetCategories,
  useBudgetTransactions,
  useBudgetAnalytics,
  useBudgetInsights,
  useBudgetGamification,
  type BudgetTransaction,
} from "@/hooks/use-budget";
import { formatCurrency, toHNL, type Currency } from "@/lib/currency-formatter";
import { EntryRow, type BudgetEntryView } from "@/components/budget/EntryRow";
import { EntryDetailSheet } from "@/components/budget/EntryDetailSheet";
import { EntryEditSheet, type EntryFormState } from "@/components/budget/EntryEditSheet";
import { BudgetFab } from "@/components/budget/BudgetFab";
import { BudgetChart } from "@/components/budget/BudgetChart";
import { MobileToast } from "@/components/mobile/MobileToast";

function txToView(tx: BudgetTransaction, categoryName?: string): BudgetEntryView {
  const amount = Math.abs(parseFloat(tx.amount));
  const isExpense = (tx.type ?? (parseFloat(tx.amount) < 0 ? "expense" : "income")) === "expense";
  return {
    id: tx.id,
    description: tx.description,
    amount,
    currency: (tx.currency ?? "HNL") as BudgetEntryView["currency"],
    type: isExpense ? "expense" : "income",
    date: tx.date,
    paid: tx.paid ?? true,
    categoryName,
  };
}

export default function BudgetMobile() {
  const { language, t } = useLanguage();
  const safe = useKeyboardSafeView();
  const layout = useDynamicLayout();

  const {
    categories,
    isLoading: catsLoading,
    createCategory,
  } = useBudgetCategories();
  const {
    transactions,
    isLoading: txLoading,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    isCreating,
    isDeleting,
  } = useBudgetTransactions();

  const { analytics } = useBudgetAnalytics();
  const { insights } = useBudgetInsights();
  const { gamification } = useBudgetGamification();

  const [detail, setDetail] = React.useState<BudgetEntryView | null>(null);
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [editInitial, setEditInitial] = React.useState<BudgetEntryView | null>(null);
  const [toast, setToast] = React.useState<{ message: string; tone: "success" | "error" } | null>(null);

  const categoryName = React.useCallback(
    (id: number) => categories.find((c) => c.id === id)?.name,
    [categories]
  );

  const views: BudgetEntryView[] = React.useMemo(
    () =>
      [...transactions]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .map((tx) => txToView(tx, categoryName(tx.categoryId))),
    [transactions, categoryName]
  );

  const totals = React.useMemo(() => {
    let income = 0;
    let expenseHnl = 0;
    for (const tx of transactions) {
      const amt = parseFloat(tx.amount);
      const cur = ((tx as any).currency ?? "HNL") as Currency;
      if (amt >= 0) income += toHNL(amt, cur);
      else expenseHnl += toHNL(Math.abs(amt), cur);
    }
    return { income, expense: expenseHnl, remaining: income - expenseHnl };
  }, [transactions]);

  const openDetail = (entry: BudgetEntryView) => {
    setDetail(entry);
    setDetailOpen(true);
  };

  const openEdit = (entry: BudgetEntryView | null) => {
    setEditInitial(entry);
    setDetailOpen(false);
    setEditOpen(true);
  };

  const handleTogglePaid = async (entry: BudgetEntryView) => {
    try {
      await updateTransaction({ id: entry.id, paid: !entry.paid } as any);
      setToast({ message: "Updated", tone: "success" });
    } catch {
      setToast({ message: "Update failed", tone: "error" });
    }
  };

  const handleDelete = async (entry: BudgetEntryView) => {
    try {
      await deleteTransaction(entry.id);
      setDetailOpen(false);
      setToast({ message: "Deleted", tone: "success" });
    } catch {
      setToast({ message: "Delete failed", tone: "error" });
    }
  };

  const handleSubmit = async (form: EntryFormState) => {
    try {
      if (form.id) {
        await updateTransaction({
          id: form.id,
          description: form.description,
          amount: form.type === "expense" ? -Math.abs(parseFloat(form.amount)) : Math.abs(parseFloat(form.amount)),
          date: form.date,
          categoryId: form.categoryId,
          currency: form.currency,
          type: form.type,
          paid: form.paid,
        } as any);
        setToast({ message: "Saved", tone: "success" });
      } else {
        const catId = form.categoryId || categories[0]?.id;
        if (!catId) {
          // Auto-create a default category if none exists (mirrors BudgetPal behaviour).
          const cat = await createCategory({ name: "General", budget: "0" });
          await createTransaction({
            categoryId: cat.id,
            description: form.description,
            amount: form.type === "expense" ? -Math.abs(parseFloat(form.amount)) : Math.abs(parseFloat(form.amount)),
            date: form.date,
            currency: form.currency,
            type: form.type,
            paid: form.paid,
          } as any);
        } else {
          await createTransaction({
            categoryId: catId,
            description: form.description,
            amount: form.type === "expense" ? -Math.abs(parseFloat(form.amount)) : Math.abs(parseFloat(form.amount)),
            date: form.date,
            currency: form.currency,
            type: form.type,
            paid: form.paid,
          } as any);
        }
        setToast({ message: "Added", tone: "success" });
      }
      setEditOpen(false);
    } catch {
      setToast({ message: "Save failed", tone: "error" });
    }
  };

  const isLoading = catsLoading || txLoading;

  return (
    <PageLayout>
      <div className={`flex h-svh flex-col ${safe}`}>
        <PageHeader
          title={language === "es" ? "Presupuesto" : "Budget"}
          subtitle={language === "es" ? "Tus gastos e ingresos" : "Your expenses & income"}
        />

        <div className="border-b border-border bg-card px-4 py-3">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {language === "es" ? "Disponible" : "Remaining"}
          </p>
          <p
            className={`text-2xl font-bold ${totals.remaining < 0 ? "text-rose-600" : "text-emerald-600"}`}
          >
            {formatCurrency(totals.remaining, "HNL", language)}
          </p>
          <div className="mt-1 flex gap-4 text-sm">
            <span className="text-emerald-600">
              {language === "es" ? "Ingresos" : "Income"}: {formatCurrency(totals.income, "HNL", language)}
            </span>
            <span className="text-rose-600">
              {language === "es" ? "Gastos" : "Expense"}: {formatCurrency(totals.expense, "HNL", language)}
            </span>
          </div>

          {gamification && (
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                🔥 {gamification.streakDays} {language === "es" ? "días" : "day streak"}
              </span>
              {gamification.onBudget && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                  ✅ {language === "es" ? "Dentro de presupuesto" : "On budget"}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <p className="p-6 text-center text-sm text-muted-foreground">…</p>
          ) : views.length === 0 ? (
            <EmptyState onAdd={() => openEdit(null)} />
          ) : (
            views.map((entry) => (
              <EntryRow
                key={entry.id}
                entry={entry}
                onOpen={openDetail}
                onTogglePaid={handleTogglePaid}
              />
            ))
          )}

          {analytics && (
            <details className="border-t border-border bg-card px-4 py-3">
              <summary className="cursor-pointer text-sm font-semibold">
                {language === "es" ? "Análisis" : "Analytics"}
              </summary>
              <div className="mt-3">
                <BudgetChart analytics={analytics} />
              </div>
            </details>
          )}

          {insights.length > 0 && (
            <div className="border-t border-border bg-card px-4 py-3">
              <h4 className="mb-2 text-sm font-semibold">
                {language === "es" ? "Consejos" : "Tips"}
              </h4>
              <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                {insights.map((tip, i) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <BudgetFab onClick={() => openEdit(null)} label={language === "es" ? "Agregar" : "Add"} />
      </div>

      <EntryDetailSheet
        entry={detail}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onEdit={openEdit}
        onDelete={handleDelete}
      />

      <EntryEditSheet
        open={editOpen}
        onOpenChange={setEditOpen}
        initial={editInitial}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        onSubmit={handleSubmit}
        isSaving={isCreating || isDeleting}
      />

      {toast && (
        <MobileToast
          open
          message={toast.message}
          variant={toast.tone}
          onClose={() => setToast(null)}
        />
      )}
    </PageLayout>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  const { language } = useLanguage();
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
      <p className="text-sm font-semibold">{language === "es" ? "Sin movimientos" : "No entries yet"}</p>
      <p className="text-sm text-muted-foreground">
        {language === "es" ? "Toca + para registrar tu primer gasto o ingreso." : "Tap + to log your first expense or income."}
      </p>
      <button
        type="button"
        onClick={onAdd}
        className="mt-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
      >
        {language === "es" ? "Agregar ahora" : "Add now"}
      </button>
    </div>
  );
}
