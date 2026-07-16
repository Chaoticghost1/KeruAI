import { Router, Response, NextFunction } from "express";
import { storage } from "../storage";
import { authenticateToken, authorizeRoles, AuthRequest } from "../auth";
import { debug } from "../lib/debug-study-materials";

export const teachersRouter = Router();

// GET /api/teachers - List registered teachers (isActive + isVerified) for students to select
teachersRouter.get(
  "/",
  authenticateToken,
  authorizeRoles("student", "teacher", "superuser"),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const teachers = await storage.getTeachersForStudents();
      const safe = teachers.map((u) => ({
        id: u.id,
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        username: u.username,
      }));
      res.json(safe);
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/teachers/students - List students (for teacher/superuser to assign content)
// Teachers see only students who are in at least one of their classes. Superusers see all students.
teachersRouter.get(
  "/students",
  authenticateToken,
  authorizeRoles("teacher", "superuser"),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const limit = Math.min(parseInt(req.query.limit as string) || 100, 100);
      const offset = Math.max(parseInt(req.query.offset as string) || 0, 0);
      const userId = req.user!.id;
      const role = req.user!.role;
      debug("GET /teachers/students", "request", { userId, role, limit, offset });

      const result =
        role === "teacher"
          ? await storage.getStudentsInTeacherClassesPaginated(userId, limit, offset)
          : await storage.getStudentsPaginated(limit, offset);

      debug("GET /teachers/students", "response", {
        total: result.total,
        dataLength: result.data.length,
        studentIds: result.data.map((u) => u.id),
      });

      const safe = result.data.map(({ password, ...u }) => u);
      res.json({ data: safe, total: result.total });
    } catch (error) {
      next(error);
    }
  }
);
