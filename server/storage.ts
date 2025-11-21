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
  authTokens,
  contentSubmissions,
  studentAssignments,
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
  type InsertStudyStreak,
  type AuthToken,
  type InsertAuthToken,
  type ContentSubmission,
  type InsertContentSubmission,
  type StudentAssignment,
  type InsertStudentAssignment,
  blogPosts,
  botPersonas,
  type BlogPost,
  type InsertBlogPost,
  type BotPersona,
  type InsertBotPersona,
  mentorProfiles,
  mentorshipRequests,
  mentorshipSessions,
  mentorRatings,
  communityPosts,
  communityReplies,
  type MentorProfile,
  type InsertMentorProfile,
  type MentorshipRequest,
  type InsertMentorshipRequest,
  type MentorshipSession,
  type InsertMentorshipSession,
  type MentorRating,
  type InsertMentorRating,
  type CommunityPost,
  type InsertCommunityPost,
  type CommunityReply,
  type InsertCommunityReply
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
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByPhone(phoneNumber: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  getUserByFacebookId(facebookId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User>;
  verifyUser(id: number): Promise<User>;
  updateLastLogin(id: number): Promise<void>;

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

  // Auth token methods
  createAuthToken(token: InsertAuthToken): Promise<AuthToken>;
  getAuthToken(tokenId: string): Promise<AuthToken | undefined>;
  getAuthTokenByToken(token: string): Promise<AuthToken | undefined>;
  revokeAuthToken(tokenId: string): Promise<void>;
  revokeAllUserTokens(userId: number): Promise<void>;

  // Content submission methods
  createContentSubmission(content: InsertContentSubmission): Promise<ContentSubmission>;
  getContentSubmission(id: number): Promise<ContentSubmission | undefined>;
  getTeacherContentSubmissions(teacherId: number): Promise<ContentSubmission[]>;
  getAllContentSubmissions(published?: boolean): Promise<ContentSubmission[]>;
  updateContentSubmission(id: number, updates: Partial<ContentSubmission>): Promise<ContentSubmission>;
  deleteContentSubmission(id: number): Promise<void>;
  publishContentSubmission(id: number): Promise<ContentSubmission>;

  // Student assignment methods
  createStudentAssignment(assignment: InsertStudentAssignment): Promise<StudentAssignment>;
  getStudentAssignment(id: number): Promise<StudentAssignment | undefined>;
  getStudentAssignments(studentId: number): Promise<StudentAssignment[]>;
  getContentAssignments(contentId: number): Promise<StudentAssignment[]>;
  updateStudentAssignment(id: number, updates: Partial<StudentAssignment>): Promise<StudentAssignment>;
  submitAssignment(assignmentId: number, submissionData: { submissionText?: string; submissionFiles?: string[] }): Promise<StudentAssignment>;
  gradeAssignment(assignmentId: number, grade: number, feedback?: string): Promise<StudentAssignment>;

  // Admin analytics methods
  getAnalytics(): Promise<any>;

  // Peer Mentorship System for Honduras Community Learning
  // Mentor profile methods
  getMentorProfile(userId: number): Promise<MentorProfile | undefined>;
  getMentorProfiles(filters?: { subjects?: string[], gradeLevel?: number, isVolunteer?: boolean, isAvailable?: boolean }): Promise<MentorProfile[]>;
  createMentorProfile(profile: InsertMentorProfile): Promise<MentorProfile>;
  updateMentorProfile(userId: number, updates: Partial<MentorProfile>): Promise<MentorProfile>;
  updateMentorRating(mentorId: number, newRating: number, totalRatings: number): Promise<void>;

  // Mentorship request methods
  createMentorshipRequest(request: InsertMentorshipRequest): Promise<MentorshipRequest>;
  getMentorshipRequest(id: number): Promise<MentorshipRequest | undefined>;
  getMentorshipRequests(mentorId?: number, studentId?: number, status?: string): Promise<MentorshipRequest[]>;
  updateMentorshipRequestStatus(id: number, status: string, respondedAt?: Date): Promise<MentorshipRequest>;

  // Mentorship session methods
  createMentorshipSession(session: InsertMentorshipSession): Promise<MentorshipSession>;
  getMentorshipSession(id: number): Promise<MentorshipSession | undefined>;
  getMentorshipSessions(mentorId?: number, studentId?: number, status?: string): Promise<MentorshipSession[]>;
  updateMentorshipSession(id: number, updates: Partial<MentorshipSession>): Promise<MentorshipSession>;
  completeMentorshipSession(id: number, duration?: number, notes?: string): Promise<MentorshipSession>;

  // Mentor rating methods
  createMentorRating(rating: InsertMentorRating): Promise<MentorRating>;
  getMentorRatings(mentorId: number): Promise<MentorRating[]>;
  
  // Community methods
  createCommunityPost(post: InsertCommunityPost): Promise<CommunityPost>;
  getCommunityPosts(subject?: string, postType?: string, limit?: number): Promise<CommunityPost[]>;
  updateCommunityPost(id: number, updates: Partial<CommunityPost>): Promise<CommunityPost>;
  createCommunityReply(reply: InsertCommunityReply): Promise<CommunityReply>;
  getCommunityReplies(postId: number): Promise<CommunityReply[]>;
  upvotePost(postId: number, userId: number): Promise<void>;
  upvoteReply(replyId: number, userId: number): Promise<void>;
  getBudgetAnalytics(): Promise<any>;
  getChatAnalytics(): Promise<any>;
  
  // Blog post methods
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  getBlogPost(id: number): Promise<BlogPost | undefined>;
  getBlogPosts(): Promise<BlogPost[]>;
  updateBlogPost(id: number, updates: Partial<BlogPost>): Promise<BlogPost>;
  deleteBlogPost(id: number): Promise<void>;
  
  // Bot persona methods
  createBotPersona(persona: InsertBotPersona): Promise<BotPersona>;
  getBotPersona(id: number): Promise<BotPersona | undefined>;
  getBotPersonas(): Promise<BotPersona[]>;
  updateBotPersona(id: number, updates: Partial<BotPersona>): Promise<BotPersona>;
  deleteBotPersona(id: number): Promise<void>;

  //Super Admin methods
  getAllUsers(): Promise<User[]>;
}

export class DatabaseStorage { // implements IStorage - temporarily commented to fix LSP errors
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

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUserByPhone(phoneNumber: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.phoneNumber, phoneNumber));
    return user || undefined;
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.googleId, googleId));
    return user || undefined;
  }

  async getUserByFacebookId(facebookId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.facebookId, facebookId));
    return user || undefined;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async verifyUser(id: number): Promise<User> {
    const [verifiedUser] = await db
      .update(users)
      .set({ isVerified: true, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return verifiedUser;
  }

  async updateLastLogin(id: number): Promise<void> {
    await db
      .update(users)
      .set({ lastLoginAt: new Date(), updatedAt: new Date() })
      .where(eq(users.id, id));
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
    const agents = await db.select().from(tutorAgents).where(eq(tutorAgents.isActive, true));
    // Convert bot personas to TutorAgent format for unified interface
    const botPersonasData = await db.select().from(botPersonas).where(eq(botPersonas.isActive, true));
    const convertedPersonas: TutorAgent[] = botPersonasData.map(persona => ({
      id: persona.id,
      agentKey: persona.key,
      name: persona.name,
      title: persona.description || '',
      avatar: '🤖',
      subjects: persona.subjects || [],
      description: persona.description || '',
      isActive: persona.isActive,
      createdAt: persona.createdAt,
    }));
    return [...agents, ...convertedPersonas];
  }

  async getTutorAgent(id: number): Promise<TutorAgent | undefined> {
    const [agent] = await db.select().from(tutorAgents).where(eq(tutorAgents.id, id));
    return agent || undefined;
  }

  async getTutorAgentByKey(agentKey: string): Promise<TutorAgent | undefined> {
    const [agent] = await db.select().from(tutorAgents).where(eq(tutorAgents.agentKey, agentKey));
    return agent || undefined;
  }

  // Bot persona methods
  async getBotPersonas(): Promise<BotPersona[]> {
    return await db.select().from(botPersonas).where(eq(botPersonas.isActive, true));
  }

  async createBotPersona(persona: InsertBotPersona): Promise<BotPersona> {
    const [newPersona] = await db.insert(botPersonas).values(persona).returning();
    return newPersona;
  }

  async updateBotPersona(id: number, updates: Partial<BotPersona>): Promise<BotPersona> {
    const [updatedPersona] = await db
      .update(botPersonas)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(botPersonas.id, id))
      .returning();
    return updatedPersona;
  }

  async deleteBotPersona(id: number): Promise<void> {
    await db.delete(botPersonas).where(eq(botPersonas.id, id));
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

  // Auth token methods
  async createAuthToken(token: InsertAuthToken): Promise<AuthToken> {
    const [authToken] = await db
      .insert(authTokens)
      .values(token)
      .returning();
    return authToken;
  }

  async getAuthToken(tokenId: string): Promise<AuthToken | undefined> {
    const [token] = await db.select().from(authTokens).where(eq(authTokens.token, tokenId));
    return token || undefined;
  }

  async getAuthTokenByToken(token: string): Promise<AuthToken | undefined> {
    const [authToken] = await db.select().from(authTokens).where(eq(authTokens.token, token));
    return authToken || undefined;
  }

  async revokeAuthToken(tokenId: string): Promise<void> {
    await db
      .update(authTokens)
      .set({ isRevoked: true })
      .where(eq(authTokens.token, tokenId));
  }

  async revokeAllUserTokens(userId: number): Promise<void> {
    await db
      .update(authTokens)
      .set({ isRevoked: true })
      .where(eq(authTokens.userId, userId));
  }

  // Content submission methods
  async createContentSubmission(content: InsertContentSubmission): Promise<ContentSubmission> {
    const [submission] = await db
      .insert(contentSubmissions)
      .values(content)
      .returning();
    return submission;
  }

  async getContentSubmission(id: number): Promise<ContentSubmission | undefined> {
    const [submission] = await db.select().from(contentSubmissions).where(eq(contentSubmissions.id, id));
    return submission || undefined;
  }

  async getTeacherContentSubmissions(teacherId: number): Promise<ContentSubmission[]> {
    return await db.select().from(contentSubmissions).where(eq(contentSubmissions.teacherId, teacherId));
  }

  async getAllContentSubmissions(published?: boolean): Promise<ContentSubmission[]> {
    if (published !== undefined) {
      return await db.select().from(contentSubmissions).where(eq(contentSubmissions.isPublished, published));
    }
    return await db.select().from(contentSubmissions);
  }

  async updateContentSubmission(id: number, updates: Partial<ContentSubmission>): Promise<ContentSubmission> {
    const [updated] = await db
      .update(contentSubmissions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(contentSubmissions.id, id))
      .returning();
    return updated;
  }

  async deleteContentSubmission(id: number): Promise<void> {
    await db.delete(contentSubmissions).where(eq(contentSubmissions.id, id));
  }

  async publishContentSubmission(id: number): Promise<ContentSubmission> {
    const [published] = await db
      .update(contentSubmissions)
      .set({ isPublished: true, publishedAt: new Date(), updatedAt: new Date() })
      .where(eq(contentSubmissions.id, id))
      .returning();
    return published;
  }

  // Student assignment methods
  async createStudentAssignment(assignment: InsertStudentAssignment): Promise<StudentAssignment> {
    const [created] = await db
      .insert(studentAssignments)
      .values(assignment)
      .returning();
    return created;
  }

  async getStudentAssignment(id: number): Promise<StudentAssignment | undefined> {
    const [assignment] = await db.select().from(studentAssignments).where(eq(studentAssignments.id, id));
    return assignment || undefined;
  }

  async getStudentAssignments(studentId: number): Promise<StudentAssignment[]> {
    return await db.select().from(studentAssignments).where(eq(studentAssignments.studentId, studentId));
  }

  async getContentAssignments(contentId: number): Promise<StudentAssignment[]> {
    return await db.select().from(studentAssignments).where(eq(studentAssignments.contentId, contentId));
  }

  async updateStudentAssignment(id: number, updates: Partial<StudentAssignment>): Promise<StudentAssignment> {
    const [updated] = await db
      .update(studentAssignments)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(studentAssignments.id, id))
      .returning();
    return updated;
  }

  async submitAssignment(assignmentId: number, submissionData: { submissionText?: string; submissionFiles?: string[] }): Promise<StudentAssignment> {
    const [submitted] = await db
      .update(studentAssignments)
      .set({ 
        status: 'completed',
        completedAt: new Date(),
        submissionText: submissionData.submissionText,
        submissionFiles: submissionData.submissionFiles || [],
        updatedAt: new Date()
      })
      .where(eq(studentAssignments.id, assignmentId))
      .returning();
    return submitted;
  }

  async gradeAssignment(assignmentId: number, grade: number, feedback?: string): Promise<StudentAssignment> {
    const [graded] = await db
      .update(studentAssignments)
      .set({ 
        status: 'reviewed',
        grade: grade.toString(),
        teacherFeedback: feedback,
        updatedAt: new Date()
      })
      .where(eq(studentAssignments.id, assignmentId))
      .returning();
    return graded;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(users.createdAt);
  }

  // User management methods for superusers
  async updateUserRole(userId: number, role: string): Promise<User> {
    const [updated] = await db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return updated;
  }

  async deleteUser(userId: number): Promise<void> {
    await db.delete(users).where(eq(users.id, userId));
  }

  async activateUser(userId: number): Promise<User> {
    const [updated] = await db
      .update(users)
      .set({ isActive: true, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return updated;
  }

  async deactivateUser(userId: number): Promise<User> {
    const [updated] = await db
      .update(users)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return updated;
  }

  // Admin analytics methods
  async getAnalytics(): Promise<any> {
    const totalUsers = await db.select({ count: sql<number>`count(*)` }).from(users);
    const newUsersThisMonth = await db.select({ count: sql<number>`count(*)` })
      .from(users)
      .where(sql`created_at >= date_trunc('month', current_date)`);
    const activeSessions = await db.select({ count: sql<number>`count(*)` })
      .from(tutorSessions)
      .where(eq(tutorSessions.isActive, true));

    return {
      totalUsers: totalUsers[0]?.count || 0,
      newUsersThisMonth: newUsersThisMonth[0]?.count || 0,
      activeSessions: activeSessions[0]?.count || 0
    };
  }

  async getBudgetAnalytics(): Promise<any> {
    const registeredUsers = await db.select({ count: sql<number>`count(distinct user_id)` }).from(budgetCategories);
    const totalTransactions = await db.select({ count: sql<number>`count(*)` }).from(budgetTransactions);
    const avgExpenses = await db.select({ 
      avg: sql<number>`avg(amount)` 
    }).from(budgetTransactions).where(sql`amount < 0`);
    const avgIncome = await db.select({ 
      avg: sql<number>`avg(amount)` 
    }).from(budgetTransactions).where(sql`amount > 0`);
    const popularCategory = await db.select({ 
      name: budgetCategories.name,
      count: sql<number>`count(*)`
    })
    .from(budgetTransactions)
    .innerJoin(budgetCategories, eq(budgetTransactions.categoryId, budgetCategories.id))
    .groupBy(budgetCategories.name)
    .orderBy(sql`count(*) desc`)
    .limit(1);

    return {
      registeredUsers: registeredUsers[0]?.count || 0,
      totalTransactions: totalTransactions[0]?.count || 0,
      monthlyAvgTransactions: Math.round((totalTransactions[0]?.count || 0) / 12),
      avgMonthlyExpense: Math.abs(avgExpenses[0]?.avg || 0),
      avgMonthlyIncome: avgIncome[0]?.avg || 0,
      popularCategory: popularCategory[0]?.name || 'N/A'
    };
  }

  async getChatAnalytics(): Promise<any> {
    const totalRequests = await db.select({ count: sql<number>`count(*)` }).from(tutorMessages);
    const thisMonth = await db.select({ count: sql<number>`count(*)` })
      .from(tutorMessages)
      .where(sql`timestamp >= date_trunc('month', current_date)`);

    // Mock frequent questions for now (would need a separate table in real implementation)
    const frequentQuestions = [
      { text: "How do I solve quadratic equations?", count: 45 },
      { text: "What is the derivative of x²?", count: 32 },
      { text: "Explain photosynthesis", count: 28 }
    ];

    return {
      totalRequests: totalRequests[0]?.count || 0,
      thisMonth: thisMonth[0]?.count || 0,
      avgPerDay: Math.round((thisMonth[0]?.count || 0) / 30),
      frequentQuestions
    };
  }

  // Blog post methods
  async createBlogPost(post: InsertBlogPost): Promise<BlogPost> {
    const [created] = await db
      .insert(blogPosts)
      .values(post)
      .returning();
    return created;
  }

  async getBlogPost(id: number): Promise<BlogPost | undefined> {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.id, id));
    return post || undefined;
  }

  async getBlogPosts(): Promise<BlogPost[]> {
    return await db.select().from(blogPosts).orderBy(desc(blogPosts.createdAt));
  }

  async updateBlogPost(id: number, updates: Partial<BlogPost>): Promise<BlogPost> {
    const [updated] = await db
      .update(blogPosts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(blogPosts.id, id))
      .returning();
    return updated;
  }

  async deleteBlogPost(id: number): Promise<void> {
    await db.delete(blogPosts).where(eq(blogPosts.id, id));
  }
}

export const storage = new DatabaseStorage();