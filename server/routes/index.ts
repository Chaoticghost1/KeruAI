import type { Express } from "express";
import { storage } from "../storage";
import {
  insertUserSchema,
  insertTutorSessionSchema,
  insertTutorMessageSchema,
  insertStudentProfileSchema,
  insertContentSubmissionSchema,
  insertStudentAssignmentSchema,
  insertBotPersonaSchema,
  User
} from "@shared/schema";
import { getPersonaByKey, generatePersonaResponse } from "@shared/tutorPersonas";
import { AITutorService } from "../ai-service.js";
import { ContentProcessor } from "../content-processor.js";
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import express from 'express';
import {
  authenticateToken,
  authorizeRoles,
  requireVerification,
  AuthRequest
} from "../auth";
import { authRouter } from './auth';
import { budgetRouter } from './budget';
import { studyRouter } from './study';
import { gamesRouter } from './games';

// Configure multer for file uploads
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
    // Allow images, PDFs, and documents
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
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

export async function registerRoutes(app: Express): Promise<void> {
  // Serve uploaded files
  app.use('/uploads', express.static(uploadDir));

  // Mount modularized routers
  app.use('/api/auth', authRouter);
  app.use('/api/budget', budgetRouter);
  app.use('/api/study', studyRouter);
  app.use('/api/games', gamesRouter);

  // ==========================================
  // ADMIN PANEL ROUTES
  // ==========================================

  // Get all users (superuser only)
  app.get("/api/admin/users", authenticateToken, authorizeRoles('superuser'), async (req: AuthRequest, res) => {
    try {
      const users = await storage.getAllUsers();
      // Remove password from all users
      const sanitizedUsers = users.map(({ password, ...user }) => user);
      res.json(sanitizedUsers);
    } catch (error) {
      res.status(500).json({ error: "Failed to get users" });
    }
  });

  // Update user status (activate/deactivate)
  app.patch("/api/admin/users/:id/status", authenticateToken, authorizeRoles('superuser'), async (req: AuthRequest, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { isActive } = req.body;

      if (typeof isActive !== 'boolean') {
        return res.status(400).json({ error: "isActive must be a boolean" });
      }

      // Prevent deactivating yourself
      if (userId === req.user!.id && !isActive) {
        return res.status(400).json({ error: "Cannot deactivate your own account" });
      }

      const updatedUser = await storage.updateUser(userId, { isActive });
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ error: "Failed to update user status" });
    }
  });

  // Update user role
  app.patch("/api/admin/users/:id/role", authenticateToken, authorizeRoles('superuser'), async (req: AuthRequest, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { role } = req.body;

      if (!['student', 'teacher', 'superuser'].includes(role)) {
        return res.status(400).json({ error: "Invalid role" });
      }

      // Prevent changing your own role from superuser
      if (userId === req.user!.id && req.user!.role === 'superuser' && role !== 'superuser') {
        return res.status(400).json({ error: "Cannot change your own superuser role" });
      }

      const updatedUser = await storage.updateUser(userId, { role });
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ error: "Failed to update user role" });
    }
  });

  // Verify user manually
  app.patch("/api/admin/users/:id/verify", authenticateToken, authorizeRoles('superuser'), async (req: AuthRequest, res) => {
    try {
      const userId = parseInt(req.params.id);
      await storage.verifyUser(userId);
      res.json({ message: "User verified successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to verify user" });
    }
  });

  // Delete user (superuser only)
  app.delete("/api/admin/users/:id", authenticateToken, authorizeRoles('superuser'), async (req: AuthRequest, res) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Prevent self-deletion
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

  // System feature controls
  app.patch("/api/admin/system/features", authenticateToken, authorizeRoles('superuser'), async (req: AuthRequest, res) => {
    try {
      const { feature, enabled } = req.body;

      if (typeof enabled !== 'boolean') {
        return res.status(400).json({ error: "enabled must be a boolean" });
      }

      // In a real implementation, you would store these settings in the database
      // For now, we'll just acknowledge the request
      res.json({ message: `Feature ${feature} ${enabled ? 'enabled' : 'disabled'}` });
    } catch (error) {
      res.status(500).json({ error: "Failed to update system feature" });
    }
  });

  // ==========================================
  // CONTENT MANAGEMENT ROUTES (Teachers)
  // ==========================================

  // Create content submission
  app.post("/api/content", authenticateToken, authorizeRoles('teacher', 'superuser'), requireVerification, upload.single('file'), async (req: AuthRequest, res) => {
    try {
      const { title, description, contentType, subject, gradeLevel, tags, htmlContent } = req.body;
      
      if (!title || !contentType || !subject) {
        return res.status(400).json({ error: "Title, content type, and subject are required" });
      }

      // Process uploaded file to extract text for AI analysis
      let extractedText = '';
      if (req.file?.path) {
        try {
          console.log(`Processing uploaded file: ${req.file.filename}`);
          const processedContent = await ContentProcessor.processFile(req.file.path, contentType);
          extractedText = ContentProcessor.cleanExtractedText(processedContent.extractedText);
          console.log(`Text extraction completed: ${extractedText.length} characters extracted`);
        } catch (processingError) {
          console.error("File processing error:", processingError);
          // Continue without extracted text if processing fails
        }
      }

      const submission = await storage.createContentSubmission({
        teacherId: req.user!.id,
        title,
        description,
        contentType,
        subject,
        gradeLevel,
        tags: tags ? JSON.parse(tags) : [],
        filePath: req.file?.path,
        fileUrl: req.file ? `/uploads/${req.file.filename}` : undefined,
        htmlContent,
        extractedText: extractedText || htmlContent || '' // Use extracted text or fall back to HTML content
      });

      res.status(201).json(submission);
    } catch (error) {
      console.error("Content creation error:", error);
      res.status(500).json({ error: "Failed to create content" });
    }
  });

  // Get teacher's content submissions
  app.get("/api/content/my", authenticateToken, authorizeRoles('teacher', 'superuser'), async (req: AuthRequest, res) => {
    try {
      const submissions = await storage.getTeacherContentSubmissions(req.user!.id);
      res.json(submissions);
    } catch (error) {
      res.status(500).json({ error: "Failed to get content submissions" });
    }
  });

  // Get all published content (students and teachers)
  app.get("/api/content", authenticateToken, requireVerification, async (req: AuthRequest, res) => {
    try {
      const submissions = await storage.getAllContentSubmissions(true);
      res.json(submissions);
    } catch (error) {
      res.status(500).json({ error: "Failed to get content" });
    }
  });

  // Publish content (teachers for their own content, superuser for any)
  app.post("/api/content/:id/publish", authenticateToken, authorizeRoles('teacher', 'superuser'), async (req: AuthRequest, res) => {
    try {
      const contentId = parseInt(req.params.id);
      const content = await storage.getContentSubmission(contentId);
      
      if (!content) {
        return res.status(404).json({ error: "Content not found" });
      }

      // Teachers can only publish their own content
      if (req.user!.role === 'teacher' && content.teacherId !== req.user!.id) {
        return res.status(403).json({ error: "You can only publish your own content" });
      }

      const published = await storage.publishContentSubmission(contentId);
      res.json(published);
    } catch (error) {
      res.status(500).json({ error: "Failed to publish content" });
    }
  });

  // ==========================================
  // STUDENT ASSIGNMENT ROUTES
  // ==========================================

  // Create assignment for student
  app.post("/api/assignments", authenticateToken, authorizeRoles('teacher', 'superuser'), async (req: AuthRequest, res) => {
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
      res.status(500).json({ error: "Failed to create assignment" });
    }
  });

  // Get student's assignments
  app.get("/api/assignments/my", authenticateToken, authorizeRoles('student'), async (req: AuthRequest, res) => {
    try {
      const assignments = await storage.getStudentAssignments(req.user!.id);
      res.json(assignments);
    } catch (error) {
      res.status(500).json({ error: "Failed to get assignments" });
    }
  });

  // Submit assignment
  app.post("/api/assignments/:id/submit", authenticateToken, authorizeRoles('student'), upload.array('files', 5), async (req: AuthRequest, res) => {
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
      res.status(500).json({ error: "Failed to submit assignment" });
    }
  });

  // Grade assignment (teachers only)
  app.post("/api/assignments/:id/grade", authenticateToken, authorizeRoles('teacher', 'superuser'), async (req: AuthRequest, res) => {
    try {
      const assignmentId = parseInt(req.params.id);
      const { grade, feedback } = req.body;
      
      if (grade === undefined || grade < 0 || grade > 100) {
        return res.status(400).json({ error: "Grade must be between 0 and 100" });
      }

      const graded = await storage.gradeAssignment(assignmentId, grade, feedback);
      res.json(graded);
    } catch (error) {
      res.status(500).json({ error: "Failed to grade assignment" });
    }
  });

  // ==========================================
  // STUDENT REVISION ROUTES (Phase 2)
  // ==========================================

  // Get revision materials for student (assignments with content)
  app.get("/api/revision/materials", authenticateToken, authorizeRoles('student'), async (req: AuthRequest, res) => {
    try {
      const assignments = await storage.getStudentAssignments(req.user!.id);
      
      // Get content details for each assignment
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
              extractedText: content.extractedText, // Available for AI processing
              htmlContent: content.htmlContent
            } : null
          };
        })
      );

      res.json(materialsWithContent.filter(m => m.content)); // Only return materials with valid content
    } catch (error) {
      console.error("Failed to get revision materials:", error);
      res.status(500).json({ error: "Failed to get revision materials" });
    }
  });

  // Get specific revision material content
  app.get("/api/revision/content/:contentId", authenticateToken, authorizeRoles('student'), async (req: AuthRequest, res) => {
    try {
      const contentId = parseInt(req.params.contentId);
      
      // Verify student has access to this content through an assignment
      const assignments = await storage.getStudentAssignments(req.user!.id);
      const hasAccess = assignments.some(assignment => assignment.contentId === contentId);
      
      if (!hasAccess) {
        return res.status(403).json({ error: "You don't have access to this content" });
      }

      const content = await storage.getContentSubmission(contentId);
      if (!content) {
        return res.status(404).json({ error: "Content not found" });
      }

      // Increment view count - safely handle undefined/null values
      const currentViewCount = Number(content.viewCount) || 0;
      await storage.updateContentSubmission(contentId, { 
        viewCount: currentViewCount + 1 
      });

      res.json(content);
    } catch (error) {
      console.error("Failed to get content:", error);
      res.status(500).json({ error: "Failed to get content" });
    }
  });

  // Start revision session
  app.post("/api/revision/session/start", authenticateToken, authorizeRoles('student'), async (req: AuthRequest, res) => {
    try {
      const { contentId, subject, topic } = req.body;
      
      if (!contentId || !subject) {
        return res.status(400).json({ error: "Content ID and subject are required" });
      }

      // Verify student has access to this content
      const assignments = await storage.getStudentAssignments(req.user!.id);
      const hasAccess = assignments.some(assignment => assignment.contentId === contentId);
      
      if (!hasAccess) {
        return res.status(403).json({ error: "You don't have access to this content" });
      }

      // For now, we'll create a simple session record
      // In the future, this could be expanded to track detailed session data
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
      console.error("Failed to start revision session:", error);
      res.status(500).json({ error: "Failed to start revision session" });
    }
  });

  // AI-assisted revision help
  app.post("/api/revision/ai-help", authenticateToken, authorizeRoles('student'), async (req: AuthRequest, res) => {
    try {
      const { contentId, question, sessionId } = req.body;
      
      if (!contentId || !question) {
        return res.status(400).json({ error: "Content ID and question are required" });
      }

      // Verify student has access to this content
      const assignments = await storage.getStudentAssignments(req.user!.id);
      const hasAccess = assignments.some(assignment => assignment.contentId === contentId);
      
      if (!hasAccess) {
        return res.status(403).json({ error: "You don't have access to this content" });
      }

      // Get content for AI context
      const content = await storage.getContentSubmission(contentId);
      if (!content) {
        return res.status(404).json({ error: "Content not found" });
      }

      // Generate AI response using extracted text as context
      const aiResponse = await AITutorService.generateTutorResponse(
        'math_buddy', // Default tutor, could be dynamic based on subject
        question,
        content.subject,
        1, // Beginner difficulty by default
        [], // No session history for now
        'en' // English by default
      );

      // Add content context to the response
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
      console.error("Failed to get AI help:", error);
      res.status(500).json({ error: "Failed to get AI assistance" });
    }
  });

  // ==========================================
  // EXISTING ROUTES (Updated with Auth)
  // ==========================================
  // User routes
  app.post("/api/users", async (req, res) => {
    try {
      const validatedUser = insertUserSchema.parse(req.body);
      const user = await storage.createUser(validatedUser);
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: "Invalid user data" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: "Invalid user ID" });
    }
  });

  app.get("/api/users/username/:username", async (req, res) => {
    try {
      const username = req.params.username;
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: "Error fetching user" });
    }
  });

  // Tutor agent routes
  app.get("/api/tutors", async (req, res) => {
    try {
      const agents = await storage.getTutorAgents();
      res.json(agents);
    } catch (error) {
      console.error('Error fetching tutors:', error);
      res.status(500).json({ error: "Error fetching tutor agents" });
    }
  });

  app.get("/api/tutors/:agentKey", async (req, res) => {
    try {
      const agentKey = req.params.agentKey;
      const agent = await storage.getTutorAgentByKey(agentKey);
      if (!agent) {
        return res.status(404).json({ error: "Tutor agent not found" });
      }
      const persona = getPersonaByKey(agentKey);
      res.json({ agent, persona });
    } catch (error) {
      res.status(400).json({ error: "Error fetching tutor agent" });
    }
  });

  // Tutor session routes
  app.post("/api/tutors/sessions", async (req, res) => {
    try {
      const validatedSession = insertTutorSessionSchema.parse(req.body);
      const session = await storage.createTutorSession(validatedSession);
      
      // Extract language preference from request
      const language = req.body.language || 'es'; // Default to Spanish if not provided
      
      // Generate welcome message from AI tutor
      try {
        // Get the agent record to extract agentKey
        const agent = await storage.getTutorAgent(validatedSession.agentId);
        if (!agent) {
          throw new Error(`Agent not found: ${validatedSession.agentId}`);
        }
        
        const welcomeResponse = await AITutorService.initializeTutoringSession(
          agent.agentKey, // Use actual agentKey from agent record
          validatedSession.subject,
          validatedSession.topic || undefined,
          validatedSession.difficultyLevel,
          language // Pass user's language preference
        );
        
        // Save welcome message
        await storage.createTutorMessage({
          sessionId: session.id,
          sender: 'agent',
          message: welcomeResponse.message,
          messageType: 'greeting',
          toolsUsed: welcomeResponse.toolsUsed
        });
      } catch (aiError) {
        const errorMessage = aiError instanceof Error ? aiError.message : 'Unknown error';
        console.warn('Failed to generate welcome message:', errorMessage);
        // Continue without welcome message - this is not a critical failure
      }
      
      res.json(session);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error creating tutor session:', errorMessage);
      res.status(500).json({ error: "Failed to create session" });
    }
  });

  app.get("/api/tutors/sessions/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const sessions = await storage.getUserTutorSessions(userId);
      res.json(sessions);
    } catch (error) {
      res.status(400).json({ error: "Error fetching tutor sessions" });
    }
  });

  app.patch("/api/tutors/sessions/:sessionId/end", async (req, res) => {
    try {
      const sessionId = parseInt(req.params.sessionId);
      const endedSession = await storage.endTutorSession(sessionId);
      res.json(endedSession);
    } catch (error) {
      res.status(400).json({ error: "Error ending session" });
    }
  });

  // Tutor message routes
  app.post("/api/tutors/messages", async (req, res) => {
    try {
      const validatedMessage = insertTutorMessageSchema.parse(req.body);
      const message = await storage.createTutorMessage(validatedMessage);
      
      // If this is a student message, generate AI agent response
      if (validatedMessage.sender === 'student') {
        try {
          const session = await storage.getTutorSession(validatedMessage.sessionId);
          if (session) {
            // Get the agent record to extract agentKey
            const agent = await storage.getTutorAgent(session.agentId);
            if (!agent) {
              throw new Error(`Agent not found: ${session.agentId}`);
            }
            
            // Extract language preference from request
            const language = req.body.language || 'es'; // Default to Spanish if not provided
            
            // Get conversation history for context
            const sessionHistory = await storage.getSessionMessages(validatedMessage.sessionId);
            const conversationHistory = sessionHistory.map(msg => ({
              sender: msg.sender,
              message: msg.message,
              timestamp: msg.timestamp.toISOString()
            }));
            
            // Generate AI response using OpenAI
            const aiResponse = await AITutorService.generateTutorResponse(
              agent.agentKey, // Use actual agentKey from agent record
              validatedMessage.message,
              session.subject,
              session.difficultyLevel,
              conversationHistory,
              language // Pass user's language preference
            );

            // Save agent response
            const agentMessage = await storage.createTutorMessage({
              sessionId: validatedMessage.sessionId,
              sender: 'agent',
              message: aiResponse.message,
              messageType: 'explanation',
              toolsUsed: aiResponse.toolsUsed
            });

            return res.json({ studentMessage: message, agentMessage });
          }
        } catch (aiError) {
          console.error('AI response generation failed:', aiError);
          // Continue with just the student message if AI fails
        }
      }
      
      res.json(message);
    } catch (error) {
      res.status(400).json({ error: "Invalid message data" });
    }
  });

  app.get("/api/tutors/sessions/:sessionId/messages", async (req, res) => {
    try {
      const sessionId = parseInt(req.params.sessionId);
      const messages = await storage.getSessionMessages(sessionId);
      res.json(messages);
    } catch (error) {
      res.status(400).json({ error: "Error fetching session messages" });
    }
  });

  // Student profile routes
  app.get("/api/students/profile/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const profile = await storage.getStudentProfile(userId);
      if (!profile) {
        return res.status(404).json({ error: "Student profile not found" });
      }
      res.json(profile);
    } catch (error) {
      res.status(400).json({ error: "Error fetching student profile" });
    }
  });

  app.post("/api/students/profile", async (req, res) => {
    try {
      const validatedProfile = insertStudentProfileSchema.parse(req.body);
      const profile = await storage.createStudentProfile(validatedProfile);
      res.json(profile);
    } catch (error) {
      res.status(400).json({ error: "Invalid profile data" });
    }
  });

  app.put("/api/students/profile/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const updates = req.body;
      const profile = await storage.updateStudentProfile(userId, updates);
      res.json(profile);
    } catch (error) {
      res.status(400).json({ error: "Error updating student profile" });
    }
  });

  // Badge system routes
  app.get("/api/badges", async (req, res) => {
    try {
      const badges = await storage.getBadges();
      res.json(badges);
    } catch (error) {
      res.status(500).json({ error: "Error fetching badges" });
    }
  });

  app.get("/api/badges/:id", async (req, res) => {
    try {
      const badgeId = parseInt(req.params.id);
      const badge = await storage.getBadge(badgeId);
      if (!badge) {
        return res.status(404).json({ error: "Badge not found" });
      }
      res.json(badge);
    } catch (error) {
      res.status(500).json({ error: "Error fetching badge" });
    }
  });

  app.get("/api/users/:userId/badges", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const userBadges = await storage.getUserBadges(userId);
      res.json(userBadges);
    } catch (error) {
      res.status(500).json({ error: "Error fetching user badges" });
    }
  });

  app.post("/api/users/:userId/badges/:badgeId/view", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const badgeId = parseInt(req.params.badgeId);
      await storage.markBadgeAsViewed(userId, badgeId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Error marking badge as viewed" });
    }
  });

  app.get("/api/users/:userId/streaks", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const limit = parseInt(req.query.limit as string) || 30;
      const streaks = await storage.getStudyStreaks(userId, limit);
      res.json(streaks);
    } catch (error) {
      res.status(500).json({ error: "Error fetching study streaks" });
    }
  });

  app.post("/api/sessions/:sessionId/complete", async (req, res) => {
    try {
      const sessionId = parseInt(req.params.sessionId);
      const { userId, subject, duration, messagesExchanged, difficulty } = req.body;
      
      // Award session rewards
      const rewards = await storage.awardSessionRewards(userId, {
        sessionId,
        subject,
        duration,
        messagesExchanged,
        difficulty
      });
      
      res.json(rewards);
    } catch (error) {
      res.status(500).json({ error: "Error completing session" });
    }
  });

  app.get("/api/users/:userId/stats", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const stats = await storage.getUserSessionStats(userId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Error fetching user stats" });
    }
  });

  // ==========================================
  // ADMIN API ROUTES
  // ==========================================
  
  // Admin Analytics Routes
  app.get("/api/admin/analytics", authenticateToken, authorizeRoles('superuser', 'teacher'), async (req: AuthRequest, res) => {
    try {
      const analytics = await storage.getAnalytics();
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ error: "Failed to get analytics" });
    }
  });

  app.get("/api/admin/budget-analytics", authenticateToken, authorizeRoles('superuser'), async (req: AuthRequest, res) => {
    try {
      const analytics = await storage.getBudgetAnalytics();
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ error: "Failed to get budget analytics" });
    }
  });

  app.get("/api/admin/chat-analytics", authenticateToken, authorizeRoles('superuser', 'teacher'), async (req: AuthRequest, res) => {
    try {
      const analytics = await storage.getChatAnalytics();
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ error: "Failed to get chat analytics" });
    }
  });

  // Bot Persona Management Routes
  app.get("/api/admin/bot-personas", authenticateToken, authorizeRoles('superuser', 'teacher'), async (req: AuthRequest, res) => {
    try {
      const personas = await storage.getBotPersonas();
      res.json(personas);
    } catch (error) {
      res.status(500).json({ error: "Failed to get bot personas" });
    }
  });

  app.post("/api/admin/bot-personas", authenticateToken, authorizeRoles('superuser', 'teacher'), async (req: AuthRequest, res) => {
    try {
      const personaData = req.body;
      // Convert comma-separated subjects to array
      if (personaData.subjects && typeof personaData.subjects === 'string') {
        personaData.subjects = personaData.subjects.split(',').map((s: string) => s.trim()).filter((s: string) => s);
      }
      // Set the creator ID from the authenticated user
      personaData.createdById = req.user!.id;
      const persona = await storage.createBotPersona(personaData);
      res.json(persona);
    } catch (error) {
      console.error('Error creating bot persona:', error);
      res.status(500).json({ error: "Failed to create bot persona" });
    }
  });

  app.put("/api/admin/bot-personas/:id", authenticateToken, authorizeRoles('superuser', 'teacher'), async (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      // Convert comma-separated subjects to array
      if (updates.subjects && typeof updates.subjects === 'string') {
        updates.subjects = updates.subjects.split(',').map((s: string) => s.trim()).filter((s: string) => s);
      }
      const persona = await storage.updateBotPersona(id, updates);
      res.json(persona);
    } catch (error) {
      res.status(500).json({ error: "Failed to update bot persona" });
    }
  });

  app.delete("/api/admin/bot-personas/:id", authenticateToken, authorizeRoles('superuser', 'teacher'), async (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteBotPersona(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete bot persona" });
    }
  });

  // Blog Post Management Routes
  app.get("/api/admin/blog-posts", authenticateToken, authorizeRoles('superuser', 'teacher'), async (req: AuthRequest, res) => {
    try {
      const limitParam = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const offsetParam = req.query.offset ? parseInt(req.query.offset as string) : undefined;
      
      // If pagination params are provided, use paginated endpoint
      if (limitParam !== undefined || offsetParam !== undefined) {
        // Validate pagination parameters
        if ((limitParam !== undefined && (isNaN(limitParam) || limitParam < 0)) || 
            (offsetParam !== undefined && (isNaN(offsetParam) || offsetParam < 0))) {
          return res.status(400).json({ error: "Invalid pagination parameters: limit and offset must be non-negative integers" });
        }
        
        const limit = Math.min(Math.max(limitParam || 10, 0), 100);
        const offset = Math.max(offsetParam || 0, 0);
        const result = await storage.getBlogPostsPaginated(limit, offset);
        res.json(result);
      } else {
        // Backwards compatibility: return all posts if no pagination params
        const posts = await storage.getBlogPosts();
        res.json(posts);
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to get blog posts" });
    }
  });

  app.post("/api/admin/blog-posts", authenticateToken, authorizeRoles('superuser', 'teacher'), async (req: AuthRequest, res) => {
    try {
      const postData = { ...req.body, authorId: req.user!.id };
      // Convert comma-separated tags to array
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

  app.put("/api/admin/blog-posts/:id", authenticateToken, authorizeRoles('superuser', 'teacher'), async (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      // Convert comma-separated tags to array
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

  app.delete("/api/admin/blog-posts/:id", authenticateToken, authorizeRoles('superuser', 'teacher'), async (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteBlogPost(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete blog post" });
    }
  });

  // Admin Personas Endpoint (paginated bot personas list)
  app.get("/api/admin/personas", authenticateToken, authorizeRoles('superuser', 'teacher'), async (req: AuthRequest, res) => {
    try {
      const limitParam = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const offsetParam = req.query.offset ? parseInt(req.query.offset as string) : undefined;
      
      // If pagination params are provided, use paginated endpoint
      if (limitParam !== undefined || offsetParam !== undefined) {
        // Validate pagination parameters
        if ((limitParam !== undefined && (isNaN(limitParam) || limitParam < 0)) || 
            (offsetParam !== undefined && (isNaN(offsetParam) || offsetParam < 0))) {
          return res.status(400).json({ error: "Invalid pagination parameters: limit and offset must be non-negative integers" });
        }
        
        const limit = Math.min(Math.max(limitParam || 10, 0), 100);
        const offset = Math.max(offsetParam || 0, 0);
        const result = await storage.getBotPersonasPaginated(limit, offset);
        res.json(result);
      } else {
        // Backwards compatibility: return all personas if no pagination params
        const personas = await storage.getBotPersonas();
        res.json(personas);
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to get personas" });
    }
  });

  // Admin Content Submissions Endpoint (paginated)
  app.get("/api/admin/submissions", authenticateToken, authorizeRoles('superuser', 'teacher'), async (req: AuthRequest, res) => {
    try {
      const limitParam = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const offsetParam = req.query.offset ? parseInt(req.query.offset as string) : undefined;
      const publishedParam = req.query.published as string;
      
      let published: boolean | undefined;
      if (publishedParam === 'true') published = true;
      else if (publishedParam === 'false') published = false;
      
      // If pagination params are provided, use paginated endpoint
      if (limitParam !== undefined || offsetParam !== undefined) {
        // Validate pagination parameters
        if ((limitParam !== undefined && (isNaN(limitParam) || limitParam < 0)) || 
            (offsetParam !== undefined && (isNaN(offsetParam) || offsetParam < 0))) {
          return res.status(400).json({ error: "Invalid pagination parameters: limit and offset must be non-negative integers" });
        }
        
        const limit = Math.min(Math.max(limitParam || 10, 0), 100);
        const offset = Math.max(offsetParam || 0, 0);
        const result = await storage.getAllContentSubmissionsPaginated(published, limit, offset);
        res.json(result);
      } else {
        // Backwards compatibility: return all submissions if no pagination params
        const submissions = await storage.getAllContentSubmissions(published);
        res.json(submissions);
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to get submissions" });
    }
  });

  // Admin Student Assignments Endpoint (paginated)
  app.get("/api/admin/assignments", authenticateToken, authorizeRoles('superuser', 'teacher'), async (req: AuthRequest, res) => {
    try {
      const limitParam = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const offsetParam = req.query.offset ? parseInt(req.query.offset as string) : undefined;
      
      // If pagination params are provided, use paginated endpoint
      if (limitParam !== undefined || offsetParam !== undefined) {
        // Validate pagination parameters
        if ((limitParam !== undefined && (isNaN(limitParam) || limitParam < 0)) || 
            (offsetParam !== undefined && (isNaN(offsetParam) || offsetParam < 0))) {
          return res.status(400).json({ error: "Invalid pagination parameters: limit and offset must be non-negative integers" });
        }
        
        const limit = Math.min(Math.max(limitParam || 10, 0), 100);
        const offset = Math.max(offsetParam || 0, 0);
        const result = await storage.getAllStudentAssignmentsPaginated(limit, offset);
        res.json(result);
      } else {
        // Backwards compatibility: return all assignments if no pagination params
        const allAssignments = await storage.getAllStudentAssignments();
        res.json(allAssignments);
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to get assignments" });
    }
  });
}
