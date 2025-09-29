// PWA Manager for Honduras Educational Platform
import { Workbox } from 'workbox-window';

export interface PWAManager {
  isSupported: boolean;
  isInstalled: boolean;
  canInstall: boolean;
  install: () => Promise<void>;
  update: () => Promise<void>;
  onUpdateAvailable: (callback: () => void) => void;
  checkConnectivity: () => boolean;
}

class PWAManagerImpl implements PWAManager {
  private wb: Workbox | null = null;
  private deferredPrompt: any = null;
  private updateCallbacks: (() => void)[] = [];

  constructor() {
    this.init();
  }

  get isSupported(): boolean {
    return 'serviceWorker' in navigator;
  }

  get isInstalled(): boolean {
    return window.matchMedia && window.matchMedia('(display-mode: standalone)').matches;
  }

  get canInstall(): boolean {
    return this.deferredPrompt !== null;
  }

  private async init() {
    if (!this.isSupported) {
      console.warn('Service workers are not supported');
      return;
    }

    // Register service worker
    this.wb = new Workbox('/sw.js');

    // Listen for service worker updates
    this.wb.addEventListener('waiting', () => {
      console.log('New service worker is waiting to activate');
      this.updateCallbacks.forEach(callback => callback());
    });

    this.wb.addEventListener('controlling', () => {
      console.log('New service worker is controlling the page');
      window.location.reload();
    });

    // Handle installation prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      console.log('PWA install prompt ready');
    });

    // Check if already installed
    window.addEventListener('appinstalled', () => {
      console.log('PWA was installed');
      this.deferredPrompt = null;
    });

    // Register the service worker
    try {
      await this.wb.register();
      console.log('Service worker registered successfully');
    } catch (error) {
      console.error('Service worker registration failed:', error);
    }

    // Listen for sync events from service worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data.type === 'SYNC_OFFLINE_DATA') {
        this.syncOfflineData();
      }
    });
  }

  async install(): Promise<void> {
    if (!this.canInstall) {
      throw new Error('PWA installation not available');
    }

    try {
      const choiceResult = await this.deferredPrompt.prompt();
      console.log('PWA install prompt result:', choiceResult.outcome);
      
      if (choiceResult.outcome === 'accepted') {
        this.deferredPrompt = null;
      }
    } catch (error) {
      console.error('PWA installation failed:', error);
      throw error;
    }
  }

  async update(): Promise<void> {
    if (!this.wb) {
      throw new Error('Service worker not available');
    }

    try {
      await this.wb.messageSkipWaiting();
    } catch (error) {
      console.error('Service worker update failed:', error);
      throw error;
    }
  }

  onUpdateAvailable(callback: () => void): void {
    this.updateCallbacks.push(callback);
  }

  checkConnectivity(): boolean {
    return navigator.onLine;
  }

  private async syncOfflineData() {
    // This will be called when the service worker detects connectivity
    // and wants to sync offline data
    try {
      const { OfflineManager } = await import('./offline-storage');
      const unsyncedData = await OfflineManager.getUnsyncedData();
      
      // Sync study notes
      for (const note of unsyncedData.studyNotes) {
        try {
          const response = await fetch('/api/study/notes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: note.title,
              content: note.content,
              subject: note.subject,
              tags: note.tags
            })
          });
          
          if (response.ok) {
            const serverNote = await response.json();
            await OfflineManager.markDataSynced('studyNotes', note.localId, serverNote.id);
            console.log('Study note synced:', note.localId);
          }
        } catch (error) {
          console.error('Failed to sync study note:', error);
        }
      }

      // Sync budget transactions
      for (const transaction of unsyncedData.budgetTransactions) {
        try {
          const response = await fetch('/api/budget/transactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: transaction.userId,
              categoryId: transaction.categoryId,
              description: transaction.description,
              amount: transaction.amount,
              date: transaction.date
            })
          });
          
          if (response.ok) {
            const serverTransaction = await response.json();
            await OfflineManager.markDataSynced('budgetTransactions', transaction.localId, serverTransaction.id);
            console.log('Budget transaction synced:', transaction.localId);
          }
        } catch (error) {
          console.error('Failed to sync budget transaction:', error);
        }
      }

      // Sync game scores
      for (const score of unsyncedData.gameScores) {
        try {
          const response = await fetch('/api/games/scores', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: score.userId,
              gameName: score.gameName,
              score: score.score,
              level: score.level,
              completed: score.completed,
              playedAt: score.playedAt
            })
          });
          
          if (response.ok) {
            const serverScore = await response.json();
            await OfflineManager.markDataSynced('gameScores', score.localId, serverScore.id);
            console.log('Game score synced:', score.localId);
          }
        } catch (error) {
          console.error('Failed to sync game score:', error);
        }
      }

      console.log('Offline data sync completed');
    } catch (error) {
      console.error('Offline data sync failed:', error);
    }
  }
}

// Singleton instance
export const pwaManager = new PWAManagerImpl();

// Hook for React components
import { useState, useEffect } from 'react';

export function usePWA() {
  const [isSupported] = useState(pwaManager.isSupported);
  const [isInstalled] = useState(pwaManager.isInstalled);
  const [canInstall, setCanInstall] = useState(pwaManager.canInstall);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    // Listen for connectivity changes
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen for install prompt availability
    const checkInstallability = () => {
      setCanInstall(pwaManager.canInstall);
    };
    
    window.addEventListener('beforeinstallprompt', checkInstallability);
    window.addEventListener('appinstalled', checkInstallability);

    // Listen for service worker updates
    pwaManager.onUpdateAvailable(() => {
      setUpdateAvailable(true);
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', checkInstallability);
      window.removeEventListener('appinstalled', checkInstallability);
    };
  }, []);

  const install = async () => {
    try {
      await pwaManager.install();
      setCanInstall(false);
    } catch (error) {
      console.error('Failed to install PWA:', error);
    }
  };

  const update = async () => {
    try {
      await pwaManager.update();
      setUpdateAvailable(false);
    } catch (error) {
      console.error('Failed to update PWA:', error);
    }
  };

  return {
    isSupported,
    isInstalled,
    canInstall,
    isOnline,
    updateAvailable,
    install,
    update
  };
}