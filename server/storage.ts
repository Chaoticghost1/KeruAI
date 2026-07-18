import { 
  users, 
  budgetCategories, 
  budgetTransactions, 
  studyNotes, 
  gameScores,
  mathProblems,
  languageProblems,
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
  type MathProblem,
  type LanguageProblem,
  tutorAgents,
  tutorSessions,
  tutorMessages,
  tutorQaCache,
  studentProfiles,
  badges,
  userBadges,
  studyStreaks,
  authTokens,
  contentSubmissions,
  contentSources,
  contentChunks,
  practiceQuestionGenerations,
  revisionPacks,
  revisionPackItems,
  studentAssignments,
  type TutorAgent,
  type InsertTutorAgent,
  type TutorSession,
  type InsertTutorSession,
  type TutorMessage,
  type InsertTutorMessage,
  type InsertTutorQaCache,
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
  type ContentSource,
  type InsertContentSource,
  type ContentChunk,
  type InsertContentChunk,
  type PracticeQuestionGeneration,
  type InsertPracticeGeneration,
  type RevisionPack,
  type InsertRevisionPack,
  type RevisionPackItem,
  type InsertRevisionPackItem,
  type StudentAssignment,
  type InsertStudentAssignment,
  classes,
  classMembers,
  studentTeachers,
  classChatMessages,
  blogPosts,
  botPersonas,
  type Class,
  type InsertClass,
  type ClassMember,
  type InsertClassMember,
  type StudentTeacher,
  type InsertStudentTeacher,
  type ClassChatMessage,
  type InsertClassChatMessage,
  classChatArchives,
  type ClassChatArchive,
  type InsertClassChatArchive,
  type BlogPost,
  type InsertBlogPost,
  type BotPersona,
  type InsertBotPersona,
  mentorProfiles,
  mentorshipRequests,
  mentorshipSessions,
  mentorRatings,
  mentorApplications,
  mentorMaterials,
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
  type MentorApplication,
  type InsertMentorApplication,
  type MentorMaterial,
  type InsertMentorMaterial,
  systemSettings
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, gte, inArray } from "drizzle-orm";
import { debug } from "./lib/debug-study-materials";
import { 
  calculateLevel, 
  calculateSessionPoints, 
  calculateGameScorePoints,
  checkBadgeEligibility,
  checkBadgeEligibilityForGame,
  PREDEFINED_BADGES
} from "@shared/badgeSystem";

/** Return type for getAnalytics() */
export interface AnalyticsResult {
  totalUsers: number;
  newUsersThisMonth: number;
  newUsersThisWeek: number;
  activeUsersLast30Days: number;
  activeSessions: number;
  usersByRole: { student: number; teacher: number; superuser: number };
  totalContent: number;
  newContentThisWeek: number;
  publishedContent: number;
  totalClasses: number;
  activeClasses: number;
  totalClassMembers: number;
  totalClassChatMessages: number;
  totalTutorSessions: number;
  sessionsThisMonth: number;
  totalStudyNotes: number;
  totalBlogPosts: number;
  publishedBlogPosts: number;
  mentorApplicationsTotal: number;
  mentorApplicationsPending: number;
  contentByType: { type: string | null; count: number }[];
  contentBySubject: { subject: string; count: number }[];
  assignmentsTotal: number;
  assignmentsCompleted: number;
  systemHealth: string;
}

/** Return type for getBudgetAnalytics() */
export interface BudgetAnalyticsResult {
  registeredUsers: number;
  totalTransactions: number;
  monthlyAvgTransactions: number;
  avgMonthlyExpense: number;
  avgMonthlyIncome: number;
  averageBudget: number;
  popularCategory: string;
}

/** Return type for getChatAnalytics() */
export interface ChatAnalyticsResult {
  totalRequests: number;
  thisMonth: number;
  thisWeek: number;
  avgPerDay: number;
  frequentQuestions: { text: string; count: number }[];
  messagesByDayLast30: { date: string; count: number }[];
  messagesByAgent: { agentKey: string; name: string; count: number }[];
  messagesBySubject: { subject: string; count: number }[];
}

/** Return type for getSuperuserAnalytics() */
export interface SuperuserAnalyticsResult extends AnalyticsResult {
  chat: ChatAnalyticsResult;
  budget: BudgetAnalyticsResult;
  userGrowth: { date: string; count: number }[];
  recentSignups: { id: number; username: string; role: string; createdAt: Date; displayName: string }[];
  topUsersBySessions: { userId: number; displayName: string; sessionCount: number }[];
  mentorProfilesCount: number;
  mentorshipRequestsTotal: number;
  mentorshipSessionsTotal: number;
  mentorshipSessionsCompleted: number;
  totalContentViewCount: number;
  gameScoresCount: number;
  qaCacheEntries: number;
  classChatMessagesByDay: { date: string; count: number }[];
  assignmentsByStatus: { status: string; count: number }[];
  blogPostsByCategory: { category: string; count: number }[];
}

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
  updateBudgetCategory(id: number, userId: number, updates: Partial<BudgetCategory>): Promise<BudgetCategory>;
  deleteBudgetCategory(id: number, userId: number): Promise<void>;
  getBudgetTransactions(userId: number): Promise<BudgetTransaction[]>;
  createBudgetTransaction(transaction: InsertBudgetTransaction): Promise<BudgetTransaction>;
  updateBudgetTransaction(id: number, userId: number, updates: Partial<BudgetTransaction>): Promise<BudgetTransaction>;
  deleteBudgetTransaction(id: number, userId: number): Promise<void>;

  // Study notes methods
  getStudyNotes(userId: number): Promise<StudyNote[]>;
  getStudyNoteById(id: number): Promise<StudyNote | undefined>;
  createStudyNote(note: InsertStudyNote): Promise<StudyNote>;
  updateStudyNote(id: number, updates: Partial<StudyNote>): Promise<StudyNote>;
  deleteStudyNote(id: number): Promise<void>;

  // Game scores methods
  getGameScores(userId: number, gameName?: string): Promise<GameScore[]>;
  createGameScore(score: InsertGameScore): Promise<GameScore>;
  getTopScores(gameName: string, limit?: number): Promise<GameScore[]>;
  getTopScoresWithDisplayNames(gameName: string, limit?: number): Promise<(GameScore & { displayName: string })[]>;
  getGameProgress(userId: number, gameName: string): Promise<{ level: number }>;

  // Game problem content (MathMaster, LinguaPlay)
  getMathProblems(level: number, limit?: number): Promise<MathProblem[]>;
  getLanguageProblems(level: number, mode: string, limit?: number): Promise<LanguageProblem[]>;

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

  // Tutor QA cache (duplicate question detection, token savings)
  getCachedResponse(sessionId: number, agentKey: string, questionHash: string): Promise<{ agentResponse: string } | undefined>;
  saveCachedResponse(sessionId: number, agentKey: string, questionHash: string, studentMessage: string, agentResponse: string): Promise<void>;

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
  awardGameScoreRewards(userId: number, data: { gameName: string; score: number }): Promise<{ pointsEarned: number; badgesEarned: Badge[]; levelUp: boolean }>;

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

  // Curriculum RAG: content sources + chunks
  createContentSource(source: InsertContentSource): Promise<ContentSource>;
  updateContentSource(id: number, updates: Partial<ContentSource>): Promise<ContentSource>;
  getContentSource(id: number): Promise<ContentSource | undefined>;
  getMyContentSources(ownerUserId: number): Promise<ContentSource[]>;
  createContentChunks(chunks: InsertContentChunk[]): Promise<ContentChunk[]>;
  getChunksBySource(sourceId: number): Promise<ContentChunk[]>;
  findCurriculumChunks(filter: {
    subject: string;
    topic?: string;
    gradeLevel?: string;
    language?: string;
    limit?: number;
  }): Promise<ContentChunk[]>;

  // Student Revision v2: practice generations + packs
  createPracticeGeneration(gen: InsertPracticeGeneration): Promise<PracticeQuestionGeneration>;
  getPracticeGeneration(id: number): Promise<PracticeQuestionGeneration | undefined>;
  createRevisionPack(pack: InsertRevisionPack): Promise<RevisionPack>;
  updateRevisionPack(id: number, updates: Partial<RevisionPack>): Promise<RevisionPack>;
  getRevisionPacks(userId: number): Promise<RevisionPack[]>;
  getRevisionPack(userId: number, packId: number): Promise<(RevisionPack & { items: (RevisionPackItem & { question: PracticeQuestionGeneration | null })[] }) | undefined>;
  addRevisionPackItem(item: InsertRevisionPackItem): Promise<RevisionPackItem>;
  updateRevisionPackItem(id: number, updates: Partial<RevisionPackItem>): Promise<RevisionPackItem>;
  setPackOfflineReady(packId: number, offlineReady: boolean): Promise<RevisionPack>;

  // Student assignment methods
  createStudentAssignment(assignment: InsertStudentAssignment): Promise<StudentAssignment>;
  getStudentAssignment(id: number): Promise<StudentAssignment | undefined>;
  getStudentAssignments(studentId: number): Promise<StudentAssignment[]>;
  getAllStudentAssignments(): Promise<StudentAssignment[]>;
  getContentAssignments(contentId: number): Promise<StudentAssignment[]>;
  updateStudentAssignment(id: number, updates: Partial<StudentAssignment>): Promise<StudentAssignment>;
  submitAssignment(assignmentId: number, submissionData: { submissionText?: string; submissionFiles?: string[] }): Promise<StudentAssignment>;
  gradeAssignment(assignmentId: number, grade: number, feedback?: string): Promise<StudentAssignment>;

  // Admin analytics methods
  getAnalytics(): Promise<AnalyticsResult>;

  // Peer Mentorship System for Honduras Community Learning
  // Mentor profile methods
  getMentorProfile(userId: number): Promise<MentorProfile | undefined>;
  getMentorProfiles(filters?: { subjects?: string[], gradeLevel?: number, isVolunteer?: boolean, isAvailable?: boolean }): Promise<MentorProfile[]>;
  getMentorProfilesPaginated(filters?: { subjects?: string[], gradeLevel?: number, isVolunteer?: boolean, isAvailable?: boolean }, limit?: number, offset?: number): Promise<{ data: MentorProfile[], total: number }>;
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

  // Mentor application methods (public form, admin pre-approval)
  createMentorApplication(app: InsertMentorApplication): Promise<MentorApplication>;
  getMentorApplications(status?: string): Promise<MentorApplication[]>;
  getMentorApplicationsPaginated(status?: string, limit?: number, offset?: number): Promise<{ data: MentorApplication[], total: number }>;
  getMentorApplication(id: number): Promise<MentorApplication | undefined>;
  updateMentorApplication(id: number, updates: Partial<MentorApplication>): Promise<MentorApplication>;

  // Mentor material methods (upload by mentor, admin approval)
  createMentorMaterial(material: InsertMentorMaterial): Promise<MentorMaterial>;
  getMentorMaterials(mentorId?: number, status?: string): Promise<MentorMaterial[]>;
  getMentorMaterial(id: number): Promise<MentorMaterial | undefined>;
  updateMentorMaterial(id: number, updates: Partial<MentorMaterial>): Promise<MentorMaterial>;

  // Community: deferred — schema has communityPosts/communityReplies; no API or IStorage methods until feature is implemented (see docs/DATABASE.md).

  getBudgetAnalytics(): Promise<BudgetAnalyticsResult>;
  getChatAnalytics(): Promise<ChatAnalyticsResult>;
  getSuperuserAnalytics(): Promise<SuperuserAnalyticsResult>;

  // Blog post methods
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  getBlogPost(id: number): Promise<BlogPost | undefined>;
  getBlogPosts(): Promise<BlogPost[]>;
  getBlogPostsPaginated(limit?: number, offset?: number): Promise<{ data: BlogPost[], total: number }>;
  getPublishedBlogPosts(limit?: number, offset?: number): Promise<{ data: BlogPost[], total: number }>;
  getLandingBlogPosts(limit?: number): Promise<BlogPost[]>;
  updateBlogPost(id: number, updates: Partial<BlogPost>): Promise<BlogPost>;
  deleteBlogPost(id: number): Promise<void>;
  
  // Bot persona methods
  createBotPersona(persona: InsertBotPersona): Promise<BotPersona>;
  getBotPersona(id: number): Promise<BotPersona | undefined>;
  getBotPersonaByKey(key: string): Promise<BotPersona | undefined>;
  getBotPersonas(): Promise<BotPersona[]>;
  getBotPersonasPaginated(limit?: number, offset?: number): Promise<{ data: BotPersona[], total: number }>;
  updateBotPersona(id: number, updates: Partial<BotPersona>): Promise<BotPersona>;
  deleteBotPersona(id: number): Promise<void>;

  // Content submission paginated methods for admin
  getAllContentSubmissionsPaginated(published?: boolean, limit?: number, offset?: number): Promise<{ data: ContentSubmission[], total: number }>;
  
  // Student assignment paginated methods for admin
  getAllStudentAssignmentsPaginated(limit?: number, offset?: number): Promise<{ data: StudentAssignment[], total: number }>;

  // Class group methods
  createClass(classData: InsertClass): Promise<Class>;
  getClass(id: number): Promise<Class | undefined>;
  getClassByInviteCode(inviteCode: string): Promise<Class | undefined>;
  getTeacherClasses(teacherId: number): Promise<Class[]>;
  deleteClass(id: number): Promise<void>;
  getStudentClasses(userId: number): Promise<{ class: Class; member: ClassMember }[]>;
  addClassMember(member: InsertClassMember): Promise<ClassMember>;
  getClassMembers(classId: number): Promise<(ClassMember & { user: User })[]>;
  getClassMember(classId: number, userId: number): Promise<ClassMember | undefined>;
  isClassMember(classId: number, userId: number): Promise<boolean>;
  isClassMemberApproved(classId: number, userId: number): Promise<boolean>;
  hasAnyApprovedClass(userId: number): Promise<boolean>;
  approveClassMember(classId: number, userId: number): Promise<ClassMember>;
  removeClassMember(classId: number, userId: number): Promise<void>;
  updateClass(id: number, updates: Partial<Pick<Class, 'status' | 'blockedUntil'>>): Promise<Class>;
  updateClassMember(classId: number, userId: number, updates: Partial<Pick<ClassMember, 'canChat' | 'isBanned' | 'accessRevoked'>>): Promise<ClassMember>;

  // Class chat methods
  createClassChatMessage(message: InsertClassChatMessage): Promise<ClassChatMessage>;
  getClassChatMessages(classId: number, limit?: number, offset?: number): Promise<(ClassChatMessage & { sender: User })[]>;

  // Class chat archives (super admin only; optional search by class name or invite code)
  createClassChatArchive(archive: InsertClassChatArchive): Promise<ClassChatArchive>;
  getClassChatArchives(): Promise<ClassChatArchive[]>;
  getClassChatArchivesPaginated(limit: number, offset: number, search?: string): Promise<{ data: ClassChatArchive[]; total: number }>;
  getClassChatArchive(id: number): Promise<ClassChatArchive | undefined>;

  // Student-selected teachers (Option A: explicit selection)
  getTeachersForStudents(): Promise<User[]>;
  getStudentTeachers(studentId: number): Promise<StudentTeacher[]>;
  addStudentTeacher(studentId: number, teacherId: number): Promise<StudentTeacher>;
  removeStudentTeacher(studentId: number, teacherId: number): Promise<void>;
  isStudentTeacher(studentId: number, teacherId: number): Promise<boolean>;

  // Super Admin methods
  getAllUsers(): Promise<User[]>;

  // System settings (feature flags, moderation)
  getSystemSetting(key: string): Promise<unknown>;
  setSystemSetting(key: string, value: unknown): Promise<void>;
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
    if (!verifiedUser) {
      throw new Error('User not found or could not be verified');
    }
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

  async updateBudgetCategory(id: number, userId: number, updates: Partial<BudgetCategory>): Promise<BudgetCategory> {
    const [updated] = await db
      .update(budgetCategories)
      .set(updates)
      .where(and(eq(budgetCategories.id, id), eq(budgetCategories.userId, userId)))
      .returning();
    if (!updated) throw new Error('Budget category not found');
    return updated;
  }

  async deleteBudgetCategory(id: number, userId: number): Promise<void> {
    await db
      .delete(budgetCategories)
      .where(and(eq(budgetCategories.id, id), eq(budgetCategories.userId, userId)));
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

  async updateBudgetTransaction(id: number, userId: number, updates: Partial<BudgetTransaction>): Promise<BudgetTransaction> {
    const [updated] = await db
      .update(budgetTransactions)
      .set(updates)
      .where(and(eq(budgetTransactions.id, id), eq(budgetTransactions.userId, userId)))
      .returning();
    if (!updated) throw new Error('Budget transaction not found');
    return updated;
  }

  async deleteBudgetTransaction(id: number, userId: number): Promise<void> {
    await db
      .delete(budgetTransactions)
      .where(and(eq(budgetTransactions.id, id), eq(budgetTransactions.userId, userId)));
  }

  // Study notes methods
  async getStudyNotes(userId: number): Promise<StudyNote[]> {
    return await db.select().from(studyNotes).where(eq(studyNotes.userId, userId));
  }

  async getStudyNoteById(id: number): Promise<StudyNote | undefined> {
    const [note] = await db.select().from(studyNotes).where(eq(studyNotes.id, id));
    return note;
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

  async getTopScoresWithDisplayNames(gameName: string, limit: number = 10): Promise<(GameScore & { displayName: string })[]> {
    const rows = await db
      .select({
        id: gameScores.id,
        userId: gameScores.userId,
        gameName: gameScores.gameName,
        score: gameScores.score,
        level: gameScores.level,
        completed: gameScores.completed,
        playedAt: gameScores.playedAt,
        username: users.username,
        firstName: users.firstName,
        lastName: users.lastName,
      })
      .from(gameScores)
      .innerJoin(users, eq(gameScores.userId, users.id))
      .where(eq(gameScores.gameName, gameName))
      .orderBy(desc(gameScores.score))
      .limit(limit);
    return rows.map((r) => {
      const displayName =
        [r.firstName, r.lastName].filter(Boolean).join(" ").trim() || r.username || `User ${r.userId}`;
      const { firstName, lastName, username, ...scoreFields } = r;
      return { ...scoreFields, displayName };
    });
  }

  async getGameProgress(userId: number, gameName: string): Promise<{ level: number }> {
    const [row] = await db
      .select({ level: sql<number | null>`max(${gameScores.level})` })
      .from(gameScores)
      .where(and(eq(gameScores.userId, userId), eq(gameScores.gameName, gameName)));
    const level = row?.level != null ? Number(row.level) : 1;
    return { level };
  }

  async getMathProblems(level: number, limit: number = 50): Promise<MathProblem[]> {
    return await db
      .select()
      .from(mathProblems)
      .where(eq(mathProblems.level, level))
      .limit(limit);
  }

  async getLanguageProblems(level: number, mode: string, limit: number = 50): Promise<LanguageProblem[]> {
    return await db
      .select()
      .from(languageProblems)
      .where(and(eq(languageProblems.level, level), eq(languageProblems.mode, mode)))
      .limit(limit);
  }

  // Tutor agent methods — seed agents + synced admin personas (all in tutor_agents)
  async getTutorAgents(): Promise<TutorAgent[]> {
    const agents = await db.select().from(tutorAgents).where(eq(tutorAgents.isActive, true));
    return agents;
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
  async getBotPersona(id: number): Promise<BotPersona | undefined> {
    const [persona] = await db.select().from(botPersonas).where(eq(botPersonas.id, id));
    return persona || undefined;
  }

  async getBotPersonaByKey(key: string): Promise<BotPersona | undefined> {
    const [persona] = await db.select().from(botPersonas).where(eq(botPersonas.key, key));
    return persona || undefined;
  }

  async getBotPersonas(): Promise<BotPersona[]> {
    return await db.select().from(botPersonas).orderBy(desc(botPersonas.createdAt));
  }

  async createBotPersona(persona: InsertBotPersona): Promise<BotPersona> {
    const [newPersona] = await db.insert(botPersonas).values(persona).returning();
    // Sync to tutor_agents so students can start sessions with this persona
    await db.insert(tutorAgents).values({
      agentKey: newPersona.key,
      name: newPersona.name,
      title: newPersona.description || newPersona.name,
      avatar: '🤖',
      subjects: newPersona.subjects || [],
      description: newPersona.description || '',
      isActive: newPersona.isActive,
    }).onConflictDoNothing({ target: tutorAgents.agentKey });
    return newPersona;
  }

  async updateBotPersona(id: number, updates: Partial<BotPersona>): Promise<BotPersona> {
    const existing = await this.getBotPersona(id);
    if (!existing) throw new Error('Bot persona not found');
    const [updatedPersona] = await db
      .update(botPersonas)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(botPersonas.id, id))
      .returning();
    if (!updatedPersona) throw new Error('Bot persona not found');
    // Sync to tutor_agents (match by key)
    await db
      .update(tutorAgents)
      .set({
        agentKey: updatedPersona.key,
        name: updatedPersona.name,
        title: updatedPersona.description || updatedPersona.name,
        subjects: updatedPersona.subjects || [],
        description: updatedPersona.description || '',
        isActive: updatedPersona.isActive,
      })
      .where(eq(tutorAgents.agentKey, existing.key));
    return updatedPersona;
  }

  async deleteBotPersona(id: number): Promise<void> {
    const persona = await this.getBotPersona(id);
    if (!persona) {
      await db.delete(botPersonas).where(eq(botPersonas.id, id));
      return;
    }
    const agent = await this.getTutorAgentByKey(persona.key);
    if (agent) {
      const sessions = await db.select({ id: tutorSessions.id }).from(tutorSessions).where(eq(tutorSessions.agentId, agent.id));
      const sessionIds = sessions.map((s) => s.id);
      if (sessionIds.length > 0) {
        await db.delete(tutorMessages).where(inArray(tutorMessages.sessionId, sessionIds));
        await db.delete(tutorQaCache).where(inArray(tutorQaCache.sessionId, sessionIds));
        await db.delete(tutorSessions).where(eq(tutorSessions.agentId, agent.id));
      }
      await db.delete(tutorAgents).where(eq(tutorAgents.agentKey, persona.key));
    }
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

  async getCachedResponse(sessionId: number, agentKey: string, questionHash: string): Promise<{ agentResponse: string } | undefined> {
    const [row] = await db
      .select({ agentResponse: tutorQaCache.agentResponse })
      .from(tutorQaCache)
      .where(
        and(
          eq(tutorQaCache.sessionId, sessionId),
          eq(tutorQaCache.agentKey, agentKey),
          eq(tutorQaCache.questionHash, questionHash)
        )
      );
    return row || undefined;
  }

  async saveCachedResponse(sessionId: number, agentKey: string, questionHash: string, studentMessage: string, agentResponse: string): Promise<void> {
    await db
      .insert(tutorQaCache)
      .values({ sessionId, agentKey, questionHash, studentMessage, agentResponse })
      .onConflictDoNothing({ target: [tutorQaCache.sessionId, tutorQaCache.agentKey, tutorQaCache.questionHash] });
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

  async awardGameScoreRewards(userId: number, data: { gameName: string; score: number }): Promise<{ pointsEarned: number; badgesEarned: Badge[]; levelUp: boolean }> {
    const { gameName, score } = data;
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

    const pointsEarned = calculateGameScorePoints(score);
    const todayStreak = await this.getTodayStreak(userId);
    let newStreak = profile.currentStreak;
    const subjectLabel = gameName;

    if (!todayStreak) {
      newStreak = profile.currentStreak + 1;
      await this.createStudyStreak({
        userId,
        sessionsCompleted: 1,
        pointsEarned,
        subjectsStudied: [subjectLabel]
      });
    } else {
      const currentSubjects = todayStreak.subjectsStudied || [];
      const updatedSubjects = currentSubjects.includes(subjectLabel) ? currentSubjects : [...currentSubjects, subjectLabel];
      await db
        .update(studyStreaks)
        .set({
          sessionsCompleted: todayStreak.sessionsCompleted + 1,
          pointsEarned: todayStreak.pointsEarned + pointsEarned,
          subjectsStudied: updatedSubjects
        })
        .where(eq(studyStreaks.id, todayStreak.id));
    }

    const newXP = profile.experiencePoints + pointsEarned;
    const newLevel = calculateLevel(newXP);
    const levelUp = newLevel > profile.level;
    const newTotalPoints = (profile.totalPoints ?? 0) + pointsEarned;

    await this.updateStudentProfile(userId, {
      experiencePoints: newXP,
      level: newLevel,
      totalPoints: newTotalPoints,
      currentStreak: newStreak,
      longestStreak: Math.max(profile.longestStreak, newStreak)
    });

    const gameScores = await this.getGameScores(userId, gameName);
    const gameStats = { count: gameScores.length, maxScore: gameScores.length ? Math.max(...gameScores.map(s => s.score)) : 0 };
    const earnedBadges: Badge[] = [];
    const allBadges = await this.getBadges();
    const userBadgesList = await this.getUserBadges(userId);
    const earnedBadgeIds = new Set(userBadgesList.map(ub => ub.badgeId));

    for (const badge of allBadges) {
      if (!earnedBadgeIds.has(badge.id) && checkBadgeEligibilityForGame(badge, gameName, gameStats)) {
        await this.createUserBadge({ userId, badgeId: badge.id, progress: 100, isNew: true });
        earnedBadges.push(badge);
      }
    }

    return { pointsEarned, badgesEarned: earnedBadges, levelUp };
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

  // ---- Curriculum RAG: content sources + chunks ----

  async createContentSource(source: InsertContentSource): Promise<ContentSource> {
    const [created] = await db.insert(contentSources).values(source).returning();
    return created;
  }

  async updateContentSource(id: number, updates: Partial<ContentSource>): Promise<ContentSource> {
    const [updated] = await db
      .update(contentSources)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(contentSources.id, id))
      .returning();
    return updated;
  }

  async getContentSource(id: number): Promise<ContentSource | undefined> {
    const [source] = await db.select().from(contentSources).where(eq(contentSources.id, id));
    return source;
  }

  async getMyContentSources(ownerUserId: number): Promise<ContentSource[]> {
    return await db
      .select()
      .from(contentSources)
      .where(eq(contentSources.ownerUserId, ownerUserId))
      .orderBy(desc(contentSources.createdAt));
  }

  async createContentChunks(chunks: InsertContentChunk[]): Promise<ContentChunk[]> {
    if (!chunks.length) return [];
    return await db.insert(contentChunks).values(chunks).returning();
  }

  async getChunksBySource(sourceId: number): Promise<ContentChunk[]> {
    return await db
      .select()
      .from(contentChunks)
      .where(eq(contentChunks.sourceId, sourceId))
      .orderBy(contentChunks.chunkIndex);
  }

  async findCurriculumChunks(filter: {
    subject: string;
    topic?: string;
    gradeLevel?: string;
    language?: string;
    limit?: number;
  }): Promise<ContentChunk[]> {
    const conditions = [eq(contentChunks.subject, filter.subject)];
    if (filter.topic) conditions.push(eq(contentChunks.topic, filter.topic));
    if (filter.gradeLevel) conditions.push(eq(contentChunks.gradeLevel, filter.gradeLevel));
    if (filter.language) conditions.push(eq(contentChunks.language, filter.language));
    const limit = Math.min(Math.max(filter.limit ?? 6, 1), 20);
    return await db
      .select()
      .from(contentChunks)
      .where(and(...conditions))
      .orderBy(contentChunks.chunkIndex)
      .limit(limit);
  }

  // ---- Student Revision v2: practice generations + packs ----

  async createPracticeGeneration(gen: InsertPracticeGeneration): Promise<PracticeQuestionGeneration> {
    const [created] = await db.insert(practiceQuestionGenerations).values(gen).returning();
    return created;
  }

  async getPracticeGeneration(id: number): Promise<PracticeQuestionGeneration | undefined> {
    const [row] = await db.select().from(practiceQuestionGenerations).where(eq(practiceQuestionGenerations.id, id));
    return row;
  }

  async createRevisionPack(pack: InsertRevisionPack): Promise<RevisionPack> {
    const [created] = await db.insert(revisionPacks).values(pack).returning();
    return created;
  }

  async updateRevisionPack(id: number, updates: Partial<RevisionPack>): Promise<RevisionPack> {
    const [updated] = await db
      .update(revisionPacks)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(revisionPacks.id, id))
      .returning();
    return updated;
  }

  async getRevisionPacks(userId: number): Promise<RevisionPack[]> {
    return await db
      .select()
      .from(revisionPacks)
      .where(eq(revisionPacks.userId, userId))
      .orderBy(desc(revisionPacks.createdAt));
  }

  async getRevisionPack(userId: number, packId: number): Promise<(RevisionPack & { items: (RevisionPackItem & { question: PracticeQuestionGeneration | null })[] }) | undefined> {
    const [pack] = await db
      .select()
      .from(revisionPacks)
      .where(and(eq(revisionPacks.id, packId), eq(revisionPacks.userId, userId)));
    if (!pack) return undefined;
    const rows = await db
      .select()
      .from(revisionPackItems)
      .leftJoin(
        practiceQuestionGenerations,
        eq(revisionPackItems.practiceGenerationId, practiceQuestionGenerations.id),
      )
      .where(eq(revisionPackItems.packId, packId))
      .orderBy(revisionPackItems.id);
    const items = rows.map((row) => ({
      ...row.revision_pack_items,
      question: row.practice_question_generations,
    }));
    return { ...pack, items };
  }

  async addRevisionPackItem(item: InsertRevisionPackItem): Promise<RevisionPackItem> {
    const [created] = await db.insert(revisionPackItems).values(item).returning();
    // keep pack item count in sync
    await db
      .update(revisionPacks)
      .set({ itemCount: sql`${revisionPacks.itemCount} + 1`, updatedAt: new Date() })
      .where(eq(revisionPacks.id, item.packId));
    return created;
  }

  async updateRevisionPackItem(id: number, updates: Partial<RevisionPackItem>): Promise<RevisionPackItem> {
    const [updated] = await db
      .update(revisionPackItems)
      .set(updates)
      .where(eq(revisionPackItems.id, id))
      .returning();
    return updated;
  }

  async setPackOfflineReady(packId: number, offlineReady: boolean): Promise<RevisionPack> {
    return this.updateRevisionPack(packId, { offlineReady });
  }

  // Class group methods
  private static generateInviteCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  async createClass(classData: InsertClass): Promise<Class> {
    let inviteCode = DatabaseStorage.generateInviteCode();
    let existing = await this.getClassByInviteCode(inviteCode);
    while (existing) {
      inviteCode = DatabaseStorage.generateInviteCode();
      existing = await this.getClassByInviteCode(inviteCode);
    }
    const [cls] = await db
      .insert(classes)
      .values({ ...classData, inviteCode })
      .returning();
    return cls;
  }

  async getClass(id: number): Promise<Class | undefined> {
    const [cls] = await db.select().from(classes).where(eq(classes.id, id));
    return cls || undefined;
  }

  async getClassByInviteCode(inviteCode: string): Promise<Class | undefined> {
    const [cls] = await db.select().from(classes).where(eq(classes.inviteCode, inviteCode.toUpperCase()));
    return cls || undefined;
  }

  async getTeacherClasses(teacherId: number): Promise<Class[]> {
    return await db.select().from(classes).where(eq(classes.teacherId, teacherId)).orderBy(desc(classes.createdAt));
  }

  async deleteClass(id: number): Promise<void> {
    await db.delete(classes).where(eq(classes.id, id));
  }

  async getStudentClasses(userId: number): Promise<{ class: Class; member: ClassMember }[]> {
    const members = await db.select().from(classMembers).where(eq(classMembers.userId, userId));
    const result: { class: Class; member: ClassMember }[] = [];
    for (const m of members) {
      const cls = await this.getClass(m.classId);
      if (cls) result.push({ class: cls, member: m });
    }
    return result.sort((a, b) => new Date(b.class.createdAt).getTime() - new Date(a.class.createdAt).getTime());
  }

  async addClassMember(member: InsertClassMember): Promise<ClassMember> {
    const [added] = await db.insert(classMembers).values(member).returning();
    return added;
  }

  async getClassMembers(classId: number): Promise<(ClassMember & { user: User })[]> {
    const members = await db.select().from(classMembers).where(eq(classMembers.classId, classId));
    const result: (ClassMember & { user: User })[] = [];
    for (const m of members) {
      const user = await this.getUser(m.userId);
      if (user) result.push({ ...m, user });
    }
    return result;
  }

  async getClassMember(classId: number, userId: number): Promise<ClassMember | undefined> {
    const [m] = await db.select().from(classMembers).where(and(eq(classMembers.classId, classId), eq(classMembers.userId, userId)));
    return m || undefined;
  }

  async isClassMember(classId: number, userId: number): Promise<boolean> {
    const members = await db.select().from(classMembers).where(and(eq(classMembers.classId, classId), eq(classMembers.userId, userId)));
    return members.length > 0;
  }

  async isClassMemberApproved(classId: number, userId: number): Promise<boolean> {
    const [m] = await db.select().from(classMembers).where(and(eq(classMembers.classId, classId), eq(classMembers.userId, userId)));
    return !!m && m.status === 'approved';
  }

  async hasAnyApprovedClass(userId: number): Promise<boolean> {
    const members = await db.select().from(classMembers).where(eq(classMembers.userId, userId));
    return members.some(m => m.status === 'approved');
  }

  async approveClassMember(classId: number, userId: number): Promise<ClassMember> {
    const [approved] = await db
      .update(classMembers)
      .set({ status: 'approved' })
      .where(and(eq(classMembers.classId, classId), eq(classMembers.userId, userId)))
      .returning();
    if (!approved) throw new Error('Class member not found');
    return approved;
  }

  async removeClassMember(classId: number, userId: number): Promise<void> {
    await db.delete(classMembers).where(and(eq(classMembers.classId, classId), eq(classMembers.userId, userId)));
  }

  async updateClass(id: number, updates: Partial<Pick<Class, 'status' | 'blockedUntil'>>): Promise<Class> {
    const [updated] = await db.update(classes).set({ ...updates, updatedAt: new Date() }).where(eq(classes.id, id)).returning();
    if (!updated) throw new Error('Class not found');
    return updated;
  }

  async updateClassMember(classId: number, userId: number, updates: Partial<Pick<ClassMember, 'canChat' | 'isBanned' | 'accessRevoked'>>): Promise<ClassMember> {
    const [updated] = await db
      .update(classMembers)
      .set(updates)
      .where(and(eq(classMembers.classId, classId), eq(classMembers.userId, userId)))
      .returning();
    if (!updated) throw new Error('Class member not found');
    return updated;
  }

  async createClassChatMessage(message: InsertClassChatMessage): Promise<ClassChatMessage> {
    const [created] = await db.insert(classChatMessages).values(message).returning();
    return created;
  }

  async getClassChatMessages(classId: number, limit = 100, offset = 0): Promise<(ClassChatMessage & { sender: User })[]> {
    const msgs = await db
      .select()
      .from(classChatMessages)
      .where(eq(classChatMessages.classId, classId))
      .orderBy(desc(classChatMessages.createdAt))
      .limit(limit)
      .offset(offset);
    const result: (ClassChatMessage & { sender: User })[] = [];
    for (const m of msgs.reverse()) {
      const sender = await this.getUser(m.senderId);
      if (sender) result.push({ ...m, sender });
    }
    return result;
  }

  async createClassChatArchive(archive: InsertClassChatArchive): Promise<ClassChatArchive> {
    const [row] = await db.insert(classChatArchives).values(archive).returning();
    return row;
  }

  async getClassChatArchives(): Promise<ClassChatArchive[]> {
    return await db.select().from(classChatArchives).orderBy(desc(classChatArchives.archivedAt));
  }

  async getClassChatArchivesPaginated(limit: number, offset: number, search?: string): Promise<{ data: ClassChatArchive[]; total: number }> {
    const trimmed = search?.trim();
    const searchCondition = trimmed
      ? sql`(${classChatArchives.className} ILIKE ${`%${trimmed}%`} OR ${classChatArchives.inviteCode} ILIKE ${`%${trimmed}%`})`
      : undefined;

    if (searchCondition) {
      const countResult = await db.select({ count: sql<number>`count(*)::int` }).from(classChatArchives).where(searchCondition);
      const total = countResult[0]?.count ?? 0;
      const data = await db
        .select()
        .from(classChatArchives)
        .where(searchCondition)
        .orderBy(desc(classChatArchives.archivedAt))
        .limit(limit)
        .offset(offset);
      return { data, total };
    }

    const countResult = await db.select({ count: sql<number>`count(*)::int` }).from(classChatArchives);
    const total = countResult[0]?.count ?? 0;
    const data = await db
      .select()
      .from(classChatArchives)
      .orderBy(desc(classChatArchives.archivedAt))
      .limit(limit)
      .offset(offset);
    return { data, total };
  }

  async getClassChatArchive(id: number): Promise<ClassChatArchive | undefined> {
    const [row] = await db.select().from(classChatArchives).where(eq(classChatArchives.id, id));
    return row ?? undefined;
  }

  async getTeachersForStudents(): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(and(eq(users.role, 'teacher'), eq(users.isActive, true), eq(users.isVerified, true)))
      .orderBy(users.createdAt);
  }

  async getStudentTeachers(studentId: number): Promise<StudentTeacher[]> {
    return await db.select().from(studentTeachers).where(eq(studentTeachers.studentId, studentId));
  }

  async addStudentTeacher(studentId: number, teacherId: number): Promise<StudentTeacher> {
    const existing = await db
      .select()
      .from(studentTeachers)
      .where(and(eq(studentTeachers.studentId, studentId), eq(studentTeachers.teacherId, teacherId)))
      .limit(1);
    if (existing[0]) return existing[0];
    const [row] = await db.insert(studentTeachers).values({ studentId, teacherId }).returning();
    if (!row) throw new Error('Failed to add student teacher');
    return row;
  }

  async removeStudentTeacher(studentId: number, teacherId: number): Promise<void> {
    await db.delete(studentTeachers).where(and(eq(studentTeachers.studentId, studentId), eq(studentTeachers.teacherId, teacherId)));
  }

  async isStudentTeacher(studentId: number, teacherId: number): Promise<boolean> {
    const [row] = await db.select().from(studentTeachers).where(and(eq(studentTeachers.studentId, studentId), eq(studentTeachers.teacherId, teacherId)));
    return !!row;
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

  async getAllStudentAssignments(): Promise<StudentAssignment[]> {
    return await db.select().from(studentAssignments).orderBy(desc(studentAssignments.createdAt));
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

  async getSystemSetting(key: string): Promise<unknown> {
    const [row] = await db.select().from(systemSettings).where(eq(systemSettings.key, key));
    return row?.value ?? undefined;
  }

  async setSystemSetting(key: string, value: unknown): Promise<void> {
    await db
      .insert(systemSettings)
      .values({ key, value: value as any, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: systemSettings.key,
        set: { value: value as any, updatedAt: new Date() },
      });
  }

  async getAllUsersPaginated(limit: number = 10, offset: number = 0, search?: string): Promise<{ data: User[], total: number }> {
    const trimmed = search?.trim();
    const searchPattern = trimmed ? `%${trimmed}%` : null;
    const searchCondition = searchPattern
      ? sql`(${users.username} ILIKE ${searchPattern} OR COALESCE(${users.email}, '')::text ILIKE ${searchPattern} OR COALESCE(${users.firstName}, '')::text ILIKE ${searchPattern} OR COALESCE(${users.lastName}, '')::text ILIKE ${searchPattern})`
      : undefined;

    if (searchCondition) {
      const [{ count }] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(users)
        .where(searchCondition);
      const data = await db
        .select()
        .from(users)
        .where(searchCondition)
        .orderBy(users.createdAt)
        .limit(limit)
        .offset(offset);
      return { data, total: count };
    }

    const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(users);
    const data = await db
      .select()
      .from(users)
      .orderBy(users.createdAt)
      .limit(limit)
      .offset(offset);
    return { data, total: count };
  }

  async getStudentsPaginated(limit: number = 100, offset: number = 0): Promise<{ data: User[], total: number }> {
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .where(eq(users.role, "student"));
    const data = await db
      .select()
      .from(users)
      .where(eq(users.role, "student"))
      .orderBy(users.createdAt)
      .limit(limit)
      .offset(offset);
    return { data, total: count };
  }

  /** Students who can be assigned content by this teacher: in at least one of their classes OR have them in "Your teachers" (student_teachers). */
  async getStudentsInTeacherClassesPaginated(teacherId: number, limit: number = 100, offset: number = 0): Promise<{ data: User[], total: number }> {
    const tid = Number(teacherId);
    const fromClasses = await db
      .selectDistinct({ userId: classMembers.userId })
      .from(classMembers)
      .innerJoin(classes, eq(classMembers.classId, classes.id))
      .where(eq(classes.teacherId, tid));
    const fromStudentTeachers = await db
      .selectDistinct({ studentId: studentTeachers.studentId })
      .from(studentTeachers)
      .where(eq(studentTeachers.teacherId, tid));
    const idsFromClasses = fromClasses.map((r) => r.userId);
    const idsFromStudentTeachers = fromStudentTeachers.map((r) => r.studentId);
    const ids = [...new Set([...idsFromClasses, ...idsFromStudentTeachers])];

    debug("getStudentsInTeacherClassesPaginated", "query result", {
      teacherId: tid,
      fromClassesCount: idsFromClasses.length,
      fromClassesUserIds: idsFromClasses,
      fromStudentTeachersCount: idsFromStudentTeachers.length,
      fromStudentTeachersStudentIds: idsFromStudentTeachers,
      combinedUniqueIds: ids,
    });

    if (ids.length === 0) {
      debug("getStudentsInTeacherClassesPaginated", "early return: no ids", {});
      return { data: [], total: 0 };
    }
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .where(and(inArray(users.id, ids), eq(users.role, "student")));
    const data = await db
      .select()
      .from(users)
      .where(and(inArray(users.id, ids), eq(users.role, "student")))
      .orderBy(users.createdAt)
      .limit(limit)
      .offset(offset);

    debug("getStudentsInTeacherClassesPaginated", "returning", { total: count, dataLength: data.length, userIds: data.map((u) => u.id) });
    return { data, total: count };
  }

  // Peer Mentorship System
  async getMentorProfile(userId: number): Promise<MentorProfile | undefined> {
    const [profile] = await db.select().from(mentorProfiles).where(eq(mentorProfiles.userId, userId));
    return profile || undefined;
  }

  async getMentorProfiles(filters?: { subjects?: string[]; gradeLevel?: number; isVolunteer?: boolean; isAvailable?: boolean }): Promise<MentorProfile[]> {
    const conditions = [];
    if (filters?.isAvailable !== undefined) {
      conditions.push(eq(mentorProfiles.isAvailable, filters.isAvailable));
    }
    if (filters?.gradeLevel !== undefined) {
      conditions.push(eq(mentorProfiles.gradeLevel, filters.gradeLevel));
    }
    if (filters?.isVolunteer === true) {
      conditions.push(sql`(${mentorProfiles.hourlyRate}::numeric = 0)`);
    }
    if (conditions.length > 0) {
      return await db.select().from(mentorProfiles).where(and(...conditions));
    }
    return await db.select().from(mentorProfiles);
  }

  async getMentorProfilesPaginated(filters?: { subjects?: string[]; gradeLevel?: number; isVolunteer?: boolean; isAvailable?: boolean }, limit: number = 12, offset: number = 0): Promise<{ data: MentorProfile[], total: number }> {
    const conditions = [];
    if (filters?.isAvailable !== undefined) {
      conditions.push(eq(mentorProfiles.isAvailable, filters.isAvailable));
    }
    if (filters?.gradeLevel !== undefined) {
      conditions.push(eq(mentorProfiles.gradeLevel, filters.gradeLevel));
    }
    if (filters?.isVolunteer === true) {
      conditions.push(sql`(${mentorProfiles.hourlyRate}::numeric = 0)`);
    }
    const countResult = conditions.length > 0
      ? await db.select({ count: sql<number>`count(*)::int` }).from(mentorProfiles).where(and(...conditions))
      : await db.select({ count: sql<number>`count(*)::int` }).from(mentorProfiles);
    const total = countResult[0]?.count ?? 0;
    const data = conditions.length > 0
      ? await db.select().from(mentorProfiles).where(and(...conditions)).limit(limit).offset(offset)
      : await db.select().from(mentorProfiles).limit(limit).offset(offset);
    return { data, total };
  }

  async createMentorProfile(profile: InsertMentorProfile): Promise<MentorProfile> {
    const [created] = await db.insert(mentorProfiles).values(profile).returning();
    return created;
  }

  async updateMentorProfile(userId: number, updates: Partial<MentorProfile>): Promise<MentorProfile> {
    const [updated] = await db
      .update(mentorProfiles)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(mentorProfiles.userId, userId))
      .returning();
    if (!updated) throw new Error("Mentor profile not found");
    return updated;
  }

  async updateMentorRating(mentorId: number, newRating: number, totalRatings: number): Promise<void> {
    await db
      .update(mentorProfiles)
      .set({ rating: newRating.toString(), totalRatings, updatedAt: new Date() })
      .where(eq(mentorProfiles.userId, mentorId));
  }

  async createMentorshipRequest(request: InsertMentorshipRequest): Promise<MentorshipRequest> {
    const [created] = await db.insert(mentorshipRequests).values(request).returning();
    return created;
  }

  async getMentorshipRequest(id: number): Promise<MentorshipRequest | undefined> {
    const [req] = await db.select().from(mentorshipRequests).where(eq(mentorshipRequests.id, id));
    return req || undefined;
  }

  async getMentorshipRequests(mentorId?: number, studentId?: number, status?: string): Promise<MentorshipRequest[]> {
    const conditions = [];
    if (mentorId !== undefined) conditions.push(eq(mentorshipRequests.mentorId, mentorId));
    if (studentId !== undefined) conditions.push(eq(mentorshipRequests.studentId, studentId));
    if (status !== undefined) conditions.push(eq(mentorshipRequests.status, status));
    if (conditions.length === 0) return await db.select().from(mentorshipRequests);
    return await db.select().from(mentorshipRequests).where(and(...conditions));
  }

  async updateMentorshipRequestStatus(id: number, status: string, respondedAt?: Date): Promise<MentorshipRequest> {
    const [updated] = await db
      .update(mentorshipRequests)
      .set({ status, respondedAt: respondedAt ?? new Date() })
      .where(eq(mentorshipRequests.id, id))
      .returning();
    if (!updated) throw new Error("Mentorship request not found");
    return updated;
  }

  async createMentorshipSession(session: InsertMentorshipSession): Promise<MentorshipSession> {
    const [created] = await db.insert(mentorshipSessions).values(session).returning();
    return created;
  }

  async getMentorshipSession(id: number): Promise<MentorshipSession | undefined> {
    const [sess] = await db.select().from(mentorshipSessions).where(eq(mentorshipSessions.id, id));
    return sess || undefined;
  }

  async getMentorshipSessions(mentorId?: number, studentId?: number, status?: string): Promise<MentorshipSession[]> {
    const conditions = [];
    if (mentorId !== undefined) conditions.push(eq(mentorshipSessions.mentorId, mentorId));
    if (studentId !== undefined) conditions.push(eq(mentorshipSessions.studentId, studentId));
    if (status !== undefined) conditions.push(eq(mentorshipSessions.status, status));
    if (conditions.length === 0) return await db.select().from(mentorshipSessions);
    return await db.select().from(mentorshipSessions).where(and(...conditions));
  }

  async updateMentorshipSession(id: number, updates: Partial<MentorshipSession>): Promise<MentorshipSession> {
    const [updated] = await db.update(mentorshipSessions).set(updates).where(eq(mentorshipSessions.id, id)).returning();
    if (!updated) throw new Error("Mentorship session not found");
    return updated;
  }

  async completeMentorshipSession(id: number, duration?: number, notes?: string): Promise<MentorshipSession> {
    const [updated] = await db
      .update(mentorshipSessions)
      .set({ status: "completed", endedAt: new Date(), ...(duration !== undefined && { duration }), ...(notes !== undefined && { notes }) })
      .where(eq(mentorshipSessions.id, id))
      .returning();
    if (!updated) throw new Error("Mentorship session not found");
    return updated;
  }

  async createMentorRating(rating: InsertMentorRating): Promise<MentorRating> {
    const [created] = await db.insert(mentorRatings).values(rating).returning();
    return created;
  }

  async getMentorRatings(mentorId: number): Promise<MentorRating[]> {
    return await db.select().from(mentorRatings).where(eq(mentorRatings.mentorId, mentorId));
  }

  async createMentorApplication(app: InsertMentorApplication): Promise<MentorApplication> {
    const [created] = await db.insert(mentorApplications).values(app).returning();
    return created;
  }

  async getMentorApplications(status?: string): Promise<MentorApplication[]> {
    if (status) {
      return await db.select().from(mentorApplications).where(eq(mentorApplications.status, status)).orderBy(desc(mentorApplications.createdAt));
    }
    return await db.select().from(mentorApplications).orderBy(desc(mentorApplications.createdAt));
  }

  async getMentorApplicationsPaginated(status?: string, limit: number = 10, offset: number = 0): Promise<{ data: MentorApplication[], total: number }> {
    const condition = status ? eq(mentorApplications.status, status) : undefined;
    const countResult = condition
      ? await db.select({ count: sql<number>`count(*)::int` }).from(mentorApplications).where(condition)
      : await db.select({ count: sql<number>`count(*)::int` }).from(mentorApplications);
    const total = countResult[0]?.count ?? 0;
    const data = condition
      ? await db.select().from(mentorApplications).where(condition).orderBy(desc(mentorApplications.createdAt)).limit(limit).offset(offset)
      : await db.select().from(mentorApplications).orderBy(desc(mentorApplications.createdAt)).limit(limit).offset(offset);
    return { data, total };
  }

  async getMentorApplication(id: number): Promise<MentorApplication | undefined> {
    const [app] = await db.select().from(mentorApplications).where(eq(mentorApplications.id, id));
    return app || undefined;
  }

  async updateMentorApplication(id: number, updates: Partial<MentorApplication>): Promise<MentorApplication> {
    const [updated] = await db.update(mentorApplications).set({ ...updates, updatedAt: new Date() }).where(eq(mentorApplications.id, id)).returning();
    if (!updated) throw new Error("Mentor application not found");
    return updated;
  }

  async createMentorMaterial(material: InsertMentorMaterial): Promise<MentorMaterial> {
    const [created] = await db.insert(mentorMaterials).values(material).returning();
    return created;
  }

  async getMentorMaterials(mentorId?: number, status?: string): Promise<MentorMaterial[]> {
    const conditions = [];
    if (mentorId !== undefined) conditions.push(eq(mentorMaterials.mentorId, mentorId));
    if (status !== undefined) conditions.push(eq(mentorMaterials.status, status));
    if (conditions.length === 0) return await db.select().from(mentorMaterials).orderBy(desc(mentorMaterials.createdAt));
    return await db.select().from(mentorMaterials).where(and(...conditions)).orderBy(desc(mentorMaterials.createdAt));
  }

  async getMentorMaterial(id: number): Promise<MentorMaterial | undefined> {
    const [m] = await db.select().from(mentorMaterials).where(eq(mentorMaterials.id, id));
    return m || undefined;
  }

  async updateMentorMaterial(id: number, updates: Partial<MentorMaterial>): Promise<MentorMaterial> {
    const [updated] = await db.update(mentorMaterials).set({ ...updates, updatedAt: new Date() }).where(eq(mentorMaterials.id, id)).returning();
    if (!updated) throw new Error("Mentor material not found");
    return updated;
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
  async getAnalytics(): Promise<AnalyticsResult> {
    const totalUsers = await db.select({ count: sql<number>`count(*)` }).from(users);
    const newUsersThisMonth = await db.select({ count: sql<number>`count(*)` })
      .from(users)
      .where(sql`created_at >= date_trunc('month', current_date)`);
    const newUsersThisWeek = await db.select({ count: sql<number>`count(*)` })
      .from(users)
      .where(sql`created_at >= current_date - interval '7 days'`);
    const activeSessions = await db.select({ count: sql<number>`count(*)` })
      .from(tutorSessions)
      .where(eq(tutorSessions.isActive, true));
    const activeUsersLast30Days = await db.select({ count: sql<number>`count(distinct id)` })
      .from(users)
      .where(sql`last_login_at >= current_date - interval '30 days' OR id IN (SELECT user_id FROM tutor_sessions WHERE started_at >= current_date - interval '30 days')`);

    const usersByRole = await db.select({ role: users.role, count: sql<number>`count(*)` })
      .from(users)
      .groupBy(users.role);
    const roleCounts: { student: number; teacher: number; superuser: number } = { student: 0, teacher: 0, superuser: 0 };
    for (const r of usersByRole) {
      if (r.role in roleCounts) roleCounts[r.role as keyof typeof roleCounts] = Number(r.count);
    }

    const totalContent = await db.select({ count: sql<number>`count(*)` }).from(contentSubmissions);
    const newContentThisWeek = await db.select({ count: sql<number>`count(*)` })
      .from(contentSubmissions)
      .where(sql`created_at >= current_date - interval '7 days'`);
    const publishedContent = await db.select({ count: sql<number>`count(*)` })
      .from(contentSubmissions)
      .where(eq(contentSubmissions.isPublished, true));

    const totalClasses = await db.select({ count: sql<number>`count(*)` }).from(classes);
    const activeClasses = await db.select({ count: sql<number>`count(*)` })
      .from(classes)
      .where(eq(classes.status, 'active'));
    const totalClassMembers = await db.select({ count: sql<number>`count(*)` }).from(classMembers);
    const totalClassChatMessages = await db.select({ count: sql<number>`count(*)` }).from(classChatMessages);

    const totalTutorSessions = await db.select({ count: sql<number>`count(*)` }).from(tutorSessions);
    const sessionsThisMonth = await db.select({ count: sql<number>`count(*)` })
      .from(tutorSessions)
      .where(sql`started_at >= date_trunc('month', current_date)`);

    const totalStudyNotes = await db.select({ count: sql<number>`count(*)` }).from(studyNotes);
    const totalBlogPosts = await db.select({ count: sql<number>`count(*)` }).from(blogPosts);
    const publishedBlogPosts = await db.select({ count: sql<number>`count(*)` })
      .from(blogPosts)
      .where(eq(blogPosts.isPublished, true));

    const mentorAppsTotal = await db.select({ count: sql<number>`count(*)` }).from(mentorApplications);
    const mentorAppsPending = await db.select({ count: sql<number>`count(*)` })
      .from(mentorApplications)
      .where(eq(mentorApplications.status, 'pending'));

    const contentByType = await db.select({
      contentType: contentSubmissions.contentType,
      count: sql<number>`count(*)`
    }).from(contentSubmissions).groupBy(contentSubmissions.contentType);
    const contentBySubject = await db.select({
      subject: contentSubmissions.subject,
      count: sql<number>`count(*)`
    }).from(contentSubmissions).groupBy(contentSubmissions.subject);

    const assignmentsTotal = await db.select({ count: sql<number>`count(*)` }).from(studentAssignments);
    const assignmentsCompleted = await db.select({ count: sql<number>`count(*)` })
      .from(studentAssignments)
      .where(eq(studentAssignments.status, 'completed'));

    return {
      totalUsers: totalUsers[0]?.count || 0,
      newUsersThisMonth: newUsersThisMonth[0]?.count || 0,
      newUsersThisWeek: newUsersThisWeek[0]?.count || 0,
      activeUsersLast30Days: activeUsersLast30Days[0]?.count || 0,
      activeSessions: activeSessions[0]?.count || 0,
      usersByRole: roleCounts,
      totalContent: totalContent[0]?.count || 0,
      newContentThisWeek: newContentThisWeek[0]?.count || 0,
      publishedContent: publishedContent[0]?.count || 0,
      totalClasses: totalClasses[0]?.count || 0,
      activeClasses: activeClasses[0]?.count || 0,
      totalClassMembers: totalClassMembers[0]?.count || 0,
      totalClassChatMessages: totalClassChatMessages[0]?.count || 0,
      totalTutorSessions: totalTutorSessions[0]?.count || 0,
      sessionsThisMonth: sessionsThisMonth[0]?.count || 0,
      totalStudyNotes: totalStudyNotes[0]?.count || 0,
      totalBlogPosts: totalBlogPosts[0]?.count || 0,
      publishedBlogPosts: publishedBlogPosts[0]?.count || 0,
      mentorApplicationsTotal: mentorAppsTotal[0]?.count || 0,
      mentorApplicationsPending: mentorAppsPending[0]?.count || 0,
      contentByType: contentByType.map(r => ({ type: r.contentType, count: Number(r.count) })),
      contentBySubject: contentBySubject.map(r => ({ subject: r.subject, count: Number(r.count) })),
      assignmentsTotal: assignmentsTotal[0]?.count || 0,
      assignmentsCompleted: assignmentsCompleted[0]?.count || 0,
      systemHealth: 'Healthy'
    };
  }

  async getBudgetAnalytics(): Promise<BudgetAnalyticsResult> {
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

    const regUsers = Number(registeredUsers[0]?.count ?? 0);
    const totalTx = Number(totalTransactions[0]?.count ?? 0);
    const avgIncomeVal = Number(avgIncome[0]?.avg || 0);
    const avgExpenseVal = Math.abs(Number(avgExpenses[0]?.avg || 0));
    const averageBudget = regUsers > 0 ? (avgIncomeVal - avgExpenseVal) : 0;

    return {
      registeredUsers: regUsers,
      totalTransactions: totalTx,
      monthlyAvgTransactions: Math.round(totalTx / 12),
      avgMonthlyExpense: avgExpenseVal,
      avgMonthlyIncome: avgIncomeVal,
      averageBudget: Math.round(averageBudget * 100) / 100,
      popularCategory: popularCategory[0]?.name || 'N/A'
    };
  }

  async getChatAnalytics(): Promise<ChatAnalyticsResult> {
    const totalRequests = await db.select({ count: sql<number>`count(*)` }).from(tutorMessages);
    const thisMonth = await db.select({ count: sql<number>`count(*)` })
      .from(tutorMessages)
      .where(sql`timestamp >= date_trunc('month', current_date)`);
    const thisWeek = await db.select({ count: sql<number>`count(*)` })
      .from(tutorMessages)
      .where(sql`timestamp >= current_date - interval '7 days'`);

    const studentMessages = await db.select({
      message: tutorMessages.message,
      count: sql<number>`count(*)`
    })
      .from(tutorMessages)
      .where(eq(tutorMessages.sender, 'student'))
      .groupBy(tutorMessages.message)
      .orderBy(sql`count(*) desc`)
      .limit(15);
    const frequentQuestions = studentMessages.map(r => ({ text: (r.message || '').slice(0, 120), count: Number(r.count) }));

    const messagesByDayRows = await db.select({
      day: sql<string>`date_trunc('day', ${tutorMessages.timestamp})::text`,
      count: sql<number>`count(*)`
    })
      .from(tutorMessages)
      .where(sql`${tutorMessages.timestamp} >= current_date - interval '30 days'`)
      .groupBy(sql`date_trunc('day', ${tutorMessages.timestamp})`)
      .orderBy(sql`date_trunc('day', ${tutorMessages.timestamp})`);
    const messagesByDayLast30 = messagesByDayRows.map(r => ({ date: r.day?.slice(0, 10) || '', count: Number(r.count) }));

    const messagesByAgentRows = await db.select({
      agentName: tutorAgents.name,
      agentKey: tutorAgents.agentKey,
      count: sql<number>`count(*)`
    })
      .from(tutorMessages)
      .innerJoin(tutorSessions, eq(tutorMessages.sessionId, tutorSessions.id))
      .innerJoin(tutorAgents, eq(tutorSessions.agentId, tutorAgents.id))
      .groupBy(tutorAgents.id, tutorAgents.name, tutorAgents.agentKey)
      .orderBy(sql`count(*) desc`);
    const messagesByAgent = messagesByAgentRows.map(r => ({ agentKey: r.agentKey, name: r.agentName, count: Number(r.count) }));

    const messagesBySubjectRows = await db.select({
      subject: tutorSessions.subject,
      count: sql<number>`count(*)`
    })
      .from(tutorMessages)
      .innerJoin(tutorSessions, eq(tutorMessages.sessionId, tutorSessions.id))
      .groupBy(tutorSessions.subject)
      .orderBy(sql`count(*) desc`);
    const messagesBySubject = messagesBySubjectRows.map(r => ({ subject: r.subject || 'N/A', count: Number(r.count) }));

    return {
      totalRequests: totalRequests[0]?.count || 0,
      thisMonth: thisMonth[0]?.count || 0,
      thisWeek: thisWeek[0]?.count || 0,
      avgPerDay: Math.round((thisMonth[0]?.count || 0) / 30),
      frequentQuestions,
      messagesByDayLast30,
      messagesByAgent,
      messagesBySubject
    };
  }

  async getSuperuserAnalytics(): Promise<SuperuserAnalyticsResult> {
    const [base, chat, budget] = await Promise.all([
      this.getAnalytics(),
      this.getChatAnalytics(),
      this.getBudgetAnalytics()
    ]);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const signupsByDay = await db.select({
      day: sql<string>`date_trunc('day', ${users.createdAt})::text`,
      count: sql<number>`count(*)`
    })
      .from(users)
      .where(gte(users.createdAt, thirtyDaysAgo))
      .groupBy(sql`date_trunc('day', ${users.createdAt})`)
      .orderBy(sql`date_trunc('day', ${users.createdAt})`);
    const userGrowth = signupsByDay.map(r => ({ date: r.day?.slice(0, 10) || '', count: Number(r.count) }));

    const recentSignups = await db.select({
      id: users.id,
      username: users.username,
      role: users.role,
      createdAt: users.createdAt,
      firstName: users.firstName,
      lastName: users.lastName
    })
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(20);

    const topUsersBySessions = await db.select({
      userId: tutorSessions.userId,
      count: sql<number>`count(*)`
    })
      .from(tutorSessions)
      .groupBy(tutorSessions.userId)
      .orderBy(sql`count(*) desc`)
      .limit(15);
    const userIds = topUsersBySessions.map(r => r.userId);
    const userList = userIds.length ? await db.select({ id: users.id, username: users.username, firstName: users.firstName, lastName: users.lastName })
      .from(users)
      .where(inArray(users.id, userIds)) : [];
    const userMap: Record<number, { id: number; username: string; firstName: string | null; lastName: string | null }> = Object.fromEntries(userList.map(u => [u.id, u]));
    const topUsersBySessionsWithNames = topUsersBySessions.map(r => ({
      userId: r.userId,
      displayName: (userMap[r.userId] ? [userMap[r.userId].firstName, userMap[r.userId].lastName].filter(Boolean).join(' ') || userMap[r.userId].username : `User ${r.userId}`),
      sessionCount: Number(r.count)
    }));

    const mentorProfilesCount = await db.select({ count: sql<number>`count(*)` }).from(mentorProfiles);
    const mentorshipRequestsTotal = await db.select({ count: sql<number>`count(*)` }).from(mentorshipRequests);
    const mentorshipSessionsTotal = await db.select({ count: sql<number>`count(*)` }).from(mentorshipSessions);
    const mentorshipSessionsCompleted = await db.select({ count: sql<number>`count(*)` })
      .from(mentorshipSessions)
      .where(eq(mentorshipSessions.status, 'completed'));

    const totalContentViewCount = await db.select({
      sum: sql<number>`coalesce(sum(view_count), 0)`
    }).from(contentSubmissions);
    const gameScoresCount = await db.select({ count: sql<number>`count(*)` }).from(gameScores);
    const qaCacheCount = await db.select({ count: sql<number>`count(*)` }).from(tutorQaCache);

    const classChatByDay = await db.select({
      day: sql<string>`date_trunc('day', ${classChatMessages.createdAt})::text`,
      count: sql<number>`count(*)`
    })
      .from(classChatMessages)
      .where(sql`${classChatMessages.createdAt} >= current_date - interval '30 days'`)
      .groupBy(sql`date_trunc('day', ${classChatMessages.createdAt})`)
      .orderBy(sql`date_trunc('day', ${classChatMessages.createdAt})`);

    const assignmentsByStatus = await db.select({
      status: studentAssignments.status,
      count: sql<number>`count(*)`
    })
      .from(studentAssignments)
      .groupBy(studentAssignments.status);

    const blogPostsByCategory = await db.select({
      category: blogPosts.category,
      count: sql<number>`count(*)`
    })
      .from(blogPosts)
      .groupBy(blogPosts.category);

    return {
      ...base,
      chat,
      budget,
      userGrowth,
      recentSignups: recentSignups.map(u => ({
        id: u.id,
        username: u.username,
        role: u.role,
        createdAt: u.createdAt,
        displayName: [u.firstName, u.lastName].filter(Boolean).join(' ') || u.username
      })),
      topUsersBySessions: topUsersBySessionsWithNames,
      mentorProfilesCount: mentorProfilesCount[0]?.count || 0,
      mentorshipRequestsTotal: mentorshipRequestsTotal[0]?.count || 0,
      mentorshipSessionsTotal: mentorshipSessionsTotal[0]?.count || 0,
      mentorshipSessionsCompleted: mentorshipSessionsCompleted[0]?.count || 0,
      totalContentViewCount: Number(totalContentViewCount[0]?.sum || 0),
      gameScoresCount: gameScoresCount[0]?.count || 0,
      qaCacheEntries: qaCacheCount[0]?.count || 0,
      classChatMessagesByDay: classChatByDay.map(r => ({ date: r.day?.slice(0, 10) || '', count: Number(r.count) })),
      assignmentsByStatus: assignmentsByStatus.map(r => ({ status: r.status, count: Number(r.count) })),
      blogPostsByCategory: blogPostsByCategory.map(r => ({ category: r.category, count: Number(r.count) }))
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

  async getBlogPostsPaginated(limit: number = 10, offset: number = 0): Promise<{ data: BlogPost[], total: number }> {
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(blogPosts);
    
    const data = await db
      .select()
      .from(blogPosts)
      .orderBy(desc(blogPosts.createdAt))
      .limit(limit)
      .offset(offset);
    
    return { data, total: count };
  }

  async getPublishedBlogPosts(limit: number = 20, offset: number = 0): Promise<{ data: BlogPost[], total: number }> {
    const publishedCondition = and(eq(blogPosts.isPublished, true), eq(blogPosts.isHidden, false));
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(blogPosts)
      .where(publishedCondition);
    
    const data = await db
      .select()
      .from(blogPosts)
      .where(publishedCondition)
      .orderBy(desc(blogPosts.publishedAt))
      .limit(limit)
      .offset(offset);
    
    return { data, total: count };
  }

  async getLandingBlogPosts(limit: number = 6): Promise<BlogPost[]> {
    const condition = and(
      eq(blogPosts.isPublished, true),
      eq(blogPosts.isHidden, false),
      eq(blogPosts.showOnLanding, true)
    );
    return await db
      .select()
      .from(blogPosts)
      .where(condition)
      .orderBy(desc(blogPosts.publishedAt))
      .limit(limit);
  }

  async getBotPersonasPaginated(limit: number = 10, offset: number = 0): Promise<{ data: BotPersona[], total: number }> {
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(botPersonas);
    
    const data = await db
      .select()
      .from(botPersonas)
      .orderBy(desc(botPersonas.createdAt))
      .limit(limit)
      .offset(offset);
    
    return { data, total: count };
  }

  async getAllContentSubmissionsPaginated(published?: boolean, limit: number = 10, offset: number = 0): Promise<{ data: ContentSubmission[], total: number }> {
    if (published !== undefined) {
      const [{ count }] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(contentSubmissions)
        .where(eq(contentSubmissions.isPublished, published));
      
      const data = await db
        .select()
        .from(contentSubmissions)
        .where(eq(contentSubmissions.isPublished, published))
        .orderBy(desc(contentSubmissions.createdAt))
        .limit(limit)
        .offset(offset);
      
      return { data, total: count };
    } else {
      const [{ count }] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(contentSubmissions);
      
      const data = await db
        .select()
        .from(contentSubmissions)
        .orderBy(desc(contentSubmissions.createdAt))
        .limit(limit)
        .offset(offset);
      
      return { data, total: count };
    }
  }

  async getAllStudentAssignmentsPaginated(limit: number = 10, offset: number = 0): Promise<{ data: StudentAssignment[], total: number }> {
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(studentAssignments);
    
    const data = await db
      .select()
      .from(studentAssignments)
      .orderBy(desc(studentAssignments.createdAt))
      .limit(limit)
      .offset(offset);
    
    return { data, total: count };
  }
}

export const storage = new DatabaseStorage();