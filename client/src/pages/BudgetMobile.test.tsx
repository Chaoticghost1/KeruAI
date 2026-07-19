// client/src/pages/BudgetMobile.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

const mockAnalytics = {
  totalIncomeHnl: 1000,
  totalExpenseHnl: 200,
  remainingHnl: 800,
  byCategory: [{ category: "Food", expenseHnl: 200, incomeHnl: 0 }],
  monthly: [{ month: "2026-07", expenseHnl: 200, incomeHnl: 1000 }],
};

vi.mock("@/hooks/use-budget", () => ({
  useBudgetCategories: () => ({ categories: [{ id: 1, name: "Food" }], isLoading: false }),
  useBudgetTransactions: () => ({
    transactions: [
      {
        id: 1,
        userId: 1,
        categoryId: 1,
        description: "Lunch",
        amount: "-50",
        date: "2026-07-19T00:00:00.000Z",
        currency: "HNL",
        type: "expense",
        paid: true,
      },
    ],
    isLoading: false,
    createTransaction: vi.fn(),
    updateTransaction: vi.fn(),
    deleteTransaction: vi.fn(),
  }),
  useBudgetAnalytics: () => ({ analytics: mockAnalytics, isLoading: false }),
  useBudgetInsights: () => ({ insights: ["Tip one", "Tip two"], isLoading: false }),
  useBudgetGamification: () => ({
    gamification: { streakDays: 3, onBudget: true, loggedToday: true },
    isLoading: false,
  }),
}));

vi.mock("@/contexts/LanguageContext", () => ({
  useLanguage: () => ({ language: "es", t: { language: "es" } }),
}));

vi.mock("@/components/PageLayout", () => ({
  PageLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock("@/components/PageHeader", () => ({
  PageHeader: ({ title, subtitle }: { title: string; subtitle?: string }) => (
    <div>
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
    </div>
  ),
}));

import BudgetMobile from "./BudgetMobile";

describe("BudgetMobile", () => {
  it("renders the remaining budget and a transaction", () => {
    render(<BudgetMobile />);
    expect(screen.getByText("Presupuesto")).toBeInTheDocument();
    expect(screen.getByText("Lunch")).toBeInTheDocument();
    // gamification streak
    expect(screen.getByText(/3/)).toBeInTheDocument();
  });

  it("opens the add sheet via FAB", () => {
    render(<BudgetMobile />);
    fireEvent.click(screen.getByLabelText("Agregar"));
    expect(screen.getByText("New transaction")).toBeInTheDocument();
  });
});
