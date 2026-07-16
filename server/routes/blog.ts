import { Router, Response, NextFunction } from "express";
import { storage } from "../storage";

export const blogRouter = Router();

// GET /posts - Public read of published blog posts (no auth required)
blogRouter.get("/posts", async (_req, res: Response, next: NextFunction) => {
  try {
    const limit = Math.min(Math.max(parseInt(String(_req.query.limit || 20), 10) || 20, 1), 100);
    const offset = Math.max(parseInt(String(_req.query.offset || 0), 10) || 0, 0);
    const result = await storage.getPublishedBlogPosts(limit, offset);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// GET /landing - Public featured posts for landing page (showOnLanding + published)
blogRouter.get("/landing", async (_req, res: Response, next: NextFunction) => {
  try {
    const limit = Math.min(Math.max(parseInt(String(_req.query.limit || 6), 10) || 6, 1), 12);
    const posts = await storage.getLandingBlogPosts(limit);
    res.json({ data: posts });
  } catch (error) {
    next(error);
  }
});
