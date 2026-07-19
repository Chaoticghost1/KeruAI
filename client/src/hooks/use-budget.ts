import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from './use-auth';
import { useLanguage } from '@/contexts/LanguageContext';

export interface BudgetCategory {
  id: number;
  userId: number;
  name: string;
  budget: string;
  spent: string;
  createdAt: string;
}

export interface BudgetTransaction {
  id: number;
  userId: number;
  categoryId: number;
  description: string;
  amount: string;
  date: string;
  // Phase 2 fields (backend-backed; may be undefined on older rows)
  currency?: string;
  type?: "income" | "expense";
  paid?: boolean;
  groupId?: number | null;
  tagId?: number | null;
  recurringId?: number | null;
  createdAt: string;
}

export interface BudgetGroup {
  id: number;
  userId: number;
  name: string;
  icon?: string | null;
  createdAt: string;
}

export interface BudgetTag {
  id: number;
  userId: number;
  name: string;
  color?: string | null;
  icon?: string | null;
  createdAt: string;
}

export interface BudgetRecurring {
  id: number;
  userId: number;
  categoryId: number;
  description: string;
  amount: string;
  currency: string;
  type: "income" | "expense";
  frequency: "week" | "month" | "year";
  interval: number;
  every: number;
  startDate: string;
  endDate?: string | null;
  createdAt: string;
}

export interface BudgetUserAnalytics {
  totalIncomeHnl: number;
  totalExpenseHnl: number;
  remainingHnl: number;
  byCategory: { category: string; expenseHnl: number; incomeHnl: number }[];
  monthly: { month: string; expenseHnl: number; incomeHnl: number }[];
}

const BUDGET_KEYS = {
  categories: ['/api/budget/categories'] as const,
  transactions: ['/api/budget/transactions'] as const,
  groups: ['/api/budget/groups'] as const,
  tags: ['/api/budget/tags'] as const,
  recurring: ['/api/budget/recurring'] as const,
  analytics: ['/api/budget/analytics'] as const,
};

export function useBudgetCategories() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery<BudgetCategory[]>({
    queryKey: [...BUDGET_KEYS.categories, user?.id],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/budget/categories');
      return res.json();
    },
    enabled: !!user,
    staleTime: 60 * 1000,
  });

  const createMutation = useMutation({
    mutationFn: async (data: { name: string; budget: string }) => {
      const res = await apiRequest('POST', '/api/budget/categories', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BUDGET_KEYS.categories });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: number; name?: string; budget?: string }) => {
      const res = await apiRequest('PUT', `/api/budget/categories/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BUDGET_KEYS.categories });
      queryClient.invalidateQueries({ queryKey: BUDGET_KEYS.transactions });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/budget/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BUDGET_KEYS.categories });
      queryClient.invalidateQueries({ queryKey: BUDGET_KEYS.transactions });
    },
  });

  return {
    categories: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    createCategory: createMutation.mutateAsync,
    updateCategory: updateMutation.mutateAsync,
    deleteCategory: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

export function useBudgetTransactions() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery<BudgetTransaction[]>({
    queryKey: [...BUDGET_KEYS.transactions, user?.id],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/budget/transactions');
      return res.json();
    },
    enabled: !!user,
    staleTime: 60 * 1000,
  });

  const createMutation = useMutation({
    mutationFn: async (data: {
      categoryId: number;
      description: string;
      amount: string | number;
      date?: string;
      currency?: string;
      type?: "income" | "expense";
      paid?: boolean;
      groupId?: number | null;
      tagId?: number | null;
      recurringId?: number | null;
    }) => {
      const payload = {
        ...data,
        amount: String(data.amount),
        date: data.date || new Date().toISOString().split('T')[0],
      };
      const res = await apiRequest('POST', '/api/budget/transactions', payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BUDGET_KEYS.transactions });
      queryClient.invalidateQueries({ queryKey: BUDGET_KEYS.categories });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      ...data
    }: {
      id: number;
      categoryId?: number;
      description?: string;
      amount?: string | number;
      date?: string;
      currency?: string;
      type?: "income" | "expense";
      paid?: boolean;
      groupId?: number | null;
      tagId?: number | null;
      recurringId?: number | null;
    }) => {
      const payload = data.amount !== undefined ? { ...data, amount: String(data.amount) } : data;
      const res = await apiRequest('PUT', `/api/budget/transactions/${id}`, payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BUDGET_KEYS.transactions });
      queryClient.invalidateQueries({ queryKey: BUDGET_KEYS.categories });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/budget/transactions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BUDGET_KEYS.transactions });
      queryClient.invalidateQueries({ queryKey: BUDGET_KEYS.categories });
    },
  });

  return {
    transactions: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    createTransaction: createMutation.mutateAsync,
    updateTransaction: updateMutation.mutateAsync,
    deleteTransaction: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

// ---- Phase 2 hooks: groups, tags, recurring, analytics ----

export function useBudgetGroups() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const query = useQuery<BudgetGroup[]>({
    queryKey: [...BUDGET_KEYS.groups, user?.id],
    queryFn: async () => (await apiRequest('GET', '/api/budget/groups')).json(),
    enabled: !!user,
    staleTime: 60 * 1000,
  });
  const createMutation = useMutation({
    mutationFn: async (data: { name: string; icon?: string | null }) => {
      const res = await apiRequest('POST', '/api/budget/groups', data);
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: BUDGET_KEYS.groups }),
  });
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => apiRequest('DELETE', `/api/budget/groups/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: BUDGET_KEYS.groups }),
  });
  return {
    groups: query.data ?? [],
    isLoading: query.isLoading,
    createGroup: createMutation.mutateAsync,
    deleteGroup: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
  };
}

export function useBudgetTags() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const query = useQuery<BudgetTag[]>({
    queryKey: [...BUDGET_KEYS.tags, user?.id],
    queryFn: async () => (await apiRequest('GET', '/api/budget/tags')).json(),
    enabled: !!user,
    staleTime: 60 * 1000,
  });
  const createMutation = useMutation({
    mutationFn: async (data: { name: string; color?: string | null; icon?: string | null }) => {
      const res = await apiRequest('POST', '/api/budget/tags', data);
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: BUDGET_KEYS.tags }),
  });
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => apiRequest('DELETE', `/api/budget/tags/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: BUDGET_KEYS.tags }),
  });
  return {
    tags: query.data ?? [],
    isLoading: query.isLoading,
    createTag: createMutation.mutateAsync,
    deleteTag: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
  };
}

export function useBudgetRecurring() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const query = useQuery<BudgetRecurring[]>({
    queryKey: [...BUDGET_KEYS.recurring, user?.id],
    queryFn: async () => (await apiRequest('GET', '/api/budget/recurring')).json(),
    enabled: !!user,
    staleTime: 60 * 1000,
  });
  const createMutation = useMutation({
    mutationFn: async (data: Omit<BudgetRecurring, 'id' | 'userId' | 'createdAt'>) => {
      const res = await apiRequest('POST', '/api/budget/recurring', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BUDGET_KEYS.recurring });
      queryClient.invalidateQueries({ queryKey: BUDGET_KEYS.transactions });
    },
  });
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => apiRequest('DELETE', `/api/budget/recurring/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: BUDGET_KEYS.recurring }),
  });
  return {
    recurring: query.data ?? [],
    isLoading: query.isLoading,
    createRecurring: createMutation.mutateAsync,
    deleteRecurring: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
  };
}

export function useBudgetAnalytics() {
  const { user } = useAuth();
  const query = useQuery<BudgetUserAnalytics>({
    queryKey: [...BUDGET_KEYS.analytics, user?.id],
    queryFn: async () => (await apiRequest('GET', '/api/budget/analytics')).json(),
    enabled: !!user,
    staleTime: 60 * 1000,
  });
  return {
    analytics: query.data,
    isLoading: query.isLoading,
    error: query.error,
  };
}

export function useBudgetInsights() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const lang = (t.language === "es" ? "es" : "en") as "es" | "en";
  const query = useQuery<{ insights: string[] }>({
    queryKey: [...BUDGET_KEYS.analytics, "insights", user?.id, lang],
    queryFn: async () =>
      (await apiRequest('GET', `/api/budget/insights?lang=${lang}`)).json(),
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });
  return { insights: query.data?.insights ?? [], isLoading: query.isLoading };
}

export function useBudgetGamification() {
  const { user } = useAuth();
  const query = useQuery<{ streakDays: number; onBudget: boolean; loggedToday: boolean }>({
    queryKey: [...BUDGET_KEYS.analytics, "gamification", user?.id],
    queryFn: async () => (await apiRequest('GET', '/api/budget/gamification')).json(),
    enabled: !!user,
    staleTime: 60 * 1000,
  });
  return {
    gamification: query.data,
    isLoading: query.isLoading,
  };
}
