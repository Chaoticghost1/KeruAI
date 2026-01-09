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
  ArrowUpRight,
  Sparkles,
  Calendar,
  ChevronRight,
  Zap,
  TrendingDown,
  CircleDollarSign,
  Eye,
} from "lucide-react";

export default function PremiumBudgetPal() {
  const [language, setLanguage] = useState("es");
  const [expenses, setExpenses] = useState([
    { id: "1", amount: 450, description: "Supermercado", category: "food", date: "2026-01-08" },
    { id: "2", amount: 200, description: "Gasolina", category: "transport", date: "2026-01-07" },
    { id: "3", amount: 850, description: "Renta", category: "utilities", date: "2026-01-05" },
    { id: "4", amount: 120, description: "Netflix", category: "entertainment", date: "2026-01-04" },
  ]);
  const [savingsGoals, setSavingsGoals] = useState([
    { id: "1", name: "Vacaciones 2026", targetAmount: 15000, currentAmount: 8500, deadline: "2026-12-01", progress: 56.67 },
    { id: "2", name: "Fondo Emergencia", targetAmount: 20000, currentAmount: 12000, deadline: "2026-06-01", progress: 60 },
    { id: "3", name: "Auto Nuevo", targetAmount: 50000, currentAmount: 18000, deadline: "2027-01-01", progress: 36 },
  ]);
  const [income, setIncome] = useState([
    { id: "1", amount: 12000, source: "Salario", date: "2026-01-01", frequency: "monthly" },
  ]);

  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [savingsDialogOpen, setSavingsDialogOpen] = useState(false);
  const [incomeDialogOpen, setIncomeDialogOpen] = useState(false);

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalIncome = income.reduce((sum, i) => sum + i.amount, 0);
  const totalSavingsCurrent = savingsGoals.reduce((sum, g) => sum + g.currentAmount, 0);
  const remainingBudget = totalIncome - totalExpenses;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-HN', { style: 'currency', currency: 'HNL' }).format(amount);
  };

  const t = {
    title: language === "es" ? "BudgetPal" : "BudgetPal",
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
  };

  const categoryIcons: Record<string, string> = {
    food: "🍽️",
    transport: "🚗",
    utilities: "🏠",
    entertainment: "🎬",
    shopping: "🛍️",
    healthcare: "⚕️",
    education: "📚",
    other: "📦",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50 dark:from-slate-950 dark:via-emerald-950/20 dark:to-teal-950/20">
      {/* Floating orbs background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-200 dark:bg-emerald-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-200 dark:bg-teal-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-cyan-200 dark:bg-cyan-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="relative z-10">
        {/* Sleek Header */}
        <div className="border-b border-slate-200/60 dark:border-slate-800 backdrop-blur-2xl bg-white/70 dark:bg-slate-900/70 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <Wallet className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    {t.title}
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{t.subtitle}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="rounded-xl text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
                  onClick={() => setLanguage(language === "es" ? "en" : "es")}
                >
                  {language === "es" ? "🇺🇸 EN" : "🇭🇳 ES"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          {/* Glowing Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Card className="relative overflow-hidden border-0 shadow-xl shadow-emerald-500/10 bg-gradient-to-br from-white to-emerald-50/50 dark:from-slate-900 dark:to-emerald-950/20 backdrop-blur-xl hover:shadow-2xl hover:shadow-emerald-500/20 transition-all duration-500 hover:-translate-y-1 group">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
              <CardContent className="p-4 sm:p-5 relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform duration-300">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <Badge className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 border-0 px-2 py-0.5 text-xs font-semibold">
                    <ArrowUpRight className="h-3 w-3 mr-0.5" />
                    +12%
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 font-medium">{t.totalIncome}</p>
                <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">{formatCurrency(totalIncome)}</p>
                <div className="h-1.5 w-full bg-emerald-100 dark:bg-emerald-950 rounded-full overflow-hidden">
                  <div className="h-full w-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full shadow-lg shadow-emerald-500/50"></div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-0 shadow-xl shadow-rose-500/10 bg-gradient-to-br from-white to-rose-50/50 dark:from-slate-900 dark:to-rose-950/20 backdrop-blur-xl hover:shadow-2xl hover:shadow-rose-500/20 transition-all duration-500 hover:-translate-y-1 group">
              <div className="absolute inset-0 bg-gradient-to-br from-rose-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
              <CardContent className="p-4 sm:p-5 relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center shadow-lg shadow-rose-500/30 group-hover:scale-110 transition-transform duration-300">
                    <Receipt className="h-5 w-5 text-white" />
                  </div>
                  <Badge className="bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-400 border-0 px-2 py-0.5 text-xs font-semibold">
                    <TrendingDown className="h-3 w-3 mr-0.5" />
                    {Math.round((totalExpenses/totalIncome)*100)}%
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 font-medium">{t.totalExpenses}</p>
                <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">{formatCurrency(totalExpenses)}</p>
                <div className="h-1.5 w-full bg-rose-100 dark:bg-rose-950 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-rose-500 to-orange-500 rounded-full shadow-lg shadow-rose-500/50" style={{width: `${Math.min((totalExpenses/totalIncome)*100, 100)}%`}}></div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-0 shadow-xl shadow-blue-500/10 bg-gradient-to-br from-white to-blue-50/50 dark:from-slate-900 dark:to-blue-950/20 backdrop-blur-xl hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 hover:-translate-y-1 group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
              <CardContent className="p-4 sm:p-5 relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform duration-300">
                    <CircleDollarSign className="h-5 w-5 text-white" />
                  </div>
                  <Badge className={`border-0 px-2 py-0.5 text-xs font-semibold ${remainingBudget > 0 ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400' : 'bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-400'}`}>
                    {remainingBudget > 0 ? '+' : ''}{Math.round((remainingBudget/totalIncome)*100)}%
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 font-medium">{t.remaining}</p>
                <p className={`text-xl sm:text-2xl font-bold mb-2 ${remainingBudget < 0 ? 'text-rose-600' : 'text-slate-900 dark:text-white'}`}>{formatCurrency(remainingBudget)}</p>
                <div className="h-1.5 w-full bg-blue-100 dark:bg-blue-950 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full shadow-lg shadow-blue-500/50" style={{width: `${Math.max(Math.min((remainingBudget/totalIncome)*100, 100), 0)}%`}}></div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-0 shadow-xl shadow-violet-500/10 bg-gradient-to-br from-white to-violet-50/50 dark:from-slate-900 dark:to-violet-950/20 backdrop-blur-xl hover:shadow-2xl hover:shadow-violet-500/20 transition-all duration-500 hover:-translate-y-1 group">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
              <CardContent className="p-4 sm:p-5 relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30 group-hover:scale-110 transition-transform duration-300">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                  <Badge className="bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-400 border-0 px-2 py-0.5 text-xs font-semibold">
                    <Zap className="h-3 w-3 mr-0.5" />
                    {savingsGoals.length}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 font-medium">{t.savings}</p>
                <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">{formatCurrency(totalSavingsCurrent)}</p>
                <div className="h-1.5 w-full bg-violet-100 dark:bg-violet-950 rounded-full overflow-hidden">
                  <div className="h-full w-3/4 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full shadow-lg shadow-violet-500/50"></div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg flex items-center text-slate-900 dark:text-white">
                <Zap className="mr-2 h-5 w-5 text-emerald-600" />
                {t.quickAdd}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                <Dialog open={expenseDialogOpen} onOpenChange={setExpenseDialogOpen}>
                  <DialogTrigger asChild>
                    <button className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 p-6 text-left shadow-lg shadow-rose-500/30 hover:shadow-2xl hover:shadow-rose-500/40 transition-all duration-300 hover:scale-105">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <Receipt className="h-8 w-8 text-white mb-3 group-hover:scale-110 transition-transform" />
                      <p className="text-sm font-bold text-white">{t.addExpense}</p>
                      <p className="text-xs text-white/80 mt-1">Registra gastos</p>
                    </button>
                  </DialogTrigger>
                  <DialogContent className="bg-white border-slate-200 sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-slate-900">{t.addExpense}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <label className="text-sm text-slate-600 mb-2 block font-medium">Monto (HNL)</label>
                        <Input className="bg-slate-50 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500" placeholder="0.00" type="number" />
                      </div>
                      <div>
                        <label className="text-sm text-slate-600 mb-2 block font-medium">Descripción</label>
                        <Input className="bg-slate-50 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500" placeholder="Ej: Almuerzo" />
                      </div>
                      <div>
                        <label className="text-sm text-slate-600 mb-2 block font-medium">Categoría</label>
                        <select className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none">
                          <option>🍽️ Comida</option>
                          <option>🚗 Transporte</option>
                          <option>🏠 Servicios</option>
                          <option>🎬 Entretenimiento</option>
                          <option>🛍️ Compras</option>
                          <option>⚕️ Salud</option>
                          <option>📚 Educación</option>
                          <option>📦 Otro</option>
                        </select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/30 text-white border-0">
                        Guardar Gasto
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
                      <p className="text-xs text-white/80 mt-1">Registra ingresos</p>
                    </button>
                  </DialogTrigger>
                  <DialogContent className="bg-white border-slate-200 sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-slate-900">{t.addIncome}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <label className="text-sm text-slate-600 mb-2 block font-medium">Monto (HNL)</label>
                        <Input className="bg-slate-50 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500" placeholder="0.00" type="number" />
                      </div>
                      <div>
                        <label className="text-sm text-slate-600 mb-2 block font-medium">Fuente</label>
                        <Input className="bg-slate-50 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500" placeholder="Ej: Salario, Freelance" />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/30 text-white border-0">
                        Guardar Ingreso
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
                      <p className="text-xs text-white/80 mt-1">Define objetivos</p>
                    </button>
                  </DialogTrigger>
                  <DialogContent className="bg-white border-slate-200 sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-slate-900">{t.createGoal}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <label className="text-sm text-slate-600 mb-2 block font-medium">Nombre de la meta</label>
                        <Input className="bg-slate-50 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500" placeholder="Ej: Vacaciones, Auto" />
                      </div>
                      <div>
                        <label className="text-sm text-slate-600 mb-2 block font-medium">Monto Objetivo (HNL)</label>
                        <Input className="bg-slate-50 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500" placeholder="0.00" type="number" />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 shadow-lg shadow-violet-500/30 text-white border-0">
                        Crear Meta
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
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
              <CardHeader className="border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base sm:text-lg flex items-center text-slate-900 dark:text-white">
                    <Sparkles className="mr-2 h-5 w-5 text-emerald-600" />
                    {t.recentActivity}
                  </CardTitle>
                  <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg">
                    <Eye className="h-4 w-4 mr-1" />
                    Ver todos
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                {expenses.map((expense) => (
                  <div 
                    key={expense.id} 
                    className="flex items-center justify-between p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 hover:bg-slate-100/70 dark:hover:bg-slate-800/80 transition-all duration-300 group border border-slate-200/50 dark:border-slate-700/50 hover:border-emerald-200 dark:hover:border-emerald-900 hover:shadow-md"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center text-2xl shadow-sm group-hover:scale-110 group-hover:shadow-md transition-all">
                        {categoryIcons[expense.category]}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white text-sm">{expense.description}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center mt-0.5">
                          <Calendar className="h-3 w-3 mr-1" />
                          {expense.date}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-rose-600 dark:text-rose-400 text-sm">-{formatCurrency(expense.amount)}</p>
                      <Badge className="bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-400 border-0 text-xs mt-1">
                        Gasto
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Savings Goals */}
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
              <CardHeader className="border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base sm:text-lg flex items-center text-slate-900 dark:text-white">
                    <Target className="mr-2 h-5 w-5 text-violet-600" />
                    {t.savingsGoals}
                  </CardTitle>
                  <Button variant="ghost" size="sm" className="text-violet-600 hover:text-violet-700 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/30 rounded-lg">
                    <Eye className="h-4 w-4 mr-1" />
                    Ver todas
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {savingsGoals.map((goal) => (
                  <div 
                    key={goal.id} 
                    className="p-4 rounded-xl bg-gradient-to-br from-violet-50/70 to-purple-50/70 dark:from-violet-950/20 dark:to-purple-950/20 hover:from-violet-100/70 hover:to-purple-100/70 dark:hover:from-violet-950/40 dark:hover:to-purple-950/40 border border-violet-200/50 dark:border-violet-800/50 hover:border-violet-300 dark:hover:border-violet-700 transition-all duration-300 group hover:shadow-lg"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30 group-hover:scale-110 transition-transform">
                          <Target className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white text-sm">{goal.name}</p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-violet-200 dark:bg-violet-900/50 text-violet-900 dark:text-violet-300 border-0 font-bold">
                        {goal.progress.toFixed(0)}%
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <Progress value={goal.progress} className="h-2.5 bg-violet-200/50 dark:bg-violet-900/30" />
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 dark:text-slate-400 flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {goal.deadline}
                        </span>
                        <span className="text-violet-700 dark:text-violet-400 font-semibold">
                          {formatCurrency(goal.targetAmount - goal.currentAmount)} restante
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
                      {language === "es" 
                        ? "💰 Estás ahorrando 15% más que el mes pasado. ¡Excelente progreso! 🚗 Tus gastos en transporte aumentaron 8%. Considera usar transporte público."
                        : "💰 You're saving 15% more than last month. Excellent progress! 🚗 Your transport expenses increased by 8%. Consider using public transport."}
                    </p>
                  </div>
                </div>
                <Button className="bg-white text-emerald-600 hover:bg-white/90 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 font-semibold whitespace-nowrap border-0">
                  Ver Análisis
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}