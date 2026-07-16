import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import {
  Target,
  TrendingUp,
  Wallet,
  Receipt,
  Sparkles,
  Calendar,
  ChevronRight,
  Zap,
  TrendingDown,
  CircleDollarSign,
  Eye,
  Trash2,
  Loader2,
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { PageLayout } from "@/components/PageLayout";
import { PageHeader } from "@/components/PageHeader";
import { useBudgetCategories, useBudgetTransactions, type BudgetTransaction, type BudgetCategory } from "../hooks/use-budget";

const CATEGORY_ICONS: Record<string, string> = {
  food: "🍽️", Food: "🍽️", Comida: "🍽️",
  transport: "🚗", Transport: "🚗", Transporte: "🚗",
  utilities: "🏠", Utilities: "🏠", Servicios: "🏠",
  entertainment: "🎬", Entertainment: "🎬", Entretenimiento: "🎬",
  shopping: "🛍️", Shopping: "🛍️", Compras: "🛍️",
  healthcare: "⚕️", Healthcare: "⚕️", Salud: "⚕️",
  education: "📚", Education: "📚", Educación: "📚",
  income: "💰", Income: "💰", Ingresos: "💰", Salario: "💰",
  other: "📦", Other: "📦", Otro: "📦",
};

function getCategoryIcon(name: string): string {
  return CATEGORY_ICONS[name] ?? "📦";
}

export default function BudgetPalPage() {
  const { language, setLanguage } = useLanguage();
  const { categories, isLoading: categoriesLoading, error: categoriesError, createCategory, isCreating } = useBudgetCategories();
  const { transactions, isLoading: transactionsLoading, error: transactionsError, createTransaction: createTx, deleteTransaction: deleteTx, isCreating: isCreatingTx, isDeleting } = useBudgetTransactions();
  const apiError = categoriesError ?? transactionsError;

  const savingsGoals: { id: string; name: string; targetAmount: number; currentAmount: number; deadline: string; progress: number }[] = [];

  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [savingsDialogOpen, setSavingsDialogOpen] = useState(false);
  const [incomeDialogOpen, setIncomeDialogOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [newCategoryForm, setNewCategoryForm] = useState({ name: "", budget: "" });

  const expenseCategories = React.useMemo(() => categories.filter((c) => !/ingreso|income/i.test(c.name)), [categories]);
  const firstExpenseCategoryId = expenseCategories[0]?.id ?? 0;

  const [expenseForm, setExpenseForm] = useState({ amount: "", description: "", categoryId: 0, date: new Date().toISOString().split("T")[0] });
  const [incomeForm, setIncomeForm] = useState({ amount: "", source: "" });

  React.useEffect(() => {
    if (firstExpenseCategoryId && !expenseForm.categoryId) {
      setExpenseForm((f) => ({ ...f, categoryId: firstExpenseCategoryId }));
    }
  }, [firstExpenseCategoryId, expenseForm.categoryId]);

  const categoryMap = React.useMemo(() => {
    const m: Record<number, BudgetCategory> = {};
    categories.forEach((c) => { m[c.id] = c; });
    return m;
  }, [categories]);

  const expenses = React.useMemo(
    () =>
      transactions
        .filter((t) => parseFloat(t.amount) < 0)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [transactions]
  );
  const incomeList = React.useMemo(
    () => transactions.filter((t) => parseFloat(t.amount) > 0),
    [transactions]
  );

  const totalExpenses = expenses.reduce((sum, e) => sum + Math.abs(parseFloat(e.amount)), 0);
  const totalIncome = incomeList.reduce((sum, i) => sum + parseFloat(i.amount), 0);
  const totalSavingsCurrent = savingsGoals.reduce((sum, g) => sum + g.currentAmount, 0);
  const remainingBudget = totalIncome - totalExpenses;
  const incomeForPercent = totalIncome || 1;

  const ensureIncomeCategory = async (): Promise<number> => {
    const incomeName = language === "es" ? "Ingresos" : "Income";
    let cat = categories.find((c) => c.name.toLowerCase() === incomeName.toLowerCase());
    if (!cat) {
      cat = await createCategory({ name: incomeName, budget: "0" });
    }
    return cat.id;
  };

  const handleAddExpense = async () => {
    const catId = expenseForm.categoryId || firstExpenseCategoryId;
    if (!expenseForm.amount || !expenseForm.description || !catId) return;
    const amt = -Math.abs(parseFloat(expenseForm.amount));
    await createTx({
      categoryId: catId,
      description: expenseForm.description,
      amount: String(amt),
      date: expenseForm.date,
    });
    setExpenseForm({ amount: "", description: "", categoryId: firstExpenseCategoryId, date: new Date().toISOString().split("T")[0] });
    setExpenseDialogOpen(false);
  };

  const handleAddIncome = async () => {
    if (!incomeForm.amount || !incomeForm.source) return;
    const catId = await ensureIncomeCategory();
    await createTx({
      categoryId: catId,
      description: incomeForm.source,
      amount: String(Math.abs(parseFloat(incomeForm.amount))),
      date: new Date().toISOString().split("T")[0],
    });
    setIncomeForm({ amount: "", source: "" });
    setIncomeDialogOpen(false);
  };

  const handleDeleteTransaction = async (id: number) => {
    await deleteTx(id);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-HN", { style: "currency", currency: "HNL" }).format(amount);
  };

  const t = {
    title: "BudgetPal",
    subtitle: language === "es" ? "Gestión financiera inteligente" : "Smart financial management",
    totalIncome: language === "es" ? "Ingresos" : "Income",
    totalExpenses: language === "es" ? "Gastos" : "Expenses",
    remaining: language === "es" ? "Saldo Disponible" : "Available Balance",
    savings: language === "es" ? "Ahorros Totales" : "Total Savings",
    recentActivity: language === "es" ? "Movimientos Recientes" : "Recent Activity",
    savingsGoals: language === "es" ? "Metas de Ahorro" : "Savings Goals",
    insights: language === "es" ? "Análisis Inteligente" : "Smart Insights",
    addExpense: language === "es" ? "Nuevo Gasto" : "New Expense",
    addIncome: language === "es" ? "Nuevo Ingreso" : "New Income",
    createGoal: language === "es" ? "Nueva Meta" : "New Goal",
    quickAdd: language === "es" ? "Acciones Rápidas" : "Quick Actions",
    saveExpense: language === "es" ? "Guardar Gasto" : "Save Expense",
    saveIncome: language === "es" ? "Guardar Ingreso" : "Save Income",
    amountHNL: language === "es" ? "Monto (HNL)" : "Amount (HNL)",
    description: language === "es" ? "Descripción" : "Description",
    category: language === "es" ? "Categoría" : "Category",
    source: language === "es" ? "Fuente" : "Source",
    expensePlaceholder: language === "es" ? "Ej: Almuerzo" : "E.g. Lunch",
    sourcePlaceholder: language === "es" ? "Ej: Salario, Freelance" : "E.g. Salary, Freelance",
    noCategories: language === "es" ? "Crea una categoría primero" : "Create a category first",
    addCategory: language === "es" ? "Nueva Categoría" : "New Category",
    categoryName: language === "es" ? "Nombre" : "Name",
    budgetLimit: language === "es" ? "Límite (HNL)" : "Limit (HNL)",
    createCategory: language === "es" ? "Crear Categoría" : "Create Category",
    dateLabel: language === "es" ? "Fecha" : "Date",
    registerExpenses: language === "es" ? "Registra gastos" : "Log expenses",
    registerIncome: language === "es" ? "Registra ingresos" : "Log income",
    organizeExpenses: language === "es" ? "Organiza gastos" : "Organize expenses",
    defineGoals: language === "es" ? "Define objetivos" : "Set goals",
    viewAll: language === "es" ? "Ver todos" : "View all",
    viewAllGoals: language === "es" ? "Ver todas" : "View all",
    categoryPlaceholder: language === "es" ? "Ej: Comida, Transporte" : "E.g. Food, Transport",
    goalNameLabel: language === "es" ? "Nombre de la meta" : "Goal name",
    goalAmountLabel: language === "es" ? "Monto Objetivo (HNL)" : "Target amount (HNL)",
    goalPlaceholder: language === "es" ? "Ej: Vacaciones, Auto" : "E.g. Vacation, Car",
    createGoalButton: language === "es" ? "Crear Meta" : "Create Goal",
    remainingLabel: language === "es" ? "restante" : "remaining",
    viewAnalysis: language === "es" ? "Ver Análisis" : "View Analysis",
    expenseLabel: language === "es" ? "Gasto" : "Expense",
    noExpenses: language === "es" ? "No hay gastos registrados" : "No expenses recorded",
    noSavingsGoals: language === "es" ? "Aún no tienes metas de ahorro" : "No savings goals yet",
    savingsGoalsComingSoon: language === "es"
      ? "Las metas de ahorro estarán disponibles en una próxima actualización."
      : "Savings goals will be available in a future update.",
    insightsPlaceholder: language === "es"
      ? "Añade ingresos y gastos para ver análisis y recomendaciones."
      : "Add income and expenses to see insights and recommendations.",
    comingSoon: language === "es" ? "Próximamente" : "Coming soon",
    getStartedHint: language === "es"
      ? "Crea una categoría y añade un ingreso o gasto para empezar."
      : "Create a category and add an income or expense to get started.",
  };

  const handleCreateCategory = async () => {
    if (!newCategoryForm.name || !newCategoryForm.budget) return;
    await createCategory({ name: newCategoryForm.name, budget: newCategoryForm.budget });
    setNewCategoryForm({ name: "", budget: "" });
    setCategoryDialogOpen(false);
  };

  const isLoading = categoriesLoading || transactionsLoading;

  return (
    <PageLayout maxWidth="7xl">
      {/* Single Budget Pal page – route: /budgetpal */}
      {apiError && (
        <div className="rounded-lg bg-red-100 border border-red-200 px-4 py-3 text-red-800 text-sm" role="alert">
          {language === "es" ? "Error al cargar datos. Comprueba la conexión e inicia sesión de nuevo." : "Failed to load data. Check your connection and try signing in again."}
        </div>
      )}
      {/* Floating orbs background - youth tokens for consistency */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-youth-primary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-youth-accent/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-youth-primary/5 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="relative z-10">
        <PageHeader
          sticky
          size="compact"
          title={
            <div className="flex items-center space-x-3">
              <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <Wallet className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  {t.title}
                </h1>
                <p className="text-xs text-slate-500">{t.subtitle}</p>
              </div>
            </div>
          }
          actions={
            <Button
              variant="ghost"
              size="sm"
              className="rounded-xl text-slate-600 hover:text-emerald-600 hover:bg-emerald-50"
              onClick={() => setLanguage(language === "es" ? "en" : "es")}
            >
              {language === "es" ? "🇺🇸 EN" : "🇭🇳 ES"}
            </Button>
          }
        />

        <div className="pt-6 space-y-6">
          {/* Glowing Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Card className="relative overflow-hidden border-0 shadow-xl shadow-emerald-500/10 bg-gradient-to-br from-white to-emerald-50/50 backdrop-blur-xl hover:shadow-2xl hover:shadow-emerald-500/20 transition-all duration-500 hover:-translate-y-1 group">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
              <CardContent className="p-4 sm:p-5 relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform duration-300">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                </div>
                <p className="text-xs text-slate-500 mb-1 font-medium">{t.totalIncome}</p>
                <p className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">{formatCurrency(totalIncome)}</p>
                <div className="h-1.5 w-full bg-emerald-100 rounded-full overflow-hidden">
                  <div className="h-full w-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full shadow-lg shadow-emerald-500/50"></div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-0 shadow-xl shadow-rose-500/10 bg-gradient-to-br from-white to-rose-50/50 backdrop-blur-xl hover:shadow-2xl hover:shadow-rose-500/20 transition-all duration-500 hover:-translate-y-1 group">
              <div className="absolute inset-0 bg-gradient-to-br from-rose-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
              <CardContent className="p-4 sm:p-5 relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center shadow-lg shadow-rose-500/30 group-hover:scale-110 transition-transform duration-300">
                    <Receipt className="h-5 w-5 text-white" />
                  </div>
                  <Badge className="bg-rose-100 text-rose-700 border-0 px-2 py-0.5 text-xs font-semibold">
                    <TrendingDown className="h-3 w-3 mr-0.5" />
                    {Math.round((totalExpenses / incomeForPercent) * 100)}%
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 mb-1 font-medium">{t.totalExpenses}</p>
                <p className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">{formatCurrency(totalExpenses)}</p>
                <div className="h-1.5 w-full bg-rose-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-rose-500 to-orange-500 rounded-full shadow-lg shadow-rose-500/50" style={{width: `${Math.min((totalExpenses / incomeForPercent) * 100, 100)}%`}}></div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-0 shadow-xl shadow-blue-500/10 bg-gradient-to-br from-white to-blue-50/50 backdrop-blur-xl hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 hover:-translate-y-1 group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
              <CardContent className="p-4 sm:p-5 relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform duration-300">
                    <CircleDollarSign className="h-5 w-5 text-white" />
                  </div>
                  <Badge className={`border-0 px-2 py-0.5 text-xs font-semibold ${remainingBudget > 0 ? 'bg-blue-100 text-blue-700' : 'bg-rose-100 text-rose-700'}`}>
                    {remainingBudget > 0 ? '+' : ''}{Math.round((remainingBudget / incomeForPercent) * 100)}%
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 mb-1 font-medium">{t.remaining}</p>
                <p className={`text-xl sm:text-2xl font-bold mb-2 ${remainingBudget < 0 ? 'text-rose-600' : 'text-slate-900'}`}>{formatCurrency(remainingBudget)}</p>
                <div className="h-1.5 w-full bg-blue-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full shadow-lg shadow-blue-500/50" style={{width: `${Math.max(Math.min((remainingBudget / incomeForPercent) * 100, 100), 0)}%`}}></div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-0 shadow-xl shadow-violet-500/10 bg-gradient-to-br from-white to-violet-50/50 backdrop-blur-xl hover:shadow-2xl hover:shadow-violet-500/20 transition-all duration-500 hover:-translate-y-1 group">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
              <CardContent className="p-4 sm:p-5 relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30 group-hover:scale-110 transition-transform duration-300">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                  <Badge className="bg-violet-100 text-violet-700 border-0 px-2 py-0.5 text-xs font-semibold">
                    <Zap className="h-3 w-3 mr-0.5" />
                    {savingsGoals.length}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 mb-1 font-medium">{t.savings}</p>
                <p className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">{formatCurrency(totalSavingsCurrent)}</p>
                <div className="h-1.5 w-full bg-violet-100 rounded-full overflow-hidden">
                  <div className="h-full w-3/4 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full shadow-lg shadow-violet-500/50"></div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          {!isLoading && categories.length === 0 && transactions.length === 0 && !apiError && (
            <p className="text-center text-slate-600 text-sm py-2">{t.getStartedHint}</p>
          )}
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg flex items-center text-slate-900">
                <Zap className="mr-2 h-5 w-5 text-emerald-600" />
                {t.quickAdd}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Dialog open={expenseDialogOpen} onOpenChange={setExpenseDialogOpen}>
                  <DialogTrigger asChild>
                    <button className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 p-6 text-left shadow-lg shadow-rose-500/30 hover:shadow-2xl hover:shadow-rose-500/40 transition-all duration-300 hover:scale-105">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <Receipt className="h-8 w-8 text-white mb-3 group-hover:scale-110 transition-transform" />
                      <p className="text-sm font-bold text-white">{t.addExpense}</p>
                      <p className="text-xs text-white/80 mt-1">{t.registerExpenses}</p>
                    </button>
                  </DialogTrigger>
                  <DialogContent className="bg-white border-slate-200 sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-slate-900">{t.addExpense}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <label className="text-sm text-slate-600 mb-2 block font-medium">{t.amountHNL}</label>
                        <Input className="bg-slate-50 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500" placeholder="0.00" type="number" value={expenseForm.amount} onChange={(e) => setExpenseForm((f) => ({ ...f, amount: e.target.value }))} />
                      </div>
                      <div>
                        <label className="text-sm text-slate-600 mb-2 block font-medium">{t.description}</label>
                        <Input className="bg-slate-50 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500" placeholder={t.expensePlaceholder} value={expenseForm.description} onChange={(e) => setExpenseForm((f) => ({ ...f, description: e.target.value }))} />
                      </div>
                      <div>
                        <label className="text-sm text-slate-600 mb-2 block font-medium">{t.category}</label>
                        <select className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none" value={expenseForm.categoryId || firstExpenseCategoryId} onChange={(e) => setExpenseForm((f) => ({ ...f, categoryId: parseInt(e.target.value) }))}>
                          {expenseCategories.map((c) => (
                            <option key={c.id} value={c.id}>{getCategoryIcon(c.name)} {c.name}</option>
                          ))}
                          {expenseCategories.length === 0 && <option value={0}>{t.noCategories}</option>}
                        </select>
                      </div>
                      <div>
                        <label className="text-sm text-slate-600 mb-2 block font-medium">{t.dateLabel}</label>
                        <Input className="bg-slate-50 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500" type="date" value={expenseForm.date} onChange={(e) => setExpenseForm((f) => ({ ...f, date: e.target.value }))} />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/30 text-white border-0" onClick={handleAddExpense} disabled={!expenseForm.amount || !expenseForm.description || !firstExpenseCategoryId || isCreatingTx}>
                        {isCreatingTx ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        {t.saveExpense}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Dialog open={incomeDialogOpen} onOpenChange={setIncomeDialogOpen}>
                  <DialogTrigger asChild>
                    <button className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-left shadow-lg shadow-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/40 transition-all duration-300 hover:scale-105">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <TrendingUp className="h-8 w-8 text-white mb-3 group-hover:scale-110 transition-transform" />
                      <p className="text-sm font-bold text-white">{t.addIncome}</p>
                      <p className="text-xs text-white/80 mt-1">{t.registerIncome}</p>
                    </button>
                  </DialogTrigger>
                  <DialogContent className="bg-white border-slate-200 sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-slate-900">{t.addIncome}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <label className="text-sm text-slate-600 mb-2 block font-medium">{t.amountHNL}</label>
                        <Input className="bg-slate-50 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500" placeholder="0.00" type="number" value={incomeForm.amount} onChange={(e) => setIncomeForm((f) => ({ ...f, amount: e.target.value }))} />
                      </div>
                      <div>
                        <label className="text-sm text-slate-600 mb-2 block font-medium">{t.source}</label>
                        <Input className="bg-slate-50 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500" placeholder={t.sourcePlaceholder} value={incomeForm.source} onChange={(e) => setIncomeForm((f) => ({ ...f, source: e.target.value }))} />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/30 text-white border-0" onClick={handleAddIncome} disabled={!incomeForm.amount || !incomeForm.source || isCreatingTx}>
                        {isCreatingTx ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        {t.saveIncome}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
                  <DialogTrigger asChild>
                    <button className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 p-6 text-left shadow-lg shadow-amber-500/30 hover:shadow-2xl hover:shadow-amber-500/40 transition-all duration-300 hover:scale-105">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <Receipt className="h-8 w-8 text-white mb-3 group-hover:scale-110 transition-transform" />
                      <p className="text-sm font-bold text-white">{t.addCategory}</p>
                      <p className="text-xs text-white/80 mt-1">{t.organizeExpenses}</p>
                    </button>
                  </DialogTrigger>
                  <DialogContent className="bg-white border-slate-200 sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-slate-900">{t.addCategory}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <label className="text-sm text-slate-600 mb-2 block font-medium">{t.categoryName}</label>
                        <Input className="bg-slate-50 border-slate-200" placeholder={t.categoryPlaceholder} value={newCategoryForm.name} onChange={(e) => setNewCategoryForm((f) => ({ ...f, name: e.target.value }))} />
                      </div>
                      <div>
                        <label className="text-sm text-slate-600 mb-2 block font-medium">{t.budgetLimit}</label>
                        <Input className="bg-slate-50 border-slate-200" placeholder="0.00" type="number" value={newCategoryForm.budget} onChange={(e) => setNewCategoryForm((f) => ({ ...f, budget: e.target.value }))} />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-0" onClick={handleCreateCategory} disabled={!newCategoryForm.name || !newCategoryForm.budget || isCreating}>
                        {isCreating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        {t.createCategory}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Dialog open={savingsDialogOpen} onOpenChange={setSavingsDialogOpen}>
                  <DialogTrigger asChild>
                    <button className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 p-6 text-left shadow-lg shadow-violet-500/30 hover:shadow-2xl hover:shadow-violet-500/40 transition-all duration-300 hover:scale-105">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <Target className="h-8 w-8 text-white mb-3 group-hover:scale-110 transition-transform" />
                      <p className="text-sm font-bold text-white">{t.createGoal}</p>
                      <p className="text-xs text-white/80 mt-1">{t.defineGoals}</p>
                    </button>
                  </DialogTrigger>
                    <DialogContent className="bg-white border-slate-200 sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-slate-900">{t.createGoal}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <p className="text-sm text-slate-600">{t.savingsGoalsComingSoon}</p>
                    </div>
                    <DialogFooter>
                      <Button className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 shadow-lg shadow-violet-500/30 text-white border-0" disabled>
                        {t.createGoalButton} ({t.comingSoon})
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-xl">
              <CardHeader className="border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base sm:text-lg flex items-center text-slate-900">
                    <Sparkles className="mr-2 h-5 w-5 text-emerald-600" />
                    {t.recentActivity}
                  </CardTitle>
                  <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg">
                    <Eye className="h-4 w-4 mr-1" />
                    {t.viewAll}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                {isLoading ? (
                  <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-emerald-500" /></div>
                ) : expenses.length === 0 ? (
                  <p className="text-center py-8 text-slate-500 text-sm">{t.noExpenses}</p>
                ) : (
                  expenses.map((expense) => (
                    <div
                      key={expense.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-slate-50/70 hover:bg-slate-100/70 transition-all duration-300 group border border-slate-200/50 hover:border-emerald-200 hover:shadow-md"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-2xl shadow-sm group-hover:scale-110 group-hover:shadow-md transition-all">
                          {getCategoryIcon(categoryMap[expense.categoryId]?.name ?? "")}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">{expense.description}</p>
                          <p className="text-xs text-slate-500 flex items-center mt-0.5">
                            <Calendar className="h-3 w-3 mr-1" />
                            {typeof expense.date === "string"
                              ? expense.date.split("T")[0]
                              : expense.date instanceof Date
                                ? expense.date.toISOString().split("T")[0]
                                : String(expense.date ?? "").split("T")[0]}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <p className="font-bold text-rose-600 text-sm">-{formatCurrency(Math.abs(parseFloat(expense.amount)))}</p>
                          <Badge className="bg-rose-100 text-rose-700 border-0 text-xs mt-1">
                            {t.expenseLabel}
                          </Badge>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-rose-500" onClick={() => handleDeleteTransaction(expense.id)} disabled={isDeleting}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Savings Goals */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-xl">
              <CardHeader className="border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base sm:text-lg flex items-center text-slate-900">
                    <Target className="mr-2 h-5 w-5 text-violet-600" />
                    {t.savingsGoals}
                  </CardTitle>
                  <Button variant="ghost" size="sm" className="text-violet-600 hover:text-violet-700 hover:bg-violet-50 rounded-lg">
                    <Eye className="h-4 w-4 mr-1" />
                    {t.viewAllGoals}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {savingsGoals.length === 0 ? (
                  <p className="text-center py-8 text-slate-500 text-sm">{t.noSavingsGoals}</p>
                ) : savingsGoals.map((goal) => (
                  <div 
                    key={goal.id} 
                    className="p-4 rounded-xl bg-gradient-to-br from-violet-50/70 to-purple-50/70 hover:from-violet-100/70 hover:to-purple-100/70 border border-violet-200/50 hover:border-violet-300 transition-all duration-300 group hover:shadow-lg"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30 group-hover:scale-110 transition-transform">
                          <Target className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{goal.name}</p>
                          <p className="text-xs text-slate-600">
                            {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-violet-200 text-violet-900 border-0 font-bold">
                        {goal.progress.toFixed(0)}%
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <Progress value={goal.progress} className="h-2.5 bg-violet-200/50" />
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {goal.deadline}
                        </span>
                        <span className="text-violet-700 font-semibold">
                          {formatCurrency(goal.targetAmount - goal.currentAmount)} {t.remainingLabel}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* AI Insights Banner */}
          <Card className="relative overflow-hidden border-0 shadow-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent"></div>
            <CardContent className="p-6 sm:p-8 relative">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start space-x-4">
                  <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center shadow-2xl animate-pulse border border-white/30">
                    <Sparkles className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 flex items-center">
                      {t.insights}
                      <span className="ml-2 text-xs bg-white/20 px-2 py-1 rounded-full border border-white/30">AI</span>
                    </h3>
                    <p className="text-white/90 text-sm sm:text-base max-w-2xl leading-relaxed">
                      {t.insightsPlaceholder}
                    </p>
                  </div>
                </div>
                <Button className="bg-white text-emerald-600 hover:bg-white/90 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 font-semibold whitespace-nowrap border-0">
                  {t.viewAnalysis}
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}