import { pgTable, text, serial, integer, timestamp, decimal, boolean, jsonb, uniqueIndex, index } from "drizzle-orm/pg-core";
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

// MathMaster game: problems per level (1-6)
export const mathProblems = pgTable("math_problems", {
  id: serial("id").primaryKey(),
  level: integer("level").notNull(), // 1-6
  topic: text("topic"),
  questionEs: text("question_es").notNull(),
  questionEn: text("question_en").notNull(),
  options: jsonb("options").notNull(), // array of 4 choice strings
  correctAnswer: text("correct_answer").notNull(),
  explanationEs: text("explanation_es"),
  explanationEn: text("explanation_en"),
  category: text("category"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// LinguaPlay game: problems per level and mode
export const languageProblems = pgTable("language_problems", {
  id: serial("id").primaryKey(),
  level: integer("level").notNull(), // 1-6
  mode: text("mode").notNull(), // vocabulary, grammar, listening, spelling, pronunciation
  promptEs: text("prompt_es").notNull(),
  promptEn: text("prompt_en").notNull(),
  options: jsonb("options").notNull(), // array of choice strings
  correctAnswer: text("correct_answer").notNull(),
  explanationEs: text("explanation_es"),
  explanationEn: text("explanation_en"),
  audioUrl: text("audio_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
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

// QA cache for duplicate question detection (token savings)
export const tutorQaCache = pgTable("tutor_qa_cache", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").references(() => tutorSessions.id, { onDelete: "cascade" }).notNull(),
  agentKey: text("agent_key").notNull(),
  questionHash: text("question_hash").notNull(),
  studentMessage: text("student_message").notNull(),
  agentResponse: text("agent_response").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [uniqueIndex("qa_cache_session_agent_hash").on(table.sessionId, table.agentKey, table.questionHash)]);

export const studentProfiles = pgTable("student_profiles", {
   id: serial("id").primaryKey(),
   userId: integer("user_id").references(() => users.id).notNull(),
   learningStyle: text("learning_style"), // visual, auditory, kinesthetic
   preferredDifficulty: integer("preferred_difficulty").default(2).notNull(),
   subjects: text("subjects").array().default([]).notNull(),
   strugglingAreas: text("struggling_areas").array().default([]).notNull(),
   preferences: text("preferences"), // JSON for detailed preferences
   language: text("language").default('es').notNull(), // User's preferred language (es/en)
   // Reward system fields
   totalPoints: integer("total_points").default(0).notNull(),
   currentStreak: integer("current_streak").default(0).notNull(),
   longestStreak: integer("longest_streak").default(0).notNull(),
   totalSessionsCompleted: integer("total_sessions_completed").default(0).notNull(),
   level: integer("level").default(1).notNull(),
   experiencePoints: integer("experience_points").default(0).notNull(),
   revisionAssistantName: text("revision_assistant_name"), // AI assistant name for Materiales de Estudio only
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
  contentData: text("content_data"), // existing field in database
  subject: text("subject").notNull(),
  difficultyLevel: integer("difficulty_level"), // existing field in database
  isPublished: boolean("is_published").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  // New fields for Phase 1
  fileUrl: text("file_url"),
  htmlContent: text("html_content"),
  extractedText: text("extracted_text"), // AI-accessible text content from PDFs and images
  gradeLevel: text("grade_level"),
  tags: text("tags").array().default([]).notNull(),
  publishedAt: timestamp("published_at"),
  viewCount: integer("view_count").default(0).notNull(),
});

// Student assignments table (for tracking student work on teacher content)
export const studentAssignments = pgTable("student_assignments", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").references(() => users.id).notNull(),
  contentId: integer("content_id").references(() => contentSubmissions.id).notNull(),
  assignedAt: timestamp("assigned_at"),
  dueDate: timestamp("due_date"),
  submissionText: text("submission_text"),
  submissionFiles: text("submission_files").array().default([]).notNull(),
  submittedAt: timestamp("submitted_at"),
  grade: decimal("grade", { precision: 5, scale: 2 }),
  maxGrade: decimal("max_grade", { precision: 5, scale: 2 }),
  feedback: text("feedback"),
  gradedAt: timestamp("graded_at"),
  gradedBy: integer("graded_by").references(() => users.id),
  status: text("status").notNull().default("assigned"), // 'assigned', 'in_progress', 'completed', 'reviewed'
  // New fields for Phase 2
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  teacherFeedback: text("teacher_feedback"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Class groups - teachers create classes, students join via invite code
export const classes = pgTable("classes", {
  id: serial("id").primaryKey(),
  teacherId: integer("teacher_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  inviteCode: text("invite_code").notNull().unique(),
  subject: text("subject"),
  status: text("status").notNull().default("active"), // active, terminated, archived, blocked
  blockedUntil: timestamp("blocked_until"), // when status=blocked, chat resumes after this time
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Class members - students join a class; teacher approves before access
export const classMembers = pgTable("class_members", {
  id: serial("id").primaryKey(),
  classId: integer("class_id").references(() => classes.id, { onDelete: "cascade" }).notNull(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  role: text("role").notNull().default("student"), // student
  status: text("status").notNull().default("pending"), // pending = awaiting teacher approval, approved = can access chat & materials
  canChat: boolean("can_chat").default(true).notNull(), // false = muted
  isBanned: boolean("is_banned").default(false).notNull(),
  accessRevoked: boolean("access_revoked").default(false).notNull(), // negate permission to access
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

// Student-selected teachers: students explicitly select teachers to see their revision materials
export const studentTeachers = pgTable("student_teachers", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  teacherId: integer("teacher_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Class chat messages - students chat with classmates
export const classChatMessages = pgTable("class_chat_messages", {
  id: serial("id").primaryKey(),
  classId: integer("class_id").references(() => classes.id, { onDelete: "cascade" }).notNull(),
  senderId: integer("sender_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Class chat archives - snapshot when a teacher deletes an empty class (super admin can view)
export const classChatArchives = pgTable("class_chat_archives", {
  id: serial("id").primaryKey(),
  originalClassId: integer("original_class_id").notNull(),
  className: text("class_name").notNull(),
  teacherId: integer("teacher_id").references(() => users.id).notNull(),
  subject: text("subject"),
  inviteCode: text("invite_code").notNull(),
  status: text("status").notNull().default("active"),
  archivedAt: timestamp("archived_at").defaultNow().notNull(),
  archivedByUserId: integer("archived_by_user_id").references(() => users.id).notNull(),
  messagesSnapshot: jsonb("messages_snapshot").$type<{ senderId: number; message: string; createdAt: string; senderName?: string }[]>().notNull().default([]),
  membersSnapshot: jsonb("members_snapshot").$type<{ userId: number; role: string; status: string; displayName?: string }[]>().notNull().default([]),
});

export type ClassChatArchive = typeof classChatArchives.$inferSelect;
export type InsertClassChatArchive = typeof classChatArchives.$inferInsert;

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
  showOnLanding: boolean("show_on_landing").default(false).notNull(),
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
  createdById: integer("created_by_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertBotPersonaSchema = createInsertSchema(botPersonas).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type BotPersona = typeof botPersonas.$inferSelect;
export type InsertBotPersona = z.infer<typeof insertBotPersonaSchema>;

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
  classes: many(classes),
  classMembers: many(classMembers),
  classChatMessages: many(classChatMessages),
  studentTeachers: many(studentTeachers),
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
  sources: many(contentSources),
}));

// ---------------------------------------------------------------------------
// Curriculum-aligned RAG: content sources (uploaded materials) + chunks
// ---------------------------------------------------------------------------

export const contentSources = pgTable("content_sources", {
  id: serial("id").primaryKey(),
  ownerUserId: integer("owner_user_id").references(() => users.id).notNull(),
  subject: text("subject").notNull(),
  topic: text("topic"),
  gradeLevel: text("grade_level"),
  fileType: text("file_type").notNull(), // 'pdf' | 'image' | 'plain'
  originalFileName: text("original_file_name"),
  storageLocation: text("storage_location"), // URL or /uploads path
  language: text("language").notNull().default("es"),
  chunkCount: integer("chunk_count").default(0).notNull(),
  tokenCount: integer("token_count").default(0).notNull(),
  status: text("status").notNull().default("ready"), // 'processing' | 'ready' | 'failed'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  subjectTopicIdx: index("content_sources_subject_topic_idx").on(table.subject, table.topic),
  ownerIdx: index("content_sources_owner_idx").on(table.ownerUserId),
}));

export const contentChunks = pgTable("content_chunks", {
  id: serial("id").primaryKey(),
  sourceId: integer("source_id").references(() => contentSources.id, { onDelete: "cascade" }).notNull(),
  language: text("language").notNull().default("es"),
  subject: text("subject").notNull(),
  topic: text("topic"),
  gradeLevel: text("grade_level"),
  chunkIndex: integer("chunk_index").notNull(),
  text: text("text").notNull(),
  tokenCount: integer("token_count").default(0).notNull(),
  embeddingStatus: text("embedding_status").notNull().default("none"), // 'none' | 'pending' | 'done' (reserved for future vector search)
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  ragIdx: index("content_chunks_rag_idx").on(table.subject, table.topic, table.gradeLevel),
  languageIdx: index("content_chunks_language_idx").on(table.language),
  sourceIdx: index("content_chunks_source_idx").on(table.sourceId),
}));

export const contentSourcesRelations = relations(contentSources, ({ one, many }) => ({
  owner: one(users, { fields: [contentSources.ownerUserId], references: [users.id] }),
  submission: one(contentSubmissions, {
    fields: [contentSources.ownerUserId], // loosely linked via owner; FK not enforced to keep migration simple
    references: [contentSubmissions.teacherId],
  }),
  chunks: many(contentChunks),
}));

export const contentChunksRelations = relations(contentChunks, ({ one }) => ({
  source: one(contentSources, { fields: [contentChunks.sourceId], references: [contentSources.id] }),
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

export const classesRelations = relations(classes, ({ one, many }) => ({
  teacher: one(users, { fields: [classes.teacherId], references: [users.id] }),
  members: many(classMembers),
  chatMessages: many(classChatMessages),
}));

export const classMembersRelations = relations(classMembers, ({ one }) => ({
  class: one(classes, { fields: [classMembers.classId], references: [classes.id] }),
  user: one(users, { fields: [classMembers.userId], references: [users.id] }),
}));

export const studentTeachersRelations = relations(studentTeachers, ({ one }) => ({
  student: one(users, { fields: [studentTeachers.studentId], references: [users.id] }),
  teacher: one(users, { fields: [studentTeachers.teacherId], references: [users.id] }),
}));

export const classChatMessagesRelations = relations(classChatMessages, ({ one }) => ({
  class: one(classes, { fields: [classChatMessages.classId], references: [classes.id] }),
  sender: one(users, { fields: [classChatMessages.senderId], references: [users.id] }),
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

export const insertBudgetTransactionSchema = createInsertSchema(budgetTransactions)
  .omit({ id: true, createdAt: true })
  .extend({
    date: z.union([z.date(), z.string()]).transform((v) => (typeof v === "string" ? new Date(v) : v)).optional(),
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

export const insertTutorQaCacheSchema = createInsertSchema(tutorQaCache).omit({
  id: true,
  createdAt: true,
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

export const insertClassSchema = createInsertSchema(classes).omit({
  id: true,
  inviteCode: true,
  createdAt: true,
  updatedAt: true,
});

export const insertClassMemberSchema = createInsertSchema(classMembers).omit({
  id: true,
  joinedAt: true,
});

export const insertClassChatMessageSchema = createInsertSchema(classChatMessages).omit({
  id: true,
  createdAt: true,
});

export const insertStudentTeacherSchema = createInsertSchema(studentTeachers).omit({
  id: true,
  createdAt: true,
});

export type Class = typeof classes.$inferSelect;
export type InsertClass = z.infer<typeof insertClassSchema>;
export type ClassMember = typeof classMembers.$inferSelect;
export type InsertClassMember = z.infer<typeof insertClassMemberSchema>;
export type ClassChatMessage = typeof classChatMessages.$inferSelect;
export type InsertClassChatMessage = z.infer<typeof insertClassChatMessageSchema>;
export type StudentTeacher = typeof studentTeachers.$inferSelect;
export type InsertStudentTeacher = z.infer<typeof insertStudentTeacherSchema>;

// Peer Mentorship System for Honduras Community Learning
export const mentorProfiles = pgTable("mentor_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  subjects: text("subjects").array().notNull(), // [math, science, english, etc.]
  bio: text("bio"),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00").notNull(),
  totalRatings: integer("total_ratings").default(0).notNull(),
  hoursVolunteered: integer("hours_volunteered").default(0).notNull(),
  isAvailable: boolean("is_available").default(true).notNull(),
  isVerified: boolean("is_verified").default(false).notNull(), // Verified by community
  languages: text("languages").array().default(["es"]).notNull(), // Spanish first for Honduras
  gradeLevel: integer("grade_level"), // Grade level they can mentor (1-12)
  hourlyRate: decimal("hourly_rate", { precision: 5, scale: 2 }).default("0.00"), // In Lempiras, 0 for volunteers
  responseTime: integer("response_time_hours").default(24).notNull(), // Expected response time
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const mentorshipRequests = pgTable("mentorship_requests", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").references(() => users.id).notNull(),
  mentorId: integer("mentor_id").references(() => users.id).notNull(),
  subject: text("subject").notNull(),
  description: text("description").notNull(),
  status: text("status").default("pending").notNull(), // pending, accepted, rejected, completed
  urgency: text("urgency").default("normal").notNull(), // low, normal, high
  requestedAt: timestamp("requested_at").defaultNow().notNull(),
  respondedAt: timestamp("responded_at"),
  completedAt: timestamp("completed_at"),
});

export const mentorshipSessions = pgTable("mentorship_sessions", {
  id: serial("id").primaryKey(),
  requestId: integer("request_id").references(() => mentorshipRequests.id).notNull(),
  studentId: integer("student_id").references(() => users.id).notNull(),
  mentorId: integer("mentor_id").references(() => users.id).notNull(),
  subject: text("subject").notNull(),
  duration: integer("duration_minutes"),
  sessionType: text("session_type").default("text").notNull(), // text, voice, video
  notes: text("notes"), // Session summary from mentor
  status: text("status").default("scheduled").notNull(), // scheduled, active, completed, cancelled
  scheduledAt: timestamp("scheduled_at"),
  startedAt: timestamp("started_at"),
  endedAt: timestamp("ended_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const mentorRatings = pgTable("mentor_ratings", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").references(() => mentorshipSessions.id).notNull(),
  studentId: integer("student_id").references(() => users.id).notNull(),
  mentorId: integer("mentor_id").references(() => users.id).notNull(),
  rating: integer("rating").notNull(), // 1-5 stars
  feedback: text("feedback"),
  wouldRecommend: boolean("would_recommend").default(true).notNull(),
  helpfulness: integer("helpfulness").notNull(), // 1-5
  clarity: integer("clarity").notNull(), // 1-5
  patience: integer("patience").notNull(), // 1-5
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const communityPosts = pgTable("community_posts", {
  id: serial("id").primaryKey(),
  authorId: integer("author_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  subject: text("subject"), // Optional subject tag
  postType: text("post_type").default("question").notNull(), // question, tip, achievement, discussion
  isHelpful: boolean("is_helpful").default(false).notNull(), // Marked as helpful by community
  upvotes: integer("upvotes").default(0).notNull(),
  replies: integer("replies").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const communityReplies = pgTable("community_replies", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").references(() => communityPosts.id).notNull(),
  authorId: integer("author_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  isHelpfulAnswer: boolean("is_helpful_answer").default(false).notNull(),
  upvotes: integer("upvotes").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Mentor applications - public sign-up form, admin pre-approves credentials
export const mentorApplications = pgTable("mentor_applications", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  city: text("city"),
  subjects: text("subjects").array().notNull(), // [math, science, english, etc.]
  credentials: text("credentials"), // Degrees, certifications description
  diplomaUrls: text("diploma_urls").array().default([]).notNull(), // File paths for uploaded diplomas
  experience: text("experience"), // Years of experience, background
  hourlyRate: text("hourly_rate").default("0"), // 0 = volunteer
  gradeLevel: integer("grade_level"),
  availability: text("availability"),
  status: text("status").default("pending").notNull(), // pending, approved, rejected
  reviewedBy: integer("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  adminNotes: text("admin_notes"), // Internal notes from admin review
  userId: integer("user_id").references(() => users.id), // Set when approved; linked user account
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Mentor materials - teaching content uploaded by mentors; admin must approve before publish
export const mentorMaterials = pgTable("mentor_materials", {
  id: serial("id").primaryKey(),
  mentorId: integer("mentor_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  subject: text("subject").notNull(),
  gradeLevel: text("grade_level"),
  contentType: text("content_type").notNull(), // pdf, image, video, html
  filePath: text("file_path"),
  fileUrl: text("file_url"),
  status: text("status").default("pending_review").notNull(), // pending_review, approved, rejected
  adminNotes: text("admin_notes"),
  reviewedBy: integer("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  teacherRecognized: boolean("teacher_recognized").default(false).notNull(), // true when a teacher (not superuser) approved → show "TEACHER RECOGNIZED AND APPROVED MATERIAL" badge
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Insert schemas for peer mentorship system
export const insertMentorProfileSchema = createInsertSchema(mentorProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMentorshipRequestSchema = createInsertSchema(mentorshipRequests).omit({
  id: true,
  requestedAt: true,
});

export const insertMentorshipSessionSchema = createInsertSchema(mentorshipSessions).omit({
  id: true,
  createdAt: true,
});

export const insertMentorRatingSchema = createInsertSchema(mentorRatings).omit({
  id: true,
  createdAt: true,
});

export const insertMentorApplicationSchema = createInsertSchema(mentorApplications).omit({
  id: true,
  status: true,
  reviewedBy: true,
  reviewedAt: true,
  adminNotes: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMentorMaterialSchema = createInsertSchema(mentorMaterials).omit({
  id: true,
  status: true,
  reviewedBy: true,
  reviewedAt: true,
  adminNotes: true,
  teacherRecognized: true,
  createdAt: true,
  updatedAt: true,
});

// System settings (super admin): feature flags and moderation config
export const systemSettings = pgTable("system_settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCommunityPostSchema = createInsertSchema(communityPosts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCommunityReplySchema = createInsertSchema(communityReplies).omit({
  id: true,
  createdAt: true,
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
export type MathProblem = typeof mathProblems.$inferSelect;
export type LanguageProblem = typeof languageProblems.$inferSelect;
export type InsertTutorAgent = z.infer<typeof insertTutorAgentSchema>;
export type TutorAgent = typeof tutorAgents.$inferSelect;
export type InsertTutorSession = z.infer<typeof insertTutorSessionSchema>;
export type TutorSession = typeof tutorSessions.$inferSelect;
export type InsertTutorMessage = z.infer<typeof insertTutorMessageSchema>;
export type TutorMessage = typeof tutorMessages.$inferSelect;
export type InsertTutorQaCache = z.infer<typeof insertTutorQaCacheSchema>;
export type TutorQaCache = typeof tutorQaCache.$inferSelect;
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

// Peer mentorship types for Honduras community learning
export type InsertMentorProfile = z.infer<typeof insertMentorProfileSchema>;
export type MentorProfile = typeof mentorProfiles.$inferSelect;
export type InsertMentorshipRequest = z.infer<typeof insertMentorshipRequestSchema>;
export type MentorshipRequest = typeof mentorshipRequests.$inferSelect;
export type InsertMentorshipSession = z.infer<typeof insertMentorshipSessionSchema>;
export type MentorshipSession = typeof mentorshipSessions.$inferSelect;
export type InsertMentorRating = z.infer<typeof insertMentorRatingSchema>;
export type MentorRating = typeof mentorRatings.$inferSelect;
export type InsertMentorApplication = z.infer<typeof insertMentorApplicationSchema>;
export type MentorApplication = typeof mentorApplications.$inferSelect;
export type InsertMentorMaterial = z.infer<typeof insertMentorMaterialSchema>;
export type MentorMaterial = typeof mentorMaterials.$inferSelect;
export type InsertCommunityPost = z.infer<typeof insertCommunityPostSchema>;
export type CommunityPost = typeof communityPosts.$inferSelect;
export type InsertCommunityReply = z.infer<typeof insertCommunityReplySchema>;
export type CommunityReply = typeof communityReplies.$inferSelect;
export type SystemSetting = typeof systemSettings.$inferSelect;

// RAG insert/select schemas & types
export const insertContentSourceSchema = createInsertSchema(contentSources).omit({
  id: true,
  chunkCount: true,
  tokenCount: true,
  status: true,
  createdAt: true,
  updatedAt: true,
});
export const insertContentChunkSchema = createInsertSchema(contentChunks).omit({
  id: true,
  embeddingStatus: true,
  createdAt: true,
});
export type InsertContentSource = z.infer<typeof insertContentSourceSchema>;
export type ContentSource = typeof contentSources.$inferSelect;
export type InsertContentChunk = z.infer<typeof insertContentChunkSchema>;
export type ContentChunk = typeof contentChunks.$inferSelect;