import { Router, Response, NextFunction } from "express";
import { storage } from "../storage";
import { insertContentSubmissionSchema, insertContentSourceSchema } from "@shared/schema";
import {
  authenticateToken,
  authorizeRoles,
  requireVerification,
  AuthRequest
} from "../auth";
import { ContentProcessor } from "../content-processor.js";
import { processAndChunk, buildRagContext } from "../lib/content-chunker.js";
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

contentRouter.post("/", authenticateToken, authorizeRoles('teacher', 'superuser'), requireVerification, upload.single('file'), async (req: AuthRequest, res: Response, next: NextFunction) => {
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
      tags: (tags && tags.trim()) ? JSON.parse(tags) : [],
      filePath: req.file?.path,
      fileUrl: req.file ? `/uploads/${req.file.filename}` : undefined,
      htmlContent,
      extractedText: extractedText || htmlContent || ''
    });

    res.status(201).json(submission);
  } catch (error) {
    next(error);
  }
});

contentRouter.get("/my", authenticateToken, authorizeRoles('teacher', 'superuser'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const submissions = await storage.getTeacherContentSubmissions(req.user!.id);
    res.json(submissions);
  } catch (error) {
    next(error);
  }
});

contentRouter.get("/", authenticateToken, requireVerification, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const submissions = await storage.getAllContentSubmissions(true);
    res.json(submissions);
  } catch (error) {
    next(error);
  }
});

contentRouter.patch("/:id", authenticateToken, authorizeRoles('teacher', 'superuser'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const contentId = parseInt(req.params.id);
    const content = await storage.getContentSubmission(contentId);
    
    if (!content) {
      return res.status(404).json({ error: "Content not found" });
    }

    if (req.user!.role === 'teacher' && content.teacherId !== req.user!.id) {
      return res.status(403).json({ error: "You can only edit your own content" });
    }

    const { title, description, subject } = req.body;
    const updated = await storage.updateContentSubmission(contentId, {
      title,
      description,
      subject
    });
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

contentRouter.delete("/:id", authenticateToken, authorizeRoles('teacher', 'superuser'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const contentId = parseInt(req.params.id);
    const content = await storage.getContentSubmission(contentId);
    
    if (!content) {
      return res.status(404).json({ error: "Content not found" });
    }

    if (req.user!.role === 'teacher' && content.teacherId !== req.user!.id) {
      return res.status(403).json({ error: "You can only delete your own content" });
    }

    await storage.deleteContentSubmission(contentId);
    res.json({ message: "Content deleted successfully" });
  } catch (error) {
    next(error);
  }
});

contentRouter.post("/:id/publish", authenticateToken, authorizeRoles('teacher', 'superuser'), async (req: AuthRequest, res: Response, next: NextFunction) => {
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
    next(error);
  }
});

// ---------------------------------------------------------------------------
// Curriculum-aligned RAG endpoints
// ---------------------------------------------------------------------------

const RAG_FILE_TYPES = /pdf|jpeg|jpg|png|gif|txt|html/;

/**
 * POST /api/content/upload
 * Upload teacher material (pdf/image/plain), extract text, chunk it, and persist
 * content_sources + content_chunks for RAG retrieval.
 */
contentRouter.post("/upload", authenticateToken, authorizeRoles('teacher', 'superuser'), requireVerification, upload.single('file'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { subject, topic, gradeLevel, language, fileType } = req.body;
    if (!subject) return res.status(400).json({ error: "Subject is required" });
    if (!req.file) return res.status(400).json({ error: "A file is required" });

    const detectedType = fileType || path.extname(req.file.originalname).replace('.', '').toLowerCase();
    if (!RAG_FILE_TYPES.test(detectedType)) {
      return res.status(400).json({ error: "Unsupported file type for RAG ingestion" });
    }

    const lang = language === 'en' ? 'en' : 'es';

    // 1. Persist source row (status: processing)
    const source = await storage.createContentSource({
      ownerUserId: req.user!.id,
      subject,
      topic: topic || null,
      gradeLevel: gradeLevel || null,
      fileType: detectedType,
      originalFileName: req.file.originalname,
      storageLocation: `/uploads/${req.file.filename}`,
      language: lang,
    });

    // 2. Extract + chunk
    const { chunks, totalTokens } = await processAndChunk(req.file.path, detectedType, {
      subject,
      topic: topic || undefined,
      gradeLevel: gradeLevel || undefined,
      language: lang,
    });

    // 3. Persist chunks
    const inserted = await storage.createContentChunks(
      chunks.map((c) => ({
        sourceId: source.id,
        language: lang,
        subject,
        topic: topic || null,
        gradeLevel: gradeLevel || null,
        chunkIndex: c.chunkIndex,
        text: c.text,
        tokenCount: c.tokenCount,
      }))
    );

    await storage.updateContentSource(source.id, {
      chunkCount: inserted.length,
      tokenCount: totalTokens,
      status: inserted.length > 0 ? 'ready' : 'failed',
    });

    res.status(201).json({
      source: { ...source, chunkCount: inserted.length, tokenCount: totalTokens, status: inserted.length > 0 ? 'ready' : 'failed' },
      chunkCount: inserted.length,
      message: inserted.length > 0 ? "Material ingested and chunked." : "No extractable text found.",
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/content/chunks
 * Query RAG chunks by subject/topic/gradeLevel/language (paginated).
 */
contentRouter.get("/chunks", authenticateToken, requireVerification, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { subject, topic, gradeLevel, language } = req.query as Record<string, string>;
    if (!subject) return res.status(400).json({ error: "subject query param is required" });
    const limit = Math.min(Math.max(parseInt(req.query.limit as string) || 6, 1), 20);
    const chunks = await storage.findCurriculumChunks({
      subject,
      topic: topic || undefined,
      gradeLevel: gradeLevel || undefined,
      language: language || undefined,
      limit,
    });
    res.json({ chunks, count: chunks.length });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/content/sources/my
 * List the current teacher's uploaded RAG sources.
 */
contentRouter.get("/sources/my", authenticateToken, authorizeRoles('teacher', 'superuser'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const sources = await storage.getMyContentSources(req.user!.id);
    res.json(sources);
  } catch (error) {
    next(error);
  }
});

/** Test/debug helper: build RAG context string from chunks. */
export function ragContextPreview(chunks: { text: string }[]): string {
  return buildRagContext(chunks);
}

