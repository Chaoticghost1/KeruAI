import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function BudgetPal() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            {t.budgetpal.title}
          </h1>
          <p className="text-xl text-slate-600">
            {t.budgetpal.description}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="flex items-center">
                <i className="fas fa-chart-pie mr-3 text-emerald-600"></i>
                {t.language === 'es' ? 'Gastos' : 'Expenses'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 mb-4">
                {t.language === 'es' 
                  ? 'Rastrea y categoriza todos tus gastos diarios automáticamente.'
                  : 'Track and categorize all your daily expenses automatically.'
                }
              </p>
              <Button className="w-full">
                {t.language === 'es' ? 'Ver Gastos' : 'View Expenses'}
              </Button>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="flex items-center">
                <i className="fas fa-piggy-bank mr-3 text-green-600"></i>
                {t.language === 'es' ? 'Ahorros' : 'Savings'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 mb-4">
                {t.language === 'es' 
                  ? 'Establece metas de ahorro y sigue tu progreso mes a mes.'
                  : 'Set savings goals and track your progress month by month.'
                }
              </p>
              <Button className="w-full" variant="outline">
                {t.language === 'es' ? 'Mis Metas' : 'My Goals'}
              </Button>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="flex items-center">
                <i className="fas fa-chart-line mr-3 text-blue-600"></i>
                {t.language === 'es' ? 'Ingresos' : 'Income'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 mb-4">
                {t.language === 'es' 
                  ? 'Registra tus ingresos variables y mantén control total.'
                  : 'Record your variable income and maintain total control.'
                }
              </p>
              <Button className="w-full" variant="outline">
                {t.language === 'es' ? 'Agregar Ingreso' : 'Add Income'}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="flex items-center">
                <i className="fas fa-mobile-alt mr-3 text-purple-600"></i>
                {t.language === 'es' ? 'Para Trabajadores Informales' : 'For Informal Workers'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-slate-600">
                <li className="flex items-center">
                  <i className="fas fa-check text-green-600 mr-2"></i>
                  {t.language === 'es' ? 'Ingresos variables' : 'Variable income'}
                </li>
                <li className="flex items-center">
                  <i className="fas fa-check text-green-600 mr-2"></i>
                  {t.language === 'es' ? 'Sin cuenta bancaria requerida' : 'No bank account required'}
                </li>
                <li className="flex items-center">
                  <i className="fas fa-check text-green-600 mr-2"></i>
                  {t.language === 'es' ? 'Manejo de efectivo' : 'Cash management'}
                </li>
                <li className="flex items-center">
                  <i className="fas fa-check text-green-600 mr-2"></i>
                  {t.language === 'es' ? 'Recordatorios inteligentes' : 'Smart reminders'}
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="flex items-center">
                <i className="fas fa-users mr-3 text-orange-600"></i>
                {t.language === 'es' ? 'Para Jóvenes' : 'For Young Adults'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-slate-600">
                <li className="flex items-center">
                  <i className="fas fa-check text-green-600 mr-2"></i>
                  {t.language === 'es' ? 'Educación financiera' : 'Financial education'}
                </li>
                <li className="flex items-center">
                  <i className="fas fa-check text-green-600 mr-2"></i>
                  {t.language === 'es' ? 'Metas de ahorro' : 'Savings goals'}
                </li>
                <li className="flex items-center">
                  <i className="fas fa-check text-green-600 mr-2"></i>
                  {t.language === 'es' ? 'Presupuesto semanal' : 'Weekly budgets'}
                </li>
                <li className="flex items-center">
                  <i className="fas fa-check text-green-600 mr-2"></i>
                  {t.language === 'es' ? 'Consejos personalizados' : 'Personalized tips'}
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

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
            <Button size="lg" variant="secondary">
              {t.budgetpal.cta}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
