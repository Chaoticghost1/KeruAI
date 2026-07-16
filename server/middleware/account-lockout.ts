import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';

const FAILED_ATTEMPTS_THRESHOLD = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds

export interface FailedLoginRecord {
  ip: string;
  attempts: number;
  lastAttempt: Date;
  lockedUntil: Date | null;
}

export async function getFailedLoginRecord(ip: string): Promise<FailedLoginRecord | null> {
  const record = await storage.getSystemSetting(`failed_login_${ip}`);
  
  if (!record || typeof record !== 'object') {
    return null;
  }

  return {
    ip: ip,
    attempts: (record as any).attempts || 0,
    lastAttempt: new Date((record as any).lastAttempt),
    lockedUntil: (record as any).lockedUntil ? new Date((record as any).lockedUntil) : null,
  };
}

export async function recordFailedAttempt(ip: string): Promise<void> {
  const record = await getFailedLoginRecord(ip);
  const now = new Date();

  let newAttempts = 1;
  let newLockedUntil: Date | null = null;

  if (record) {
    newAttempts = record.attempts + 1;

    // If already locked, extend lockout
    if (record.lockedUntil && record.lockedUntil > now) {
      newLockedUntil = record.lockedUntil;
    }
  }

  // If threshold reached, lock account
  if (newAttempts >= FAILED_ATTEMPTS_THRESHOLD) {
    newLockedUntil = new Date(now.getTime() + LOCKOUT_DURATION);
  }

  await storage.setSystemSetting(`failed_login_${ip}`, {
    ip,
    attempts: newAttempts,
    lastAttempt: now.toISOString(),
    lockedUntil: newLockedUntil?.toISOString() || null,
  });
}

export async function clearFailedLoginRecord(ip: string): Promise<void> {
  await storage.setSystemSetting(`failed_login_${ip}`, null);
}

export async function checkLockout(ip: string): Promise<{ locked: boolean; retryAfter?: number }> {
  const record = await getFailedLoginRecord(ip);
  
  if (!record) {
    return { locked: false };
  }

  const now = new Date();

  // Check if lockout expired
  if (record.lockedUntil && now < record.lockedUntil) {
    const retryAfter = Math.ceil((record.lockedUntil.getTime() - now.getTime()) / 1000);
    return { locked: true, retryAfter };
  }

  // Reset if lockout expired
  if (record.lockedUntil && now >= record.lockedUntil) {
    await clearFailedLoginRecord(ip);
    return { locked: false };
  }

  return { locked: false };
}

export function lockoutMiddleware(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  
  return checkLockout(ip).then(({ locked, retryAfter }) => {
    if (locked) {
      return res.status(429).json({
        error: "Account temporarily locked due to too many failed login attempts",
        retryAfter,
      });
    }
    
    next();
  }).catch(() => next());
}

export function recordFailedAttemptMiddleware(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  
  return recordFailedAttempt(ip).then(() => {
    next();
  }).catch(() => next());
}
