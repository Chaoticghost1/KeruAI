import { Router, NextFunction } from "express";
import { storage } from "../storage";
import { insertStudentProfileSchema } from "@shared/schema";

export const progressRouter = Router();

progressRouter.get("/profile/:userId", async (req, res, next: NextFunction) => {
  try {
    const userId = parseInt(req.params.userId);
    const profile = await storage.getStudentProfile(userId);
    if (!profile) {
      return res.status(404).json({ error: "Student profile not found" });
    }
    res.json(profile);
  } catch (error) {
    next(error);
  }
});

progressRouter.post("/profile", async (req, res, next: NextFunction) => {
  try {
    const validatedProfile = insertStudentProfileSchema.parse(req.body);
    const profile = await storage.createStudentProfile(validatedProfile);
    res.json(profile);
  } catch (error) {
    next(error);
  }
});

progressRouter.put("/profile/:userId", async (req, res, next: NextFunction) => {
  try {
    const userId = parseInt(req.params.userId);
    const updates = req.body;
    const profile = await storage.updateStudentProfile(userId, updates);
    res.json(profile);
  } catch (error) {
    next(error);
  }
});

progressRouter.get("/badges", async (req, res, next: NextFunction) => {
  try {
    const badges = await storage.getBadges();
    res.json(badges);
  } catch (error) {
    next(error);
  }
});

progressRouter.get("/badges/:id", async (req, res, next: NextFunction) => {
  try {
    const badgeId = parseInt(req.params.id);
    const badge = await storage.getBadge(badgeId);
    if (!badge) {
      return res.status(404).json({ error: "Badge not found" });
    }
    res.json(badge);
  } catch (error) {
    next(error);
  }
});

progressRouter.get("/user-badges/:userId", async (req, res, next: NextFunction) => {
  try {
    const userId = parseInt(req.params.userId);
    const userBadges = await storage.getUserBadges(userId);
    res.json(userBadges);
  } catch (error) {
    next(error);
  }
});

progressRouter.post("/user-badges/:userId/:badgeId/view", async (req, res, next: NextFunction) => {
  try {
    const userId = parseInt(req.params.userId);
    const badgeId = parseInt(req.params.badgeId);
    await storage.markBadgeAsViewed(userId, badgeId);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

progressRouter.get("/streaks/:userId", async (req, res, next: NextFunction) => {
  try {
    const userId = parseInt(req.params.userId);
    const limit = parseInt(req.query.limit as string) || 30;
    const streaks = await storage.getStudyStreaks(userId, limit);
    res.json(streaks);
  } catch (error) {
    next(error);
  }
});

progressRouter.post("/session-complete/:sessionId", async (req, res, next: NextFunction) => {
  try {
    const sessionId = parseInt(req.params.sessionId);
    const { userId, subject, duration, messagesExchanged, difficulty } = req.body;
    
    const rewards = await storage.awardSessionRewards(userId, {
      sessionId,
      subject,
      duration,
      messagesExchanged,
      difficulty
    });
    
    res.json(rewards);
  } catch (error) {
    next(error);
  }
});

progressRouter.get("/stats/:userId", async (req, res, next: NextFunction) => {
  try {
    const userId = parseInt(req.params.userId);
    const stats = await storage.getUserSessionStats(userId);
    res.json(stats);
  } catch (error) {
    next(error);
  }
});
