import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from './use-auth';

export interface MentorProfile {
  id: number;
  userId: number;
  subjects: string[];
  bio: string | null;
  rating: string;
  totalRatings: number;
  hourlyRate: string | null;
  isAvailable: boolean;
  isVerified: boolean;
  mentorName?: string;
}

export interface MentorshipRequest {
  id: number;
  studentId: number;
  mentorId: number;
  subject: string;
  description: string;
  status: string;
  urgency: string;
  requestedAt: string;
}

const MENTORSHIP_KEYS = {
  mentors: ['/api/mentorship/mentors'] as const,
  requests: ['/api/mentorship/requests'] as const,
  sessions: ['/api/mentorship/sessions'] as const,
};

export function useMyMentorProfile() {
  const { user } = useAuth();

  return useQuery<MentorProfile | null>({
    queryKey: ['/api/mentorship/me', user?.id],
    queryFn: async () => {
      try {
        const res = await apiRequest('GET', '/api/mentorship/me');
        if (!res.ok) return null;
        return res.json();
      } catch {
        return null;
      }
    },
    enabled: !!user,
    staleTime: 60 * 1000,
  });
}

export function useUpdateMentorProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { subjects?: string[]; bio?: string; gradeLevel?: number; hourlyRate?: string; isAvailable?: boolean }) => {
      const res = await apiRequest('PATCH', '/api/mentorship/me', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/mentorship/me'] });
      queryClient.invalidateQueries({ queryKey: MENTORSHIP_KEYS.mentors });
    },
  });
}

/** Page size for paginated mentor list; used by useMentorsPaginated and MentorshipHub. */
export const MENTORS_PAGE_SIZE = 12;

export function useMentors(filters?: { subject?: string; gradeLevel?: number; isVolunteer?: boolean }) {
  const { user } = useAuth();

  const params = new URLSearchParams();
  if (filters?.subject) params.set('subject', filters.subject);
  if (filters?.gradeLevel) params.set('gradeLevel', String(filters.gradeLevel));
  if (filters?.isVolunteer) params.set('isVolunteer', 'true');

  const queryString = params.toString();
  const url = queryString ? `/api/mentorship/mentors?${queryString}` : '/api/mentorship/mentors';

  return useQuery<MentorProfile[]>({
    queryKey: [...MENTORSHIP_KEYS.mentors, filters],
    queryFn: async () => {
      const res = await apiRequest('GET', url);
      return res.json();
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000,
  });
}

export function useMentorsPaginated(
  filters?: { subject?: string; gradeLevel?: number; isVolunteer?: boolean },
  page: number = 1
) {
  const { user } = useAuth();
  const params = new URLSearchParams();
  if (filters?.subject) params.set('subject', filters.subject);
  if (filters?.gradeLevel) params.set('gradeLevel', String(filters.gradeLevel));
  if (filters?.isVolunteer) params.set('isVolunteer', 'true');
  params.set('limit', String(MENTORS_PAGE_SIZE));
  params.set('offset', String((page - 1) * MENTORS_PAGE_SIZE));
  const url = `/api/mentorship/mentors?${params.toString()}`;

  return useQuery<{ data: MentorProfile[]; total: number }>({
    queryKey: [...MENTORSHIP_KEYS.mentors, 'paginated', filters, page],
    queryFn: async () => {
      const res = await apiRequest('GET', url);
      return res.json();
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000,
  });
}

export function useMentorshipRequests(asMentor?: boolean) {
  const { user } = useAuth();

  const url = asMentor ? '/api/mentorship/requests?asMentor=true' : '/api/mentorship/requests';

  return useQuery<MentorshipRequest[]>({
    queryKey: [...MENTORSHIP_KEYS.requests, user?.id, asMentor],
    queryFn: async () => {
      const res = await apiRequest('GET', url);
      return res.json();
    },
    enabled: !!user,
    staleTime: 60 * 1000,
  });
}

export function useCreateMentorProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { subjects: string[]; bio?: string; gradeLevel?: number; hourlyRate?: string }) => {
      const res = await apiRequest('POST', '/api/mentorship/mentors', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MENTORSHIP_KEYS.mentors });
    },
  });
}

export function useMentorshipSessions() {
  const { user } = useAuth();

  return useQuery({
    queryKey: [...MENTORSHIP_KEYS.sessions, user?.id],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/mentorship/sessions');
      return res.json();
    },
    enabled: !!user,
    staleTime: 60 * 1000,
  });
}

export function useCreateMentorshipRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { mentorId: number; subject: string; description: string; urgency?: string }) => {
      const res = await apiRequest('POST', '/api/mentorship/requests', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MENTORSHIP_KEYS.requests });
    },
  });
}

export function useMentorMaterials() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['/api/mentorship/materials', user?.id],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/mentorship/materials');
      return res.json();
    },
    enabled: !!user,
  });
}

export function useUploadMentorMaterial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: FormData) => {
      const token = localStorage.getItem('accessToken');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/mentorship/materials`, {
        method: 'POST',
        headers,
        body: data,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Upload failed');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/mentorship/materials'] });
    },
  });
}
