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
  PieChart,
  Target,
  TrendingUp,
  Plus,
  Wallet,
  DollarSign,
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Calendar,
  Filter,
  Download,
  Settings,
  Bell,
  ChevronRight,
  Zap,
} from "lucide-react";

export default function PremiumBudgetPal() {
  const [language, setLanguage] = useState("es");
  const [expenses, setExpenses] = useState([
    { id: "1", amount: 450, description: "Supermercado", category: "food", date: "2026-01-08" },
    { id: "2", amount: 200, description: "Gasolina", category: "transport", date: "2026-01-07" },
    { id: "3", amount: 850, description: "Renta", category: "utilities", date: "2026-01-05" },
  ]);
  const [savingsGoals, setSavingsGoals] = useState([
    { id: "1", name: "Vacaciones 2026", targetAmount: 15000, currentAmount: 8500, deadline: "2026-12-01", progress: 56.67 },
    { id: "2", name: "Fondo Emergencia", targetAmount: 20000, currentAmount: 12000, deadline: "2026-06-01", progress: 60 },
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-HN', { style: 'currency', currency: 'HNL' }).format(amount);
  };

  const t = {
    title: language === "es" ? "BudgetPal Premium" : "BudgetPal Premium",
    subtitle: language === "es" ? "Tu asistente financiero inteligente" : "Your intelligent financial assistant",
    totalIncome: language === "es" ? "Ingresos Totales" : "Total Income",
    totalExpenses: language === "es" ? "Gastos Totales" : "Total Expenses",
    remaining: language === "es" ? "Disponible" : "Available",
    savings: language === "es" ? "Ahorros" : "Savings",
    recentActivity: language === "es" ? "Actividad Reciente" : "Recent Activity",
    savingsGoals: language === "es" ? "Metas de Ahorro" : "Savings Goals",
    insights: language === "es" ? "Insights Financieros" : "Financial Insights",
    addExpense: language === "es" ? "Nuevo Gasto" : "New Expense",
    addIncome: language === "es" ? "Nuevo Ingreso" : "New Income",
    createGoal: language === "es" ? "Nueva Meta" : "New Goal",
  };

  const categoryIcons = {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
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
          {/* Hero Stats */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border-emerald-500/30 backdrop-blur-xl overflow-hidden group hover:scale-105 transition-transform duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardContent className="p-6 relative">
                <div className="flex items-start justify-between mb-4">
                  <div className="h-12 w-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-emerald-400" />
                  </div>
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    +12%
                  </Badge>
                </div>
                <p className="text-sm text-emerald-300/80 mb-1">{t.totalIncome}</p>
                <p className="text-3xl font-bold text-white mb-2">{formatCurrency(totalIncome)}</p>
                <div className="h-1 w-full bg-emerald-500/20 rounded-full overflow-hidden">
                  <div className="h-full w-3/4 bg-gradient-to-r from-emerald-400 to-teal-400 animate-pulse"></div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-500/20 to-red-600/20 border-red-500/30 backdrop-blur-xl overflow-hidden group hover:scale-105 transition-transform duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-red-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardContent className="p-6 relative">
                <div className="flex items-start justify-between mb-4">
                  <div className="h-12 w-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                    <Receipt className="h-6 w-6 text-red-400" />
                  </div>
                  <Badge className="bg-red-500/20 text-red-300 border-red-500/30">
                    <ArrowDownRight className="h-3 w-3 mr-1" />
                    -{Math.round((totalExpenses/totalIncome)*100)}%
                  </Badge>
                </div>
                <p className="text-sm text-red-300/80 mb-1">{t.totalExpenses}</p>
                <p className="text-3xl font-bold text-white mb-2">{formatCurrency(totalExpenses)}</p>
                <div className="h-1 w-full bg-red-500/20 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-red-400 to-orange-400 animate-pulse" style={{width: `${(totalExpenses/totalIncome)*100}%`}}></div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-500/30 backdrop-blur-xl overflow-hidden group hover:scale-105 transition-transform duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardContent className="p-6 relative">
                <div className="flex items-start justify-between mb-4">
                  <div className="h-12 w-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <Wallet className="h-6 w-6 text-blue-400" />
                  </div>
                  <Badge className={`${remainingBudget > 0 ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' : 'bg-red-500/20 text-red-300 border-red-500/30'}`}>
                    {remainingBudget > 0 ? '+' : ''}{Math.round((remainingBudget/totalIncome)*100)}%
                  </Badge>
                </div>
                <p className="text-sm text-blue-300/80 mb-1">{t.remaining}</p>
                <p className="text-3xl font-bold text-white mb-2">{formatCurrency(remainingBudget)}</p>
                <div className="h-1 w-full bg-blue-500/20 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 animate-pulse" style={{width: `${(remainingBudget/totalIncome)*100}%`}}></div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-purple-500/30 backdrop-blur-xl overflow-hidden group hover:scale-105 transition-transform duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardContent className="p-6 relative">
                <div className="flex items-start justify-between mb-4">
                  <div className="h-12 w-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                    <Target className="h-6 w-6 text-purple-400" />
                  </div>
                  <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                    <Zap className="h-3 w-3 mr-1" />
                    {savingsGoals.length}
                  </Badge>
                </div>
                <p className="text-sm text-purple-300/80 mb-1">{t.savings}</p>
                <p className="text-3xl font-bold text-white mb-2">{formatCurrency(totalSavingsCurrent)}</p>
                <div className="h-1 w-full bg-purple-500/20 rounded-full overflow-hidden">
                  <div className="h-full w-2/3 bg-gradient-to-r from-purple-400 to-pink-400 animate-pulse"></div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
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
                          <p className="text-sm text-slate-400">Registra gastos rápido</p>
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
                    <label className="text-sm text-slate-400 mb-2 block">Monto</label>
                    <Input className="bg-slate-800 border-slate-700" placeholder="0.00" type="number" />
                  </div>
                  <div>
                    <label className="text-sm text-slate-400 mb-2 block">Descripción</label>
                    <Input className="bg-slate-800 border-slate-700" placeholder="Ej: Almuerzo" />
                  </div>
                  <div>
                    <label className="text-sm text-slate-400 mb-2 block">Categoría</label>
                    <select className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2">
                      <option>Comida</option>
                      <option>Transporte</option>
                      <option>Servicios</option>
                      <option>Entretenimiento</option>
                    </select>
                  </div>
                </div>
                <DialogFooter>
                  <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600">
                    Guardar Gasto
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={incomeDialogOpen} onOpenChange={setIncomeDialogOpen}>
              <DialogTrigger asChild>
                <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50 backdrop-blur-xl cursor-pointer hover:scale-105 transition-all duration-300 hover:border-emerald-500/50 group">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <TrendingUp className="h-7 w-7 text-white" />
                        </div>
                        <div>
                          <p className="text-lg font-semibold">{t.addIncome}</p>
                          <p className="text-sm text-slate-400">Registra tus ingresos</p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-emerald-400 transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent className="bg-slate-900 border-slate-700 text-white">
                <DialogHeader>
                  <DialogTitle>{t.addIncome}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <label className="text-sm text-slate-400 mb-2 block">Monto</label>
                    <Input className="bg-slate-800 border-slate-700" placeholder="0.00" type="number" />
                  </div>
                  <div>
                    <label className="text-sm text-slate-400 mb-2 block">Fuente</label>
                    <Input className="bg-slate-800 border-slate-700" placeholder="Ej: Salario" />
                  </div>
                </div>
                <DialogFooter>
                  <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600">
                    Guardar Ingreso
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={savingsDialogOpen} onOpenChange={setSavingsDialogOpen}>
              <DialogTrigger asChild>
                <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50 backdrop-blur-xl cursor-pointer hover:scale-105 transition-all duration-300 hover:border-emerald-500/50 group">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Target className="h-7 w-7 text-white" />
                        </div>
                        <div>
                          <p className="text-lg font-semibold">{t.createGoal}</p>
                          <p className="text-sm text-slate-400">Define tus objetivos</p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-emerald-400 transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent className="bg-slate-900 border-slate-700 text-white">
                <DialogHeader>
                  <DialogTitle>{t.createGoal}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <label className="text-sm text-slate-400 mb-2 block">Nombre</label>
                    <Input className="bg-slate-800 border-slate-700" placeholder="Ej: Vacaciones" />
                  </div>
                  <div>
                    <label className="text-sm text-slate-400 mb-2 block">Monto Objetivo</label>
                    <Input className="bg-slate-800 border-slate-700" placeholder="0.00" type="number" />
                  </div>
                </div>
                <DialogFooter>
                  <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                    Crear Meta
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Main Content Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Recent Activity */}
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Sparkles className="mr-2 h-5 w-5 text-emerald-400" />
                    {t.recentActivity}
                  </CardTitle>
                  <Button variant="ghost" size="sm" className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10">
                    Ver todos
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {expenses.slice(0, 5).map((expense, index) => (
                  <div 
                    key={expense.id} 
                    className="flex items-center justify-between p-4 rounded-xl bg-slate-900/50 hover:bg-slate-900/80 transition-all duration-300 group border border-slate-700/30 hover:border-emerald-500/30"
                    style={{animationDelay: `${index * 100}ms`}}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                        {categoryIcons[expense.category]}
                      </div>
                      <div>
                        <p className="font-medium">{expense.description}</p>
                        <p className="text-sm text-slate-400">{expense.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-400">-{formatCurrency(expense.amount)}</p>
                      <Badge className="bg-red-500/20 text-red-300 border-red-500/30 text-xs">
                        Gasto
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Savings Goals */}
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Target className="mr-2 h-5 w-5 text-purple-400" />
                    {t.savingsGoals}
                  </CardTitle>
                  <Button variant="ghost" size="sm" className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10">
                    Ver todas
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                {savingsGoals.map((goal, index) => (
                  <div 
                    key={goal.id} 
                    className="p-5 rounded-xl bg-gradient-to-br from-slate-900/80 to-slate-900/50 border border-slate-700/50 hover:border-purple-500/50 transition-all duration-300 group"
                    style={{animationDelay: `${index * 100}ms`}}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Target className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold">{goal.name}</p>
                          <p className="text-sm text-slate-400">
                            {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                        {goal.progress.toFixed(0)}%
                      </Badge>
                    </div>
                    <Progress value={goal.progress} className="h-3 bg-slate-700/50">
                      <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500" style={{width: `${goal.progress}%`}}></div>
                    </Progress>
                    <p className="text-xs text-slate-400 mt-2">
                      <Calendar className="h-3 w-3 inline mr-1" />
                      Meta: {goal.deadline}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* AI Insights Banner */}
          <Card className="bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20 border-emerald-500/30 backdrop-blur-xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/10 via-teal-400/10 to-cyan-400/10 animate-pulse"></div>
            <CardContent className="p-8 relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center animate-pulse">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2">{t.insights}</h3>
                    <p className="text-slate-300 max-w-2xl">
                      {language === "es" 
                        ? "Estás ahorrando 15% más que el mes pasado. ¡Sigue así! Tus gastos en transporte aumentaron 8%."
                        : "You're saving 15% more than last month. Keep it up! Your transport expenses increased by 8%."}
                    </p>
                  </div>
                </div>
                <Button className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg shadow-emerald-500/50">
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