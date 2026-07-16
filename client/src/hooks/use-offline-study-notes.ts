import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { OfflineManager } from '@/lib/offline-storage';
import { OFFLINE_ENABLED } from '@/lib/offline-config';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from './use-auth';

interface StudyNote {
  id?: number;
  localId?: string;
  userId: number;
  title: string;
  content: string;
  subject?: string;
  tags?: string[];
  synced?: boolean;
  createdAt: string;
  updatedAt: string;
}

// Honduras-first offline-aware study notes hook
export function useOfflineStudyNotes() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Get study notes (online + offline merged when OFFLINE_ENABLED)
  const { data: notes = [], isLoading, error } = useQuery({
    queryKey: ['/api/study/notes', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const response = await apiRequest('GET', '/api/study/notes');
      const onlineNotes = await response.json();
      if (!OFFLINE_ENABLED) return onlineNotes;
      const offlineNotes = await OfflineManager.getOfflineStudyNotes(user.id);
      const allNotes = [...onlineNotes];
      offlineNotes.forEach(offlineNote => {
        if (!offlineNote.synced) {
          allNotes.push({ ...offlineNote, id: undefined });
        }
      });
      return allNotes;
    },
    enabled: !!user,
    staleTime: OFFLINE_ENABLED ? 5 * 60 * 1000 : Infinity,
  });

  // Create study note (offline-first)
  const createNoteMutation = useMutation({
    mutationFn: async (noteData: Omit<StudyNote, 'id' | 'localId' | 'synced' | 'createdAt' | 'updatedAt'>) => {
      if (!user) throw new Error('User not authenticated');
      
      const newNote = {
        ...noteData,
        userId: user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (OFFLINE_ENABLED && (isOffline || !navigator.onLine)) {
        const localId = await OfflineManager.saveStudyNoteOffline(newNote);
        return { ...newNote, localId, synced: false };
      }
      const { userId, ...noteDataWithoutUserId } = newNote;
      const response = await apiRequest('POST', '/api/study/notes', noteDataWithoutUserId);
      const serverNote = await response.json();
      if (OFFLINE_ENABLED) await OfflineManager.cacheContent('/api/study/notes', null, 0.5);
      return serverNote;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/study/notes', user?.id] });
    },
  });

  // Update study note (offline-first)
  const updateNoteMutation = useMutation({
    mutationFn: async ({ id, localId, ...updateData }: Partial<StudyNote> & { id?: number; localId?: string }) => {
      if (!user) throw new Error('User not authenticated');

      const updatedNote = {
        ...updateData,
        updatedAt: new Date().toISOString(),
      };

      if (OFFLINE_ENABLED && (isOffline || !navigator.onLine) && localId) {
        return { ...updatedNote, localId, synced: false };
      }
      if (OFFLINE_ENABLED && (isOffline || !navigator.onLine) && !localId) {
        throw new Error('Cannot update online note while offline');
      }
      if (id) {
        const response = await apiRequest('PUT', `/api/study/notes/${id}`, updatedNote);
        const serverNote = await response.json();
        if (OFFLINE_ENABLED) await OfflineManager.cacheContent('/api/study/notes', null, 0.5);
        return serverNote;
      }
      if (localId) {
        const response = await apiRequest('POST', '/api/study/notes', updatedNote);
        const serverNote = await response.json();
        if (OFFLINE_ENABLED) await OfflineManager.markStudyNoteSynced(localId, serverNote.id);
        return serverNote;
      }
      throw new Error('No valid ID provided for update');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/study/notes', user?.id] });
    },
  });

  // Delete study note
  const deleteNoteMutation = useMutation({
    mutationFn: async ({ id, localId }: { id?: number; localId?: string }) => {
      if (!user) throw new Error('User not authenticated');

      if (OFFLINE_ENABLED && localId && !id) {
        return { success: true };
      }
      if (id) {
        if (OFFLINE_ENABLED && (isOffline || !navigator.onLine)) {
          return { success: true, queued: true };
        }
        const response = await apiRequest('DELETE', `/api/study/notes/${id}`);
        const result = await response.json();
        if (OFFLINE_ENABLED) await OfflineManager.cacheContent('/api/study/notes', null, 0.5);
        return result;
      }

      throw new Error('No valid ID provided for deletion');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/study/notes', user?.id] });
    },
  });

  const syncOfflineData = async () => {
    if (!OFFLINE_ENABLED || !user || !navigator.onLine) return;
    try {
      const unsyncedData = await OfflineManager.getUnsyncedData();
      
      for (const note of unsyncedData.studyNotes) {
        try {
          // userId will be extracted from auth token
          const response = await apiRequest('POST', '/api/study/notes', {
            title: note.title,
            content: note.content,
            subject: note.subject,
            tags: note.tags,
          });
          
          if (response.ok) {
            const serverNote = await response.json();
            await OfflineManager.markDataSynced('studyNotes', note.localId, serverNote.id);
            console.log('Honduras offline note synced:', note.localId);
          }
        } catch (error) {
          console.error('Failed to sync Honduras offline note:', error);
        }
      }
      
      // Refresh data after sync
      queryClient.invalidateQueries({ queryKey: ['/api/study/notes', user.id] });
    } catch (error) {
      console.error('Honduras offline sync failed:', error);
    }
  };

  useEffect(() => {
    if (OFFLINE_ENABLED && !isOffline && user) syncOfflineData();
  }, [isOffline, user]);

  return {
    notes,
    isLoading,
    error,
    isOffline,
    createNote: createNoteMutation.mutate,
    updateNote: updateNoteMutation.mutate,
    deleteNote: deleteNoteMutation.mutate,
    isCreating: createNoteMutation.isPending,
    isUpdating: updateNoteMutation.isPending,
    isDeleting: deleteNoteMutation.isPending,
    syncOfflineData,
  };
}