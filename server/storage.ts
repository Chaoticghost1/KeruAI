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
  type InsertGameScore,
  tutorAgents,
  tutorSessions,
  tutorMessages,
  studentProfiles,
  type TutorAgent,
  type InsertTutorAgent,
  type TutorSession,
  type InsertTutorSession,
  type TutorMessage,
  type InsertTutorMessage,
  type StudentProfile,
  type InsertStudentProfile
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
  
  // Tutor agent methods
  getTutorAgents(): Promise<TutorAgent[]>;
  getTutorAgent(id: number): Promise<TutorAgent | undefined>;
  getTutorAgentByKey(agentKey: string): Promise<TutorAgent | undefined>;
  
  // Tutor session methods
  createTutorSession(session: InsertTutorSession): Promise<TutorSession>;
  getTutorSession(id: number): Promise<TutorSession | undefined>;
  getUserTutorSessions(userId: number): Promise<TutorSession[]>;
  endTutorSession(sessionId: number): Promise<TutorSession>;
  
  // Tutor message methods
  createTutorMessage(message: InsertTutorMessage): Promise<TutorMessage>;
  getSessionMessages(sessionId: number): Promise<TutorMessage[]>;
  
  // Student profile methods
  getStudentProfile(userId: number): Promise<StudentProfile | undefined>;
  createStudentProfile(profile: InsertStudentProfile): Promise<StudentProfile>;
  updateStudentProfile(userId: number, updates: Partial<StudentProfile>): Promise<StudentProfile>;
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

  // Tutor agent methods
  async getTutorAgents(): Promise<TutorAgent[]> {
    return await db.select().from(tutorAgents).where(eq(tutorAgents.isActive, true));
  }

  async getTutorAgent(id: number): Promise<TutorAgent | undefined> {
    const [agent] = await db.select().from(tutorAgents).where(eq(tutorAgents.id, id));
    return agent || undefined;
  }

  async getTutorAgentByKey(agentKey: string): Promise<TutorAgent | undefined> {
    const [agent] = await db.select().from(tutorAgents).where(eq(tutorAgents.agentKey, agentKey));
    return agent || undefined;
  }

  // Tutor session methods
  async createTutorSession(session: InsertTutorSession): Promise<TutorSession> {
    const [newSession] = await db
      .insert(tutorSessions)
      .values(session)
      .returning();
    return newSession;
  }

  async getTutorSession(id: number): Promise<TutorSession | undefined> {
    const [session] = await db.select().from(tutorSessions).where(eq(tutorSessions.id, id));
    return session || undefined;
  }

  async getUserTutorSessions(userId: number): Promise<TutorSession[]> {
    return await db.select().from(tutorSessions)
      .where(eq(tutorSessions.userId, userId))
      .orderBy(desc(tutorSessions.startedAt));
  }

  async endTutorSession(sessionId: number): Promise<TutorSession> {
    const [endedSession] = await db
      .update(tutorSessions)
      .set({ isActive: false, endedAt: new Date() })
      .where(eq(tutorSessions.id, sessionId))
      .returning();
    return endedSession;
  }

  // Tutor message methods
  async createTutorMessage(message: InsertTutorMessage): Promise<TutorMessage> {
    const [newMessage] = await db
      .insert(tutorMessages)
      .values(message)
      .returning();
    return newMessage;
  }

  async getSessionMessages(sessionId: number): Promise<TutorMessage[]> {
    return await db.select().from(tutorMessages)
      .where(eq(tutorMessages.sessionId, sessionId))
      .orderBy(tutorMessages.timestamp);
  }

  // Student profile methods
  async getStudentProfile(userId: number): Promise<StudentProfile | undefined> {
    const [profile] = await db.select().from(studentProfiles).where(eq(studentProfiles.userId, userId));
    return profile || undefined;
  }

  async createStudentProfile(profile: InsertStudentProfile): Promise<StudentProfile> {
    const [newProfile] = await db
      .insert(studentProfiles)
      .values(profile)
      .returning();
    return newProfile;
  }

  async updateStudentProfile(userId: number, updates: Partial<StudentProfile>): Promise<StudentProfile> {
    const [updatedProfile] = await db
      .update(studentProfiles)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(studentProfiles.userId, userId))
      .returning();
    return updatedProfile;
  }
}

export const storage = new DatabaseStorage();