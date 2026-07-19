import { Router, Response, NextFunction } from "express";
import { getErrorMessage } from "../middleware/error-handler";
import { getModerationFromStorage, getBadWordLeaderboard, type ModerationSettings } from "../moderation";
import { storage } from "../storage";
import { insertBotPersonaSchema } from "@shared/schema";
import { runEmbeddingWorker } from "../embeddingsRunner.js";
import {
  authenticateToken,
  authorizeRoles,
  AuthRequest
} from "../auth";

export const adminRouter = Router();

// GET /users - List users with pagination (supports limit, offset, search)
adminRouter.get("/users", authenticateToken, authorizeRoles('superuser'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user || req.user.role !== 'superuser') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const limitParam = req.query.limit != null ? parseInt(req.query.limit as string) : 20;
    const offsetParam = req.query.offset != null ? parseInt(req.query.offset as string) : 0;
    const search = typeof req.query.search === 'string' ? req.query.search : undefined;

    if (isNaN(limitParam) || limitParam < 1 || limitParam > 100) {
      return res.status(400).json({ error: 'Invalid limit: must be 1-100' });
    }
    if (isNaN(offsetParam) || offsetParam < 0) {
      return res.status(400).json({ error: 'Invalid offset: must be >= 0' });
    }

    const result = await storage.getAllUsersPaginated(limitParam, offsetParam, search);
    const sanitizedData = result.data.map(({ password, ...user }) => user);
    res.json({ data: sanitizedData, total: result.total });
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

const DEFAULT_FEATURES: Record<string, boolean> = {
  revision_materials: true,
  studybuddy_ai: true,
  budget_tracker: true,
  games: true,
  content_management: true,
  travel_blog: true,
  dao_access: true,
  admin_panel: true,
};

async function getFeaturesFromStorage(): Promise<Record<string, boolean>> {
  const stored = await storage.getSystemSetting('features');
  if (stored && typeof stored === 'object' && !Array.isArray(stored)) {
    return { ...DEFAULT_FEATURES, ...(stored as Record<string, boolean>) };
  }
  return { ...DEFAULT_FEATURES };
}

// GET /system/features - Get current feature flags (admin: full; used to populate System Settings)
adminRouter.get("/system/features", authenticateToken, authorizeRoles('superuser'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user || req.user.role !== 'superuser') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    const features = await getFeaturesFromStorage();
    res.json(features);
  } catch (error) {
    next(error);
  }
});

// PATCH /system/features - Toggle system features (persisted)
adminRouter.patch("/system/features", authenticateToken, authorizeRoles('superuser'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user || req.user.role !== 'superuser') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    const { feature, enabled } = req.body;
    if (!feature || typeof feature !== 'string') {
      return res.status(400).json({ error: "Feature name is required" });
    }
    if (typeof enabled !== 'boolean') {
      return res.status(400).json({ error: "enabled must be a boolean" });
    }
    const features = await getFeaturesFromStorage();
    features[feature] = enabled;
    await storage.setSystemSetting('features', features);
    res.json({ success: true, message: `Feature ${feature} ${enabled ? 'enabled' : 'disabled'}`, features });
  } catch (error) {
    next(error);
  }
});

// GET /system/moderation - Get moderation settings (superuser only)
adminRouter.get("/system/moderation", authenticateToken, authorizeRoles('superuser'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user || req.user.role !== 'superuser') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    const moderation = await getModerationFromStorage();
    res.json(moderation);
  } catch (error) {
    next(error);
  }
});

// PATCH /system/moderation - Update moderation settings (superuser only)
adminRouter.patch("/system/moderation", authenticateToken, authorizeRoles('superuser'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user || req.user.role !== 'superuser') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    const body = (req.body || {}) as Partial<ModerationSettings>;
    const current = await getModerationFromStorage();
    const num = (v: unknown): number => {
      if (typeof v === 'number' && !isNaN(v)) return Math.max(0, v);
      if (typeof v === 'string') return Math.max(0, parseInt(v, 10) || 0);
      return 0;
    };
    const arr = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []);
    const updated: ModerationSettings = {
      blockedUsernamePatterns: body.blockedUsernamePatterns !== undefined ? arr(body.blockedUsernamePatterns) : current.blockedUsernamePatterns,
      blockedEmailPatterns: body.blockedEmailPatterns !== undefined ? arr(body.blockedEmailPatterns) : current.blockedEmailPatterns,
      blockedWords: body.blockedWords !== undefined ? arr(body.blockedWords) : current.blockedWords ?? [],
      signupRateLimitPerIpPerHour: body.signupRateLimitPerIpPerHour !== undefined ? num(body.signupRateLimitPerIpPerHour) : current.signupRateLimitPerIpPerHour,
      chatMessagesPerUserPerMinute: body.chatMessagesPerUserPerMinute !== undefined ? num(body.chatMessagesPerUserPerMinute) : current.chatMessagesPerUserPerMinute,
    };
    await storage.setSystemSetting('moderation', updated);
    res.json(updated);
  } catch (error: unknown) {
    res.status(500).json({ error: getErrorMessage(error, 'Failed to save moderation settings') });
  }
});

// GET /system/api-keys - Status only (set/not_set), never returns actual keys (superuser only)
adminRouter.get("/system/api-keys", authenticateToken, authorizeRoles('superuser'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user || req.user.role !== 'superuser') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    const stored = await storage.getSystemSetting('api_keys');
    const s = stored && typeof stored === 'object' && !Array.isArray(stored) ? (stored as Record<string, string>) : {};
    const openai = typeof s.openai === 'string' && s.openai.trim().length > 0;
    const perplexity = typeof s.perplexity === 'string' && s.perplexity.trim().length > 0;
    res.json({
      openai: openai ? 'set' : (process.env.OPENAI_API_KEY ? 'env' : 'not_set'),
      perplexity: perplexity ? 'set' : (process.env.PERPLEXITY_API_KEY ? 'env' : 'not_set'),
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /system/api-keys - Update API keys (superuser only). Send openai/perplexity to set; omit or send empty string to clear (use env).
adminRouter.patch("/system/api-keys", authenticateToken, authorizeRoles('superuser'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user || req.user.role !== 'superuser') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    const body = (req.body || {}) as { openai?: string; perplexity?: string };
    let current: Record<string, string> | undefined;
    try {
      const raw = await storage.getSystemSetting('api_keys');
      current = raw && typeof raw === 'object' && !Array.isArray(raw) ? (raw as Record<string, string>) : undefined;
    } catch {
      current = undefined;
    }
    const prev: Record<string, string> = current ? { ...current } : {};
    if (body.openai !== undefined) prev.openai = typeof body.openai === 'string' ? body.openai.trim() : '';
    if (body.perplexity !== undefined) prev.perplexity = typeof body.perplexity === 'string' ? body.perplexity.trim() : '';
    await storage.setSystemSetting('api_keys', prev);
    return res.json({
      openai: prev.openai ? 'set' : (process.env.OPENAI_API_KEY ? 'env' : 'not_set'),
      perplexity: prev.perplexity ? 'set' : (process.env.PERPLEXITY_API_KEY ? 'env' : 'not_set'),
    });
  } catch (error: unknown) {
    let message = getErrorMessage(error, 'Failed to save API keys');
    if (message.includes('system_settings')) {
      message = 'Database table system_settings is missing. Run: npm run db:push (or run migrations/add-system-settings.sql on your database).';
    }
    return res.status(500).json({ error: message });
  }
});

// GET /system/bad-words-leaderboard - Users who attempted blocked words most (superuser only)
adminRouter.get("/system/bad-words-leaderboard", authenticateToken, authorizeRoles('superuser'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user || req.user.role !== 'superuser') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    const rows = await getBadWordLeaderboard();
    const enriched = await Promise.all(
      rows.map(async (r) => {
        const u = await storage.getUser(r.userId);
        return {
          userId: r.userId,
          username: u?.username ?? null,
          firstName: u?.firstName ?? null,
          lastName: u?.lastName ?? null,
          count: r.count,
          lastWord: r.lastWord,
          lastAt: r.lastAt,
        };
      })
    );
    res.json(enriched);
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

// GET /analytics/detailed - Full analytics for superuser only (heavy payload)
adminRouter.get("/analytics/detailed", authenticateToken, authorizeRoles('superuser'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user || req.user.role !== 'superuser') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    const analytics = await storage.getSuperuserAnalytics();
    res.json(analytics);
  } catch (error) {
    next(error);
  }
});

// GET /class-chat-archives - List archives (superuser only). Optional limit, offset, search (returns { data, total }).
adminRouter.get("/class-chat-archives", authenticateToken, authorizeRoles('superuser'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user || req.user.role !== 'superuser') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    const limitParam = req.query.limit != null ? parseInt(req.query.limit as string) : undefined;
    const offsetParam = req.query.offset != null ? parseInt(req.query.offset as string) : undefined;
    const search = typeof req.query.search === 'string' ? req.query.search : undefined;
    if (limitParam !== undefined || offsetParam !== undefined || search) {
      const limit = Math.min(Math.max(limitParam ?? 10, 1), 100);
      const offset = Math.max(offsetParam ?? 0, 0);
      const result = await storage.getClassChatArchivesPaginated(limit, offset, search);
      return res.json(result);
    }
    const archives = await storage.getClassChatArchives();
    res.json(archives);
  } catch (error) {
    next(error);
  }
});

// GET /class-chat-archives/:id - Get one archive (superuser only)
adminRouter.get("/class-chat-archives/:id", authenticateToken, authorizeRoles('superuser'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user || req.user.role !== 'superuser') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) return res.status(400).json({ error: 'Invalid archive ID' });
    const archive = await storage.getClassChatArchive(id);
    if (!archive) return res.status(404).json({ error: 'Archive not found' });
    res.json(archive);
  } catch (error) {
    next(error);
  }
});

// GET /bot-personas - List bot personas (optional pagination: ?limit=&offset= returns { data, total }; no params returns full array)
adminRouter.get("/bot-personas", authenticateToken, authorizeRoles('superuser', 'teacher'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user || !['superuser', 'teacher'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    const limitParam = req.query.limit != null ? parseInt(req.query.limit as string) : undefined;
    const offsetParam = req.query.offset != null ? parseInt(req.query.offset as string) : undefined;
    if (limitParam !== undefined || offsetParam !== undefined) {
      const limit = Math.min(Math.max(limitParam ?? 10, 1), 100);
      const offset = Math.max(offsetParam ?? 0, 0);
      const result = await storage.getBotPersonasPaginated(limit, offset);
      return res.json(result);
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
    // DB column is "key"; API accepts "agentKey"
    if (personaData.agentKey != null && personaData.agentKey !== '') {
      personaData.key = personaData.agentKey;
    }
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
      showOnLanding: !!req.body.showOnLanding,
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
    if (typeof updates.showOnLanding === 'boolean') {
      updates.showOnLanding = updates.showOnLanding;
    } else {
      updates.showOnLanding = !!updates.showOnLanding;
    }
    
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

// GET /mentor-applications - List mentor applications (superuser only; optional limit/offset for pagination)
adminRouter.get("/mentor-applications", authenticateToken, authorizeRoles('superuser'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user || req.user.role !== 'superuser') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    const status = req.query.status as string | undefined;
    const limitParam = req.query.limit != null ? parseInt(req.query.limit as string) : undefined;
    const offsetParam = req.query.offset != null ? parseInt(req.query.offset as string) : undefined;
    if (limitParam !== undefined || offsetParam !== undefined) {
      const limit = Math.min(Math.max(limitParam ?? 10, 1), 100);
      const offset = Math.max(offsetParam ?? 0, 0);
      const result = await storage.getMentorApplicationsPaginated(status, limit, offset);
      return res.json(result);
    }
    const applications = await storage.getMentorApplications(status);
    res.json(applications);
  } catch (error) {
    next(error);
  }
});

// PATCH /mentor-applications/:id - Approve or reject mentor application (superuser only)
adminRouter.patch("/mentor-applications/:id", authenticateToken, authorizeRoles('superuser'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user || req.user.role !== 'superuser') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    const id = parseInt(req.params.id);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ error: "Invalid application ID" });
    }
    const { status, adminNotes, createAccount } = req.body;
    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: "Status must be 'approved' or 'rejected'" });
    }
    const application = await storage.getMentorApplication(id);
    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }
    const updates: Record<string, unknown> = {
      status,
      reviewedBy: req.user.id,
      reviewedAt: new Date(),
      adminNotes: adminNotes || application.adminNotes,
    };
    if (status === 'approved' && createAccount) {
      const { hashPassword } = await import("../auth");
      let user = await storage.getUserByEmail(application.email);
      if (!user) {
        const usernameBase = application.email.replace(/@.*$/, '').replace(/\W/g, '');
        let username = usernameBase;
        let suffix = 0;
        while (await storage.getUserByUsername(username)) {
          suffix++;
          username = `${usernameBase}${suffix}`;
        }
        const tempPassword = Math.random().toString(36).slice(-10) + 'A1!';
        user = await storage.createUser({
          username,
          email: application.email,
          password: await hashPassword(tempPassword),
          role: 'teacher',
          firstName: application.fullName.split(' ')[0] || application.fullName,
          lastName: application.fullName.split(' ').slice(1).join(' ') || '',
          phoneNumber: application.phone || undefined,
          isVerified: true,
        });
        updates.userId = user.id;
        const profile = await storage.createMentorProfile({
          userId: user.id,
          subjects: application.subjects,
          bio: application.experience || application.credentials || '',
          gradeLevel: application.gradeLevel || undefined,
          hourlyRate: application.hourlyRate || '0',
          isVerified: true,
        });
        (updates as Record<string, unknown>).tempPassword = tempPassword;
        (updates as Record<string, unknown>).createdProfileId = profile.id;
      } else {
        updates.userId = user.id;
        const existingProfile = await storage.getMentorProfile(user.id);
        if (!existingProfile) {
          await storage.createMentorProfile({
            userId: user.id,
            subjects: application.subjects,
            bio: application.experience || application.credentials || '',
            gradeLevel: application.gradeLevel || undefined,
            hourlyRate: application.hourlyRate || '0',
            isVerified: true,
          });
        } else {
          await storage.updateMentorProfile(user.id, { isVerified: true });
        }
      }
    }
    const { tempPassword, createdProfileId, ...dbUpdates } = updates as Record<string, unknown>;
    const updated = await storage.updateMentorApplication(id, dbUpdates as Parameters<typeof storage.updateMentorApplication>[1]);
    const response: Record<string, unknown> = { ...updated };
    if (tempPassword) response.tempPassword = tempPassword;
    if (createdProfileId) response.createdProfileId = createdProfileId;
    res.json(response);
  } catch (error) {
    next(error);
  }
});

// GET /mentor-materials - List mentor materials (for admin approval)
adminRouter.get("/mentor-materials", authenticateToken, authorizeRoles('superuser', 'teacher'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user || !['superuser', 'teacher'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    const status = req.query.status as string | undefined;
    const mentorId = req.query.mentorId ? parseInt(req.query.mentorId as string) : undefined;
    const materials = await storage.getMentorMaterials(mentorId, status);
    res.json(materials);
  } catch (error) {
    next(error);
  }
});

// PATCH /mentor-materials/:id - Approve or reject mentor material
adminRouter.patch("/mentor-materials/:id", authenticateToken, authorizeRoles('superuser', 'teacher'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user || !['superuser', 'teacher'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    const id = parseInt(req.params.id);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ error: "Invalid material ID" });
    }
    const { status, adminNotes } = req.body;
    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: "Status must be 'approved' or 'rejected'" });
    }
    const material = await storage.getMentorMaterial(id);
    if (!material) {
      return res.status(404).json({ error: "Material not found" });
    }
    const isTeacherApproval = req.user.role === 'teacher' && status === 'approved';
    const updated = await storage.updateMentorMaterial(id, {
      status,
      adminNotes: adminNotes || material.adminNotes,
      reviewedBy: req.user.id,
      reviewedAt: new Date(),
      ...(isTeacherApproval ? { teacherRecognized: true } : {}),
    });
    res.json(updated);
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

/**
 * POST /api/admin/embeddings/run
 * Manually trigger the embeddings worker to drain the RAG embedding queue.
 */
adminRouter.post("/embeddings/run", authenticateToken, authorizeRoles('superuser'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await runEmbeddingWorker();
    res.json({ ok: true, ...result });
  } catch (error) {
    next(error);
  }
});
