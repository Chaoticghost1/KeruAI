import { Router, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";
import multer from "multer";
import { storage } from "../storage";
import { insertMentorProfileSchema, insertMentorshipRequestSchema } from "@shared/schema";
import { authenticateToken, AuthRequest } from "../auth";
import { authorizeRoles } from "../auth";

const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
const mentorUpload = multer({
  storage: multer.diskStorage({
    destination: (_, __, cb) => cb(null, uploadDir),
    filename: (_, file, cb) => cb(null, "mentor-" + Date.now() + "-" + Math.round(Math.random() * 1e9) + path.extname(file.originalname)),
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    const ok = /jpeg|jpg|png|gif|pdf|doc|docx|txt|html/.test(path.extname(file.originalname).toLowerCase());
    cb(ok ? null : new Error("Invalid file type"), ok);
  },
});

export const mentorshipRouter = Router();

// POST /api/mentorship/applications - Public mentor application (no auth required)
mentorshipRouter.post("/applications", async (req, res: Response, next: NextFunction) => {
  try {
    const { fullName, email, phone, city, subjects, credentials, experience, hourlyRate, gradeLevel, availability } = req.body;
    if (!fullName || !email) {
      return res.status(400).json({ error: "Full name and email are required" });
    }
    const subjectsArray = Array.isArray(subjects) ? subjects : (typeof subjects === "string" ? subjects.split(",").map((s: string) => s.trim()).filter(Boolean) : []);
    if (subjectsArray.length === 0) {
      return res.status(400).json({ error: "At least one subject is required" });
    }
    const application = await storage.createMentorApplication({
      fullName,
      email,
      phone: phone || null,
      city: city || null,
      subjects: subjectsArray,
      credentials: credentials || null,
      experience: experience || null,
      hourlyRate: hourlyRate || "0",
      gradeLevel: gradeLevel ? parseInt(gradeLevel) : null,
      availability: availability || null,
    });
    res.status(201).json(application);
  } catch (error) {
    next(error);
  }
});

// POST /api/mentorship/materials - Mentor uploads material (requires mentor/teacher)
mentorshipRouter.post("/materials", authenticateToken, authorizeRoles("teacher", "superuser"), mentorUpload.single("file"), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { title, description, subject, gradeLevel, contentType } = req.body;
    if (!title || !subject || !contentType) {
      return res.status(400).json({ error: "Title, subject, and content type are required" });
    }
    const mentorProfile = await storage.getMentorProfile(req.user!.id);
    if (!mentorProfile && req.user!.role !== "superuser") {
      return res.status(403).json({ error: "You need a mentor profile to upload materials. Apply to become a mentor first." });
    }
    const material = await storage.createMentorMaterial({
      mentorId: req.user!.id,
      title,
      description: description || null,
      subject,
      gradeLevel: gradeLevel || null,
      contentType,
      filePath: req.file?.path || null,
      fileUrl: req.file ? `/uploads/${req.file.filename}` : null,
    });
    res.status(201).json(material);
  } catch (error) {
    next(error);
  }
});

// GET /api/mentorship/materials - Mentor gets their materials
mentorshipRouter.get("/materials", authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const materials = await storage.getMentorMaterials(req.user!.id);
    res.json(materials);
  } catch (error) {
    next(error);
  }
});

// GET /api/mentorship/mentors - List mentor profiles (optional filters; optional limit/offset for pagination)
mentorshipRouter.get("/mentors", authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const subject = req.query.subject as string | undefined;
    const gradeLevel = req.query.gradeLevel ? parseInt(req.query.gradeLevel as string) : undefined;
    const isVolunteer = req.query.isVolunteer === "true" ? true : undefined;
    const isAvailable = req.query.isAvailable !== "false";
    const limitParam = req.query.limit != null ? parseInt(req.query.limit as string) : undefined;
    const offsetParam = req.query.offset != null ? parseInt(req.query.offset as string) : undefined;

    const filters = {
      subjects: subject ? [subject] : undefined,
      gradeLevel,
      isVolunteer,
      isAvailable,
    };

    if (limitParam !== undefined || offsetParam !== undefined) {
      const limit = Math.min(Math.max(limitParam ?? 12, 1), 50);
      const offset = Math.max(offsetParam ?? 0, 0);
      const result = await storage.getMentorProfilesPaginated(filters, limit, offset);
      const enriched = await Promise.all(
        result.data.map(async (m) => {
          const user = await storage.getUser(m.userId);
          return {
            ...m,
            mentorName: user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username : "Mentor",
          };
        })
      );
      return res.json({ data: enriched, total: result.total });
    }

    const mentors = await storage.getMentorProfiles(filters);
    const enriched = await Promise.all(
      mentors.map(async (m) => {
        const user = await storage.getUser(m.userId);
        return {
          ...m,
          mentorName: user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username : "Mentor",
        };
      })
    );

    res.json(enriched);
  } catch (error) {
    next(error);
  }
});

// GET /api/mentorship/me - Get current user's mentor profile (if any)
mentorshipRouter.get("/me", authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const profile = await storage.getMentorProfile(req.user!.id);
    if (!profile) {
      return res.status(404).json({ error: "No mentor profile found" });
    }
    const user = await storage.getUser(req.user!.id);
    res.json({
      ...profile,
      mentorName: user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username : "Mentor",
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/mentorship/me - Update current user's mentor profile
mentorshipRouter.patch("/me", authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const profile = await storage.getMentorProfile(req.user!.id);
    if (!profile) {
      return res.status(404).json({ error: "No mentor profile found. Create one first." });
    }
    const { subjects, bio, gradeLevel, hourlyRate, isAvailable } = req.body;
    const updates: Record<string, unknown> = {};
    if (subjects !== undefined) updates.subjects = Array.isArray(subjects) ? subjects : (typeof subjects === "string" ? subjects.split(",").map((s: string) => s.trim()).filter(Boolean) : profile.subjects);
    if (bio !== undefined) updates.bio = bio;
    if (gradeLevel !== undefined) updates.gradeLevel = gradeLevel;
    if (hourlyRate !== undefined) updates.hourlyRate = String(hourlyRate);
    if (isAvailable !== undefined) updates.isAvailable = isAvailable;
    const updated = await storage.updateMentorProfile(req.user!.id, updates);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// POST /api/mentorship/mentors - Create mentor profile (become a mentor)
mentorshipRouter.post("/mentors", authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const profileData = { ...req.body, userId: req.user!.id };
    const validated = insertMentorProfileSchema.parse(profileData);
    const profile = await storage.createMentorProfile(validated);
    res.status(201).json(profile);
  } catch (error) {
    next(error);
  }
});

// GET /api/mentorship/requests - Get mentorship requests (for current user as student or mentor)
mentorshipRouter.get("/requests", authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const asMentor = req.query.asMentor === "true";
    const status = req.query.status as string | undefined;

    const requests = asMentor
      ? await storage.getMentorshipRequests(req.user!.id, undefined, status)
      : await storage.getMentorshipRequests(undefined, req.user!.id, status);

    res.json(requests);
  } catch (error) {
    next(error);
  }
});

// POST /api/mentorship/requests - Create mentorship request
mentorshipRouter.post("/requests", authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const requestData = {
      ...req.body,
      studentId: req.user!.id,
    };
    const validated = insertMentorshipRequestSchema.parse(requestData);
    const request = await storage.createMentorshipRequest(validated);
    res.status(201).json(request);
  } catch (error) {
    next(error);
  }
});

// GET /api/mentorship/sessions - Get user's mentorship sessions
mentorshipRouter.get("/sessions", authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const sessions = await storage.getMentorshipSessions(undefined, req.user!.id);
    res.json(sessions);
  } catch (error) {
    next(error);
  }
});
