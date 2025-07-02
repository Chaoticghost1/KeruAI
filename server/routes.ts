import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertUserSchema,
  insertBudgetCategorySchema,
  insertBudgetTransactionSchema,
  insertStudyNoteSchema,
  insertGameScoreSchema,
  insertTutorSessionSchema,
  insertTutorMessageSchema,
  insertStudentProfileSchema
} from "@shared/schema";
import { getPersonaByKey, generatePersonaResponse } from "@shared/tutorPersonas";

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

  // Tutor agent routes
  app.get("/api/tutors", async (req, res) => {
    try {
      const agents = await storage.getTutorAgents();
      res.json(agents);
    } catch (error) {
      res.status(400).json({ error: "Error fetching tutor agents" });
    }
  });

  app.get("/api/tutors/:agentKey", async (req, res) => {
    try {
      const agentKey = req.params.agentKey;
      const agent = await storage.getTutorAgentByKey(agentKey);
      if (!agent) {
        return res.status(404).json({ error: "Tutor agent not found" });
      }
      const persona = getPersonaByKey(agentKey);
      res.json({ agent, persona });
    } catch (error) {
      res.status(400).json({ error: "Error fetching tutor agent" });
    }
  });

  // Tutor session routes
  app.post("/api/tutors/sessions", async (req, res) => {
    try {
      const validatedSession = insertTutorSessionSchema.parse(req.body);
      const session = await storage.createTutorSession(validatedSession);
      res.json(session);
    } catch (error) {
      res.status(400).json({ error: "Invalid session data" });
    }
  });

  app.get("/api/tutors/sessions/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const sessions = await storage.getUserTutorSessions(userId);
      res.json(sessions);
    } catch (error) {
      res.status(400).json({ error: "Error fetching tutor sessions" });
    }
  });

  app.patch("/api/tutors/sessions/:sessionId/end", async (req, res) => {
    try {
      const sessionId = parseInt(req.params.sessionId);
      const endedSession = await storage.endTutorSession(sessionId);
      res.json(endedSession);
    } catch (error) {
      res.status(400).json({ error: "Error ending session" });
    }
  });

  // Tutor message routes
  app.post("/api/tutors/messages", async (req, res) => {
    try {
      const validatedMessage = insertTutorMessageSchema.parse(req.body);
      const message = await storage.createTutorMessage(validatedMessage);
      
      // If this is a student message, generate agent response
      if (validatedMessage.sender === 'student') {
        const session = await storage.getTutorSession(validatedMessage.sessionId);
        if (session) {
          const agent = await storage.getTutorAgent(session.agentId);
          if (agent) {
            const persona = getPersonaByKey(agent.agentKey);
            if (persona) {
              const agentResponse = generatePersonaResponse(persona, {
                messageType: 'explanation',
                studentMessage: validatedMessage.message,
                topic: session.topic || undefined,
                difficulty: session.difficultyLevel
              });

              // Save agent response
              const agentMessage = await storage.createTutorMessage({
                sessionId: validatedMessage.sessionId,
                sender: 'agent',
                message: agentResponse,
                messageType: 'explanation'
              });

              return res.json({ studentMessage: message, agentMessage });
            }
          }
        }
      }
      
      res.json(message);
    } catch (error) {
      res.status(400).json({ error: "Invalid message data" });
    }
  });

  app.get("/api/tutors/sessions/:sessionId/messages", async (req, res) => {
    try {
      const sessionId = parseInt(req.params.sessionId);
      const messages = await storage.getSessionMessages(sessionId);
      res.json(messages);
    } catch (error) {
      res.status(400).json({ error: "Error fetching session messages" });
    }
  });

  // Student profile routes
  app.get("/api/students/profile/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const profile = await storage.getStudentProfile(userId);
      if (!profile) {
        return res.status(404).json({ error: "Student profile not found" });
      }
      res.json(profile);
    } catch (error) {
      res.status(400).json({ error: "Error fetching student profile" });
    }
  });

  app.post("/api/students/profile", async (req, res) => {
    try {
      const validatedProfile = insertStudentProfileSchema.parse(req.body);
      const profile = await storage.createStudentProfile(validatedProfile);
      res.json(profile);
    } catch (error) {
      res.status(400).json({ error: "Invalid profile data" });
    }
  });

  app.put("/api/students/profile/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const updates = req.body;
      const profile = await storage.updateStudentProfile(userId, updates);
      res.json(profile);
    } catch (error) {
      res.status(400).json({ error: "Error updating student profile" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
