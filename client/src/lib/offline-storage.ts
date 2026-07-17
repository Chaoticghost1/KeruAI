import Dexie, { Table } from 'dexie';

// Offline storage interfaces for Honduras educational platform
export interface OfflineStudyNote {
  id?: number;
  localId: string;
  userId: number;
  title: string;
  content: string;
  subject?: string;
  tags?: string[];
  synced: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OfflineBudgetTransaction {
  id?: number;
  localId: string;
  userId: number;
  categoryId: number;
  description: string;
  amount: string;
  date: string;
  synced: boolean;
  createdAt: string;
}

export interface OfflineBudgetCategory {
  id?: number;
  localId: string;
  userId: number;
  name: string;
  budget: string;
  spent: string;
  synced: boolean;
  createdAt: string;
}

export interface OfflineGameScore {
  id?: number;
  localId: string;
  userId: number;
  gameName: string;
  score: number;
  level: number;
  completed: boolean;
  synced: boolean;
  playedAt: string;
}

export interface OfflineContentCache {
  id?: number;
  url: string;
  data: any;
  cachedAt: string;
  expiresAt: string;
}

export interface AppSettings {
  id?: number;
  dataSaverMode: boolean;
  language: string;
  theme: string;
  lastSyncTime?: string;
  userId?: number;
}

export interface OfflineRevisionPack {
  id?: number;
  packId: number;
  subject: string;
  topic?: string | null;
  title?: string | null;
  itemCount: number;
  data: any;
  cachedAt: string;
}

// IndexedDB database for offline storage
export class OfflineDatabase extends Dexie {
  studyNotes!: Table<OfflineStudyNote>;
  budgetTransactions!: Table<OfflineBudgetTransaction>;
  budgetCategories!: Table<OfflineBudgetCategory>;
  gameScores!: Table<OfflineGameScore>;
  contentCache!: Table<OfflineContentCache>;
  settings!: Table<AppSettings>;
  revisionPacks!: Table<OfflineRevisionPack>;

  constructor() {
    super('HondurasEducationalPlatform');
    
    this.version(1).stores({
      studyNotes: '++id, localId, userId, synced, createdAt',
      budgetTransactions: '++id, localId, userId, categoryId, synced, createdAt',
      budgetCategories: '++id, localId, userId, synced, createdAt',
      gameScores: '++id, localId, userId, gameName, synced, playedAt',
      contentCache: '++id, url, cachedAt, expiresAt',
      settings: '++id, userId'
    });

    this.version(2).stores({
      revisionPacks: '++id, &packId, subject, cachedAt'
    });
  }
}

export const offlineDb = new OfflineDatabase();

// Utility functions for offline data management
export class OfflineManager {
  private static generateLocalId(): string {
    return `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Study Notes Management
  static async saveStudyNoteOffline(note: Omit<OfflineStudyNote, 'id' | 'localId' | 'synced'>) {
    const offlineNote: OfflineStudyNote = {
      ...note,
      localId: this.generateLocalId(),
      synced: false
    };
    
    return await offlineDb.studyNotes.add(offlineNote);
  }

  static async getOfflineStudyNotes(userId: number): Promise<OfflineStudyNote[]> {
    return await offlineDb.studyNotes.where('userId').equals(userId).toArray();
  }

  static async markStudyNoteSynced(localId: string, serverId: number) {
    return await offlineDb.studyNotes.where('localId').equals(localId).modify({
      id: serverId,
      synced: true
    });
  }

  // Budget Management
  static async saveBudgetTransactionOffline(transaction: Omit<OfflineBudgetTransaction, 'id' | 'localId' | 'synced'>) {
    const offlineTransaction: OfflineBudgetTransaction = {
      ...transaction,
      localId: this.generateLocalId(),
      synced: false
    };
    
    return await offlineDb.budgetTransactions.add(offlineTransaction);
  }

  static async saveBudgetCategoryOffline(category: Omit<OfflineBudgetCategory, 'id' | 'localId' | 'synced'>) {
    const offlineCategory: OfflineBudgetCategory = {
      ...category,
      localId: this.generateLocalId(),
      synced: false
    };
    
    return await offlineDb.budgetCategories.add(offlineCategory);
  }

  static async getOfflineBudgetData(userId: number) {
    const [categories, transactions] = await Promise.all([
      offlineDb.budgetCategories.where('userId').equals(userId).toArray(),
      offlineDb.budgetTransactions.where('userId').equals(userId).toArray()
    ]);
    
    return { categories, transactions };
  }

  // Game Scores Management
  static async saveGameScoreOffline(score: Omit<OfflineGameScore, 'id' | 'localId' | 'synced'>) {
    const offlineScore: OfflineGameScore = {
      ...score,
      localId: this.generateLocalId(),
      synced: false
    };
    
    return await offlineDb.gameScores.add(offlineScore);
  }

  static async getOfflineGameScores(userId: number, gameName?: string): Promise<OfflineGameScore[]> {
    let query = offlineDb.gameScores.where('userId').equals(userId);
    
    if (gameName) {
      const allScores = await query.toArray();
      return allScores.filter(score => score.gameName === gameName);
    }
    
    return await query.toArray();
  }

  // Content Caching
  static async cacheContent(url: string, data: any, ttlHours: number = 24) {
    const expiresAt = new Date(Date.now() + (ttlHours * 60 * 60 * 1000)).toISOString();
    
    const cached: OfflineContentCache = {
      url,
      data,
      cachedAt: new Date().toISOString(),
      expiresAt
    };
    
    // Remove existing cache for this URL
    await offlineDb.contentCache.where('url').equals(url).delete();
    
    return await offlineDb.contentCache.add(cached);
  }

  static async getCachedContent(url: string): Promise<any | null> {
    const cached = await offlineDb.contentCache.where('url').equals(url).first();
    
    if (!cached) return null;
    
    // Check if cache has expired
    if (new Date(cached.expiresAt) < new Date()) {
      await offlineDb.contentCache.delete(cached.id!);
      return null;
    }
    
    return cached.data;
  }

  // Settings Management
  static async updateSettings(settings: Partial<AppSettings>) {
    const existing = await offlineDb.settings.orderBy('id').last();
    
    if (existing) {
      return await offlineDb.settings.update(existing.id!, settings);
    } else {
      return await offlineDb.settings.add({
        dataSaverMode: false,
        language: 'es-HN',
        theme: 'light',
        ...settings
      });
    }
  }

  static async getSettings(): Promise<AppSettings | null> {
    return await offlineDb.settings.orderBy('id').last() || null;
  }

  // Sync Management
  static async getUnsyncedData() {
    const [studyNotes, budgetTransactions, budgetCategories, gameScores] = await Promise.all([
      offlineDb.studyNotes.where('synced').equals(0).toArray(),
      offlineDb.budgetTransactions.where('synced').equals(0).toArray(),
      offlineDb.budgetCategories.where('synced').equals(0).toArray(),
      offlineDb.gameScores.where('synced').equals(0).toArray()
    ]);
    
    return {
      studyNotes,
      budgetTransactions,
      budgetCategories,
      gameScores
    };
  }

  static async markDataSynced(type: string, localId: string, serverId?: number) {
    const updateData: any = { synced: true };
    if (serverId) updateData.id = serverId;
    
    switch (type) {
      case 'studyNotes':
        return await offlineDb.studyNotes.where('localId').equals(localId).modify(updateData);
      case 'budgetTransactions':
        return await offlineDb.budgetTransactions.where('localId').equals(localId).modify(updateData);
      case 'budgetCategories':
        return await offlineDb.budgetCategories.where('localId').equals(localId).modify(updateData);
      case 'gameScores':
        return await offlineDb.gameScores.where('localId').equals(localId).modify(updateData);
    }
  }

  // Clear expired cache
  static async clearExpiredCache() {
    const now = new Date().toISOString();
    return await offlineDb.contentCache.where('expiresAt').below(now).delete();
  }

  // Clear ALL content cache (used on logout)
  static async clearAllContentCache() {
    return await offlineDb.contentCache.clear();
  }

  // Clear auth-related cache entries
  static async clearAuthCache() {
    // Delete any cached auth endpoints
    return await offlineDb.contentCache.where('url').startsWithAnyOf([
      '/api/auth',
      'http'  // In case full URLs are cached
    ]).filter(item => item.url.includes('/api/auth')).delete();
  }

  // Clear classes cache (user-specific, changes when creating classes - avoid stale data)
  static async clearClassesCache() {
    const entries = await offlineDb.contentCache.filter(c => c.url.includes('/api/classes')).toArray();
    await Promise.all(entries.map(e => e.id != null ? offlineDb.contentCache.delete(e.id) : Promise.resolve()));
  }

  // Database maintenance
  static async getStorageUsage(): Promise<{ used: number; available?: number }> {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        return {
          used: estimate.usage || 0,
          available: estimate.quota
        };
      }
    } catch (error) {
      console.warn('Could not estimate storage usage:', error);
    }
    
    return { used: 0 };
  }
}

// Revision pack offline storage (TG2 → used by TG3 offline mode)
export async function saveRevisionPackOffline(pack: {
  id: number;
  subject: string;
  topic?: string | null;
  title?: string | null;
  itemCount: number;
  items?: unknown[];
}): Promise<void> {
  const record: OfflineRevisionPack = {
    packId: pack.id,
    subject: pack.subject,
    topic: pack.topic ?? null,
    title: pack.title ?? null,
    itemCount: pack.itemCount,
    data: pack,
    cachedAt: new Date().toISOString(),
  };
  await offlineDb.revisionPacks.where('packId').equals(pack.id).delete();
  await offlineDb.revisionPacks.add(record);
}

export async function getOfflineRevisionPacks(): Promise<OfflineRevisionPack[]> {
  return await offlineDb.revisionPacks.orderBy('cachedAt').reverse().toArray();
}

export async function getOfflineRevisionPack(packId: number): Promise<OfflineRevisionPack | undefined> {
  return await offlineDb.revisionPacks.where('packId').equals(packId).first();
}

// Initialize offline database - DISABLED
export const initializeOfflineStorage = async () => {
  console.log('Offline storage is disabled');
  return false;
};