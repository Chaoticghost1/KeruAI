import { Router } from "express";
import { storage } from "../storage";
import { insertGameScoreSchema } from "@shared/schema";

export const gamesRouter = Router();

// Get game scores
gamesRouter.get("/scores/:userId", async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const gameName = req.query.game as string;
    const scores = await storage.getGameScores(userId, gameName);
    res.json(scores);
  } catch (error) {
    res.status(400).json({ error: "Error fetching game scores" });
  }
});

// Create game score
gamesRouter.post("/scores", async (req, res) => {
  try {
    const validatedScore = insertGameScoreSchema.parse(req.body);
    const score = await storage.createGameScore(validatedScore);
    res.json(score);
  } catch (error) {
    res.status(400).json({ error: "Invalid score data" });
  }
});

// Get leaderboard
gamesRouter.get("/leaderboard/:gameName", async (req, res) => {
  try {
    const gameName = req.params.gameName;
    const limit = parseInt(req.query.limit as string) || 10;
    const topScores = await storage.getTopScores(gameName, limit);
    res.json(topScores);
  } catch (error) {
    res.status(400).json({ error: "Error fetching leaderboard" });
  }
});
