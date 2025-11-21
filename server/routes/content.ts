import { Router } from "express";
import { storage } from "../storage";
import { insertContentSubmissionSchema } from "@shared/schema";
import {
  authenticateToken,
  authorizeRoles,
  requireVerification,
  AuthRequest
} from "../auth";
import { ContentProcessor } from "../content-processor.js";
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage_multer = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage_multer,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|html/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, PDFs, and documents are allowed.'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});

export const contentRouter = Router();

contentRouter.post("/", authenticateToken, authorizeRoles('teacher', 'superuser'), requireVerification, upload.single('file'), async (req: AuthRequest, res) => {
  try {
    const { title, description, contentType, subject, gradeLevel, tags, htmlContent } = req.body;
    
    if (!title || !contentType || !subject) {
      return res.status(400).json({ error: "Title, content type, and subject are required" });
    }

    let extractedText = '';
    if (req.file?.path) {
      try {
        console.log(`Processing uploaded file: ${req.file.filename}`);
        const processedContent = await ContentProcessor.processFile(req.file.path, contentType);
        extractedText = ContentProcessor.cleanExtractedText(processedContent.extractedText);
        console.log(`Text extraction completed: ${extractedText.length} characters extracted`);
      } catch (processingError) {
        console.error("File processing error:", processingError);
      }
    }

    const submission = await storage.createContentSubmission({
      teacherId: req.user!.id,
      title,
      description,
      contentType,
      subject,
      gradeLevel,
      tags: tags ? JSON.parse(tags) : [],
      filePath: req.file?.path,
      fileUrl: req.file ? `/uploads/${req.file.filename}` : undefined,
      htmlContent,
      extractedText: extractedText || htmlContent || ''
    });

    res.status(201).json(submission);
  } catch (error) {
    console.error("Content creation error:", error);
    res.status(500).json({ error: "Failed to create content" });
  }
});

contentRouter.get("/my", authenticateToken, authorizeRoles('teacher', 'superuser'), async (req: AuthRequest, res) => {
  try {
    const submissions = await storage.getTeacherContentSubmissions(req.user!.id);
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ error: "Failed to get content submissions" });
  }
});

contentRouter.get("/", authenticateToken, requireVerification, async (req: AuthRequest, res) => {
  try {
    const submissions = await storage.getAllContentSubmissions(true);
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ error: "Failed to get content" });
  }
});

contentRouter.post("/:id/publish", authenticateToken, authorizeRoles('teacher', 'superuser'), async (req: AuthRequest, res) => {
  try {
    const contentId = parseInt(req.params.id);
    const content = await storage.getContentSubmission(contentId);
    
    if (!content) {
      return res.status(404).json({ error: "Content not found" });
    }

    if (req.user!.role === 'teacher' && content.teacherId !== req.user!.id) {
      return res.status(403).json({ error: "You can only publish your own content" });
    }

    const published = await storage.publishContentSubmission(contentId);
    res.json(published);
  } catch (error) {
    res.status(500).json({ error: "Failed to publish content" });
  }
});
