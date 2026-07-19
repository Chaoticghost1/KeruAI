import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from './use-auth';

export type DaoProposalStatus = "draft" | "active" | "passed" | "rejected" | "executed";
export type DaoVoteChoice = "for" | "against" | "abstain";

export interface DaoProposalTally {
  for: number;
  against: number;
  abstain: number;
  total: number;
}

export interface DaoProposal {
  id: number;
  title: string;
  description: string;
  category: string;
  authorId: number;
  status: DaoProposalStatus;
  deadline: string;
  createdAt: string;
  updatedAt: string;
  tally?: DaoProposalTally;
}

export interface DaoProposalDetail extends DaoProposal {
  userVote: { choice: DaoVoteChoice } | null;
}

export interface CreateProposalInput {
  title: string;
  description: string;
  category?: string;
  deadline: string; // ISO date string
}

const DAO_KEYS = {
  proposals: ['/api/dao/proposals'] as const,
};

function isOpen(proposal: DaoProposal): boolean {
  return proposal.status === "active" && new Date(proposal.deadline).getTime() >= Date.now();
}

export function useDaoProposals() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery<DaoProposal[]>({
    queryKey: DAO_KEYS.proposals,
    queryFn: async () => (await apiRequest('GET', '/api/dao/proposals')).json(),
    enabled: !!user,
    staleTime: 30 * 1000,
  });

  const createMutation = useMutation({
    mutationFn: async (data: CreateProposalInput) => {
      const res = await apiRequest('POST', '/api/dao/proposals', data);
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: DAO_KEYS.proposals }),
  });

  const voteMutation = useMutation({
    mutationFn: async ({ id, choice }: { id: number; choice: DaoVoteChoice }) => {
      const res = await apiRequest('POST', `/api/dao/proposals/${id}/vote`, { choice });
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: DAO_KEYS.proposals }),
  });

  const closeMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('POST', `/api/dao/proposals/${id}/close`);
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: DAO_KEYS.proposals }),
  });

  return {
    proposals: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    createProposal: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    vote: voteMutation.mutateAsync,
    isVoting: voteMutation.isPending,
    closeProposal: closeMutation.mutateAsync,
    isClosing: closeMutation.isPending,
    isOpen,
  };
}

export function useDaoProposal(id: number | null) {
  const { user } = useAuth();
  return useQuery<DaoProposalDetail>({
    queryKey: ['/api/dao/proposals', id],
    queryFn: async () => (await apiRequest('GET', `/api/dao/proposals/${id}`)).json(),
    enabled: !!user && id !== null,
    staleTime: 30 * 1000,
  });
}
