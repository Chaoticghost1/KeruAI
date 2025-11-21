import type { Express } from "express";
import { storage } from "../storage";
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
import { assignmentsRouter } from './assignments';
import { adminRouter } from './admin';

const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

export async function registerRoutes(app: Express): Promise<void> {
  app.use('/uploads', express.static(uploadDir));

  app.use('/api/auth', authRouter);
  app.use('/api/budget', budgetRouter);
  app.use('/api/study', studyRouter);
  app.use('/api/games', gamesRouter);
  app.use('/api/tutors', tutorsRouter);
  app.use('/api/progress', progressRouter);
  app.use('/api/content', contentRouter);
  app.use('/api/assignments', assignmentsRouter);
  app.use('/api/admin', adminRouter);

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
}
