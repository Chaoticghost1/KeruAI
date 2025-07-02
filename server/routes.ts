import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertUserSchema,
  insertBudgetCategorySchema,
  insertBudgetTransactionSchema,
  insertStudyNoteSchema,
  insertGameScoreSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
  app.post("/api/users", async (req, res) => {
    try {
      const validatedUser = insertUserSchema.parse(req.body);
      const user = await storage.createUser(validatedUser);
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: "Invalid user data" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: "Invalid user ID" });
    }
  });

  app.get("/api/users/username/:username", async (req, res) => {
    try {
      const username = req.params.username;
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: "Error fetching user" });
    }
  });

  // Budget routes
  app.get("/api/budget/categories/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const categories = await storage.getBudgetCategories(userId);
      res.json(categories);
    } catch (error) {
      res.status(400).json({ error: "Error fetching budget categories" });
    }
  });

  app.post("/api/budget/categories", async (req, res) => {
    try {
      const validatedCategory = insertBudgetCategorySchema.parse(req.body);
      const category = await storage.createBudgetCategory(validatedCategory);
      res.json(category);
    } catch (error) {
      res.status(400).json({ error: "Invalid category data" });
    }
  });

  app.get("/api/budget/transactions/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const transactions = await storage.getBudgetTransactions(userId);
      res.json(transactions);
    } catch (error) {
      res.status(400).json({ error: "Error fetching budget transactions" });
    }
  });

  app.post("/api/budget/transactions", async (req, res) => {
    try {
      const validatedTransaction = insertBudgetTransactionSchema.parse(req.body);
      const transaction = await storage.createBudgetTransaction(validatedTransaction);
      res.json(transaction);
    } catch (error) {
      res.status(400).json({ error: "Invalid transaction data" });
    }
  });

  // Study notes routes
  app.get("/api/study/notes/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const notes = await storage.getStudyNotes(userId);
      res.json(notes);
    } catch (error) {
      res.status(400).json({ error: "Error fetching study notes" });
    }
  });

  app.post("/api/study/notes", async (req, res) => {
    try {
      const validatedNote = insertStudyNoteSchema.parse(req.body);
      const note = await storage.createStudyNote(validatedNote);
      res.json(note);
    } catch (error) {
      res.status(400).json({ error: "Invalid note data" });
    }
  });

  app.put("/api/study/notes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const updatedNote = await storage.updateStudyNote(id, updates);
      res.json(updatedNote);
    } catch (error) {
      res.status(400).json({ error: "Error updating note" });
    }
  });

  app.delete("/api/study/notes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteStudyNote(id);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: "Error deleting note" });
    }
  });

  // Game scores routes
  app.get("/api/games/scores/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const gameName = req.query.game as string;
      const scores = await storage.getGameScores(userId, gameName);
      res.json(scores);
    } catch (error) {
      res.status(400).json({ error: "Error fetching game scores" });
    }
  });

  app.post("/api/games/scores", async (req, res) => {
    try {
      const validatedScore = insertGameScoreSchema.parse(req.body);
      const score = await storage.createGameScore(validatedScore);
      res.json(score);
    } catch (error) {
      res.status(400).json({ error: "Invalid score data" });
    }
  });

  app.get("/api/games/leaderboard/:gameName", async (req, res) => {
    try {
      const gameName = req.params.gameName;
      const limit = parseInt(req.query.limit as string) || 10;
      const topScores = await storage.getTopScores(gameName, limit);
      res.json(topScores);
    } catch (error) {
      res.status(400).json({ error: "Error fetching leaderboard" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
