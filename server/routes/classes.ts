import { Router, Response, NextFunction } from "express";
import { storage } from "../storage";
import {
  authenticateToken,
  authorizeRoles,
  requireVerification,
  AuthRequest
} from "../auth";
import {
  getModerationFromStorage,
  containsBlockedWord,
  recordBadWordAttempt,
} from "../moderation";

export const classesRouter = Router();

// POST /classes - Create class (teacher only, must be approved)
classesRouter.post("/", authenticateToken, authorizeRoles('teacher', 'superuser'), requireVerification, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, subject } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Class name is required" });
    }
    const cls = await storage.createClass({
      teacherId: req.user!.id,
      name: name.trim(),
      subject: subject?.trim() || null
    });
    res.status(201).json(cls);
  } catch (error) {
    next(error);
  }
});

// GET /classes/teacher - Get teacher's classes (must be before /:id)
classesRouter.get("/teacher", authenticateToken, authorizeRoles('teacher', 'superuser'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const teacherId = req.user!.role === 'superuser' && req.query.teacherId
      ? parseInt(req.query.teacherId as string)
      : req.user!.id;
    const classes = await storage.getTeacherClasses(teacherId);
    console.log('[classes] GET /teacher userId=', req.user!.id, 'teacherId=', teacherId, 'count=', classes.length);
    res.set('Cache-Control', 'no-store');
    res.json(classes);
  } catch (error) {
    next(error);
  }
});

// GET /classes/student - Get student's classes (excludes banned/access-revoked)
classesRouter.get("/student", authenticateToken, authorizeRoles('student'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const enrolled = await storage.getStudentClasses(req.user!.id);
    const filtered = enrolled.filter(
      (e) => !(e.member as { accessRevoked?: boolean; isBanned?: boolean }).accessRevoked
        && !(e.member as { accessRevoked?: boolean; isBanned?: boolean }).isBanned
    );
    res.set('Cache-Control', 'no-store');
    res.json(filtered);
  } catch (error) {
    next(error);
  }
});

// POST /classes/join - Join class via invite code (student only)
classesRouter.post("/join", authenticateToken, authorizeRoles('student'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { inviteCode } = req.body;
    if (!inviteCode || !inviteCode.trim()) {
      return res.status(400).json({ error: "Invite code is required" });
    }
    const cls = await storage.getClassByInviteCode(inviteCode.trim());
    if (!cls) {
      return res.status(404).json({ error: "Invalid invite code. No class found." });
    }
    const alreadyMember = await storage.isClassMember(cls.id, req.user!.id);
    if (alreadyMember) {
      return res.status(400).json({ error: "You are already in this class" });
    }
    const member = await storage.addClassMember({
      classId: cls.id,
      userId: req.user!.id,
      role: "student"
    });
    res.status(201).json({ class: cls, member });
  } catch (error) {
    next(error);
  }
});

// Helper: parse numeric id or return null
function parseId(val: string): number | null {
  const n = parseInt(val, 10);
  return !isNaN(n) && n > 0 ? n : null;
}

// Helper: class is open for chat (not terminated/archived, and not blocked or block expired)
function isClassChatOpen(cls: { status?: string; blockedUntil?: Date | null }): boolean {
  const status = cls.status ?? 'active';
  if (status === 'terminated' || status === 'archived') return false;
  if (status === 'blocked' && cls.blockedUntil && new Date(cls.blockedUntil) > new Date()) return false;
  return true;
}

// Helper: can user access chat (view messages)?
function canAccessChat(cls: { teacherId: number }, member: { status: string; accessRevoked?: boolean; isBanned?: boolean } | null, isTeacher: boolean): boolean {
  if (isTeacher) return true;
  if (!member || member.status !== 'approved') return false;
  if (member.accessRevoked === true || member.isBanned === true) return false;
  return true;
}

// Helper: can user send messages?
function canSendMessages(cls: { status?: string; blockedUntil?: Date | null; teacherId: number }, member: { status: string; canChat?: boolean; accessRevoked?: boolean; isBanned?: boolean } | null, isTeacher: boolean): boolean {
  if (!canAccessChat(cls, member, isTeacher)) return false;
  if (isTeacher) return isClassChatOpen(cls);
  if (member && member.canChat === false) return false; // muted
  return isClassChatOpen(cls);
}

// PATCH /classes/:id/members/:userId/approve - Teacher approves student (teacher only)
classesRouter.patch("/:id/members/:userId/approve", authenticateToken, authorizeRoles('teacher', 'superuser'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const classId = parseId(req.params.id);
    const userId = parseId(req.params.userId);
    if (!classId || !userId) return res.status(400).json({ error: "Invalid class or user ID" });
    const cls = await storage.getClass(classId);
    if (!cls) {
      return res.status(404).json({ error: "Class not found" });
    }
    const isTeacher = cls.teacherId === req.user!.id || req.user!.role === 'superuser';
    if (!isTeacher) {
      return res.status(403).json({ error: "Only the class teacher can approve students" });
    }
    const isMember = await storage.isClassMember(classId, userId);
    if (!isMember) {
      return res.status(404).json({ error: "Student is not in this class" });
    }
    const approved = await storage.approveClassMember(classId, userId);
    res.json(approved);
  } catch (error) {
    next(error);
  }
});

// Teacher moderation: terminate chat
classesRouter.patch("/:id/terminate", authenticateToken, authorizeRoles('teacher', 'superuser'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const classId = parseId(req.params.id);
    if (!classId) return res.status(400).json({ error: "Invalid class ID" });
    const cls = await storage.getClass(classId);
    if (!cls) return res.status(404).json({ error: "Class not found" });
    if (cls.teacherId !== req.user!.id && req.user!.role !== 'superuser') {
      return res.status(403).json({ error: "Only the class teacher can terminate the chat" });
    }
    const updated = await storage.updateClass(classId, { status: 'terminated', blockedUntil: null });
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// Teacher moderation: archive chat
classesRouter.patch("/:id/archive", authenticateToken, authorizeRoles('teacher', 'superuser'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const classId = parseId(req.params.id);
    if (!classId) return res.status(400).json({ error: "Invalid class ID" });
    const cls = await storage.getClass(classId);
    if (!cls) return res.status(404).json({ error: "Class not found" });
    if (cls.teacherId !== req.user!.id && req.user!.role !== 'superuser') {
      return res.status(403).json({ error: "Only the class teacher can archive the chat" });
    }
    const updated = await storage.updateClass(classId, { status: 'archived', blockedUntil: null });
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// Teacher moderation: block chat for a duration
classesRouter.patch("/:id/block", authenticateToken, authorizeRoles('teacher', 'superuser'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const classId = parseId(req.params.id);
    if (!classId) return res.status(400).json({ error: "Invalid class ID" });
    const { minutes } = req.body; // block for N minutes
    const minutesNum = typeof minutes === 'number' ? minutes : parseInt(String(minutes || 60));
    if (isNaN(minutesNum) || minutesNum < 1 || minutesNum > 10080) {
      return res.status(400).json({ error: "Invalid duration. Provide minutes between 1 and 10080 (7 days)" });
    }
    const cls = await storage.getClass(classId);
    if (!cls) return res.status(404).json({ error: "Class not found" });
    if (cls.teacherId !== req.user!.id && req.user!.role !== 'superuser') {
      return res.status(403).json({ error: "Only the class teacher can block the chat" });
    }
    const blockedUntil = new Date(Date.now() + minutesNum * 60 * 1000);
    const updated = await storage.updateClass(classId, { status: 'blocked', blockedUntil });
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// Teacher moderation: unblock chat
classesRouter.patch("/:id/unblock", authenticateToken, authorizeRoles('teacher', 'superuser'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const classId = parseId(req.params.id);
    if (!classId) return res.status(400).json({ error: "Invalid class ID" });
    const cls = await storage.getClass(classId);
    if (!cls) return res.status(404).json({ error: "Class not found" });
    if (cls.teacherId !== req.user!.id && req.user!.role !== 'superuser') {
      return res.status(403).json({ error: "Only the class teacher can unblock the chat" });
    }
    const updated = await storage.updateClass(classId, { status: 'active', blockedUntil: null });
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// Teacher moderation: mute student
classesRouter.patch("/:id/members/:userId/mute", authenticateToken, authorizeRoles('teacher', 'superuser'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const classId = parseId(req.params.id);
    const userId = parseId(req.params.userId);
    if (!classId || !userId) return res.status(400).json({ error: "Invalid class or user ID" });
    const cls = await storage.getClass(classId);
    if (!cls) return res.status(404).json({ error: "Class not found" });
    if (cls.teacherId !== req.user!.id && req.user!.role !== 'superuser') {
      return res.status(403).json({ error: "Only the class teacher can mute students" });
    }
    const member = await storage.getClassMember(classId, userId);
    if (!member) return res.status(404).json({ error: "Student is not in this class" });
    const updated = await storage.updateClassMember(classId, userId, { canChat: false });
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// Teacher moderation: unmute student
classesRouter.patch("/:id/members/:userId/unmute", authenticateToken, authorizeRoles('teacher', 'superuser'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const classId = parseId(req.params.id);
    const userId = parseId(req.params.userId);
    if (!classId || !userId) return res.status(400).json({ error: "Invalid class or user ID" });
    const cls = await storage.getClass(classId);
    if (!cls) return res.status(404).json({ error: "Class not found" });
    if (cls.teacherId !== req.user!.id && req.user!.role !== 'superuser') {
      return res.status(403).json({ error: "Only the class teacher can unmute students" });
    }
    const member = await storage.getClassMember(classId, userId);
    if (!member) return res.status(404).json({ error: "Student is not in this class" });
    const updated = await storage.updateClassMember(classId, userId, { canChat: true });
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// Teacher moderation: ban student
classesRouter.patch("/:id/members/:userId/ban", authenticateToken, authorizeRoles('teacher', 'superuser'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const classId = parseId(req.params.id);
    const userId = parseId(req.params.userId);
    if (!classId || !userId) return res.status(400).json({ error: "Invalid class or user ID" });
    const cls = await storage.getClass(classId);
    if (!cls) return res.status(404).json({ error: "Class not found" });
    if (cls.teacherId !== req.user!.id && req.user!.role !== 'superuser') {
      return res.status(403).json({ error: "Only the class teacher can ban students" });
    }
    const member = await storage.getClassMember(classId, userId);
    if (!member) return res.status(404).json({ error: "Student is not in this class" });
    const updated = await storage.updateClassMember(classId, userId, { isBanned: true, canChat: false });
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// Teacher moderation: unban student
classesRouter.patch("/:id/members/:userId/unban", authenticateToken, authorizeRoles('teacher', 'superuser'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const classId = parseId(req.params.id);
    const userId = parseId(req.params.userId);
    if (!classId || !userId) return res.status(400).json({ error: "Invalid class or user ID" });
    const cls = await storage.getClass(classId);
    if (!cls) return res.status(404).json({ error: "Class not found" });
    if (cls.teacherId !== req.user!.id && req.user!.role !== 'superuser') {
      return res.status(403).json({ error: "Only the class teacher can unban students" });
    }
    const member = await storage.getClassMember(classId, userId);
    if (!member) return res.status(404).json({ error: "Student is not in this class" });
    const updated = await storage.updateClassMember(classId, userId, { isBanned: false, canChat: true });
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// Teacher moderation: revoke access
classesRouter.patch("/:id/members/:userId/revoke-access", authenticateToken, authorizeRoles('teacher', 'superuser'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const classId = parseId(req.params.id);
    const userId = parseId(req.params.userId);
    if (!classId || !userId) return res.status(400).json({ error: "Invalid class or user ID" });
    const cls = await storage.getClass(classId);
    if (!cls) return res.status(404).json({ error: "Class not found" });
    if (cls.teacherId !== req.user!.id && req.user!.role !== 'superuser') {
      return res.status(403).json({ error: "Only the class teacher can revoke access" });
    }
    const member = await storage.getClassMember(classId, userId);
    if (!member) return res.status(404).json({ error: "Student is not in this class" });
    const updated = await storage.updateClassMember(classId, userId, { accessRevoked: true, canChat: false });
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// Teacher moderation: restore access
classesRouter.patch("/:id/members/:userId/restore-access", authenticateToken, authorizeRoles('teacher', 'superuser'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const classId = parseId(req.params.id);
    const userId = parseId(req.params.userId);
    if (!classId || !userId) return res.status(400).json({ error: "Invalid class or user ID" });
    const cls = await storage.getClass(classId);
    if (!cls) return res.status(404).json({ error: "Class not found" });
    if (cls.teacherId !== req.user!.id && req.user!.role !== 'superuser') {
      return res.status(403).json({ error: "Only the class teacher can restore access" });
    }
    const member = await storage.getClassMember(classId, userId);
    if (!member) return res.status(404).json({ error: "Student is not in this class" });
    const updated = await storage.updateClassMember(classId, userId, { accessRevoked: false, canChat: true });
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// DELETE /classes/:id - Always archive then delete. Superuser: any class. Teacher: empty classes only.
classesRouter.delete("/:id(\\d+)", authenticateToken, authorizeRoles('teacher', 'superuser'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const classId = parseId(req.params.id);
    if (!classId) return res.status(400).json({ error: "Invalid class ID" });
    const cls = await storage.getClass(classId);
    if (!cls) return res.status(404).json({ error: "Class not found" });
    const isSuperuser = req.user!.role === 'superuser';
    if (cls.teacherId !== req.user!.id && !isSuperuser) {
      return res.status(403).json({ error: "Only the class teacher can delete this class" });
    }

    const members = await storage.getClassMembers(classId);
    const messageLimit = isSuperuser ? 5000 : 500;
    const messages = await storage.getClassChatMessages(classId, messageLimit, 0);

    if (!isSuperuser) {
      // Teacher: only allow delete when empty
      if (members.length > 0) {
        return res.status(400).json({ error: "Cannot delete a class that has members. Remove all members first, or delete only empty classes created by mistake." });
      }
      if (messages.length > 0) {
        return res.status(400).json({ error: "Cannot delete a class that has chat messages. Delete only empty, unused classes." });
      }
    }

    const messagesSnapshot = messages.map((m) => ({
      senderId: m.senderId,
      message: m.message,
      createdAt: m.createdAt,
      senderName: m.sender ? `${m.sender.firstName ?? ''} ${m.sender.lastName ?? ''}`.trim() || m.sender.username : undefined,
    }));
    const membersSnapshot = members.map((m) => ({
      userId: m.userId,
      role: m.role,
      status: m.status,
      displayName: m.user ? `${m.user.firstName ?? ''} ${m.user.lastName ?? ''}`.trim() || m.user.username : undefined,
    }));

    await storage.createClassChatArchive({
      originalClassId: cls.id,
      className: cls.name,
      teacherId: cls.teacherId,
      subject: cls.subject,
      inviteCode: cls.inviteCode,
      status: cls.status,
      archivedByUserId: req.user!.id,
      messagesSnapshot,
      membersSnapshot,
    });
    await storage.deleteClass(classId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// GET /classes/:id - Get class details (numeric id only - prevents "teacher"/"student" from matching)
classesRouter.get("/:id(\\d+)", authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const classId = parseInt(req.params.id);
    const cls = await storage.getClass(classId);
    if (!cls) {
      return res.status(404).json({ error: "Class not found" });
    }
    const isTeacher = cls.teacherId === req.user!.id;
    const isMember = await storage.isClassMember(classId, req.user!.id);
    const isSuperuser = req.user!.role === 'superuser';
    if (!isTeacher && !isMember && !isSuperuser) {
      return res.status(403).json({ error: "You do not have access to this class" });
    }
    const members = await storage.getClassMembers(classId);
    res.set('Cache-Control', 'no-store');
    res.json({ ...cls, members });
  } catch (error) {
    next(error);
  }
});

// GET /classes/:id/messages - Get class chat messages (students must be approved, not banned/revoked)
classesRouter.get("/:id/messages", authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const classId = parseId(req.params.id);
    if (!classId) return res.status(400).json({ error: "Invalid class ID" });
    const cls = await storage.getClass(classId);
    if (!cls) {
      return res.status(404).json({ error: "Class not found" });
    }
    const isTeacher = cls.teacherId === req.user!.id || req.user!.role === 'superuser';
    const member = await storage.getClassMember(classId, req.user!.id);
    if (!canAccessChat(cls, member ?? null, isTeacher)) {
      return res.status(403).json({ error: "You do not have permission to access this class chat" });
    }
    const limit = req.query.limit ? Math.min(Math.max(parseInt(req.query.limit as string) || 50, 1), 200) : 50;
    const offset = req.query.offset != null ? Math.max(parseInt(req.query.offset as string) || 0, 0) : 0;
    const messages = await storage.getClassChatMessages(classId, limit, offset);
    const hasMore = messages.length === limit;
    res.set('Cache-Control', 'no-store');
    res.json({ messages, teacherId: cls.teacherId, hasMore });
  } catch (error) {
    next(error);
  }
});

// POST /classes/:id/messages - Send class chat message (enforces mute, ban, access, class status)
classesRouter.post("/:id/messages", authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const classId = parseId(req.params.id);
    if (!classId) return res.status(400).json({ error: "Invalid class ID" });
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Message is required" });
    }
    const cls = await storage.getClass(classId);
    if (!cls) {
      return res.status(404).json({ error: "Class not found" });
    }
    const isTeacher = cls.teacherId === req.user!.id || req.user!.role === 'superuser';
    const member = await storage.getClassMember(classId, req.user!.id);
    if (!canSendMessages(cls, member ?? null, isTeacher)) {
      if (member?.accessRevoked || member?.isBanned) {
        return res.status(403).json({ error: "You do not have permission to send messages in this class" });
      }
      if (member && !member.canChat) {
        return res.status(403).json({ error: "You are muted in this class" });
      }
      if (!isClassChatOpen(cls)) {
        return res.status(403).json({ error: "This class chat is currently closed" });
      }
      return res.status(403).json({ error: "You do not have permission to chat in this class" });
    }
    const mod = await getModerationFromStorage();
    const blockedWords = mod.blockedWords ?? [];
    if (blockedWords.length > 0) {
      const blocked = containsBlockedWord(message.trim(), blockedWords);
      if (blocked) {
        await recordBadWordAttempt(req.user!.id, blocked);
        return res.status(400).json({
          error: "Your message contains a word that is not allowed. Please rephrase.",
          blockedWord: blocked,
        });
      }
    }
    const msg = await storage.createClassChatMessage({
      classId,
      senderId: req.user!.id,
      message: message.trim()
    });
    const sender = await storage.getUser(req.user!.id);
    res.status(201).json({ ...msg, sender });
  } catch (error) {
    next(error);
  }
});
