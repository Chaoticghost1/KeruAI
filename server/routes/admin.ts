import { Router, Response, NextFunction } from "express";
import { storage } from "../storage";
import { insertBotPersonaSchema } from "@shared/schema";
import {
  authenticateToken,
  authorizeRoles,
  AuthRequest
} from "../auth";

export const adminRouter = Router();

adminRouter.get("/users", authenticateToken, authorizeRoles('superuser'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const users = await storage.getAllUsers();
    const sanitizedUsers = users.map(({ password, ...user }) => user);
    res.json(sanitizedUsers);
  } catch (error) {
    next(error);
  }
});

adminRouter.patch("/users/:id/status", authenticateToken, authorizeRoles('superuser'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = parseInt(req.params.id);
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ error: "isActive must be a boolean" });
    }

    if (userId === req.user!.id && !isActive) {
      return res.status(400).json({ error: "Cannot deactivate your own account" });
    }

    const updatedUser = await storage.updateUser(userId, { isActive });
    res.json(updatedUser);
  } catch (error) {
    next(error);
  }
});

adminRouter.patch("/users/:id/role", authenticateToken, authorizeRoles('superuser'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = parseInt(req.params.id);
    const { role } = req.body;

    if (!['student', 'teacher', 'superuser'].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    if (userId === req.user!.id && req.user!.role === 'superuser' && role !== 'superuser') {
      return res.status(400).json({ error: "Cannot change your own superuser role" });
    }

    const updatedUser = await storage.updateUser(userId, { role });
    res.json(updatedUser);
  } catch (error) {
    next(error);
  }
});

adminRouter.patch("/users/:id/verify", authenticateToken, authorizeRoles('superuser'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = parseInt(req.params.id);
    await storage.verifyUser(userId);
    res.json({ message: "User verified successfully" });
  } catch (error) {
    next(error);
  }
});

adminRouter.delete("/users/:id", authenticateToken, authorizeRoles('superuser'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = parseInt(req.params.id);
    
    if (userId === req.user!.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }
    
    await storage.deleteUser(userId);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
});

adminRouter.patch("/system/features", authenticateToken, authorizeRoles('superuser'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { feature, enabled } = req.body;

    if (typeof enabled !== 'boolean') {
      return res.status(400).json({ error: "enabled must be a boolean" });
    }

    res.json({ message: `Feature ${feature} ${enabled ? 'enabled' : 'disabled'}` });
  } catch (error) {
    next(error);
  }
});

adminRouter.get("/analytics", authenticateToken, authorizeRoles('superuser', 'teacher'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const analytics = await storage.getAnalytics();
    res.json(analytics);
  } catch (error) {
    next(error);
  }
});

adminRouter.get("/budget-analytics", authenticateToken, authorizeRoles('superuser'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const analytics = await storage.getBudgetAnalytics();
    res.json(analytics);
  } catch (error) {
    next(error);
  }
});

adminRouter.get("/chat-analytics", authenticateToken, authorizeRoles('superuser', 'teacher'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const analytics = await storage.getChatAnalytics();
    res.json(analytics);
  } catch (error) {
    next(error);
  }
});

adminRouter.get("/bot-personas", authenticateToken, authorizeRoles('superuser', 'teacher'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const personas = await storage.getBotPersonas();
    res.json(personas);
  } catch (error) {
    next(error);
  }
});

adminRouter.post("/bot-personas", authenticateToken, authorizeRoles('superuser', 'teacher'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const personaData = req.body;
    
    if (typeof personaData.subjects === 'string') {
      const subjectsArray = personaData.subjects.split(',').map((s: string) => s.trim()).filter((s: string) => s);
      personaData.subjects = subjectsArray.length > 0 ? subjectsArray : null;
    } else if (!personaData.subjects) {
      personaData.subjects = null;
    }
    
    personaData.createdById = req.user!.id;
    const persona = await storage.createBotPersona(personaData);
    res.json(persona);
  } catch (error) {
    next(error);
  }
});

adminRouter.put("/bot-personas/:id", authenticateToken, authorizeRoles('superuser', 'teacher'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const updates = req.body;
    
    if (typeof updates.subjects === 'string') {
      const subjectsArray = updates.subjects.split(',').map((s: string) => s.trim()).filter((s: string) => s);
      updates.subjects = subjectsArray.length > 0 ? subjectsArray : null;
    } else if (!updates.subjects) {
      updates.subjects = null;
    }
    
    const persona = await storage.updateBotPersona(id, updates);
    res.json(persona);
  } catch (error) {
    next(error);
  }
});

adminRouter.delete("/bot-personas/:id", authenticateToken, authorizeRoles('superuser', 'teacher'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    await storage.deleteBotPersona(id);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

adminRouter.get("/blog-posts", authenticateToken, authorizeRoles('superuser', 'teacher'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const limitParam = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const offsetParam = req.query.offset ? parseInt(req.query.offset as string) : undefined;
    
    if (limitParam !== undefined || offsetParam !== undefined) {
      if ((limitParam !== undefined && (isNaN(limitParam) || limitParam < 0)) || 
          (offsetParam !== undefined && (isNaN(offsetParam) || offsetParam < 0))) {
        return res.status(400).json({ error: "Invalid pagination parameters: limit and offset must be non-negative integers" });
      }
      
      const limit = Math.min(Math.max(limitParam || 10, 0), 100);
      const offset = Math.max(offsetParam || 0, 0);
      const result = await storage.getBlogPostsPaginated(limit, offset);
      res.json(result);
    } else {
      const posts = await storage.getBlogPosts();
      res.json(posts);
    }
  } catch (error) {
    next(error);
  }
});

adminRouter.post("/blog-posts", authenticateToken, authorizeRoles('superuser', 'teacher'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const postData = { ...req.body, authorId: req.user!.id };
    if (postData.tags && typeof postData.tags === 'string') {
      postData.tags = postData.tags.split(',').map((t: string) => t.trim()).filter((t: string) => t);
    }
    if (postData.isPublished) {
      postData.publishedAt = new Date();
    }
    const post = await storage.createBlogPost(postData);
    res.json(post);
  } catch (error) {
    next(error);
  }
});

adminRouter.put("/blog-posts/:id", authenticateToken, authorizeRoles('superuser', 'teacher'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const updates = req.body;
    if (updates.tags && typeof updates.tags === 'string') {
      updates.tags = updates.tags.split(',').map((t: string) => t.trim()).filter((t: string) => t);
    }
    if (updates.isPublished && !updates.publishedAt) {
      updates.publishedAt = new Date();
    }
    const post = await storage.updateBlogPost(id, updates);
    res.json(post);
  } catch (error) {
    next(error);
  }
});

adminRouter.delete("/blog-posts/:id", authenticateToken, authorizeRoles('superuser', 'teacher'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    await storage.deleteBlogPost(id);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

adminRouter.get("/personas", authenticateToken, authorizeRoles('superuser', 'teacher'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const limitParam = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const offsetParam = req.query.offset ? parseInt(req.query.offset as string) : undefined;
    
    if (limitParam !== undefined || offsetParam !== undefined) {
      if ((limitParam !== undefined && (isNaN(limitParam) || limitParam < 0)) || 
          (offsetParam !== undefined && (isNaN(offsetParam) || offsetParam < 0))) {
        return res.status(400).json({ error: "Invalid pagination parameters: limit and offset must be non-negative integers" });
      }
      
      const limit = Math.min(Math.max(limitParam || 10, 0), 100);
      const offset = Math.max(offsetParam || 0, 0);
      const result = await storage.getBotPersonasPaginated(limit, offset);
      res.json(result);
    } else {
      const personas = await storage.getBotPersonas();
      res.json(personas);
    }
  } catch (error) {
    next(error);
  }
});

adminRouter.get("/submissions", authenticateToken, authorizeRoles('superuser', 'teacher'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const limitParam = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const offsetParam = req.query.offset ? parseInt(req.query.offset as string) : undefined;
    const publishedParam = req.query.published as string;
    
    let published: boolean | undefined;
    if (publishedParam === 'true') published = true;
    else if (publishedParam === 'false') published = false;
    
    if (limitParam !== undefined || offsetParam !== undefined) {
      if ((limitParam !== undefined && (isNaN(limitParam) || limitParam < 0)) || 
          (offsetParam !== undefined && (isNaN(offsetParam) || offsetParam < 0))) {
        return res.status(400).json({ error: "Invalid pagination parameters: limit and offset must be non-negative integers" });
      }
      
      const limit = Math.min(Math.max(limitParam || 10, 0), 100);
      const offset = Math.max(offsetParam || 0, 0);
      const result = await storage.getAllContentSubmissionsPaginated(published, limit, offset);
      res.json(result);
    } else {
      const submissions = await storage.getAllContentSubmissions(published);
      res.json(submissions);
    }
  } catch (error) {
    next(error);
  }
});

adminRouter.get("/assignments", authenticateToken, authorizeRoles('superuser', 'teacher'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const limitParam = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const offsetParam = req.query.offset ? parseInt(req.query.offset as string) : undefined;
    
    if (limitParam !== undefined || offsetParam !== undefined) {
      if ((limitParam !== undefined && (isNaN(limitParam) || limitParam < 0)) || 
          (offsetParam !== undefined && (isNaN(offsetParam) || offsetParam < 0))) {
        return res.status(400).json({ error: "Invalid pagination parameters: limit and offset must be non-negative integers" });
      }
      
      const limit = Math.min(Math.max(limitParam || 10, 0), 100);
      const offset = Math.max(offsetParam || 0, 0);
      const result = await storage.getAllStudentAssignmentsPaginated(limit, offset);
      res.json(result);
    } else {
      const allAssignments = await storage.getAllStudentAssignments();
      res.json(allAssignments);
    }
  } catch (error) {
    next(error);
  }
});
