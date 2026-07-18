import { Router, NextFunction, Response } from "express";
import path from "path";
import fs from "fs";
import multer from "multer";
import { authLimiter } from "../middleware/rate-limit";
import { passwordResetLimiter } from "../middleware/password-reset-limit";
import { storage } from "../storage";
import { User } from "@shared/schema";
import { checkRegistrationAllowed } from "../moderation";
import { logSecurityEvent, passwordResetLogger } from "../middleware/security-logger";
import {
  authenticateToken,
  generateTokens,
  verifyToken,
  hashPassword,
  comparePassword,
  generateVerificationToken,
  generatePasswordResetToken,
  verifyEmailToken,
  verifyResetToken,
  revokeToken,
  AuthRequest
} from "../auth";

const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const profileImageUpload = multer({
  storage: multer.diskStorage({
    destination: (_, __, cb) => cb(null, uploadDir),
    filename: (_, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, "profile-" + uniqueSuffix + path.extname(file.originalname).toLowerCase());
    },
  }),
  fileFilter: (_, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ext = path.extname(file.originalname).toLowerCase().slice(1);
    const mimeOk = /image\/(jpeg|jpg|png|gif|webp)/.test(file.mimetype);
    if (allowed.test(ext) && mimeOk) return cb(null, true);
    cb(new Error("Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed."));
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

export const authRouter = Router();

// Register user (stricter rate limit: 10/15min per IP)
authRouter.post("/register", authLimiter, async (req, res, next: NextFunction) => {
  try {
    const { username, email, phoneNumber, password, role = 'student', firstName, lastName } = req.body;
    const normalizedPhone = phoneNumber && String(phoneNumber).trim() !== "" ? String(phoneNumber).trim() : undefined;
    
    const allowedRoles = ['student', 'teacher', 'superuser'];
    const userRole = allowedRoles.includes(role) ? role : 'student';
    
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }
    
    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters long" });
    }
    
    if (!email && !normalizedPhone) {
      return res.status(400).json({ error: "Email or phone number is required" });
    }

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

    if (normalizedPhone) {
      const existingPhone = await storage.getUserByPhone(normalizedPhone);
      if (existingPhone) {
        return res.status(400).json({ error: "Phone number already registered" });
      }
    }

    const modCheck = await checkRegistrationAllowed(username, email);
    if (!modCheck.allowed) {
      return res.status(400).json({ error: modCheck.reason });
    }

    const hashedPassword = await hashPassword(password);
    const user = await storage.createUser({
      username,
      email,
      phoneNumber: normalizedPhone,
      password: hashedPassword,
      role: userRole,
      firstName,
      lastName,
      isVerified: false
    });

    const verificationToken = await generateVerificationToken(user.id);
    const tokens = await generateTokens(user);
    const { password: _, ...userResponse } = user;

    res.status(201).json({
      user: userResponse,
      tokens,
      verificationToken
    });
  } catch (error) {
    next(error);
  }
});

// #region agent log (guarded by DEBUG_AGENT_INGEST; leave unset in production)
const _dbg = process.env.DEBUG_AGENT_INGEST
  ? (m: string, d?: object) => fetch('http://127.0.0.1:7242/ingest/5a811126-3bcf-4744-9ff0-298a7797a469', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'server/routes/auth.ts', message: m, data: d || {}, timestamp: Date.now(), sessionId: 'debug-session', hypothesisId: 'H3' }) }).catch(() => {})
  : () => {};
// #endregion

// #region IP tracking (for account lockout)
interface LoginAttemptRecord {
  attempts: number;
  lastAttempt: Date;
  lockoutUntil?: Date;
}

const loginAttempts = new Map<string, LoginAttemptRecord>();

async function recordFailedLoginAttempt(ip: string) {
  const record = loginAttempts.get(ip);
  const now = new Date();
  
  const newAttempts = (record?.attempts || 0) + 1;
  
  let lockoutUntil: Date | undefined;
  if (newAttempts >= 5) {
    lockoutUntil = new Date(now.getTime() + 15 * 60 * 1000);
  }
  
  loginAttempts.set(ip, {
    attempts: newAttempts,
    lastAttempt: now,
    lockoutUntil,
  });
}

function checkLockoutStatus(ip: string): { locked: boolean; retryAfter?: number } {
  const record = loginAttempts.get(ip);
  
  if (!record) return { locked: false };

  const now = new Date();
  const lockoutUntil = record.lockoutUntil || null;

  if (lockoutUntil && now < lockoutUntil) {
    const retryAfter = Math.ceil((lockoutUntil.getTime() - now.getTime()) / 1000);
    return { locked: true, retryAfter };
  }

  // Reset if lockout expired
  if (lockoutUntil && now >= lockoutUntil) {
    loginAttempts.delete(ip);
  }

  return { locked: false };
}

function clearFailedLogin(ip: string) {
  loginAttempts.delete(ip);
}
// #endregion

// Login user (with account lockout protection)
authRouter.post("/login", authLimiter, async (req, res, next: NextFunction) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  
  const { locked, retryAfter } = checkLockoutStatus(ip);
  if (locked) {
    logSecurityEvent({
      event: 'BLOCKED: Login attempt during lockout',
      level: 'critical',
      ip,
      details: { retryAfter, attempts: retryAfter }
    });
    return res.status(429).json({
      error: "Account temporarily locked due to too many failed login attempts",
      retryAfter,
    });
  }
  
  try {
    _dbg('login attempt', { hasUsername: !!req.body?.username, hasEmail: !!req.body?.email, hasPhone: !!req.body?.phoneNumber });
    const { username, email, phoneNumber, password, identifier } = req.body;
    const resolvedIdentifier = identifier || username || email || phoneNumber || "";

    if (!password) {
      return res.status(400).json({ error: "Password is required" });
    }

    let user: User | undefined;
    if (username) {
      user = await storage.getUserByUsername(username);
    } else if (email) {
      user = await storage.getUserByEmail(email);
    } else if (phoneNumber) {
      user = await storage.getUserByPhone(phoneNumber);
    } else if (identifier) {
      const isEmail = String(identifier).includes("@");
      const isPhone = /^\+?[\d\s-()]+$/.test(String(identifier));
      if (isEmail) {
        user = await storage.getUserByEmail(String(identifier));
      } else if (isPhone) {
        user = await storage.getUserByPhone(String(identifier));
      } else {
        user = await storage.getUserByUsername(String(identifier));
      }
    } else {
      return res.status(400).json({ error: "Username, email, or phone number is required" });
    }

    if (!user) {
      await recordFailedLoginAttempt(ip);
      logSecurityEvent({
        event: 'FAILED: Invalid credentials',
        level: 'warning',
        ip,
        username: username || email || phoneNumber || 'unknown'
      });
      return res.status(401).json({ error: "Invalid credentials" });
    }

    if (!user.isActive) {
      logSecurityEvent({
        event: 'FAILED: Inactive account login attempt',
        level: 'warning',
        ip,
        username: user.username
      });
      return res.status(401).json({ error: "Account is deactivated" });
    }

    const isValidPassword = await comparePassword(password, user.password!);
    if (!isValidPassword) {
      await recordFailedLoginAttempt(ip);
      logSecurityEvent({
        event: 'FAILED: Invalid password',
        level: 'warning',
        ip,
        username: user.username
      });
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Clear failed attempts on successful login
    clearFailedLogin(ip);
    await storage.updateLastLogin(user.id);
    const tokens = await generateTokens(user);
    const { password: _, ...userResponse } = user;
    logSecurityEvent({
      event: 'SUCCESS: Login successful',
      level: 'info',
      ip,
      username: user.username,
      details: { userId: user.id, role: user.role }
    });
    _dbg('login success', { userId: user.id, username: user.username });

    res.json({
      user: userResponse,
      tokens
    });
  } catch (error) {
    next(error);
  }
});

// Refresh access token
authRouter.post("/refresh", async (req, res, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: "Refresh token is required" });
    }

    const decoded = await verifyToken(refreshToken, true);
    if (!decoded) {
      return res.status(401).json({ error: "Invalid or expired refresh token" });
    }

    const user = await storage.getUser(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({ error: "User not found or inactive" });
    }

    const tokens = await generateTokens(user);
    res.json({ tokens });
  } catch (error) {
    next(error);
  }
});

// Logout user
authRouter.post("/logout", authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (req.tokenId) {
      await revokeToken(req.tokenId);
    }
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
});

// Get current user
authRouter.get("/me", authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    _dbg('/me success', { userId: req.user!.id });
    const { password: _, ...userResponse } = req.user!;
    res.json(userResponse);
  } catch (error) {
    next(error);
  }
});

// Upload profile photo (requires terms acceptance)
authRouter.post(
  "/profile-image",
  authenticateToken,
  profileImageUpload.single("photo"),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const acceptedTerms = req.body.acceptedTerms === "true" || req.body.acceptedTerms === true;
      if (!acceptedTerms) {
        return res.status(400).json({
          error: "You must accept the terms to upload a profile photo. Your photo will be visible across the platform.",
        });
      }
      const file = req.file;
      if (!file) {
        return res.status(400).json({ error: "No photo file provided." });
      }
      const profileImage = `/uploads/${file.filename}`;
      const updated = await storage.updateUser(req.user!.id, { profileImage });
      const { password: _, ...userResponse } = updated;
      res.json({ user: userResponse });
    } catch (error) {
      next(error);
    }
  }
);

// Verify email
authRouter.post("/verify-email", async (req, res, next: NextFunction) => {
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
    next(error);
  }
});

// Request password reset
authRouter.post("/forgot-password", passwordResetLimiter, async (req, res, next: NextFunction) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await storage.getUserByEmail(email);
    if (!user) {
      logSecurityEvent({
        event: 'INFO: Password reset requested for non-existent user',
        level: 'info',
        ip: req.ip || req.socket.remoteAddress || 'unknown',
        details: { email }
      });
      return res.json({ message: "If the email exists, a reset link has been sent" });
    }

    const resetToken = await generatePasswordResetToken(user.id);
    
    logSecurityEvent({
      event: 'INFO: Password reset requested',
      level: 'info',
      ip: req.ip || req.socket.remoteAddress || 'unknown',
      username: user.username,
      details: { email: user.email }
    });

    res.json({ 
      message: "Password reset token generated",
      resetToken
    });
  } catch (error) {
    next(error);
  }
});

// Reset password
authRouter.post("/reset-password", async (req, res, next: NextFunction) => {
  try {
    const { token, newPassword } = req.body;
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    
    if (!token || !newPassword) {
      return res.status(400).json({ error: "Token and new password are required" });
    }

    const user = await verifyResetToken(token);
    if (!user) {
      logSecurityEvent({
        event: 'FAILED: Invalid password reset token',
        level: 'warning',
        ip,
        details: { token: token.substring(0, 10) + '...' }
      });
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    const hashedPassword = await hashPassword(newPassword);
    await storage.updateUser(user.id, { password: hashedPassword });
    await storage.revokeAuthToken(token);
    
    passwordResetLogger.resetAttempts(ip);
    
    logSecurityEvent({
      event: 'SUCCESS: Password reset completed',
      level: 'info',
      ip,
      username: user.username,
      details: { userId: user.id }
    });

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    next(error);
  }
});
