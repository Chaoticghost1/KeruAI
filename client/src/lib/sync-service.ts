import { db } from './offline-storage';

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
        .equals(false)
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
          result.errors.push(`Error syncing note: ${error.message}`);
        }
      }

      return result;
    } catch (error) {
      result.errors.push(`Critical sync error: ${error.message}`);
      return result;
    }
  },

  startAutoSync() {
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
