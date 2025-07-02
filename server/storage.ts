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
  badges,
  userBadges,
  studyStreaks,
  type TutorAgent,
  type InsertTutorAgent,
  type TutorSession,
  type InsertTutorSession,
  type TutorMessage,
  type InsertTutorMessage,
  type StudentProfile,
  type InsertStudentProfile,
  type Badge,
  type InsertBadge,
  type UserBadge,
  type InsertUserBadge,
  type StudyStreak,
  type InsertStudyStreak
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";
import { 
  calculateLevel, 
  calculateSessionPoints, 
  checkBadgeEligibility,
  PREDEFINED_BADGES
} from "@shared/badgeSystem";

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
  
  // Badge system methods
  getBadges(): Promise<Badge[]>;
  getBadge(id: number): Promise<Badge | undefined>;
  getBadgeByKey(badgeKey: string): Promise<Badge | undefined>;
  createBadge(badge: InsertBadge): Promise<Badge>;
  
  // User badge methods
  getUserBadges(userId: number): Promise<UserBadge[]>;
  createUserBadge(userBadge: InsertUserBadge): Promise<UserBadge>;
  markBadgeAsViewed(userId: number, badgeId: number): Promise<void>;
  
  // Study streak methods
  getStudyStreaks(userId: number, limit?: number): Promise<StudyStreak[]>;
  createStudyStreak(streak: InsertStudyStreak): Promise<StudyStreak>;
  getTodayStreak(userId: number): Promise<StudyStreak | undefined>;
  
  // Reward calculation methods
  awardSessionRewards(userId: number, sessionData: {
    sessionId: number;
    subject: string;
    duration?: number;
    messagesExchanged: number;
    difficulty: number;
  }): Promise<{ pointsEarned: number; badgesEarned: Badge[]; levelUp: boolean }>;
  
  // Statistics
  getUserSessionStats(userId: number): Promise<{
    subjectSessions: Record<string, number>;
    todaySessions: number;
    totalSessions: number;
  }>;
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

  // Badge system methods
  async getBadges(): Promise<Badge[]> {
    return await db.select().from(badges);
  }

  async getBadge(id: number): Promise<Badge | undefined> {
    const [badge] = await db.select().from(badges).where(eq(badges.id, id));
    return badge || undefined;
  }

  async getBadgeByKey(badgeKey: string): Promise<Badge | undefined> {
    const [badge] = await db.select().from(badges).where(eq(badges.badgeKey, badgeKey));
    return badge || undefined;
  }

  async createBadge(badge: InsertBadge): Promise<Badge> {
    const [newBadge] = await db.insert(badges).values(badge).returning();
    return newBadge;
  }

  // User badge methods
  async getUserBadges(userId: number): Promise<UserBadge[]> {
    return await db.select().from(userBadges).where(eq(userBadges.userId, userId));
  }

  async createUserBadge(userBadge: InsertUserBadge): Promise<UserBadge> {
    const [newUserBadge] = await db.insert(userBadges).values(userBadge).returning();
    return newUserBadge;
  }

  async markBadgeAsViewed(userId: number, badgeId: number): Promise<void> {
    await db
      .update(userBadges)
      .set({ isNew: false })
      .where(and(eq(userBadges.userId, userId), eq(userBadges.badgeId, badgeId)));
  }

  // Study streak methods
  async getStudyStreaks(userId: number, limit: number = 30): Promise<StudyStreak[]> {
    return await db
      .select()
      .from(studyStreaks)
      .where(eq(studyStreaks.userId, userId))
      .orderBy(desc(studyStreaks.date))
      .limit(limit);
  }

  async createStudyStreak(streak: InsertStudyStreak): Promise<StudyStreak> {
    const [newStreak] = await db.insert(studyStreaks).values(streak).returning();
    return newStreak;
  }

  async getTodayStreak(userId: number): Promise<StudyStreak | undefined> {
    const today = new Date().toISOString().split('T')[0];
    const [streak] = await db
      .select()
      .from(studyStreaks)
      .where(and(
        eq(studyStreaks.userId, userId),
        sql`DATE(${studyStreaks.date}) = ${today}`
      ));
    return streak || undefined;
  }

  // Reward calculation and badge awarding
  async awardSessionRewards(userId: number, sessionData: {
    sessionId: number;
    subject: string;
    duration?: number;
    messagesExchanged: number;
    difficulty: number;
  }): Promise<{ pointsEarned: number; badgesEarned: Badge[]; levelUp: boolean }> {
    // Get user's current profile
    let profile = await this.getStudentProfile(userId);
    if (!profile) {
      profile = await this.createStudentProfile({
        userId,
        level: 1,
        experiencePoints: 0,
        totalSessionsCompleted: 0,
        currentStreak: 0,
        longestStreak: 0
      });
    }

    // Calculate points for this session
    const pointsEarned = calculateSessionPoints({
      duration: sessionData.duration,
      messagesExchanged: sessionData.messagesExchanged,
      difficulty: sessionData.difficulty,
      completed: true
    });

    // Update session count and streak
    const sessionStats = await this.getUserSessionStats(userId);
    const todayStreak = await this.getTodayStreak(userId);
    let newStreak = profile.currentStreak;

    if (!todayStreak) {
      // First session today - increment streak
      newStreak = profile.currentStreak + 1;
      await this.createStudyStreak({
        userId,
        date: new Date(),
        sessionsCompleted: 1,
        pointsEarned: pointsEarned,
        subjectsStudied: [sessionData.subject]
      });
    } else {
      // Update today's streak session count
      const currentSubjects = todayStreak.subjectsStudied || [];
      const updatedSubjects = currentSubjects.includes(sessionData.subject) 
        ? currentSubjects 
        : [...currentSubjects, sessionData.subject];
      
      await db
        .update(studyStreaks)
        .set({ 
          sessionsCompleted: todayStreak.sessionsCompleted + 1,
          pointsEarned: todayStreak.pointsEarned + pointsEarned,
          subjectsStudied: updatedSubjects
        })
        .where(eq(studyStreaks.id, todayStreak.id));
    }

    // Calculate new level
    const newXP = profile.experiencePoints + pointsEarned;
    const currentLevel = profile.level;
    const newLevel = calculateLevel(newXP);
    const levelUp = newLevel > currentLevel;

    // Update profile
    await this.updateStudentProfile(userId, {
      experiencePoints: newXP,
      level: newLevel,
      totalSessionsCompleted: profile.totalSessionsCompleted + 1,
      currentStreak: newStreak,
      longestStreak: Math.max(profile.longestStreak, newStreak)
    });

    // Check for new badges
    const earnedBadges: Badge[] = [];
    const allBadges = await this.getBadges();
    const userBadgesList = await this.getUserBadges(userId);
    const earnedBadgeIds = new Set(userBadgesList.map(ub => ub.badgeId));

    const updatedSessionStats = {
      ...sessionStats,
      totalSessions: sessionStats.totalSessions + 1,
      todaySessions: sessionStats.todaySessions + 1,
      subjectSessions: {
        ...sessionStats.subjectSessions,
        [sessionData.subject]: (sessionStats.subjectSessions[sessionData.subject] || 0) + 1
      }
    };

    for (const badge of allBadges) {
      if (!earnedBadgeIds.has(badge.id)) {
        const updatedProfile = { ...profile, experiencePoints: newXP, level: newLevel, totalSessionsCompleted: profile.totalSessionsCompleted + 1, currentStreak: newStreak };
        
        if (checkBadgeEligibility(badge, updatedProfile, {
          ...updatedSessionStats,
          sessionTime: new Date()
        })) {
          await this.createUserBadge({
            userId,
            badgeId: badge.id,
            progress: 100,
            isNew: true
          });
          earnedBadges.push(badge);
        }
      }
    }

    return {
      pointsEarned,
      badgesEarned: earnedBadges,
      levelUp
    };
  }

  // Statistics helper
  async getUserSessionStats(userId: number): Promise<{
    subjectSessions: Record<string, number>;
    todaySessions: number;
    totalSessions: number;
  }> {
    const today = new Date().toISOString().split('T')[0];
    
    // Get all user sessions (completed sessions have endedAt set)
    const allSessions = await db
      .select()
      .from(tutorSessions)
      .where(and(
        eq(tutorSessions.userId, userId),
        sql`${tutorSessions.endedAt} IS NOT NULL`
      ));

    // Get today's sessions
    const todaySessions = allSessions.filter(session => 
      session.startedAt.toISOString().split('T')[0] === today
    );

    // Count sessions by subject
    const subjectSessions: Record<string, number> = {};
    for (const session of allSessions) {
      const subject = session.subject || 'general';
      subjectSessions[subject] = (subjectSessions[subject] || 0) + 1;
    }

    return {
      subjectSessions,
      todaySessions: todaySessions.length,
      totalSessions: allSessions.length
    };
  }
}

export const storage = new DatabaseStorage();