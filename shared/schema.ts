import { pgTable, text, serial, integer, timestamp, decimal, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
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
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  budgetCategories: many(budgetCategories),
  budgetTransactions: many(budgetTransactions),
  studyNotes: many(studyNotes),
  gameScores: many(gameScores),
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
