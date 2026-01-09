import { useState } from "react";
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
  Plus,
  Wallet,
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Calendar,
  Settings,
  Bell,
  ChevronRight,
  Zap,
  Loader2,
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { BudgetCategory, BudgetTransaction } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function PremiumBudgetPal() {
  const { toast } = useToast();
  const [language, setLanguage] = useState("es");
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);

  const [newExpense, setNewExpense] = useState({ amount: "", description: "", categoryId: "" });
  const [newCategory, setNewCategory] = useState({ name: "", budget: "" });

  const { data: categories = [], isLoading: categoriesLoading } = useQuery<BudgetCategory[]>({
    queryKey: ['/api/budget/categories'],
  });

  const { data: transactions = [], isLoading: transactionsLoading } = useQuery<BudgetTransaction[]>({
    queryKey: ['/api/budget/transactions'],
  });

  const createTransactionMutation = useMutation({
    mutationFn: async (data: { categoryId: number; description: string; amount: string }) => {
      return apiRequest('POST', '/api/budget/transactions', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/budget/transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/budget/categories'] });
      setExpenseDialogOpen(false);
      setNewExpense({ amount: "", description: "", categoryId: "" });
      toast({ title: language === "es" ? "Gasto registrado" : "Expense recorded" });
    },
    onError: () => {
      toast({ title: language === "es" ? "Error al guardar" : "Error saving", variant: "destructive" });
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (data: { name: string; budget: string }) => {
      return apiRequest('POST', '/api/budget/categories', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/budget/categories'] });
      setCategoryDialogOpen(false);
      setNewCategory({ name: "", budget: "" });
      toast({ title: language === "es" ? "Categoría creada" : "Category created" });
    },
    onError: () => {
      toast({ title: language === "es" ? "Error al crear categoría" : "Error creating category", variant: "destructive" });
    },
  });

  const totalBudget = categories.reduce((sum, c) => sum + parseFloat(c.budget || "0"), 0);
  const totalSpent = categories.reduce((sum, c) => sum + parseFloat(c.spent || "0"), 0);
  const remainingBudget = totalBudget - totalSpent;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-HN', { style: 'currency', currency: 'HNL' }).format(amount);
  };

  const t = {
    title: language === "es" ? "BudgetPal Premium" : "BudgetPal Premium",
    subtitle: language === "es" ? "Tu asistente financiero inteligente" : "Your intelligent financial assistant",
    totalBudget: language === "es" ? "Presupuesto Total" : "Total Budget",
    totalExpenses: language === "es" ? "Gastos Totales" : "Total Expenses",
    remaining: language === "es" ? "Disponible" : "Available",
    categories: language === "es" ? "Categorías" : "Categories",
    recentActivity: language === "es" ? "Actividad Reciente" : "Recent Activity",
    budgetCategories: language === "es" ? "Categorías de Presupuesto" : "Budget Categories",
    addExpense: language === "es" ? "Nuevo Gasto" : "New Expense",
    addCategory: language === "es" ? "Nueva Categoría" : "New Category",
    noData: language === "es" ? "Sin datos aún" : "No data yet",
    addFirst: language === "es" ? "Agrega tu primera categoría para comenzar" : "Add your first category to get started",
    loading: language === "es" ? "Cargando..." : "Loading...",
  };

  const isLoading = categoriesLoading || transactionsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-emerald-400 mx-auto mb-4" />
          <p className="text-slate-400">{t.loading}</p>
        </div>
      </div>
    );
  }

  const handleAddExpense = () => {
    if (!newExpense.amount || !newExpense.description || !newExpense.categoryId) {
      toast({ title: language === "es" ? "Completa todos los campos" : "Fill all fields", variant: "destructive" });
      return;
    }
    createTransactionMutation.mutate({
      categoryId: parseInt(newExpense.categoryId),
      description: newExpense.description,
      amount: newExpense.amount,
    });
  };

  const handleAddCategory = () => {
    if (!newCategory.name || !newCategory.budget) {
      toast({ title: language === "es" ? "Completa todos los campos" : "Fill all fields", variant: "destructive" });
      return;
    }
    createCategoryMutation.mutate({
      name: newCategory.name,
      budget: newCategory.budget,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="relative z-10">
        <div className="border-b border-white/10 backdrop-blur-xl bg-slate-900/50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                  <Wallet className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                    {t.title}
                  </h1>
                  <p className="text-xs text-slate-400">{t.subtitle}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10">
                  <Bell className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10">
                  <Settings className="h-5 w-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="rounded-full hover:bg-white/10"
                  onClick={() => setLanguage(language === "es" ? "en" : "es")}
                >
                  {language === "es" ? "EN" : "ES"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border-emerald-500/30 backdrop-blur-xl overflow-hidden group hover:scale-105 transition-transform duration-300">
              <CardContent className="p-6 relative">
                <div className="flex items-start justify-between mb-4">
                  <div className="h-12 w-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-emerald-400" />
                  </div>
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    {categories.length}
                  </Badge>
                </div>
                <p className="text-sm text-emerald-300/80 mb-1">{t.totalBudget}</p>
                <p className="text-3xl font-bold text-white mb-2">{formatCurrency(totalBudget)}</p>
                <div className="h-1 w-full bg-emerald-500/20 rounded-full overflow-hidden">
                  <div className="h-full w-full bg-gradient-to-r from-emerald-400 to-teal-400"></div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-500/20 to-red-600/20 border-red-500/30 backdrop-blur-xl overflow-hidden group hover:scale-105 transition-transform duration-300">
              <CardContent className="p-6 relative">
                <div className="flex items-start justify-between mb-4">
                  <div className="h-12 w-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                    <Receipt className="h-6 w-6 text-red-400" />
                  </div>
                  <Badge className="bg-red-500/20 text-red-300 border-red-500/30">
                    <ArrowDownRight className="h-3 w-3 mr-1" />
                    {totalBudget > 0 ? `-${Math.round((totalSpent/totalBudget)*100)}%` : '0%'}
                  </Badge>
                </div>
                <p className="text-sm text-red-300/80 mb-1">{t.totalExpenses}</p>
                <p className="text-3xl font-bold text-white mb-2">{formatCurrency(totalSpent)}</p>
                <div className="h-1 w-full bg-red-500/20 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-red-400 to-orange-400" style={{width: totalBudget > 0 ? `${(totalSpent/totalBudget)*100}%` : '0%'}}></div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-500/30 backdrop-blur-xl overflow-hidden group hover:scale-105 transition-transform duration-300">
              <CardContent className="p-6 relative">
                <div className="flex items-start justify-between mb-4">
                  <div className="h-12 w-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <Wallet className="h-6 w-6 text-blue-400" />
                  </div>
                  <Badge className={`${remainingBudget >= 0 ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' : 'bg-red-500/20 text-red-300 border-red-500/30'}`}>
                    {totalBudget > 0 ? `${remainingBudget >= 0 ? '+' : ''}${Math.round((remainingBudget/totalBudget)*100)}%` : '0%'}
                  </Badge>
                </div>
                <p className="text-sm text-blue-300/80 mb-1">{t.remaining}</p>
                <p className="text-3xl font-bold text-white mb-2">{formatCurrency(remainingBudget)}</p>
                <div className="h-1 w-full bg-blue-500/20 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-400 to-cyan-400" style={{width: totalBudget > 0 ? `${Math.max(0, (remainingBudget/totalBudget)*100)}%` : '0%'}}></div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-purple-500/30 backdrop-blur-xl overflow-hidden group hover:scale-105 transition-transform duration-300">
              <CardContent className="p-6 relative">
                <div className="flex items-start justify-between mb-4">
                  <div className="h-12 w-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                    <Target className="h-6 w-6 text-purple-400" />
                  </div>
                  <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                    <Zap className="h-3 w-3 mr-1" />
                    {transactions.length}
                  </Badge>
                </div>
                <p className="text-sm text-purple-300/80 mb-1">{t.categories}</p>
                <p className="text-3xl font-bold text-white mb-2">{categories.length}</p>
                <div className="h-1 w-full bg-purple-500/20 rounded-full overflow-hidden">
                  <div className="h-full w-full bg-gradient-to-r from-purple-400 to-pink-400"></div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <Dialog open={expenseDialogOpen} onOpenChange={setExpenseDialogOpen}>
              <DialogTrigger asChild>
                <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50 backdrop-blur-xl cursor-pointer hover:scale-105 transition-all duration-300 hover:border-emerald-500/50 group">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Receipt className="h-7 w-7 text-white" />
                        </div>
                        <div>
                          <p className="text-lg font-semibold">{t.addExpense}</p>
                          <p className="text-sm text-slate-400">{language === "es" ? "Registra gastos rápido" : "Record expenses quickly"}</p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-emerald-400 transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent className="bg-slate-900 border-slate-700 text-white">
                <DialogHeader>
                  <DialogTitle>{t.addExpense}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <label className="text-sm text-slate-400 mb-2 block">{language === "es" ? "Monto" : "Amount"}</label>
                    <Input 
                      className="bg-slate-800 border-slate-700" 
                      placeholder="0.00" 
                      type="number" 
                      value={newExpense.amount}
                      onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-400 mb-2 block">{language === "es" ? "Descripción" : "Description"}</label>
                    <Input 
                      className="bg-slate-800 border-slate-700" 
                      placeholder={language === "es" ? "Ej: Almuerzo" : "Ex: Lunch"}
                      value={newExpense.description}
                      onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-400 mb-2 block">{language === "es" ? "Categoría" : "Category"}</label>
                    <select 
                      className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2"
                      value={newExpense.categoryId}
                      onChange={(e) => setNewExpense({...newExpense, categoryId: e.target.value})}
                    >
                      <option value="">{language === "es" ? "Seleccionar..." : "Select..."}</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                    onClick={handleAddExpense}
                    disabled={createTransactionMutation.isPending}
                  >
                    {createTransactionMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    {language === "es" ? "Guardar Gasto" : "Save Expense"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
              <DialogTrigger asChild>
                <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50 backdrop-blur-xl cursor-pointer hover:scale-105 transition-all duration-300 hover:border-emerald-500/50 group">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Plus className="h-7 w-7 text-white" />
                        </div>
                        <div>
                          <p className="text-lg font-semibold">{t.addCategory}</p>
                          <p className="text-sm text-slate-400">{language === "es" ? "Crea categorías de presupuesto" : "Create budget categories"}</p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-emerald-400 transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent className="bg-slate-900 border-slate-700 text-white">
                <DialogHeader>
                  <DialogTitle>{t.addCategory}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <label className="text-sm text-slate-400 mb-2 block">{language === "es" ? "Nombre" : "Name"}</label>
                    <Input 
                      className="bg-slate-800 border-slate-700" 
                      placeholder={language === "es" ? "Ej: Comida" : "Ex: Food"}
                      value={newCategory.name}
                      onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-400 mb-2 block">{language === "es" ? "Presupuesto" : "Budget"}</label>
                    <Input 
                      className="bg-slate-800 border-slate-700" 
                      placeholder="0.00" 
                      type="number"
                      value={newCategory.budget}
                      onChange={(e) => setNewCategory({...newCategory, budget: e.target.value})}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    onClick={handleAddCategory}
                    disabled={createCategoryMutation.isPending}
                  >
                    {createCategoryMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    {language === "es" ? "Crear Categoría" : "Create Category"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Sparkles className="mr-2 h-5 w-5 text-emerald-400" />
                    {t.recentActivity}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {transactions.length === 0 ? (
                  <div className="text-center py-8">
                    <Receipt className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400">{t.noData}</p>
                    <p className="text-sm text-slate-500">{language === "es" ? "Agrega un gasto para comenzar" : "Add an expense to get started"}</p>
                  </div>
                ) : (
                  transactions.slice(0, 5).map((transaction) => {
                    const category = categories.find(c => c.id === transaction.categoryId);
                    return (
                      <div 
                        key={transaction.id} 
                        className="flex items-center justify-between p-4 rounded-xl bg-slate-900/50 hover:bg-slate-900/80 transition-all duration-300 group border border-slate-700/30 hover:border-emerald-500/30"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                            <Receipt className="h-5 w-5 text-slate-400" />
                          </div>
                          <div>
                            <p className="font-medium">{transaction.description}</p>
                            <p className="text-sm text-slate-400">{category?.name || 'Sin categoría'}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-red-400">-{formatCurrency(parseFloat(transaction.amount))}</p>
                          <Badge className="bg-red-500/20 text-red-300 border-red-500/30 text-xs">
                            {language === "es" ? "Gasto" : "Expense"}
                          </Badge>
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Target className="mr-2 h-5 w-5 text-purple-400" />
                    {t.budgetCategories}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                {categories.length === 0 ? (
                  <div className="text-center py-8">
                    <Target className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400">{t.noData}</p>
                    <p className="text-sm text-slate-500">{t.addFirst}</p>
                  </div>
                ) : (
                  categories.map((category) => {
                    const budget = parseFloat(category.budget || "0");
                    const spent = parseFloat(category.spent || "0");
                    const progress = budget > 0 ? (spent / budget) * 100 : 0;
                    return (
                      <div 
                        key={category.id} 
                        className="p-5 rounded-xl bg-gradient-to-br from-slate-900/80 to-slate-900/50 border border-slate-700/50 hover:border-purple-500/50 transition-all duration-300 group"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                              <Wallet className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <p className="font-semibold">{category.name}</p>
                              <p className="text-sm text-slate-400">
                                {formatCurrency(spent)} / {formatCurrency(budget)}
                              </p>
                            </div>
                          </div>
                          <Badge className={`${progress > 100 ? 'bg-red-500/20 text-red-300 border-red-500/30' : 'bg-purple-500/20 text-purple-300 border-purple-500/30'}`}>
                            {progress.toFixed(0)}%
                          </Badge>
                        </div>
                        <Progress value={Math.min(progress, 100)} className="h-3 bg-slate-700/50" />
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20 border-emerald-500/30 backdrop-blur-xl overflow-hidden">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-1">
                      {language === "es" ? "Tu Resumen Financiero" : "Your Financial Summary"}
                    </h3>
                    <p className="text-slate-300">
                      {categories.length === 0 
                        ? (language === "es" ? "Comienza agregando categorías de presupuesto" : "Start by adding budget categories")
                        : (language === "es" 
                            ? `Tienes ${categories.length} categorías y ${transactions.length} transacciones registradas` 
                            : `You have ${categories.length} categories and ${transactions.length} transactions recorded`)
                      }
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
