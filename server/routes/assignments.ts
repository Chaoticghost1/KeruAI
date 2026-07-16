import { Router, Response, NextFunction } from "express";
import { storage } from "../storage";
import { insertStudentAssignmentSchema } from "@shared/schema";
import {
  authenticateToken,
  authorizeRoles,
  requireVerification,
  AuthRequest
} from "../auth";
import { debug } from "../lib/debug-study-materials";
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
    debug("POST /assignments", "body received", { body: req.body });
    const studentId = typeof req.body.studentId === 'number' ? req.body.studentId : parseInt(req.body.studentId, 10);
    const contentId = typeof req.body.contentId === 'number' ? req.body.contentId : parseInt(req.body.contentId, 10);

    if (!Number.isInteger(studentId) || studentId < 1 || !Number.isInteger(contentId) || contentId < 1) {
      debug("POST /assignments", "validation failed", { studentId, contentId });
      return res.status(400).json({ error: "Student ID and content ID are required and must be positive integers" });
    }

    const assignment = await storage.createStudentAssignment({
      studentId,
      contentId,
      status: 'assigned'
    });

    debug("POST /assignments", "created", { assignmentId: assignment.id, studentId, contentId });
    res.status(201).json(assignment);
  } catch (error) {
    debug("POST /assignments", "error", { error: error instanceof Error ? error.message : String(error) });
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
    const studentId = req.user!.id;
    const selectedRows = await storage.getStudentTeachers(studentId);
    const selectedTeacherIds = new Set(selectedRows.map((r) => r.teacherId));

    debug("GET /revision/materials", "student context", {
      studentId,
      selectedTeacherIds: [...selectedTeacherIds],
      selectedTeacherCount: selectedTeacherIds.size,
    });

    if (selectedTeacherIds.size === 0) {
      debug("GET /revision/materials", "empty: no teachers selected", {});
      return res.json([]);
    }

    const hasApprovedClass = await storage.hasAnyApprovedClass(studentId);
    debug("GET /revision/materials", "approved class check", { hasApprovedClass });

    if (!hasApprovedClass) {
      debug("GET /revision/materials", "403: no approved class", {});
      return res.status(403).json({ error: "Your teacher must approve you in a class before you can access study materials" });
    }
    const assignments = await storage.getStudentAssignments(studentId);
    debug("GET /revision/materials", "assignments", {
      count: assignments.length,
      assignmentIds: assignments.map((a) => ({ id: a.id, contentId: a.contentId })),
    });

    const materialsWithContent = await Promise.all(
      assignments.map(async (assignment) => {
        const content = await storage.getContentSubmission(assignment.contentId);
        if (!content || !selectedTeacherIds.has(content.teacherId)) {
          debug("GET /revision/materials", "assignment filtered out (no content or teacher not in selected)", {
            assignmentId: assignment.id,
            contentId: assignment.contentId,
            hasContent: !!content,
            contentTeacherId: content?.teacherId,
            inSelected: content ? selectedTeacherIds.has(content.teacherId) : false,
          });
          return null;
        }
        return {
          assignmentId: assignment.id,
          contentId: assignment.contentId,
          teacherId: content.teacherId,
          status: assignment.status,
          assignedAt: assignment.assignedAt,
          dueDate: assignment.dueDate,
          grade: assignment.grade,
          content: {
            id: content.id,
            title: content.title,
            description: content.description,
            contentType: content.contentType,
            subject: content.subject,
            gradeLevel: content.gradeLevel,
            tags: Array.isArray(content.tags) ? content.tags : [],
            fileUrl: content.fileUrl,
            extractedText: content.extractedText ?? '',
            htmlContent: content.htmlContent
          }
        };
      })
    );

    const filtered = materialsWithContent.filter((m): m is NonNullable<typeof m> => m !== null);
    debug("GET /revision/materials", "response", { materialsCount: filtered.length });
    res.json(filtered);
  } catch (error) {
    debug("GET /revision/materials", "error", { error: error instanceof Error ? error.message : String(error) });
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
    const hasApprovedClass = await storage.hasAnyApprovedClass(req.user!.id);
    if (!hasApprovedClass) {
      return res.status(403).json({ error: "Your teacher must approve you in a class before you can access study materials" });
    }
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
    const hasApprovedClass = await storage.hasAnyApprovedClass(req.user!.id);
    if (!hasApprovedClass) {
      return res.status(403).json({ error: "Your teacher must approve you in a class before you can access study materials" });
    }
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

    const studentProfile = await storage.getStudentProfile(req.user!.id);
    const profileContext = studentProfile ? {
      learningStyle: studentProfile.learningStyle,
      preferredDifficulty: studentProfile.preferredDifficulty,
      subjects: studentProfile.subjects,
      strugglingAreas: studentProfile.strugglingAreas,
      revisionAssistantName: studentProfile.revisionAssistantName ?? undefined
    } : undefined;

    // Get user's language preference from profile or default to 'en'
    const userLanguage = studentProfile?.language || 'en';
    
    const aiResponse = await AITutorService.generateTutorResponse(
      'math_buddy',
      question,
      content.subject,
      studentProfile?.preferredDifficulty ?? 2,
      [],
      userLanguage,
      undefined,
      profileContext
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
