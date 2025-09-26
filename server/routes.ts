import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertUserSchema,
  insertBudgetCategorySchema,
  insertBudgetTransactionSchema,
  insertStudyNoteSchema,
  insertGameScoreSchema,
  insertTutorSessionSchema,
  insertTutorMessageSchema,
  insertStudentProfileSchema,
  insertContentSubmissionSchema,
  insertStudentAssignmentSchema,
  User
} from "@shared/schema";
import { getPersonaByKey, generatePersonaResponse } from "@shared/tutorPersonas";
import { AITutorService } from "./ai-service.js";
import { GitHubBudgetService } from "./github-service.js";
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import express from 'express';
import {
  authenticateToken,
  authorizeRoles,
  requireVerification,
  generateTokens,
  hashPassword,
  comparePassword,
  generateVerificationToken,
  generatePasswordResetToken,
  verifyEmailToken,
  verifyResetToken,
  revokeToken,
  AuthRequest
} from "./auth";

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

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve uploaded files
  app.use('/uploads', express.static(uploadDir));

  // ==========================================
  // AUTHENTICATION ROUTES
  // ==========================================

  // Register user
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, email, phoneNumber, password, role = 'student', firstName, lastName } = req.body;
      
      // Validate required fields
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
      }
      
      if (!email && !phoneNumber) {
        return res.status(400).json({ error: "Email or phone number is required" });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }

      if (email) {
        const existingEmail = await storage.getUserByEmail(email);
        if (existingEmail) {
          return res.status(400).json({ error: "Email already registered" });
        }
      }

      if (phoneNumber) {
        const existingPhone = await storage.getUserByPhone(phoneNumber);
        if (existingPhone) {
          return res.status(400).json({ error: "Phone number already registered" });
        }
      }

      // Hash password and create user
      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        username,
        email,
        phoneNumber,
        password: hashedPassword,
        role,
        firstName,
        lastName,
        isVerified: false
      });

      // Generate verification token
      const verificationToken = await generateVerificationToken(user.id);
      
      // Generate auth tokens
      const tokens = await generateTokens(user);

      // Remove password from response
      const { password: _, ...userResponse } = user;

      res.status(201).json({
        user: userResponse,
        tokens,
        verificationToken
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  // Login user
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, email, phoneNumber, password } = req.body;
      
      if (!password) {
        return res.status(400).json({ error: "Password is required" });
      }

      // Find user by username, email, or phone
      let user: User | undefined;
      if (username) {
        user = await storage.getUserByUsername(username);
      } else if (email) {
        user = await storage.getUserByEmail(email);
      } else if (phoneNumber) {
        user = await storage.getUserByPhone(phoneNumber);
      } else {
        return res.status(400).json({ error: "Username, email, or phone number is required" });
      }

      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      if (!user.isActive) {
        return res.status(401).json({ error: "Account is deactivated" });
      }

      // Verify password
      const isValidPassword = await comparePassword(password, user.password!);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Update last login
      await storage.updateLastLogin(user.id);

      // Generate tokens
      const tokens = await generateTokens(user);

      // Remove password from response
      const { password: _, ...userResponse } = user;

      res.json({
        user: userResponse,
        tokens
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // Logout user
  app.post("/api/auth/logout", authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (req.tokenId) {
        await revokeToken(req.tokenId);
      }
      res.json({ message: "Logged out successfully" });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ error: "Logout failed" });
    }
  });

  // Get current user
  app.get("/api/auth/me", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { password: _, ...userResponse } = req.user!;
      res.json(userResponse);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ error: "Failed to get user" });
    }
  });

  // Verify email
  app.post("/api/auth/verify-email", async (req, res) => {
    try {
      const { token } = req.body;
      
      if (!token) {
        return res.status(400).json({ error: "Verification token is required" });
      }

      const user = await verifyEmailToken(token);
      if (!user) {
        return res.status(400).json({ error: "Invalid or expired verification token" });
      }

      await storage.verifyUser(user.id);
      await storage.revokeAuthToken(token);

      res.json({ message: "Email verified successfully" });
    } catch (error) {
      console.error("Email verification error:", error);
      res.status(500).json({ error: "Email verification failed" });
    }
  });

  // Request password reset
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        // Don't reveal if email exists
        return res.json({ message: "If the email exists, a reset link has been sent" });
      }

      const resetToken = await generatePasswordResetToken(user.id);

      // In production, send email with reset link
      // For now, return the token in response (remove in production)
      res.json({ 
        message: "Password reset token generated",
        resetToken // Remove this in production
      });
    } catch (error) {
      console.error("Password reset error:", error);
      res.status(500).json({ error: "Password reset failed" });
    }
  });

  // Reset password
  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { token, newPassword } = req.body;
      
      if (!token || !newPassword) {
        return res.status(400).json({ error: "Token and new password are required" });
      }

      const user = await verifyResetToken(token);
      if (!user) {
        return res.status(400).json({ error: "Invalid or expired reset token" });
      }

      const hashedPassword = await hashPassword(newPassword);
      await storage.updateUser(user.id, { password: hashedPassword });
      await storage.revokeAuthToken(token);

      res.json({ message: "Password reset successfully" });
    } catch (error) {
      console.error("Password reset error:", error);
      res.status(500).json({ error: "Password reset failed" });
    }
  });

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
        htmlContent
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

  // Budget routes
  app.get("/api/budget/categories/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const categories = await storage.getBudgetCategories(userId);
      res.json(categories);
    } catch (error) {
      res.status(400).json({ error: "Error fetching budget categories" });
    }
  });

  app.post("/api/budget/categories", async (req, res) => {
    try {
      const validatedCategory = insertBudgetCategorySchema.parse(req.body);
      const category = await storage.createBudgetCategory(validatedCategory);
      res.json(category);
    } catch (error) {
      res.status(400).json({ error: "Invalid category data" });
    }
  });

  app.get("/api/budget/transactions/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const transactions = await storage.getBudgetTransactions(userId);
      res.json(transactions);
    } catch (error) {
      res.status(400).json({ error: "Error fetching budget transactions" });
    }
  });

  app.post("/api/budget/transactions", async (req, res) => {
    try {
      const validatedTransaction = insertBudgetTransactionSchema.parse(req.body);
      const transaction = await storage.createBudgetTransaction(validatedTransaction);
      res.json(transaction);
    } catch (error) {
      res.status(400).json({ error: "Invalid transaction data" });
    }
  });

  // Study notes routes
  app.get("/api/study/notes/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const notes = await storage.getStudyNotes(userId);
      res.json(notes);
    } catch (error) {
      res.status(400).json({ error: "Error fetching study notes" });
    }
  });

  app.post("/api/study/notes", async (req, res) => {
    try {
      const validatedNote = insertStudyNoteSchema.parse(req.body);
      const note = await storage.createStudyNote(validatedNote);
      res.json(note);
    } catch (error) {
      res.status(400).json({ error: "Invalid note data" });
    }
  });

  app.put("/api/study/notes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const updatedNote = await storage.updateStudyNote(id, updates);
      res.json(updatedNote);
    } catch (error) {
      res.status(400).json({ error: "Error updating note" });
    }
  });

  app.delete("/api/study/notes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteStudyNote(id);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: "Error deleting note" });
    }
  });

  // Game scores routes
  app.get("/api/games/scores/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const gameName = req.query.game as string;
      const scores = await storage.getGameScores(userId, gameName);
      res.json(scores);
    } catch (error) {
      res.status(400).json({ error: "Error fetching game scores" });
    }
  });

  app.post("/api/games/scores", async (req, res) => {
    try {
      const validatedScore = insertGameScoreSchema.parse(req.body);
      const score = await storage.createGameScore(validatedScore);
      res.json(score);
    } catch (error) {
      res.status(400).json({ error: "Invalid score data" });
    }
  });

  app.get("/api/games/leaderboard/:gameName", async (req, res) => {
    try {
      const gameName = req.params.gameName;
      const limit = parseInt(req.query.limit as string) || 10;
      const topScores = await storage.getTopScores(gameName, limit);
      res.json(topScores);
    } catch (error) {
      res.status(400).json({ error: "Error fetching leaderboard" });
    }
  });

  // Tutor agent routes
  app.get("/api/tutors", async (req, res) => {
    try {
      const agents = await storage.getTutorAgents();
      res.json(agents);
    } catch (error) {
      res.status(400).json({ error: "Error fetching tutor agents" });
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
        console.warn('Failed to generate welcome message:', aiError);
      }
      
      res.json(session);
    } catch (error) {
      // Log removed for cleaner output
      res.status(400).json({ error: "Invalid session data" });
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
      const persona = await storage.createBotPersona(personaData);
      res.json(persona);
    } catch (error) {
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
      const posts = await storage.getBlogPosts();
      res.json(posts);
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

  // GitHub Budget Templates API
  app.get("/api/budget/templates", async (req, res) => {
    try {
      const query = req.query.q as string || 'budget management template';
      const limit = parseInt(req.query.limit as string) || 20;
      const templates = await GitHubBudgetService.searchBudgetTemplates(query, limit);
      res.json(templates);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch budget templates" });
    }
  });

  app.get("/api/budget/templates/featured", async (req, res) => {
    try {
      const templates = await GitHubBudgetService.getFeaturedBudgetRepos();
      res.json(templates);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch featured templates" });
    }
  });

  app.get("/api/budget/templates/:owner/:repo", async (req, res) => {
    try {
      const { owner, repo } = req.params;
      const details = await GitHubBudgetService.getRepositoryDetails(owner, repo);
      res.json(details);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch repository details" });
    }
  });

  app.post("/api/budget/templates/:owner/:repo/fork", async (req, res) => {
    try {
      const { owner, repo } = req.params;
      const forkedRepo = await GitHubBudgetService.forkRepository(owner, repo);
      res.json(forkedRepo);
    } catch (error) {
      res.status(500).json({ error: "Failed to fork repository" });
    }
  });

  app.get("/api/budget/github/profile", async (req, res) => {
    try {
      const profile = await GitHubBudgetService.getUserProfile();
      res.json(profile);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch GitHub profile" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
