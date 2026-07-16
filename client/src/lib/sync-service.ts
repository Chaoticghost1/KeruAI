import { OFFLINE_ENABLED } from './offline-config';
import { offlineDb as db } from './offline-storage';

export interface SyncResult {
  synced: number;
  failed: number;
  errors: string[];
}

export const syncService = {
  async syncToServer(): Promise<SyncResult> {
    const result: SyncResult = {
      synced: 0,
      failed: 0,
      errors: []
    };

    try {
      // Sync unsynced study notes
      const unsyncedNotes = await db.studyNotes
        .where('synced')
        .equals(0)
        .toArray();

      for (const note of unsyncedNotes) {
        try {
          const response = await fetch('/api/study/notes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(note)
          });

          if (response.ok) {
            await db.studyNotes.update(note.id, {
              synced: true
            });
            result.synced++;
          } else {
            result.failed++;
            result.errors.push(`Failed to sync note: ${note.title}`);
          }
        } catch (error) {
          result.failed++;
          result.errors.push(`Error syncing note: ${error instanceof Error ? error.message : String(error)}`);
        }
      }

      return result;
    } catch (error) {
      result.errors.push(`Critical sync error: ${error instanceof Error ? error.message : String(error)}`);
      return result;
    }
  },

  startAutoSync() {
    if (!OFFLINE_ENABLED) return;
    window.addEventListener('online', () => {
      console.log('Connection restored, syncing...');
      this.syncToServer();
    });

    setInterval(() => {
      if (navigator.onLine) {
        this.syncToServer();
      }
    }, 5 * 60 * 1000);
  }
};
