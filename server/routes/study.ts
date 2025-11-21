import { Router } from "express";
import { storage } from "../storage";
import { insertStudyNoteSchema } from "@shared/schema";
import { authenticateToken, AuthRequest } from "../auth";

export const studyRouter = Router();

// Get study notes
studyRouter.get("/notes", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const notes = await storage.getStudyNotes(req.user!.id);
    res.json(notes);
  } catch (error) {
    res.status(400).json({ error: "Error fetching study notes" });
  }
});

// Create study note
studyRouter.post("/notes", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const noteData = { ...req.body, userId: req.user!.id };
    const validatedNote = insertStudyNoteSchema.parse(noteData);
    const note = await storage.createStudyNote(validatedNote);
    res.json(note);
  } catch (error) {
    res.status(400).json({ error: "Invalid note data" });
  }
});

// Update study note
studyRouter.put("/notes/:id", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    
    // First verify ownership
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
    res.status(400).json({ error: "Error updating note" });
  }
});

// Delete study note
studyRouter.delete("/notes/:id", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    
    // First verify ownership
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
    res.status(400).json({ error: "Error deleting note" });
  }
});
