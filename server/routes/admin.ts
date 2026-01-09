import { Router, Response, NextFunction } from "express";
import { storage } from "../storage";
import { insertBotPersonaSchema } from "@shared/schema";
import {
  authenticateToken,
  authorizeRoles,
  AuthRequest
} from "../auth";

export const adminRouter = Router();

// GET /users - List all users
adminRouter.get("/users", authenticateToken, authorizeRoles('superuser'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user || req.user.role !== 'superuser') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const users = await storage.getAllUsers();
    const sanitizedUsers = users.map(({ password, ...user }) => user);
    res.json(sanitizedUsers);
  } catch (error) {
    next(error);
  }
});

// PATCH /users/:id/status - Update user active status
adminRouter.patch("/users/:id/status", authenticateToken, authorizeRoles('superuser'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user || req.user.role !== 'superuser') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const userId = parseInt(req.params.id);
    
    if (isNaN(userId) || userId <= 0) {
      return res.status(400).json({ error: "Invalid user ID" });
    }
    
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ error: "isActive must be a boolean" });
    }

    const existingUser = await storage.getUser(userId);
    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }

    if (userId === req.user.id && !isActive) {
      return res.status(400).json({ error: "Cannot deactivate your own account" });
    }

    const updatedUser = await storage.updateUser(userId, { isActive });
    const { password, ...sanitizedUser } = updatedUser!;
    res.json(sanitizedUser);
  } catch (error) {
    next(error);
  }
});

// PATCH /users/:id/role - Update user role
adminRouter.patch("/users/:id/role", authenticateToken, authorizeRoles('superuser'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user || req.user.role !== 'superuser') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const userId = parseInt(req.params.id);
    
    if (isNaN(userId) || userId <= 0) {
      return res.status(400).json({ error: "Invalid user ID" });
    }
    
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({ error: "Role is required" });
    }

    if (!['student', 'teacher', 'superuser'].includes(role)) {
      return res.status(400).json({ error: "Invalid role. Must be student, teacher, or superuser" });
    }

    const existingUser = await storage.getUser(userId);
    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }

    if (userId === req.user.id && req.user.role === 'superuser' && role !== 'superuser') {
      return res.status(400).json({ error: "Cannot change your own superuser role" });
    }

    const updatedUser = await storage.updateUser(userId, { role });
    const { password, ...sanitizedUser } = updatedUser!;
    res.json(sanitizedUser);
  } catch (error) {
    next(error);
  }
});

// PATCH /users/:id/verify - Verify user
adminRouter.patch("/users/:id/verify", authenticateToken, authorizeRoles('superuser'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user || req.user.role !== 'superuser') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const userId = parseInt(req.params.id);
    
    if (isNaN(userId) || userId <= 0) {
      return res.status(400).json({ error: "Invalid user ID" });
    }
    
    const existingUser = await storage.getUser(userId);
    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }
    
    await storage.verifyUser(userId);
    res.json({ success: true, message: "User verified successfully" });
  } catch (error) {
    next(error);
  }
});

// DELETE /users/:id - Delete user
adminRouter.delete("/users/:id", authenticateToken, authorizeRoles('superuser'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user || req.user.role !== 'superuser') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const userId = parseInt(req.params.id);
    
    if (isNaN(userId) || userId <= 0) {
      return res.status(400).json({ error: "Invalid user ID" });
    }
    
    if (userId === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }
    
    const existingUser = await storage.getUser(userId);
    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }
    
    await storage.deleteUser(userId);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// PATCH /system/features - Toggle system features
adminRouter.patch("/system/features", authenticateToken, authorizeRoles('superuser'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user || req.user.role !== 'superuser') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const { feature, enabled } = req.body;

    if (!feature) {
      return res.status(400).json({ error: "Feature name is required" });
    }

    if (typeof enabled !== 'boolean') {
      return res.status(400).json({ error: "enabled must be a boolean" });
    }

    res.json({ success: true, message: `Feature ${feature} ${enabled ? 'enabled' : 'disabled'}` });
  } catch (error) {
    next(error);
  }
});

// GET /analytics - Get platform analytics
adminRouter.get("/analytics", authenticateToken, authorizeRoles('superuser', 'teacher'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user || !['superuser', 'teacher'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const analytics = await storage.getAnalytics();
    res.json(analytics);
  } catch (error) {
    next(error);
  }
});

// GET /budget-analytics - Get budget analytics
adminRouter.get("/budget-analytics", authenticateToken, authorizeRoles('superuser'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user || req.user.role !== 'superuser') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const analytics = await storage.getBudgetAnalytics();
    res.json(analytics);
  } catch (error) {
    next(error);
  }
});

// GET /chat-analytics - Get chat analytics
adminRouter.get("/chat-analytics", authenticateToken, authorizeRoles('superuser', 'teacher'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user || !['superuser', 'teacher'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const analytics = await storage.getChatAnalytics();
    res.json(analytics);
  } catch (error) {
    next(error);
  }
});

// GET /bot-personas - List all bot personas
adminRouter.get("/bot-personas", authenticateToken, authorizeRoles('superuser', 'teacher'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user || !['superuser', 'teacher'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const personas = await storage.getBotPersonas();
    res.json(personas);
  } catch (error) {
    next(error);
  }
});

// POST /bot-personas - Create bot persona
adminRouter.post("/bot-personas", authenticateToken, authorizeRoles('superuser', 'teacher'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user || !['superuser', 'teacher'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const { name, description, systemPrompt, agentKey } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Name is required" });
    }
    
    if (!agentKey || !agentKey.trim()) {
      return res.status(400).json({ error: "Agent key is required" });
    }
    
    const personaData = { ...req.body };
    
    if (typeof personaData.subjects === 'string') {
      const subjectsArray = personaData.subjects.split(',').map((s: string) => s.trim()).filter((s: string) => s);
      personaData.subjects = subjectsArray.length > 0 ? subjectsArray : null;
    } else if (!personaData.subjects) {
      personaData.subjects = null;
    }
    
    personaData.createdById = req.user.id;
    const persona = await storage.createBotPersona(personaData);
    res.json({ success: true, persona });
  } catch (error) {
    next(error);
  }
});

// PUT /bot-personas/:id - Update bot persona
adminRouter.put("/bot-personas/:id", authenticateToken, authorizeRoles('superuser', 'teacher'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user || !['superuser', 'teacher'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const id = parseInt(req.params.id);
    
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ error: "Invalid persona ID" });
    }
    
    const existingPersona = await storage.getBotPersona(id);
    if (!existingPersona) {
      return res.status(404).json({ error: "Bot persona not found" });
    }
    
    const updates = { ...req.body };
    
    if (typeof updates.subjects === 'string') {
      const subjectsArray = updates.subjects.split(',').map((s: string) => s.trim()).filter((s: string) => s);
      updates.subjects = subjectsArray.length > 0 ? subjectsArray : null;
    } else if (!updates.subjects) {
      updates.subjects = null;
    }
    
    const persona = await storage.updateBotPersona(id, updates);
    res.json({ success: true, persona });
  } catch (error) {
    next(error);
  }
});

// DELETE /bot-personas/:id - Delete bot persona
adminRouter.delete("/bot-personas/:id", authenticateToken, authorizeRoles('superuser', 'teacher'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user || !['superuser', 'teacher'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const id = parseInt(req.params.id);
    
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ error: "Invalid persona ID" });
    }
    
    const existingPersona = await storage.getBotPersona(id);
    if (!existingPersona) {
      return res.status(404).json({ error: "Bot persona not found" });
    }
    
    await storage.deleteBotPersona(id);
    res.json({ success: true, message: "Bot persona deleted successfully" });
  } catch (error) {
    next(error);
  }
});

// GET /blog-posts - List blog posts with optional pagination
adminRouter.get("/blog-posts", authenticateToken, authorizeRoles('superuser', 'teacher'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user || !['superuser', 'teacher'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
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

// POST /blog-posts - Create blog post
adminRouter.post("/blog-posts", authenticateToken, authorizeRoles('superuser', 'teacher'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user || !['superuser', 'teacher'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const { title, content, category } = req.body;
    
    if (!title || !title.trim()) {
      return res.status(400).json({ error: "Title is required" });
    }
    
    if (!content || !content.trim()) {
      return res.status(400).json({ error: "Content is required" });
    }
    
    const postData = { 
      ...req.body, 
      authorId: req.user.id,
      category: category || 'uncategorized',
      isPublished: req.body.isPublished || false,
      createdAt: new Date()
    };
    
    if (postData.tags && typeof postData.tags === 'string') {
      postData.tags = postData.tags.split(',').map((t: string) => t.trim()).filter((t: string) => t);
    }
    
    if (postData.isPublished) {
      postData.publishedAt = new Date();
    }
    
    const post = await storage.createBlogPost(postData);
    res.json({ success: true, post });
  } catch (error) {
    next(error);
  }
});

// PUT /blog-posts/:id - Update blog post
adminRouter.put("/blog-posts/:id", authenticateToken, authorizeRoles('superuser', 'teacher'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user || !['superuser', 'teacher'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const id = parseInt(req.params.id);
    
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ error: "Invalid blog post ID" });
    }
    
    const existingPost = await storage.getBlogPost(id);
    if (!existingPost) {
      return res.status(404).json({ error: "Blog post not found" });
    }
    
    if (req.user.role !== 'superuser' && existingPost.authorId !== req.user.id) {
      return res.status(403).json({ error: "You can only edit your own posts" });
    }
    
    const updates = { ...req.body };
    
    if (updates.tags && typeof updates.tags === 'string') {
      updates.tags = updates.tags.split(',').map((t: string) => t.trim()).filter((t: string) => t);
    }
    
    if (updates.isPublished && !existingPost.publishedAt) {
      updates.publishedAt = new Date();
    }
    
    const post = await storage.updateBlogPost(id, updates);
    res.json({ success: true, post });
  } catch (error) {
    next(error);
  }
});

// DELETE /blog-posts/:id - Delete blog post
adminRouter.delete("/blog-posts/:id", authenticateToken, authorizeRoles('superuser', 'teacher'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user || !['superuser', 'teacher'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const id = parseInt(req.params.id);
    
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ error: "Invalid blog post ID" });
    }
    
    const existingPost = await storage.getBlogPost(id);
    if (!existingPost) {
      return res.status(404).json({ error: "Blog post not found" });
    }
    
    if (req.user.role !== 'superuser' && existingPost.authorId !== req.user.id) {
      return res.status(403).json({ error: "You can only delete your own posts" });
    }
    
    await storage.deleteBlogPost(id);
    res.json({ success: true, message: "Blog post deleted successfully" });
  } catch (error) {
    next(error);
  }
});

// GET /personas - List personas with pagination
adminRouter.get("/personas", authenticateToken, authorizeRoles('superuser', 'teacher'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user || !['superuser', 'teacher'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
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

// GET /submissions - List content submissions
adminRouter.get("/submissions", authenticateToken, authorizeRoles('superuser', 'teacher'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user || !['superuser', 'teacher'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
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

// GET /assignments - List all assignments
adminRouter.get("/assignments", authenticateToken, authorizeRoles('superuser', 'teacher'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user || !['superuser', 'teacher'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
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
