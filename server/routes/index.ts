import type { Express, NextFunction, Request, Response } from "express";
import { sql } from "drizzle-orm";
import { storage } from "../storage";
import { db } from "../db";
import { insertUserSchema } from "@shared/schema";
import express from 'express';
import path from 'path';
import fs from 'fs';
import { authRouter } from './auth';
import { budgetRouter } from './budget';
import { studyRouter } from './study';
import { gamesRouter } from './games';
import { tutorsRouter } from './tutors';
import { progressRouter } from './progress';
import { contentRouter } from './content';
import { classesRouter } from './classes';
import { assignmentsRouter } from './assignments';
import { adminRouter } from './admin';
import { mentorshipRouter } from './mentorship';
import { blogRouter } from './blog';
import { teachersRouter } from './teachers';
import { studentsRouter } from './students';
import captchaRouter from './captcha';

const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// #region agent log (guarded by DEBUG_AGENT_INGEST; leave unset in production)
const _dbg = process.env.DEBUG_AGENT_INGEST
  ? (m: string, d?: object) => fetch('http://127.0.0.1:7242/ingest/5a811126-3bcf-4744-9ff0-298a7797a469', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'server/routes/index.ts', message: m, data: d || {}, timestamp: Date.now(), sessionId: 'debug-session', hypothesisId: 'H4' }) }).catch(() => {})
  : () => {};
// #endregion
export async function registerRoutes(app: Express): Promise<void> {
  _dbg('registerRoutes entered', {});
  try {
    await db.execute(sql`SELECT 1`);
    _dbg('db connection ok', {});
  } catch (e: unknown) {
    _dbg('db connection failed', { err: e instanceof Error ? e.message : String(e) });
  }
  app.use('/uploads', express.static(uploadDir));

  app.use('/api/auth', authRouter);
  app.use('/api/captcha', captchaRouter);
  app.use('/api/budget', budgetRouter);
  app.use('/api/study', studyRouter);
  app.use('/api/games', gamesRouter);
  app.use('/api/tutors', tutorsRouter);
  app.use('/api/progress', progressRouter);
  app.use('/api/content', contentRouter);
  app.use('/api/classes', classesRouter);
  app.use('/api/assignments', assignmentsRouter);
  app.use('/api/admin', adminRouter);
  app.use('/api/mentorship', mentorshipRouter);
  app.use('/api/blog', blogRouter);
  app.use('/api/teachers', teachersRouter);
  app.use('/api/students', studentsRouter);

  // Public system endpoint: feature flags for nav/UI (no auth required)
  app.get("/api/system/features", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const stored = await storage.getSystemSetting('features');
      const defaults: Record<string, boolean> = {
        revision_materials: true,
        studybuddy_ai: true,
        budget_tracker: true,
        games: true,
        content_management: true,
        travel_blog: true,
        dao_access: true,
        admin_panel: true,
      };
      if (stored && typeof stored === 'object' && !Array.isArray(stored)) {
        const merged = { ...defaults, ...(stored as Record<string, boolean>) };
        return res.json(merged);
      }
      res.json(defaults);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/users", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedUser = insertUserSchema.parse(req.body);
      const user = await storage.createUser(validatedUser);
      res.json(user);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/users/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/users/username/:username", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const username = req.params.username;
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      next(error);
    }
  });
}
