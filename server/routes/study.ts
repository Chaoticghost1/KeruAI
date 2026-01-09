import { Router, Response, NextFunction } from "express";
import { storage } from "../storage";
import { insertStudyNoteSchema } from "@shared/schema";
import { authenticateToken, AuthRequest } from "../auth";

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
