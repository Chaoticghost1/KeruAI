import { Router, Response, NextFunction } from "express";
import { storage } from "../storage";
import {
  authenticateToken,
  authorizeRoles,
  AuthRequest,
} from "../auth";

export const studentsRouter = Router();

// GET /api/students/teachers - My selected teachers (student only)
studentsRouter.get(
  "/teachers",
  authenticateToken,
  authorizeRoles("student"),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const rows = await storage.getStudentTeachers(userId);
      const teachers = await Promise.all(
        rows.map(async (r) => {
          const u = await storage.getUser(r.teacherId);
          if (!u) return null;
          return {
            id: u.id,
            firstName: u.firstName,
            lastName: u.lastName,
            email: u.email,
            username: u.username,
            selectedAt: r.createdAt,
          };
        })
      );
      res.json(teachers.filter(Boolean));
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/students/teachers/:teacherId - Select a teacher (student only)
studentsRouter.post(
  "/teachers/:teacherId",
  authenticateToken,
  authorizeRoles("student"),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const studentId = req.user!.id;
      const teacherId = parseInt(req.params.teacherId, 10);
      if (Number.isNaN(teacherId)) {
        return res.status(400).json({ error: "Invalid teacher ID" });
      }
      const teacher = await storage.getUser(teacherId);
      if (!teacher || teacher.role !== "teacher" || !teacher.isActive || !teacher.isVerified) {
        return res.status(404).json({ error: "Teacher not found or not available" });
      }
      const row = await storage.addStudentTeacher(studentId, teacherId);
      res.status(201).json(row);
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/students/teachers/:teacherId - Unselect a teacher (student only)
studentsRouter.delete(
  "/teachers/:teacherId",
  authenticateToken,
  authorizeRoles("student"),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const studentId = req.user!.id;
      const teacherId = parseInt(req.params.teacherId, 10);
      if (Number.isNaN(teacherId)) {
        return res.status(400).json({ error: "Invalid teacher ID" });
      }
      await storage.removeStudentTeacher(studentId, teacherId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);
