import { Router, Response, NextFunction } from "express";
import { storage } from "../storage";
import { insertStudyNoteSchema } from "@shared/schema";
import { authenticateToken, AuthRequest } from "../auth";
import { AITutorService } from "../ai-service";
import { getInitialSchedulingInfo, scheduleNextReview, ReviewDifficulty } from "../lib/spaced-repetition.js";

export const studyRouter = Router();

// Get study notes
studyRouter.get("/notes", authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const notes = await storage.getStudyNotes(req.user!.id);
    res.json(notes);
  } catch (error) {
    next(error);
  }
});

// Create study note
studyRouter.post("/notes", authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const noteData = { ...req.body, userId: req.user!.id };
    const validatedNote = insertStudyNoteSchema.parse(noteData);
    const note = await storage.createStudyNote(validatedNote);
    res.json(note);
  } catch (error) {
    next(error);
  }
});

// Update study note
studyRouter.put("/notes/:id", authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    
    const existingNote = await storage.getStudyNoteById(id);
    if (!existingNote) {
      return res.status(404).json({ error: "Note not found" });
    }
    if (existingNote.userId !== req.user!.id) {
      return res.status(403).json({ error: "Not authorized to update this note" });
    }
    
    const updates = req.body;
    const updatedNote = await storage.updateStudyNote(id, updates);
    res.json(updatedNote);
  } catch (error) {
    next(error);
  }
});

// Delete study note
studyRouter.delete("/notes/:id", authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    
    const existingNote = await storage.getStudyNoteById(id);
    if (!existingNote) {
      return res.status(404).json({ error: "Note not found" });
    }
    if (existingNote.userId !== req.user!.id) {
      return res.status(403).json({ error: "Not authorized to delete this note" });
    }
    
    await storage.deleteStudyNote(id);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// ---------------------------------------------------------------------------
// Student Revision v2: practice generation + revision packs
// ---------------------------------------------------------------------------

/**
 * POST /api/study/practice
 * Generate practice questions (AI or fallback), persist them, and create/update a
 * revision pack for the user.
 */
studyRouter.post("/practice", authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { subject, topic, difficulty, count, language, packTitle } = req.body;
    if (!subject) return res.status(400).json({ error: "subject is required" });

    const questions = await AITutorService.generatePracticeQuestions(subject, {
      topic,
      difficulty: difficulty ? Number(difficulty) : 2,
      count: count ? Number(count) : 5,
      language: language || "es",
    });

    // Persist each generated question + pack item
    const generations = await Promise.all(
      questions.map((q) =>
        storage.createPracticeGeneration({
          userId: req.user!.id,
          subject,
          topic: topic || null,
          difficulty: difficulty ? Number(difficulty) : 2,
          sourceType: "ai",
          rawPrompt: JSON.stringify({ subject, topic, difficulty }),
          rawAnswer: JSON.stringify(q),
          structuredQuestion: q,
        })
      )
    );

    const pack = await storage.createRevisionPack({
      userId: req.user!.id,
      subject,
      topic: topic || null,
      title: packTitle || `${subject}${topic ? ` — ${topic}` : ""}`,
      metadata: { questions: generations.length, sourceTypes: ["ai"], generatedAt: new Date().toISOString() },
    });

    for (const gen of generations) {
      await storage.addRevisionPackItem({
        packId: pack.id,
        practiceGenerationId: gen.id,
        type: "question",
        schedulingInfo: getInitialSchedulingInfo("medium"),
      });
    }

    res.status(201).json({ pack, generations });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/revision/packs — list packs for the current user (summary).
 */
studyRouter.get("/revision/packs", authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const packs = await storage.getRevisionPacks(req.user!.id);
    res.json(packs);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/revision/packs/:id — full pack with items (questions + scheduling).
 */
studyRouter.get("/revision/packs/:id", authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const packId = parseInt(req.params.id);
    const pack = await storage.getRevisionPack(req.user!.id, packId);
    if (!pack) return res.status(404).json({ error: "Pack not found" });
    res.json(pack);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/revision/packs/:id/offline — mark a pack available for offline study.
 */
studyRouter.post("/revision/packs/:id/offline", authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const packId = parseInt(req.params.id);
    const pack = await storage.setPackOfflineReady(packId, true);
    res.json(pack);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/revision/packs/:id/items/:itemId/review
 * Record a spaced-repetition review and reschedule the item.
 */
studyRouter.post("/revision/packs/:id/items/:itemId/review", authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const itemId = parseInt(req.params.itemId);
    const difficulty = (req.body.difficulty as ReviewDifficulty) || "medium";
    if (!["easy", "medium", "hard"].includes(difficulty)) {
      return res.status(400).json({ error: "difficulty must be easy|medium|hard" });
    }
    const item = await storage.updateRevisionPackItem(itemId, {});
    if (!item) return res.status(404).json({ error: "Item not found" });
    const current = (item.schedulingInfo as any) ?? null;
    const next = scheduleNextReview(current, difficulty);
    const updated = await storage.updateRevisionPackItem(itemId, { schedulingInfo: next });
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

