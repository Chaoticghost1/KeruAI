// client/src/components/budget/BudgetChart.tsx
// Category + monthly analytics chart (ported concept from gider chart.tsx) using Recharts.
import * as React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatCurrency, type Currency } from "@/lib/currency-formatter";
import type { BudgetUserAnalytics } from "@/hooks/use-budget";

const COLORS = ["#10b981", "#f43f5e", "#3b82f6", "#f59e0b", "#8b5cf6", "#14b8a6", "#ec4899", "#6366f1"];

interface BudgetChartProps {
  analytics: BudgetUserAnalytics;
  currency?: Currency;
}

export function BudgetChart({ analytics, currency = "HNL" }: BudgetChartProps) {
  const { language } = useLanguage();

  const pieData = analytics.byCategory
    .map((c) => ({ name: c.category, value: Math.max(c.expenseHnl, c.incomeHnl) }))
    .filter((d) => d.value > 0);

  const barData = analytics.monthly.map((m) => ({
    month: m.month.slice(2), // YY-MM → MM
    Expense: Math.round(m.expenseHnl),
    Income: Math.round(m.incomeHnl),
  }));

  if (pieData.length === 0 && barData.length === 0) {
    return (
      <p className="p-4 text-center text-sm text-muted-foreground">
        {language === "es" ? "Aún no hay datos para graficar." : "No data to chart yet."}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {pieData.length > 0 && (
        <div>
          <h4 className="mb-2 text-sm font-semibold">
            {language === "es" ? "Por categoría" : "By category"}
          </h4>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={80} label>
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => formatCurrency(v, currency, language)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {barData.length > 0 && (
        <div>
          <h4 className="mb-2 text-sm font-semibold">
            {language === "es" ? "Tendencia mensual" : "Monthly trend"}
          </h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData}>
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => formatCurrency(v, currency, language)} />
              <Legend />
              <Bar dataKey="Income" fill="#10b981" />
              <Bar dataKey="Expense" fill="#f43f5e" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
