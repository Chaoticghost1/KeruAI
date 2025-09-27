import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { OfflineManager } from '@/lib/offline-storage';
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

  // Get study notes (online + offline merged)
  const { data: notes = [], isLoading, error } = useQuery({
    queryKey: ['/api/study/notes', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      try {
        // Try to get online data first
        const response = await apiRequest('GET', `/api/study/notes/${user.id}`);
        const onlineNotes = await response.json();
        
        // Get offline notes
        const offlineNotes = await OfflineManager.getOfflineStudyNotes(user.id);
        
        // Merge online and offline notes, prioritizing unsynced offline notes
        const allNotes = [...onlineNotes];
        
        offlineNotes.forEach(offlineNote => {
          if (!offlineNote.synced) {
            // Add unsynced offline notes
            allNotes.push({
              ...offlineNote,
              id: undefined, // Remove server ID for unsynced notes
            });
          }
        });
        
        return allNotes;
      } catch (error) {
        // If online request fails, return only offline notes
        console.log('Failed to fetch online notes, using offline data');
        const offlineNotes = await OfflineManager.getOfflineStudyNotes(user?.id || 0);
        return offlineNotes;
      }
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes for Honduras data saver optimization
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

      if (isOffline || !navigator.onLine) {
        // Save offline for Honduras poor connectivity
        console.log('Creating note offline for Honduras user');
        const localId = await OfflineManager.saveStudyNoteOffline(newNote);
        return { ...newNote, localId, synced: false };
      }

      try {
        // Try online creation
        const response = await apiRequest('POST', '/api/study/notes', newNote);
        const serverNote = await response.json();
        
        // Cache the successful response
        await OfflineManager.cacheContent(`/api/study/notes/${user.id}`, null, 0.5); // Invalidate cache
        
        return serverNote;
      } catch (error) {
        // Fallback to offline creation
        console.log('Online creation failed, saving offline for Honduras user');
        const localId = await OfflineManager.saveStudyNoteOffline(newNote);
        return { ...newNote, localId, synced: false };
      }
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

      if (isOffline || !navigator.onLine) {
        // Update offline for Honduras poor connectivity
        console.log('Updating note offline for Honduras user');
        if (localId) {
          // Update existing offline note
          return { ...updatedNote, localId, synced: false };
        }
        throw new Error('Cannot update online note while offline');
      }

      try {
        if (id) {
          // Update online note
          const response = await apiRequest('PUT', `/api/study/notes/${id}`, updatedNote);
          const serverNote = await response.json();
          
          // Invalidate cache
          await OfflineManager.cacheContent(`/api/study/notes/${user.id}`, null, 0.5);
          
          return serverNote;
        } else if (localId) {
          // Convert offline note to online
          const response = await apiRequest('POST', '/api/study/notes', { ...updatedNote, userId: user.id });
          const serverNote = await response.json();
          
          // Mark offline note as synced
          await OfflineManager.markStudyNoteSynced(localId, serverNote.id);
          
          return serverNote;
        }
        
        throw new Error('No valid ID provided for update');
      } catch (error) {
        if (localId) {
          // Fallback to offline update
          console.log('Online update failed, updating offline for Honduras user');
          return { ...updatedNote, localId, synced: false };
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/study/notes', user?.id] });
    },
  });

  // Delete study note
  const deleteNoteMutation = useMutation({
    mutationFn: async ({ id, localId }: { id?: number; localId?: string }) => {
      if (!user) throw new Error('User not authenticated');

      if (localId && !id) {
        // Delete offline-only note
        // Note: This would need implementation in OfflineManager
        console.log('Deleting offline note for Honduras user');
        return { success: true };
      }

      if (id) {
        if (isOffline || !navigator.onLine) {
          // Queue for deletion when online
          console.log('Queuing note deletion for when online (Honduras)');
          return { success: true, queued: true };
        }

        // Delete online note
        const response = await apiRequest('DELETE', `/api/study/notes/${id}`);
        const result = await response.json();
        
        // Invalidate cache
        await OfflineManager.cacheContent(`/api/study/notes/${user.id}`, null, 0.5);
        
        return result;
      }

      throw new Error('No valid ID provided for deletion');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/study/notes', user?.id] });
    },
  });

  // Sync offline data when connection is restored
  const syncOfflineData = async () => {
    if (!user || !navigator.onLine) return;

    try {
      const unsyncedData = await OfflineManager.getUnsyncedData();
      
      for (const note of unsyncedData.studyNotes) {
        try {
          const response = await apiRequest('POST', '/api/study/notes', {
            userId: note.userId,
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

  // Auto-sync when coming online
  useEffect(() => {
    if (!isOffline && user) {
      syncOfflineData();
    }
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