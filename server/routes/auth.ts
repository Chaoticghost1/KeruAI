import { Router } from "express";
import { storage } from "../storage";
import { User } from "@shared/schema";
import {
  authenticateToken,
  generateTokens,
  hashPassword,
  comparePassword,
  generateVerificationToken,
  generatePasswordResetToken,
  verifyEmailToken,
  verifyResetToken,
  revokeToken,
  AuthRequest
} from "../auth";

export const authRouter = Router();

// Register user
authRouter.post("/register", async (req, res) => {
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
authRouter.post("/login", async (req, res) => {
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
authRouter.post("/logout", authenticateToken, async (req: AuthRequest, res) => {
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
authRouter.get("/me", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { password: _, ...userResponse } = req.user!;
    res.json(userResponse);
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ error: "Failed to get user" });
  }
});

// Verify email
authRouter.post("/verify-email", async (req, res) => {
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
authRouter.post("/forgot-password", async (req, res) => {
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
authRouter.post("/reset-password", async (req, res) => {
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
