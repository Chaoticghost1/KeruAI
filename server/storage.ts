import { 
  users, 
  budgetCategories, 
  budgetTransactions, 
  studyNotes, 
  gameScores,
  type User, 
  type InsertUser,
  type BudgetCategory,
  type InsertBudgetCategory,
  type BudgetTransaction,
  type InsertBudgetTransaction,
  type StudyNote,
  type InsertStudyNote,
  type GameScore,
  type InsertGameScore
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Budget methods
  getBudgetCategories(userId: number): Promise<BudgetCategory[]>;
  createBudgetCategory(category: InsertBudgetCategory): Promise<BudgetCategory>;
  getBudgetTransactions(userId: number): Promise<BudgetTransaction[]>;
  createBudgetTransaction(transaction: InsertBudgetTransaction): Promise<BudgetTransaction>;
  
  // Study notes methods
  getStudyNotes(userId: number): Promise<StudyNote[]>;
  createStudyNote(note: InsertStudyNote): Promise<StudyNote>;
  updateStudyNote(id: number, updates: Partial<StudyNote>): Promise<StudyNote>;
  deleteStudyNote(id: number): Promise<void>;
  
  // Game scores methods
  getGameScores(userId: number, gameName?: string): Promise<GameScore[]>;
  createGameScore(score: InsertGameScore): Promise<GameScore>;
  getTopScores(gameName: string, limit?: number): Promise<GameScore[]>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Budget methods
  async getBudgetCategories(userId: number): Promise<BudgetCategory[]> {
    return await db.select().from(budgetCategories).where(eq(budgetCategories.userId, userId));
  }

  async createBudgetCategory(category: InsertBudgetCategory): Promise<BudgetCategory> {
    const [newCategory] = await db
      .insert(budgetCategories)
      .values(category)
      .returning();
    return newCategory;
  }

  async getBudgetTransactions(userId: number): Promise<BudgetTransaction[]> {
    return await db.select().from(budgetTransactions).where(eq(budgetTransactions.userId, userId));
  }

  async createBudgetTransaction(transaction: InsertBudgetTransaction): Promise<BudgetTransaction> {
    const [newTransaction] = await db
      .insert(budgetTransactions)
      .values(transaction)
      .returning();
    return newTransaction;
  }

  // Study notes methods
  async getStudyNotes(userId: number): Promise<StudyNote[]> {
    return await db.select().from(studyNotes).where(eq(studyNotes.userId, userId));
  }

  async createStudyNote(note: InsertStudyNote): Promise<StudyNote> {
    const [newNote] = await db
      .insert(studyNotes)
      .values(note)
      .returning();
    return newNote;
  }

  async updateStudyNote(id: number, updates: Partial<StudyNote>): Promise<StudyNote> {
    const [updatedNote] = await db
      .update(studyNotes)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(studyNotes.id, id))
      .returning();
    return updatedNote;
  }

  async deleteStudyNote(id: number): Promise<void> {
    await db.delete(studyNotes).where(eq(studyNotes.id, id));
  }

  // Game scores methods
  async getGameScores(userId: number, gameName?: string): Promise<GameScore[]> {
    if (gameName) {
      return await db.select().from(gameScores)
        .where(and(eq(gameScores.userId, userId), eq(gameScores.gameName, gameName)));
    }
    
    return await db.select().from(gameScores).where(eq(gameScores.userId, userId));
  }

  async createGameScore(score: InsertGameScore): Promise<GameScore> {
    const [newScore] = await db
      .insert(gameScores)
      .values(score)
      .returning();
    return newScore;
  }

  async getTopScores(gameName: string, limit: number = 10): Promise<GameScore[]> {
    return await db
      .select()
      .from(gameScores)
      .where(eq(gameScores.gameName, gameName))
      .orderBy(desc(gameScores.score))
      .limit(limit);
  }
}

export const storage = new DatabaseStorage();