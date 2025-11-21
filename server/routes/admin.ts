import { Router } from "express";
import { storage } from "../storage";
import { insertBotPersonaSchema } from "@shared/schema";
import {
  authenticateToken,
  authorizeRoles,
  AuthRequest
} from "../auth";

export const adminRouter = Router();

adminRouter.get("/users", authenticateToken, authorizeRoles('superuser'), async (req: AuthRequest, res) => {
  try {
    const users = await storage.getAllUsers();
    const sanitizedUsers = users.map(({ password, ...user }) => user);
    res.json(sanitizedUsers);
  } catch (error) {
    res.status(500).json({ error: "Failed to get users" });
  }
});

adminRouter.patch("/users/:id/status", authenticateToken, authorizeRoles('superuser'), async (req: AuthRequest, res) => {
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
    res.status(500).json({ error: "Failed to update user status" });
  }
});

adminRouter.patch("/users/:id/role", authenticateToken, authorizeRoles('superuser'), async (req: AuthRequest, res) => {
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
    res.status(500).json({ error: "Failed to update user role" });
  }
});

adminRouter.patch("/users/:id/verify", authenticateToken, authorizeRoles('superuser'), async (req: AuthRequest, res) => {
  try {
    const userId = parseInt(req.params.id);
    await storage.verifyUser(userId);
    res.json({ message: "User verified successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to verify user" });
  }
});

adminRouter.delete("/users/:id", authenticateToken, authorizeRoles('superuser'), async (req: AuthRequest, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    if (userId === req.user!.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }
    
    await storage.deleteUser(userId);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

adminRouter.patch("/system/features", authenticateToken, authorizeRoles('superuser'), async (req: AuthRequest, res) => {
  try {
    const { feature, enabled } = req.body;

    if (typeof enabled !== 'boolean') {
      return res.status(400).json({ error: "enabled must be a boolean" });
    }

    res.json({ message: `Feature ${feature} ${enabled ? 'enabled' : 'disabled'}` });
  } catch (error) {
    res.status(500).json({ error: "Failed to update system feature" });
  }
});

adminRouter.get("/analytics", authenticateToken, authorizeRoles('superuser', 'teacher'), async (req: AuthRequest, res) => {
  try {
    const analytics = await storage.getAnalytics();
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: "Failed to get analytics" });
  }
});

adminRouter.get("/budget-analytics", authenticateToken, authorizeRoles('superuser'), async (req: AuthRequest, res) => {
  try {
    const analytics = await storage.getBudgetAnalytics();
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: "Failed to get budget analytics" });
  }
});

adminRouter.get("/chat-analytics", authenticateToken, authorizeRoles('superuser', 'teacher'), async (req: AuthRequest, res) => {
  try {
    const analytics = await storage.getChatAnalytics();
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: "Failed to get chat analytics" });
  }
});

adminRouter.get("/bot-personas", authenticateToken, authorizeRoles('superuser', 'teacher'), async (req: AuthRequest, res) => {
  try {
    const personas = await storage.getBotPersonas();
    res.json(personas);
  } catch (error) {
    res.status(500).json({ error: "Failed to get bot personas" });
  }
});

adminRouter.post("/bot-personas", authenticateToken, authorizeRoles('superuser', 'teacher'), async (req: AuthRequest, res) => {
  try {
    const personaData = req.body;
    if (personaData.subjects && typeof personaData.subjects === 'string') {
      personaData.subjects = personaData.subjects.split(',').map((s: string) => s.trim()).filter((s: string) => s);
    }
    personaData.createdById = req.user!.id;
    const persona = await storage.createBotPersona(personaData);
    res.json(persona);
  } catch (error) {
    console.error('Error creating bot persona:', error);
    res.status(500).json({ error: "Failed to create bot persona" });
  }
});

adminRouter.put("/bot-personas/:id", authenticateToken, authorizeRoles('superuser', 'teacher'), async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    const updates = req.body;
    if (updates.subjects && typeof updates.subjects === 'string') {
      updates.subjects = updates.subjects.split(',').map((s: string) => s.trim()).filter((s: string) => s);
    }
    const persona = await storage.updateBotPersona(id, updates);
    res.json(persona);
  } catch (error) {
    res.status(500).json({ error: "Failed to update bot persona" });
  }
});

adminRouter.delete("/bot-personas/:id", authenticateToken, authorizeRoles('superuser', 'teacher'), async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    await storage.deleteBotPersona(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete bot persona" });
  }
});

adminRouter.get("/blog-posts", authenticateToken, authorizeRoles('superuser', 'teacher'), async (req: AuthRequest, res) => {
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
    res.status(500).json({ error: "Failed to get blog posts" });
  }
});

adminRouter.post("/blog-posts", authenticateToken, authorizeRoles('superuser', 'teacher'), async (req: AuthRequest, res) => {
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
    res.status(500).json({ error: "Failed to create blog post" });
  }
});

adminRouter.put("/blog-posts/:id", authenticateToken, authorizeRoles('superuser', 'teacher'), async (req: AuthRequest, res) => {
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
    res.status(500).json({ error: "Failed to update blog post" });
  }
});

adminRouter.delete("/blog-posts/:id", authenticateToken, authorizeRoles('superuser', 'teacher'), async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    await storage.deleteBlogPost(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete blog post" });
  }
});

adminRouter.get("/personas", authenticateToken, authorizeRoles('superuser', 'teacher'), async (req: AuthRequest, res) => {
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
    res.status(500).json({ error: "Failed to get personas" });
  }
});

adminRouter.get("/submissions", authenticateToken, authorizeRoles('superuser', 'teacher'), async (req: AuthRequest, res) => {
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
    res.status(500).json({ error: "Failed to get submissions" });
  }
});

adminRouter.get("/assignments", authenticateToken, authorizeRoles('superuser', 'teacher'), async (req: AuthRequest, res) => {
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
    res.status(500).json({ error: "Failed to get assignments" });
  }
});
