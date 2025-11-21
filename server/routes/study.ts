import { Router } from "express";
import { storage } from "../storage";
import { insertStudyNoteSchema } from "@shared/schema";

export const studyRouter = Router();

// Get study notes
studyRouter.get("/notes/:userId", async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const notes = await storage.getStudyNotes(userId);
    res.json(notes);
  } catch (error) {
    res.status(400).json({ error: "Error fetching study notes" });
  }
});

// Create study note
studyRouter.post("/notes", async (req, res) => {
  try {
    const validatedNote = insertStudyNoteSchema.parse(req.body);
    const note = await storage.createStudyNote(validatedNote);
    res.json(note);
  } catch (error) {
    res.status(400).json({ error: "Invalid note data" });
  }
});

// Update study note
studyRouter.put("/notes/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updates = req.body;
    const updatedNote = await storage.updateStudyNote(id, updates);
    res.json(updatedNote);
  } catch (error) {
    res.status(400).json({ error: "Error updating note" });
  }
});

// Delete study note
studyRouter.delete("/notes/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await storage.deleteStudyNote(id);
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: "Error deleting note" });
  }
});
