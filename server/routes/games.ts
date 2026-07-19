import { Router, Response, NextFunction } from "express";
import { storage } from "../storage";
import { insertGameScoreSchema } from "@shared/schema";
import { authenticateToken, AuthRequest } from "../auth";
import { buildRevisionPackFromMissed } from "../lib/revision";

export const gamesRouter = Router();

// Get game scores
gamesRouter.get("/scores", authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const gameName = req.query.game as string;
    const scores = await storage.getGameScores(req.user!.id, gameName);
    res.json(scores);
  } catch (error) {
    next(error);
  }
});

// Get game progress (reached level = max level from scores; for CruiseWord Level Challenge band)
gamesRouter.get("/progress/:gameName", authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const gameName = req.params.gameName;
    const progress = await storage.getGameProgress(req.user!.id, gameName);
    res.json(progress);
  } catch (error) {
    next(error);
  }
});

// Create game score and award profile/streak/badges
gamesRouter.post("/scores", authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const scoreData = { ...req.body, userId: req.user!.id };
    const validatedScore = insertGameScoreSchema.parse(scoreData);
    const score = await storage.createGameScore(validatedScore);
    const rewards = await storage.awardGameScoreRewards(req.user!.id, {
      gameName: validatedScore.gameName,
      score: validatedScore.score
    });

    // Revision hook: push missed questions into a revision pack (source_type = 'game').
    const missed = Array.isArray(req.body.missedQuestions) ? req.body.missedQuestions : [];
    if (missed.length > 0) {
      const subject = validatedScore.gameName === "mathmaster" ? "matematicas"
        : validatedScore.gameName === "linguaplay" ? "idiomas" : validatedScore.gameName;
      try {
        await buildRevisionPackFromMissed({
          userId: req.user!.id,
          subject,
          title: `Repaso: ${validatedScore.gameName}`,
          sourceType: "game",
          missed,
        });
      } catch (revErr) {
        console.warn("Revision pack from game failed (non-fatal):", revErr);
      }
    }

    res.json({ ...score, rewards });
  } catch (error) {
    next(error);
  }
});

// Get leaderboard with display names (public - no authentication required)
gamesRouter.get("/leaderboard/:gameName", async (req, res, next: NextFunction) => {
  try {
    const gameName = req.params.gameName;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
    const topScores = await storage.getTopScoresWithDisplayNames(gameName, limit);
    res.json(topScores);
  } catch (error) {
    next(error);
  }
});

// Get MathMaster problems for a level (authenticated)
gamesRouter.get("/problems/mathmaster/:level", authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const level = parseInt(req.params.level, 10);
    if (isNaN(level) || level < 1 || level > 6) {
      return res.status(400).json({ error: "Level must be between 1 and 6" });
    }
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const problems = await storage.getMathProblems(level, limit);
    res.json(problems);
  } catch (error: unknown) {
    const err = error as Error;
    console.error("[games] getMathProblems error:", err.message, err);
    if (err.message?.includes("does not exist") || err.message?.includes("relation")) {
      return res.status(503).json({
        error: "Games database not set up",
        hint: "Run: npm run setup:games",
      });
    }
    next(error);
  }
});

// Get LinguaPlay problems for a level and mode (authenticated)
gamesRouter.get("/problems/linguaplay/:level", authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const level = parseInt(req.params.level, 10);
    if (isNaN(level) || level < 1 || level > 6) {
      return res.status(400).json({ error: "Level must be between 1 and 6" });
    }
    const mode = (req.query.mode as string) || "vocabulary";
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const problems = await storage.getLanguageProblems(level, mode, limit);
    res.json(problems);
  } catch (error: unknown) {
    const err = error as Error;
    console.error("[games] getLanguageProblems error:", err.message, err);
    if (err.message?.includes("does not exist") || err.message?.includes("relation")) {
      return res.status(503).json({
        error: "Games database not set up",
        hint: "Run: npm run setup:games",
      });
    }
    next(error);
  }
});

// Get all LinguaPlay problems for a mode across levels (authenticated) — powers the Learn Path.
gamesRouter.get("/problems/linguaplay/all", authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const mode = (req.query.mode as string) || "vocabulary";
    const problems = await storage.getLanguageProblemsAllModes(mode);
    res.json(problems);
  } catch (error: unknown) {
    const err = error as Error;
    console.error("[games] getLanguageProblemsAllModes error:", err.message, err);
    if (err.message?.includes("does not exist") || err.message?.includes("relation")) {
      return res.status(503).json({ error: "Games database not set up", hint: "Run: npm run setup:games" });
    }
    next(error);
  }
});

// Get CruiseWord vocabulary words (authenticated). Optional ?level=1-6 filter.
gamesRouter.get("/problems/cruiseword", authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const levelRaw = req.query.level as string | undefined;
    const level = levelRaw != null ? parseInt(levelRaw, 10) : undefined;
    if (level != null && (isNaN(level) || level < 1 || level > 6)) {
      return res.status(400).json({ error: "Level must be between 1 and 6" });
    }
    const limit = Math.min(parseInt(req.query.limit as string) || 200, 500);
    const words = await storage.getCruiseWordWords(level, limit);
    res.json(words);
  } catch (error: unknown) {
    const err = error as Error;
    console.error("[games] getCruiseWordWords error:", err.message, err);
    if (err.message?.includes("does not exist") || err.message?.includes("relation")) {
      return res.status(503).json({
        error: "Games database not set up",
        hint: "Run: npm run setup:games",
      });
    }
    next(error);
  }
});
