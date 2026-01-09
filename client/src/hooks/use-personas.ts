import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

/**
 * Hook for fetching available tutors/personas for students
 * Fetches from /api/tutors which returns active tutors + active bot personas
 */
export function useTutors() {
  return useQuery({
    queryKey: ['tutors'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/tutors');
      return await response.json();
    },
    enabled: true
  });
}

/**
 * Alias for useTutors - fetches personas/tutors for student view
 */
export function usePersonas() {
  return useTutors();
}

/**
 * Hook for admin persona management
 * Provides CRUD operations for bot personas
 */
export function useAdminPersonas(userRole?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all personas (including inactive) for admin management
  const personas = useQuery({
    queryKey: ['/api/admin/bot-personas'],
    enabled: !!userRole && ['superuser', 'teacher'].includes(userRole)
  });

  // Create new persona
  const createPersona = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/admin/bot-personas", data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/bot-personas'] });
      queryClient.invalidateQueries({ queryKey: ['tutors'] });
      toast({ title: "Bot persona created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create persona", description: error.message, variant: "destructive" });
    }
  });

  // Update existing persona
  const updatePersona = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await apiRequest("PUT", `/api/admin/bot-personas/${id}`, data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/bot-personas'] });
      queryClient.invalidateQueries({ queryKey: ['tutors'] });
      toast({ title: "Bot persona updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update persona", description: error.message, variant: "destructive" });
    }
  });

  // Delete persona
  const deletePersona = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/admin/bot-personas/${id}`);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/bot-personas'] });
      queryClient.invalidateQueries({ queryKey: ['tutors'] });
      toast({ title: "Bot persona deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete persona", description: error.message, variant: "destructive" });
    }
  });

  return {
    personas: personas.data || [],
    isLoading: personas.isLoading,
    createPersona,
    updatePersona,
    deletePersona
  };
}
