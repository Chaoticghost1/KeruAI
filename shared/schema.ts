import { pgTable, text, serial, integer, timestamp, decimal, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password"),
  email: text("email").unique(),
  phoneNumber: text("phone_number").unique(),
  role: text("role").notNull().default("student"), // superuser, teacher, student
  isVerified: boolean("is_verified").default(false).notNull(),
  verificationToken: text("verification_token"),
  passwordResetToken: text("password_reset_token"),
  passwordResetExpires: timestamp("password_reset_expires"),
  googleId: text("google_id").unique(),
  facebookId: text("facebook_id").unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  profileImage: text("profile_image"),
  isActive: boolean("is_active").default(true).notNull(),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const budgetCategories = pgTable("budget_categories", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  budget: decimal("budget", { precision: 10, scale: 2 }).notNull(),
  spent: decimal("spent", { precision: 10, scale: 2 }).default("0").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const budgetTransactions = pgTable("budget_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  categoryId: integer("category_id").references(() => budgetCategories.id).notNull(),
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  date: timestamp("date").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const studyNotes = pgTable("study_notes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  subject: text("subject"),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const gameScores = pgTable("game_scores", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  gameName: text("game_name").notNull(),
  score: integer("score").notNull(),
  level: integer("level").default(1).notNull(),
  completed: boolean("completed").default(false).notNull(),
  playedAt: timestamp("played_at").defaultNow().notNull(),
});

export const tutorAgents = pgTable("tutor_agents", {
  id: serial("id").primaryKey(),
  agentKey: text("agent_key").unique().notNull(), // math_buddy, science_explorer, etc.
  name: text("name").notNull(),
  title: text("title").notNull(),
  avatar: text("avatar"),
  subjects: text("subjects").array().notNull(),
  description: text("description").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tutorSessions = pgTable("tutor_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  agentId: integer("agent_id").references(() => tutorAgents.id).notNull(),
  subject: text("subject").notNull(),
  topic: text("topic"),
  difficultyLevel: integer("difficulty_level").default(1).notNull(),
  sessionData: text("session_data"), // JSON data for persona state
  isActive: boolean("is_active").default(true).notNull(),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  endedAt: timestamp("ended_at"),
});

export const tutorMessages = pgTable("tutor_messages", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").references(() => tutorSessions.id).notNull(),
  sender: text("sender").notNull(), // 'student' or 'agent'
  message: text("message").notNull(),
  messageType: text("message_type").default("text").notNull(), // text, hint, encouragement, etc.
  toolsUsed: text("tools_used").array(), // calculator, diagram, etc.
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const studentProfiles = pgTable("student_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  learningStyle: text("learning_style"), // visual, auditory, kinesthetic
  preferredDifficulty: integer("preferred_difficulty").default(2).notNull(),
  subjects: text("subjects").array().default([]).notNull(),
  strugglingAreas: text("struggling_areas").array().default([]).notNull(),
  preferences: text("preferences"), // JSON for detailed preferences
  // Reward system fields
  totalPoints: integer("total_points").default(0).notNull(),
  currentStreak: integer("current_streak").default(0).notNull(),
  longestStreak: integer("longest_streak").default(0).notNull(),
  totalSessionsCompleted: integer("total_sessions_completed").default(0).notNull(),
  level: integer("level").default(1).notNull(),
  experiencePoints: integer("experience_points").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Badges and achievements system
export const badges = pgTable("badges", {
  id: serial("id").primaryKey(),
  badgeKey: text("badge_key").unique().notNull(), // first_session, week_warrior, math_master, etc.
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(), // emoji or icon name
  category: text("category").notNull(), // streak, achievement, subject, milestone
  rarity: text("rarity").default("common").notNull(), // common, rare, epic, legendary
  requirements: text("requirements").notNull(), // JSON describing requirements
  points: integer("points").default(10).notNull(), // points awarded for earning this badge
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const userBadges = pgTable("user_badges", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  badgeId: integer("badge_id").references(() => badges.id).notNull(),
  earnedAt: timestamp("earned_at").defaultNow().notNull(),
  progress: integer("progress").default(0).notNull(), // for tracking partial progress
  isNew: boolean("is_new").default(true).notNull() // for showing new badge notifications
});

export const studyStreaks = pgTable("study_streaks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  date: timestamp("date").defaultNow().notNull(),
  sessionsCompleted: integer("sessions_completed").default(1).notNull(),
  pointsEarned: integer("points_earned").default(0).notNull(),
  subjectsStudied: text("subjects_studied").array().default([]).notNull()
});

// Authentication tokens table
export const authTokens = pgTable("auth_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  token: text("token").notNull().unique(),
  type: text("type").notNull(), // 'access', 'refresh', 'verification', 'reset'
  expiresAt: timestamp("expires_at").notNull(),
  isRevoked: boolean("is_revoked").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Teacher content submissions table
export const contentSubmissions = pgTable("content_submissions", {
  id: serial("id").primaryKey(),
  teacherId: integer("teacher_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  contentType: text("content_type").notNull(), // 'image', 'pdf', 'whiteboard', 'diagram', 'html', 'video'
  filePath: text("file_path"),
  fileUrl: text("file_url"),
  htmlContent: text("html_content"),
  subject: text("subject").notNull(),
  gradeLevel: text("grade_level"),
  tags: text("tags").array().default([]).notNull(),
  isPublished: boolean("is_published").default(false).notNull(),
  publishedAt: timestamp("published_at"),
  viewCount: integer("view_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Student assignments table (for tracking student work on teacher content)
export const studentAssignments = pgTable("student_assignments", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").references(() => users.id).notNull(),
  contentId: integer("content_id").references(() => contentSubmissions.id).notNull(),
  status: text("status").notNull().default("assigned"), // 'assigned', 'in_progress', 'completed', 'reviewed'
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  submissionText: text("submission_text"),
  submissionFiles: text("submission_files").array().default([]).notNull(),
  teacherFeedback: text("teacher_feedback"),
  grade: integer("grade"), // 0-100
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Blog posts table for travel section
export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  category: text("category").notNull(), // cruises, destinations, travel-tips, reviews
  tags: text("tags").array(),
  authorId: integer("author_id").references(() => users.id).notNull(),
  isPublished: boolean("is_published").default(false).notNull(),
  isHidden: boolean("is_hidden").default(false).notNull(),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Bot personas table for Telegram integration
export const botPersonas = pgTable("bot_personas", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  key: text("key").unique().notNull(), // Unique identifier for the persona
  description: text("description"),
  systemPrompt: text("system_prompt").notNull(),
  subjects: text("subjects").array(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  budgetCategories: many(budgetCategories),
  budgetTransactions: many(budgetTransactions),
  studyNotes: many(studyNotes),
  gameScores: many(gameScores),
  authTokens: many(authTokens),
  contentSubmissions: many(contentSubmissions),
  studentAssignments: many(studentAssignments, { relationName: "studentAssignments" }),
  tutorSessions: many(tutorSessions),
  studentProfiles: many(studentProfiles),
  userBadges: many(userBadges),
  studyStreaks: many(studyStreaks),
}));

export const budgetCategoriesRelations = relations(budgetCategories, ({ one, many }) => ({
  user: one(users, {
    fields: [budgetCategories.userId],
    references: [users.id],
  }),
  transactions: many(budgetTransactions),
}));

export const budgetTransactionsRelations = relations(budgetTransactions, ({ one }) => ({
  user: one(users, {
    fields: [budgetTransactions.userId],
    references: [users.id],
  }),
  category: one(budgetCategories, {
    fields: [budgetTransactions.categoryId],
    references: [budgetCategories.id],
  }),
}));

export const studyNotesRelations = relations(studyNotes, ({ one }) => ({
  user: one(users, {
    fields: [studyNotes.userId],
    references: [users.id],
  }),
}));

export const gameScoresRelations = relations(gameScores, ({ one }) => ({
  user: one(users, {
    fields: [gameScores.userId],
    references: [users.id],
  }),
}));

export const tutorAgentsRelations = relations(tutorAgents, ({ many }) => ({
  sessions: many(tutorSessions),
}));

export const tutorSessionsRelations = relations(tutorSessions, ({ one, many }) => ({
  user: one(users, {
    fields: [tutorSessions.userId],
    references: [users.id],
  }),
  agent: one(tutorAgents, {
    fields: [tutorSessions.agentId],
    references: [tutorAgents.id],
  }),
  messages: many(tutorMessages),
}));

export const tutorMessagesRelations = relations(tutorMessages, ({ one }) => ({
  session: one(tutorSessions, {
    fields: [tutorMessages.sessionId],
    references: [tutorSessions.id],
  }),
}));

export const studentProfilesRelations = relations(studentProfiles, ({ one }) => ({
  user: one(users, {
    fields: [studentProfiles.userId],
    references: [users.id],
  }),
}));

export const badgesRelations = relations(badges, ({ many }) => ({
  userBadges: many(userBadges),
}));

export const userBadgesRelations = relations(userBadges, ({ one }) => ({
  user: one(users, {
    fields: [userBadges.userId],
    references: [users.id],
  }),
  badge: one(badges, {
    fields: [userBadges.badgeId],
    references: [badges.id],
  }),
}));

export const studyStreaksRelations = relations(studyStreaks, ({ one }) => ({
  user: one(users, {
    fields: [studyStreaks.userId],
    references: [users.id],
  }),
}));

export const authTokensRelations = relations(authTokens, ({ one }) => ({
  user: one(users, {
    fields: [authTokens.userId],
    references: [users.id],
  }),
}));

export const contentSubmissionsRelations = relations(contentSubmissions, ({ one, many }) => ({
  teacher: one(users, {
    fields: [contentSubmissions.teacherId],
    references: [users.id],
  }),
  assignments: many(studentAssignments),
}));

export const studentAssignmentsRelations = relations(studentAssignments, ({ one }) => ({
  student: one(users, {
    fields: [studentAssignments.studentId],
    references: [users.id],
  }),
  content: one(contentSubmissions, {
    fields: [studentAssignments.contentId],
    references: [contentSubmissions.id],
  }),
}));

export const blogPostsRelations = relations(blogPosts, ({ one }) => ({
  author: one(users, {
    fields: [blogPosts.authorId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertBudgetCategorySchema = createInsertSchema(budgetCategories).omit({
  id: true,
  createdAt: true,
  spent: true,
});

export const insertBudgetTransactionSchema = createInsertSchema(budgetTransactions).omit({
  id: true,
  createdAt: true,
});

export const insertStudyNoteSchema = createInsertSchema(studyNotes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGameScoreSchema = createInsertSchema(gameScores).omit({
  id: true,
});

export const insertTutorAgentSchema = createInsertSchema(tutorAgents).omit({
  id: true,
  createdAt: true,
});

export const insertTutorSessionSchema = createInsertSchema(tutorSessions).omit({
  id: true,
  startedAt: true,
});

export const insertTutorMessageSchema = createInsertSchema(tutorMessages).omit({
  id: true,
  timestamp: true,
});

export const insertStudentProfileSchema = createInsertSchema(studentProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBadgeSchema = createInsertSchema(badges).omit({
  id: true,
  createdAt: true,
});

export const insertUserBadgeSchema = createInsertSchema(userBadges).omit({
  id: true,
  earnedAt: true,
});

export const insertStudyStreakSchema = createInsertSchema(studyStreaks).omit({
  id: true,
  date: true,
});

export const insertAuthTokenSchema = createInsertSchema(authTokens).omit({
  id: true,
  createdAt: true,
});

export const insertContentSubmissionSchema = createInsertSchema(contentSubmissions).omit({
  id: true,
  publishedAt: true,
  viewCount: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStudentAssignmentSchema = createInsertSchema(studentAssignments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({
  id: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBotPersonaSchema = createInsertSchema(botPersonas).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertBudgetCategory = z.infer<typeof insertBudgetCategorySchema>;
export type BudgetCategory = typeof budgetCategories.$inferSelect;
export type InsertBudgetTransaction = z.infer<typeof insertBudgetTransactionSchema>;
export type BudgetTransaction = typeof budgetTransactions.$inferSelect;
export type InsertStudyNote = z.infer<typeof insertStudyNoteSchema>;
export type StudyNote = typeof studyNotes.$inferSelect;
export type InsertGameScore = z.infer<typeof insertGameScoreSchema>;
export type GameScore = typeof gameScores.$inferSelect;
export type InsertTutorAgent = z.infer<typeof insertTutorAgentSchema>;
export type TutorAgent = typeof tutorAgents.$inferSelect;
export type InsertTutorSession = z.infer<typeof insertTutorSessionSchema>;
export type TutorSession = typeof tutorSessions.$inferSelect;
export type InsertTutorMessage = z.infer<typeof insertTutorMessageSchema>;
export type TutorMessage = typeof tutorMessages.$inferSelect;
export type InsertStudentProfile = z.infer<typeof insertStudentProfileSchema>;
export type StudentProfile = typeof studentProfiles.$inferSelect;
export type InsertBadge = z.infer<typeof insertBadgeSchema>;
export type Badge = typeof badges.$inferSelect;
export type InsertUserBadge = z.infer<typeof insertUserBadgeSchema>;
export type UserBadge = typeof userBadges.$inferSelect;
export type InsertStudyStreak = z.infer<typeof insertStudyStreakSchema>;
export type StudyStreak = typeof studyStreaks.$inferSelect;
export type InsertAuthToken = z.infer<typeof insertAuthTokenSchema>;
export type AuthToken = typeof authTokens.$inferSelect;
export type InsertContentSubmission = z.infer<typeof insertContentSubmissionSchema>;
export type ContentSubmission = typeof contentSubmissions.$inferSelect;
export type InsertStudentAssignment = z.infer<typeof insertStudentAssignmentSchema>;
export type StudentAssignment = typeof studentAssignments.$inferSelect;
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBotPersona = z.infer<typeof insertBotPersonaSchema>;
export type BotPersona = typeof botPersonas.$inferSelect;
