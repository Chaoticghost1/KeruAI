import { type Request, type Response, type NextFunction } from 'express';

interface SecurityEvent {
  timestamp: string;
  event: string;
  level: 'info' | 'warning' | 'critical';
  ip?: string;
  username?: string;
  details?: Record<string, unknown>;
}

const securityEvents: SecurityEvent[] = [];

export function logSecurityEvent(event: Omit<SecurityEvent, 'timestamp'>): void {
  const securityEvent: SecurityEvent = {
    ...event,
    timestamp: new Date().toISOString()
  };
  securityEvents.push(securityEvent);
  
  const logLevel = event.level.toUpperCase();
  console.log(`[${logLevel}] ${event.event} - IP: ${event.ip || 'N/A'} - ${event.username ? `User: ${event.username}` : ''}`);
  
  if (event.details) {
    console.log(`  Details: ${JSON.stringify(event.details)}`);
  }
}

export function getSecurityEvents(): SecurityEvent[] {
  return securityEvents.slice(-100);
}

export function clearSecurityEvents(): void {
  securityEvents.length = 0;
}

export function securityLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    if (res.statusCode >= 400) {
      logSecurityEvent({
        event: 'HTTP Error Response',
        level: res.statusCode >= 500 ? 'critical' : 'warning',
        ip: req.ip || req.connection.remoteAddress,
        details: {
          method: req.method,
          path: req.path,
          statusCode: res.statusCode,
          duration: `${duration}ms`
        }
      });
    }
  });
  
  next();
}

export function resetPasswordLogger(): {
  trackAttempt: (ip: string, username: string, success: boolean) => void;
  getLockoutStatus: (ip: string) => { locked: boolean; attempts: number; until?: Date };
  resetAttempts: (ip: string) => void;
} {
  const attemptsMap = new Map<string, { count: number; latestFailure: Date; lockedUntil?: Date }>();
  
  const LOCKOUT_DURATION = 15 * 60 * 1000;
  const MAX_ATTEMPTS = 5;
  
  function trackAttempt(ip: string, username: string, success: boolean): void {
    const now = Date.now();
    const record = attemptsMap.get(ip);
    
    if (record && record.lockedUntil && now < record.lockedUntil.getTime()) {
      if (!success) {
        logSecurityEvent({
          event: 'BLOCKED: Account locked',
          level: 'critical',
          ip,
          username,
          details: { reason: 'Account lockout active', attempts: record.count }
        });
      }
      return;
    }
    
    if (success) {
      attemptsMap.delete(ip);
      logSecurityEvent({
        event: 'SUCCESS: Password reset',
        level: 'info',
        ip,
        username
      });
    } else {
      const currentAttempts = record ? record.count + 1 : 1;
      attemptsMap.set(ip, { count: currentAttempts, latestFailure: new Date() });
      
      logSecurityEvent({
        event: 'FAILED: Password reset attempt',
        level: currentAttempts >= MAX_ATTEMPTS ? 'critical' : 'warning',
        ip,
        username,
        details: { attempts: currentAttempts }
      });
      
      if (currentAttempts >= MAX_ATTEMPTS) {
        attemptsMap.set(ip, { 
          count: currentAttempts, 
          latestFailure: new Date(), 
          lockedUntil: new Date(now + LOCKOUT_DURATION) 
        });
        logSecurityEvent({
          event: 'LOCKOUT: Account locked due to failed attempts',
          level: 'critical',
          ip,
          username,
          details: { attempts: currentAttempts, duration: `${LOCKOUT_DURATION / 1000 / 60}min` }
        });
      }
    }
  }
  
  function getLockoutStatus(ip: string): { locked: boolean; attempts: number; until?: Date } {
    const record = attemptsMap.get(ip);
    const now = Date.now();
    
    if (!record) {
      return { locked: false, attempts: 0 };
    }
    
    if (record.lockedUntil && now < record.lockedUntil.getTime()) {
      return { 
        locked: true, 
        attempts: record.count, 
        until: record.lockedUntil 
      };
    }
    
    attemptsMap.delete(ip);
    return { locked: false, attempts: 0 };
  }
  
  function resetAttempts(ip: string): void {
    attemptsMap.delete(ip);
  }
  
  return { trackAttempt, getLockoutStatus, resetAttempts };
}

export const passwordResetLogger = resetPasswordLogger();
