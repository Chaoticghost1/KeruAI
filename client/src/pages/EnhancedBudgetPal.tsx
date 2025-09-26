import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { PieChart, Target, TrendingUp } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';


export default function EnhancedBudgetPal() {
  const { t } = useLanguage();



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
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card className="card-hover" data-testid="card-expenses">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChart className="mr-3 text-emerald-600" />
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
                  <Button className="w-full" data-testid="button-view-expenses">
                    {t.language === 'es' ? 'Ver Gastos' : 'View Expenses'}
                  </Button>
                </CardContent>
              </Card>

              <Card className="card-hover" data-testid="card-savings">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="mr-3 text-green-600" />
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
                  <Button className="w-full" variant="outline" data-testid="button-my-goals">
                    {t.language === 'es' ? 'Mis Metas' : 'My Goals'}
                  </Button>
                </CardContent>
              </Card>

              <Card className="card-hover" data-testid="card-income">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="mr-3 text-blue-600" />
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
                  <Button className="w-full" variant="outline" data-testid="button-add-income">
                    {t.language === 'es' ? 'Agregar Ingreso' : 'Add Income'}
                  </Button>
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
                <Button size="lg" variant="secondary" data-testid="button-get-started">
                  {t.budgetpal.cta}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}