import { Router } from "express";
import { storage } from "../storage";
import { insertStudentProfileSchema } from "@shared/schema";

export const progressRouter = Router();

progressRouter.get("/profile/:userId", async (req, res) => {
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

progressRouter.post("/profile", async (req, res) => {
  try {
    const validatedProfile = insertStudentProfileSchema.parse(req.body);
    const profile = await storage.createStudentProfile(validatedProfile);
    res.json(profile);
  } catch (error) {
    res.status(400).json({ error: "Invalid profile data" });
  }
});

progressRouter.put("/profile/:userId", async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const updates = req.body;
    const profile = await storage.updateStudentProfile(userId, updates);
    res.json(profile);
  } catch (error) {
    res.status(400).json({ error: "Error updating student profile" });
  }
});

progressRouter.get("/badges", async (req, res) => {
  try {
    const badges = await storage.getBadges();
    res.json(badges);
  } catch (error) {
    res.status(500).json({ error: "Error fetching badges" });
  }
});

progressRouter.get("/badges/:id", async (req, res) => {
  try {
    const badgeId = parseInt(req.params.id);
    const badge = await storage.getBadge(badgeId);
    if (!badge) {
      return res.status(404).json({ error: "Badge not found" });
    }
    res.json(badge);
  } catch (error) {
    res.status(500).json({ error: "Error fetching badge" });
  }
});

progressRouter.get("/user-badges/:userId", async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const userBadges = await storage.getUserBadges(userId);
    res.json(userBadges);
  } catch (error) {
    res.status(500).json({ error: "Error fetching user badges" });
  }
});

progressRouter.post("/user-badges/:userId/:badgeId/view", async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const badgeId = parseInt(req.params.badgeId);
    await storage.markBadgeAsViewed(userId, badgeId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Error marking badge as viewed" });
  }
});

progressRouter.get("/streaks/:userId", async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const limit = parseInt(req.query.limit as string) || 30;
    const streaks = await storage.getStudyStreaks(userId, limit);
    res.json(streaks);
  } catch (error) {
    res.status(500).json({ error: "Error fetching study streaks" });
  }
});

progressRouter.post("/session-complete/:sessionId", async (req, res) => {
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
    res.status(500).json({ error: "Error completing session" });
  }
});

progressRouter.get("/stats/:userId", async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const stats = await storage.getUserSessionStats(userId);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: "Error fetching user stats" });
  }
});
