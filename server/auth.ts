import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { storage } from './storage';
import { User, AuthToken, InsertAuthToken } from '@shared/schema';

// JWT Configuration
// SECURITY: JWT secrets must be cryptographically secure in production
// - Secrets should be at least 32 characters long
// - Use cryptographically random values (not dictionary words)
// - Generate secure secrets using: openssl rand -base64 32
// - Set JWT_SECRET and JWT_REFRESH_SECRET in your environment variables
const isDev = process.env.NODE_ENV !== 'production';
const JWT_SECRET = process.env.JWT_SECRET || (isDev ? 'dev-secret-key-change-in-production' : '');
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || (isDev ? 'dev-refresh-secret-change-in-production' : '');

// Validate that secrets are set in production
if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
  throw new Error(
    'CRITICAL SECURITY ERROR: JWT_SECRET and JWT_REFRESH_SECRET must be set in production. ' +
    'Generate secure secrets using: openssl rand -base64 32'
  );
}

const ACCESS_TOKEN_EXPIRES = '15m';
const REFRESH_TOKEN_EXPIRES = '7d';

export interface JWTPayload {
  userId: number;
  email: string;
  role: string;
  tokenId: string;
}

export interface AuthRequest extends Request {
  user?: User;
  tokenId?: string;
}

// Password utilities
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Token utilities
export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export async function generateTokens(user: User): Promise<{ accessToken: string; refreshToken: string; }> {
  // Create access token record
  const accessTokenRecord: InsertAuthToken = {
    userId: user.id,
    token: generateSecureToken(),
    type: 'access',
    expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
  };
  
  // Create refresh token record
  const refreshTokenRecord: InsertAuthToken = {
    userId: user.id,
    token: generateSecureToken(),
    type: 'refresh',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  };

  const [savedAccessToken, savedRefreshToken] = await Promise.all([
    storage.createAuthToken(accessTokenRecord),
    storage.createAuthToken(refreshTokenRecord)
  ]);

  const accessTokenPayload: JWTPayload = {
    userId: user.id,
    email: user.email!,
    role: user.role,
    tokenId: savedAccessToken.token,
  };

  const refreshTokenPayload: JWTPayload = {
    userId: user.id,
    email: user.email!,
    role: user.role,
    tokenId: savedRefreshToken.token,
  };

  const accessToken = jwt.sign(accessTokenPayload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES });
  const refreshToken = jwt.sign(refreshTokenPayload, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES });

  return { accessToken, refreshToken };
}

export async function verifyToken(token: string, isRefresh = false): Promise<JWTPayload | null> {
  try {
    const secret = isRefresh ? JWT_REFRESH_SECRET : JWT_SECRET;
    const decoded = jwt.verify(token, secret) as JWTPayload;
    
    // Check if token exists in database and is not revoked
    const tokenRecord = await storage.getAuthToken(decoded.tokenId);
    if (!tokenRecord || tokenRecord.isRevoked || new Date() > tokenRecord.expiresAt) {
      return null;
    }

    return decoded;
  } catch (error) {
    return null;
  }
}

export async function revokeToken(tokenId: string): Promise<void> {
  await storage.revokeAuthToken(tokenId);
}

export async function revokeAllUserTokens(userId: number): Promise<void> {
  await storage.revokeAllUserTokens(userId);
}

// Middleware for authentication
export async function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  const decoded = await verifyToken(token);
  if (!decoded) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }

  // Get fresh user data
  const user = await storage.getUser(decoded.userId);
  if (!user || !user.isActive) {
    return res.status(403).json({ error: 'User not found or inactive' });
  }

  req.user = user;
  req.tokenId = decoded.tokenId;
  next();
}

// Middleware for role-based authorization
export function authorizeRoles(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
}

// Middleware to ensure user is verified
export function requireVerification(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (!req.user.isVerified) {
    return res.status(403).json({ error: 'Email verification required' });
  }

  next();
}

// Generate verification token
export async function generateVerificationToken(userId: number): Promise<string> {
  const token = generateSecureToken();
  
  const verificationToken: InsertAuthToken = {
    userId,
    token,
    type: 'verification',
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
  };

  await storage.createAuthToken(verificationToken);
  return token;
}

// Generate password reset token
export async function generatePasswordResetToken(userId: number): Promise<string> {
  const token = generateSecureToken();
  
  const resetToken: InsertAuthToken = {
    userId,
    token,
    type: 'reset',
    expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
  };

  await storage.createAuthToken(resetToken);
  return token;
}

// Verify reset token
export async function verifyResetToken(token: string): Promise<User | null> {
  const tokenRecord = await storage.getAuthTokenByToken(token);
  
  if (!tokenRecord || tokenRecord.type !== 'reset' || tokenRecord.isRevoked || new Date() > tokenRecord.expiresAt) {
    return null;
  }

  const user = await storage.getUser(tokenRecord.userId);
  return user || null;
}

// Verify email verification token
export async function verifyEmailToken(token: string): Promise<User | null> {
  const tokenRecord = await storage.getAuthTokenByToken(token);
  
  if (!tokenRecord || tokenRecord.type !== 'verification' || tokenRecord.isRevoked || new Date() > tokenRecord.expiresAt) {
    return null;
  }

  const user = await storage.getUser(tokenRecord.userId);
  return user || null;
}