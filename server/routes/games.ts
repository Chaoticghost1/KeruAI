import { Router } from "express";
import { storage } from "../storage";
import { insertGameScoreSchema } from "@shared/schema";
import { authenticateToken, AuthRequest } from "../auth";

export const gamesRouter = Router();

// Get game scores
gamesRouter.get("/scores", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const gameName = req.query.game as string;
    const scores = await storage.getGameScores(req.user!.id, gameName);
    res.json(scores);
  } catch (error) {
    res.status(400).json({ error: "Error fetching game scores" });
  }
});

// Create game score
gamesRouter.post("/scores", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const scoreData = { ...req.body, userId: req.user!.id };
    const validatedScore = insertGameScoreSchema.parse(scoreData);
    const score = await storage.createGameScore(validatedScore);
    res.json(score);
  } catch (error) {
    res.status(400).json({ error: "Invalid score data" });
  }
});

// Get leaderboard (public - no authentication required)
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
