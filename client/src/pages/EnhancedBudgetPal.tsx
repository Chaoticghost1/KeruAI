import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { PieChart, Target, TrendingUp, Plus, Wallet, DollarSign, Receipt, Calendar } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/currency-formatter';


// Form schemas
const expenseSchema = z.object({
  amount: z.string().min(1, 'Amount is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.string().min(1, 'Category is required'),
  date: z.string().min(1, 'Date is required')
});

const savingsGoalSchema = z.object({
  name: z.string().min(1, 'Goal name is required'),
  targetAmount: z.string().min(1, 'Target amount is required'),
  currentAmount: z.string().min(0),
  deadline: z.string().min(1, 'Deadline is required')
});

const incomeSchema = z.object({
  amount: z.string().min(1, 'Amount is required'),
  source: z.string().min(1, 'Source is required'),
  date: z.string().min(1, 'Date is required'),
  frequency: z.string().min(1, 'Frequency is required')
});

type ExpenseFormData = z.infer<typeof expenseSchema>;
type SavingsGoalFormData = z.infer<typeof savingsGoalSchema>;
type IncomeFormData = z.infer<typeof incomeSchema>;

interface Expense {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
}

interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  progress: number;
}

interface Income {
  id: string;
  amount: number;
  source: string;
  date: string;
  frequency: string;
}

export default function EnhancedBudgetPal() {
  const { t } = useLanguage();
  const { toast } = useToast();
  
  // Honduras-first: Use proper currency formatting
  const formatHondurasCurrency = (amount: number) => formatCurrency(amount, 'HNL', t.language);
  
  // State for storing budget data
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [income, setIncome] = useState<Income[]>([]);
  
  // Dialog states
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [savingsDialogOpen, setSavingsDialogOpen] = useState(false);
  const [incomeDialogOpen, setIncomeDialogOpen] = useState(false);
  
  // Forms
  const expenseForm = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      amount: '',
      description: '',
      category: '',
      date: new Date().toISOString().split('T')[0]
    }
  });
  
  const savingsForm = useForm<SavingsGoalFormData>({
    resolver: zodResolver(savingsGoalSchema),
    defaultValues: {
      name: '',
      targetAmount: '',
      currentAmount: '0',
      deadline: ''
    }
  });
  
  const incomeForm = useForm<IncomeFormData>({
    resolver: zodResolver(incomeSchema),
    defaultValues: {
      amount: '',
      source: '',
      date: new Date().toISOString().split('T')[0],
      frequency: ''
    }
  });
  
  // Submit handlers
  const onExpenseSubmit = (data: ExpenseFormData) => {
    const newExpense: Expense = {
      id: Date.now().toString(),
      amount: parseFloat(data.amount),
      description: data.description,
      category: data.category,
      date: data.date
    };
    setExpenses(prev => [newExpense, ...prev]);
    setExpenseDialogOpen(false);
    expenseForm.reset();
    toast({
      title: t.language === 'es' ? 'Gasto agregado' : 'Expense added',
      description: t.language === 'es' ? 'Tu gasto ha sido registrado exitosamente' : 'Your expense has been recorded successfully'
    });
  };
  
  const onSavingsSubmit = (data: SavingsGoalFormData) => {
    const currentAmount = parseFloat(data.currentAmount);
    const targetAmount = parseFloat(data.targetAmount);
    const newGoal: SavingsGoal = {
      id: Date.now().toString(),
      name: data.name,
      targetAmount,
      currentAmount,
      deadline: data.deadline,
      progress: (currentAmount / targetAmount) * 100
    };
    setSavingsGoals(prev => [newGoal, ...prev]);
    setSavingsDialogOpen(false);
    savingsForm.reset();
    toast({
      title: t.language === 'es' ? 'Meta de ahorro creada' : 'Savings goal created',
      description: t.language === 'es' ? 'Tu meta de ahorro ha sido establecida' : 'Your savings goal has been set'
    });
  };
  
  const onIncomeSubmit = (data: IncomeFormData) => {
    const newIncome: Income = {
      id: Date.now().toString(),
      amount: parseFloat(data.amount),
      source: data.source,
      date: data.date,
      frequency: data.frequency
    };
    setIncome(prev => [newIncome, ...prev]);
    setIncomeDialogOpen(false);
    incomeForm.reset();
    toast({
      title: t.language === 'es' ? 'Ingreso agregado' : 'Income added',
      description: t.language === 'es' ? 'Tu ingreso ha sido registrado exitosamente' : 'Your income has been recorded successfully'
    });
  };
  
  // Calculate totals
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalIncome = income.reduce((sum, inc) => sum + inc.amount, 0);
  const totalSavingsTarget = savingsGoals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const totalSavingsCurrent = savingsGoals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const remainingBudget = totalIncome - totalExpenses;
  
  // Expense categories for the dropdown
  const expenseCategories = [
    { value: 'food', label: t.language === 'es' ? 'Comida' : 'Food' },
    { value: 'transport', label: t.language === 'es' ? 'Transporte' : 'Transport' },
    { value: 'utilities', label: t.language === 'es' ? 'Servicios' : 'Utilities' },
    { value: 'entertainment', label: t.language === 'es' ? 'Entretenimiento' : 'Entertainment' },
    { value: 'shopping', label: t.language === 'es' ? 'Compras' : 'Shopping' },
    { value: 'healthcare', label: t.language === 'es' ? 'Salud' : 'Healthcare' },
    { value: 'education', label: t.language === 'es' ? 'Educación' : 'Education' },
    { value: 'other', label: t.language === 'es' ? 'Otro' : 'Other' }
  ];
  
  const incomeFrequencies = [
    { value: 'daily', label: t.language === 'es' ? 'Diario' : 'Daily' },
    { value: 'weekly', label: t.language === 'es' ? 'Semanal' : 'Weekly' },
    { value: 'monthly', label: t.language === 'es' ? 'Mensual' : 'Monthly' },
    { value: 'one-time', label: t.language === 'es' ? 'Una vez' : 'One-time' }
  ];



  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            {t.budgetpal.title}
          </h1>
          <p className="text-xl text-slate-600">
            {t.budgetpal.description}
          </p>
        </div>

        <div className="space-y-6">

          {/* Budget Dashboard */}
          <div className="space-y-6">
            {/* Budget Overview Cards */}
            <div className="grid md:grid-cols-4 gap-4 mb-8">
              <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-emerald-100 text-sm">
                        {t.language === 'es' ? 'Ingresos Totales' : 'Total Income'}
                      </p>
                      <p className="text-2xl font-bold">{formatHondurasCurrency(totalIncome)}</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-emerald-200" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-red-100 text-sm">
                        {t.language === 'es' ? 'Gastos Totales' : 'Total Expenses'}
                      </p>
                      <p className="text-2xl font-bold">{formatHondurasCurrency(totalExpenses)}</p>
                    </div>
                    <Receipt className="h-8 w-8 text-red-200" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">
                        {t.language === 'es' ? 'Presupuesto Restante' : 'Remaining Budget'}
                      </p>
                      <p className={`text-2xl font-bold ${remainingBudget < 0 ? 'text-red-200' : 'text-white'}`}>
                        {formatHondurasCurrency(remainingBudget)}
                      </p>
                    </div>
                    <Wallet className="h-8 w-8 text-blue-200" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm">
                        {t.language === 'es' ? 'Ahorros Actuales' : 'Current Savings'}
                      </p>
                      <p className="text-2xl font-bold">{formatHondurasCurrency(totalSavingsCurrent)}</p>
                    </div>
                    <Target className="h-8 w-8 text-green-200" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Action Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card className="card-hover" data-testid="card-expenses">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <PieChart className="mr-3 text-emerald-600" />
                      {t.language === 'es' ? 'Gastos' : 'Expenses'}
                    </div>
                    <Badge variant="secondary">{expenses.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 mb-4">
                    {t.language === 'es' 
                      ? 'Rastrea y categoriza todos tus gastos diarios automáticamente.'
                      : 'Track and categorize all your daily expenses automatically.'
                    }
                  </p>
                  <div className="space-y-2">
                    <Dialog open={expenseDialogOpen} onOpenChange={setExpenseDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="w-full" data-testid="button-add-expense">
                          <Plus className="mr-2 h-4 w-4" />
                          {t.language === 'es' ? 'Agregar Gasto' : 'Add Expense'}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>
                            {t.language === 'es' ? 'Agregar Nuevo Gasto' : 'Add New Expense'}
                          </DialogTitle>
                        </DialogHeader>
                        <Form {...expenseForm}>
                          <form onSubmit={expenseForm.handleSubmit(onExpenseSubmit)} className="space-y-4">
                            <FormField
                              control={expenseForm.control}
                              name="amount"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t.language === 'es' ? 'Monto' : 'Amount'}</FormLabel>
                                  <FormControl>
                                    <Input placeholder="0.00" type="number" step="0.01" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={expenseForm.control}
                              name="description"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t.language === 'es' ? 'Descripción' : 'Description'}</FormLabel>
                                  <FormControl>
                                    <Input placeholder={t.language === 'es' ? 'Ej: Almuerzo' : 'e.g. Lunch'} {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={expenseForm.control}
                              name="category"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t.language === 'es' ? 'Categoría' : 'Category'}</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder={t.language === 'es' ? 'Selecciona una categoría' : 'Select a category'} />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {expenseCategories.map((category) => (
                                        <SelectItem key={category.value} value={category.value}>
                                          {category.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={expenseForm.control}
                              name="date"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t.language === 'es' ? 'Fecha' : 'Date'}</FormLabel>
                                  <FormControl>
                                    <Input type="date" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <DialogFooter>
                              <Button type="submit">
                                {t.language === 'es' ? 'Guardar Gasto' : 'Save Expense'}
                              </Button>
                            </DialogFooter>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                    
                    {expenses.length > 0 && (
                      <Button variant="outline" className="w-full" data-testid="button-view-expenses">
                        {t.language === 'es' ? 'Ver Todos los Gastos' : 'View All Expenses'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="card-hover" data-testid="card-savings">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Target className="mr-3 text-green-600" />
                      {t.language === 'es' ? 'Ahorros' : 'Savings'}
                    </div>
                    <Badge variant="secondary">{savingsGoals.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 mb-4">
                    {t.language === 'es' 
                      ? 'Establece metas de ahorro y sigue tu progreso mes a mes.'
                      : 'Set savings goals and track your progress month by month.'
                    }
                  </p>
                  <div className="space-y-2">
                    <Dialog open={savingsDialogOpen} onOpenChange={setSavingsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="w-full" data-testid="button-create-goal">
                          <Plus className="mr-2 h-4 w-4" />
                          {t.language === 'es' ? 'Nueva Meta' : 'New Goal'}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>
                            {t.language === 'es' ? 'Crear Meta de Ahorro' : 'Create Savings Goal'}
                          </DialogTitle>
                        </DialogHeader>
                        <Form {...savingsForm}>
                          <form onSubmit={savingsForm.handleSubmit(onSavingsSubmit)} className="space-y-4">
                            <FormField
                              control={savingsForm.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t.language === 'es' ? 'Nombre de la Meta' : 'Goal Name'}</FormLabel>
                                  <FormControl>
                                    <Input placeholder={t.language === 'es' ? 'Ej: Vacaciones' : 'e.g. Vacation'} {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={savingsForm.control}
                              name="targetAmount"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t.language === 'es' ? 'Monto Objetivo' : 'Target Amount'}</FormLabel>
                                  <FormControl>
                                    <Input placeholder="1000.00" type="number" step="0.01" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={savingsForm.control}
                              name="currentAmount"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t.language === 'es' ? 'Monto Actual' : 'Current Amount'}</FormLabel>
                                  <FormControl>
                                    <Input placeholder="0.00" type="number" step="0.01" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={savingsForm.control}
                              name="deadline"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t.language === 'es' ? 'Fecha Límite' : 'Deadline'}</FormLabel>
                                  <FormControl>
                                    <Input type="date" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <DialogFooter>
                              <Button type="submit">
                                {t.language === 'es' ? 'Crear Meta' : 'Create Goal'}
                              </Button>
                            </DialogFooter>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                    
                    {savingsGoals.length > 0 && (
                      <Button variant="outline" className="w-full" data-testid="button-my-goals">
                        {t.language === 'es' ? 'Ver Mis Metas' : 'View My Goals'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="card-hover" data-testid="card-income">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <TrendingUp className="mr-3 text-blue-600" />
                      {t.language === 'es' ? 'Ingresos' : 'Income'}
                    </div>
                    <Badge variant="secondary">{income.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 mb-4">
                    {t.language === 'es' 
                      ? 'Registra tus ingresos variables y mantén control total.'
                      : 'Record your variable income and maintain total control.'
                    }
                  </p>
                  <div className="space-y-2">
                    <Dialog open={incomeDialogOpen} onOpenChange={setIncomeDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="w-full" data-testid="button-add-income">
                          <Plus className="mr-2 h-4 w-4" />
                          {t.language === 'es' ? 'Agregar Ingreso' : 'Add Income'}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>
                            {t.language === 'es' ? 'Agregar Nuevo Ingreso' : 'Add New Income'}
                          </DialogTitle>
                        </DialogHeader>
                        <Form {...incomeForm}>
                          <form onSubmit={incomeForm.handleSubmit(onIncomeSubmit)} className="space-y-4">
                            <FormField
                              control={incomeForm.control}
                              name="amount"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t.language === 'es' ? 'Monto' : 'Amount'}</FormLabel>
                                  <FormControl>
                                    <Input placeholder="0.00" type="number" step="0.01" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={incomeForm.control}
                              name="source"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t.language === 'es' ? 'Fuente' : 'Source'}</FormLabel>
                                  <FormControl>
                                    <Input placeholder={t.language === 'es' ? 'Ej: Trabajo, Freelance' : 'e.g. Job, Freelance'} {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={incomeForm.control}
                              name="frequency"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t.language === 'es' ? 'Frecuencia' : 'Frequency'}</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder={t.language === 'es' ? 'Selecciona frecuencia' : 'Select frequency'} />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {incomeFrequencies.map((freq) => (
                                        <SelectItem key={freq.value} value={freq.value}>
                                          {freq.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={incomeForm.control}
                              name="date"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t.language === 'es' ? 'Fecha' : 'Date'}</FormLabel>
                                  <FormControl>
                                    <Input type="date" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <DialogFooter>
                              <Button type="submit">
                                {t.language === 'es' ? 'Guardar Ingreso' : 'Save Income'}
                              </Button>
                            </DialogFooter>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                    
                    {income.length > 0 && (
                      <Button variant="outline" className="w-full">
                        {t.language === 'es' ? 'Ver Todos los Ingresos' : 'View All Income'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity and Savings Progress */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Recent Expenses */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Receipt className="mr-2 h-5 w-5" />
                    {t.language === 'es' ? 'Gastos Recientes' : 'Recent Expenses'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {expenses.length > 0 ? (
                    <div className="space-y-3">
                      {expenses.slice(0, 3).map((expense) => (
                        <div key={expense.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div>
                            <p className="font-medium">{expense.description}</p>
                            <p className="text-sm text-slate-500">
                              {expenseCategories.find(cat => cat.value === expense.category)?.label} • {expense.date}
                            </p>
                          </div>
                          <Badge variant="destructive">{formatHondurasCurrency(expense.amount)}</Badge>
                        </div>
                      ))}
                      {expenses.length > 3 && (
                        <p className="text-sm text-slate-500 text-center">
                          {t.language === 'es' ? 'y' : 'and'} {expenses.length - 3} {t.language === 'es' ? 'más...' : 'more...'}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-slate-500">
                      <Receipt className="mx-auto h-12 w-12 mb-4 text-slate-300" />
                      <p>{t.language === 'es' ? 'No hay gastos registrados' : 'No expenses recorded'}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Savings Goals Progress */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="mr-2 h-5 w-5" />
                    {t.language === 'es' ? 'Progreso de Metas' : 'Goals Progress'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {savingsGoals.length > 0 ? (
                    <div className="space-y-4">
                      {savingsGoals.slice(0, 3).map((goal) => (
                        <div key={goal.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{goal.name}</span>
                            <span className="text-sm text-slate-500">
                              {formatHondurasCurrency(goal.currentAmount)} / {formatHondurasCurrency(goal.targetAmount)}
                            </span>
                          </div>
                          <Progress value={goal.progress} className="h-2" />
                          <p className="text-xs text-slate-500">
                            {goal.progress.toFixed(1)}% {t.language === 'es' ? 'completado' : 'complete'}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-slate-500">
                      <Target className="mx-auto h-12 w-12 mb-4 text-slate-300" />
                      <p>{t.language === 'es' ? 'No hay metas de ahorro' : 'No savings goals set'}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Call to Action */}
            <Card className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
              <CardContent className="p-8 text-center">
                <h2 className="text-2xl font-bold mb-4">
                  {t.language === 'es' ? '¡Toma Control de tu Dinero!' : 'Take Control of Your Money!'}
                </h2>
                <p className="mb-6">
                  {t.language === 'es' 
                    ? 'Comienza a administrar tus finanzas de manera inteligente y alcanza tus metas económicas.'
                    : 'Start managing your finances intelligently and reach your economic goals.'
                  }
                </p>
                <div className="flex justify-center gap-4">
                  <Button size="lg" variant="secondary" onClick={() => setExpenseDialogOpen(true)} data-testid="button-get-started">
                    <Plus className="mr-2 h-4 w-4" />
                    {t.language === 'es' ? 'Agregar Primer Gasto' : 'Add First Expense'}
                  </Button>
                  <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-emerald-600" onClick={() => setSavingsDialogOpen(true)}>
                    <Target className="mr-2 h-4 w-4" />
                    {t.language === 'es' ? 'Crear Meta' : 'Create Goal'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}