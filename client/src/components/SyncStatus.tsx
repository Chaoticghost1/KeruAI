import { useState, useEffect } from 'react';
import { syncService } from '@/lib/sync-service';

export function SyncStatus() {
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  useEffect(() => {
    syncService.startAutoSync();
  }, []);

  return (
    <div className="text-xs text-gray-500">
      {navigator.onLine ? (
        <span>
          ✓ Online
          {lastSync && ` • Last sync: ${lastSync.toLocaleTimeString()}`}
        </span>
      ) : (
        <span>⚠ Offline • Changes will sync when online</span>
      )}
      {syncing && <span> • Syncing...</span>}
    </div>
  );
}
