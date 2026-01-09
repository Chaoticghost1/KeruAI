import { Router, Response, NextFunction } from "express";
import { storage } from "../storage";
import { insertStudentAssignmentSchema } from "@shared/schema";
import {
  authenticateToken,
  authorizeRoles,
  requireVerification,
  AuthRequest
} from "../auth";
import { AITutorService } from "../ai-service.js";
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

export const assignmentsRouter = Router();

assignmentsRouter.post("/", authenticateToken, authorizeRoles('teacher', 'superuser'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { studentId, contentId } = req.body;
    
    if (!studentId || !contentId) {
      return res.status(400).json({ error: "Student ID and content ID are required" });
    }

    const assignment = await storage.createStudentAssignment({
      studentId,
      contentId,
      status: 'assigned'
    });

    res.status(201).json(assignment);
  } catch (error) {
    next(error);
  }
});

assignmentsRouter.get("/my", authenticateToken, authorizeRoles('student'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const assignments = await storage.getStudentAssignments(req.user!.id);
    res.json(assignments);
  } catch (error) {
    next(error);
  }
});

assignmentsRouter.post("/:id/submit", authenticateToken, authorizeRoles('student'), upload.array('files', 5), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const assignmentId = parseInt(req.params.id);
    const { submissionText } = req.body;
    
    const assignment = await storage.getStudentAssignment(assignmentId);
    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    if (assignment.studentId !== req.user!.id) {
      return res.status(403).json({ error: "Not your assignment" });
    }

    const files = req.files as Express.Multer.File[];
    const submissionFiles = files?.map(file => `/uploads/${file.filename}`) || [];

    const submitted = await storage.submitAssignment(assignmentId, {
      submissionText,
      submissionFiles
    });

    res.json(submitted);
  } catch (error) {
    next(error);
  }
});

assignmentsRouter.post("/:id/grade", authenticateToken, authorizeRoles('teacher', 'superuser'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const assignmentId = parseInt(req.params.id);
    const { grade, feedback } = req.body;
    
    if (grade === undefined || grade < 0 || grade > 100) {
      return res.status(400).json({ error: "Grade must be between 0 and 100" });
    }

    const graded = await storage.gradeAssignment(assignmentId, grade, feedback);
    res.json(graded);
  } catch (error) {
    next(error);
  }
});

assignmentsRouter.get("/revision/materials", authenticateToken, authorizeRoles('student'), requireVerification, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const assignments = await storage.getStudentAssignments(req.user!.id);
    
    const materialsWithContent = await Promise.all(
      assignments.map(async (assignment) => {
        const content = await storage.getContentSubmission(assignment.contentId);
        return {
          assignmentId: assignment.id,
          contentId: assignment.contentId,
          status: assignment.status,
          assignedAt: assignment.assignedAt,
          dueDate: assignment.dueDate,
          grade: assignment.grade,
          content: content ? {
            id: content.id,
            title: content.title,
            description: content.description,
            contentType: content.contentType,
            subject: content.subject,
            gradeLevel: content.gradeLevel,
            tags: content.tags,
            fileUrl: content.fileUrl,
            extractedText: content.extractedText,
            htmlContent: content.htmlContent
          } : null
        };
      })
    );

    res.json(materialsWithContent.filter(m => m.content));
  } catch (error) {
    next(error);
  }
});

assignmentsRouter.get("/revision/content/:contentId", authenticateToken, authorizeRoles('student'), requireVerification, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const contentId = parseInt(req.params.contentId);
    
    const assignments = await storage.getStudentAssignments(req.user!.id);
    const hasAccess = assignments.some(assignment => assignment.contentId === contentId);
    
    if (!hasAccess) {
      return res.status(403).json({ error: "You don't have access to this content" });
    }

    const content = await storage.getContentSubmission(contentId);
    if (!content) {
      return res.status(404).json({ error: "Content not found" });
    }

    const currentViewCount = Number(content.viewCount) || 0;
    await storage.updateContentSubmission(contentId, { 
      viewCount: currentViewCount + 1 
    });

    res.json(content);
  } catch (error) {
    next(error);
  }
});

assignmentsRouter.post("/revision/session/start", authenticateToken, authorizeRoles('student'), requireVerification, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { contentId, subject, topic } = req.body;
    
    if (!contentId || !subject) {
      return res.status(400).json({ error: "Content ID and subject are required" });
    }

    const assignments = await storage.getStudentAssignments(req.user!.id);
    const hasAccess = assignments.some(assignment => assignment.contentId === contentId);
    
    if (!hasAccess) {
      return res.status(403).json({ error: "You don't have access to this content" });
    }

    const sessionData = {
      contentId,
      subject,
      topic: topic || 'General Review',
      startTime: new Date().toISOString(),
      studentId: req.user!.id
    };

    res.json({
      sessionId: `session_${Date.now()}_${req.user!.id}`,
      ...sessionData,
      message: "Revision session started successfully"
    });
  } catch (error) {
    next(error);
  }
});

assignmentsRouter.post("/revision/ai-help", authenticateToken, authorizeRoles('student'), requireVerification, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { contentId, question, sessionId } = req.body;
    
    if (!contentId || !question) {
      return res.status(400).json({ error: "Content ID and question are required" });
    }

    const assignments = await storage.getStudentAssignments(req.user!.id);
    const hasAccess = assignments.some(assignment => assignment.contentId === contentId);
    
    if (!hasAccess) {
      return res.status(403).json({ error: "You don't have access to this content" });
    }

    const content = await storage.getContentSubmission(contentId);
    if (!content) {
      return res.status(404).json({ error: "Content not found" });
    }

    const aiResponse = await AITutorService.generateTutorResponse(
      'math_buddy',
      question,
      content.subject,
      1,
      [],
      'en'
    );

    const enhancedResponse = {
      ...aiResponse,
      contentContext: {
        title: content.title,
        subject: content.subject,
        hasExtractedText: !!content.extractedText
      },
      sessionId
    };

    res.json(enhancedResponse);
  } catch (error) {
    next(error);
  }
});
