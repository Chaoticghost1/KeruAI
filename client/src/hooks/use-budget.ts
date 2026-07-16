import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from './use-auth';

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
  createdAt: string;
}

const BUDGET_KEYS = {
  categories: ['/api/budget/categories'] as const,
  transactions: ['/api/budget/transactions'] as const,
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
    mutationFn: async (data: { categoryId: number; description: string; amount: string | number; date?: string }) => {
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
