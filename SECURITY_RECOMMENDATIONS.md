# StudyBuddyAI Security Recommendations

## Overview
This document outlines recommended security enhancements for the StudyBuddyAI authentication system.

---

## 1. Email Verification System

### Status
Currently disabled - users are created with `isVerified: false` but can immediately login.

### Implementation Steps

1. **Setup Email Provider**
   - Sign up with Twilio SendGrid, Mailgun, or Resend
   - Get API key and configure environment variables:
   ```bash
   EMAIL_PROVIDER=sendgrid
   EMAIL_API_KEY=SG.xxxxx
   EMAIL_FROM=noreply@studybuddyai.com
   ```

2. **Add Email Service**
   - Create `server/services/email.ts`
   - Implement `sendVerificationEmail(userId, email, token)`
   - Implement `sendPasswordResetEmail(email, token)`

3. **Update Registration Flow**
   - Auto-generate verification token on registration
   - Send verification email with link containing token
   - Set `isVerified: false` until email clicked

4. **Configure Frontend**
   - Add "Check your email" message on registration
   - Add "Resend verification email" option
   - Show verification status in profile

### Code Example
```typescript
// server/services/email.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(
  userId: number,
  email: string,
  token: string
) {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  
  await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Verify your StudyBuddyAI account',
    html: `
      <h1>Welcome to StudyBuddyAI!</h1>
      <p>Please verify your email by clicking:</p>
      <a href="${verificationUrl}">Verify Email</a>
      <p>This link expires in 24 hours.</p>
    `
  });
}
```

---

## 2. Account Lockout After Failed Attempts

### Status
Not implemented - unlimited login attempts possible.

### Implementation Steps

1. **Create Failed Login Tracking Table**
   - Add `failed_logins` table to track attempts per IP/user
   - Fields: `ip_address`, `attempts`, `last_attempt`, `locked_until`

2. **Update Login Route**
   - Check if IP/user is currently locked
   - On failed login: increment counter
   - On 5+ failed attempts: set `locked_until` to 15min from now
   - On successful login: reset counter

3. **Rate Limiting Enhancement**
   - After lockout, return `429 Too Many Requests` with retry-after timestamp

### Example Logic
```typescript
// server/middleware/account-lockout.ts
export function checkLockout(ip: string) {
  const record = await storage.getFailedLogin(ip);
  
  if (!record) return { locked: false, remaining: 0 };
  
  if (record.lockedUntil > new Date()) {
    return { 
      locked: true, 
      retryAfter: Math.ceil((record.lockedUntil.getTime() - Date.now()) / 1000) 
    };
  }
  
  // Reset if lockout expired
  await storage.clearFailedLogin(ip);
  return { locked: false, remaining: 5 };
}

export function recordFailedAttempt(ip: string) {
  const record = await storage.getFailedLogin(ip) || { attempts: 0 };
  
  if (record.attempts >= 5) {
    await storage.updateFailedLogin(ip, record.attempts, new Date(Date.now() + 15 * 60 * 1000));
    return { locked: true, retryAfter: 900 };
  }
  
  await storage.updateFailedLogin(ip, record.attempts + 1, null);
  return { locked: false, remaining: 5 - record.attempts - 1 };
}
```

### Configuration
```bash
# Environment variables
FAILED_ATTEMPTS_THRESHOLD=5
LOCKOUT_DURATION=15  # minutes
```

---

## 3. Password Reset Rate Limiting

### Status
Not implemented - `/forgot-password` can be spammed.

### Implementation Steps

1. **Add Rate Limiter to Forgot Password**
   - Use existing `authLimiter` or create stricter limit
   - Limit: 3-5 requests per email per hour

2. **Per-User Throttling**
   - Track reset requests per email address
   - Even if IP changes, limit per email

3. **Rate Limiting Implementation**
```typescript
// server/middleware/password-reset-limit.ts
import rateLimit from "express-rate-limit";

export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 requests per hour
  keyGenerator: (req) => {
    // Rate limit per email, not IP
    return req.body.email || req.ip;
  },
  message: { error: "Too many password reset attempts. Please try again in 1 hour." },
  standardHeaders: true,
  legacyHeaders: false,
});

// In routes/auth.ts
authRouter.post("/forgot-password", passwordResetLimiter, ...);
```

---

## 4. CAPTCHA After Failed Attempts

### Status
Not implemented.

### Implementation Steps

1. **Choose CAPTCHA Provider**
   - reCAPTCHA v2/v3 (Google)
   - hCaptcha
   - Cloudflare Turnstile (free, privacy-friendly)

2. **Add CAPTCHA to Login/Register**
   - After 3 failed attempts: show CAPTCHA challenge
   - Before CAPTCHA: block with "Too many attempts" message

3. **Implementation Example**
```typescript
// server/middleware/captcha.ts
import crypto from 'crypto';

export async function verifyCaptcha(token: string): Promise<boolean> {
  const secretKey = process.env.CAPTCHA_SECRET_KEY;
  
  const response = await fetch(
    `https://challenges.cloudflare.com/turnstile/v0/siteverify`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: secretKey!,
        response: token,
        remoteip: req.ip
      })
    }
  );
  
  const result = await response.json();
  return result.success;
}

export function requireCaptcha(req: Request, res: Response, next: NextFunction) {
  const attempts = req.session?.failedAttempts || 0;
  
  if (attempts >= 3) {
    if (!req.body.captchaToken) {
      return res.status(400).json({ error: "CAPTCHA required", needsCaptcha: true });
    }
    
    if (!await verifyCaptcha(req.body.captchaToken)) {
      return res.status(403).json({ error: "CAPTCHA verification failed" });
    }
  }
  
  next();
}
```

4. **Frontend Integration**
```tsx
// client/src/pages/auth-page.tsx
const [needsCaptcha, setNeedsCaptcha] = useState(false);
const [captchaToken, setCaptchaToken] = useState('');

{needsCaptcha && (
  <Turnstile
    siteKey={process.env.NEXT_PUBLIC_CAPTCHA_SITE_KEY!}
    onChange={(token) => setCaptchaToken(token)}
  />
)}
```

---

## 5. Two-Factor Authentication (2FA)

### Status
Not implemented.

### Implementation Steps

1. **Choose 2FA Method**
   - TOTP (Google Authenticator, Authy)
   - SMS-based (Twilio)
   - Email-based (less secure but easier)

2. **Database Schema**
```sql
ALTER TABLE users ADD COLUMN two_factor_secret TEXT;
ALTER TABLE users ADD COLUMN two_factor_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN two_factor_backup_codes JSONB;
```

3. **Implementation Flow**
```typescript
// Enable 2FA
1. Generate secret using speakeasy.generate()
2. Show QR code to user
3. User enters 6-digit code
4. If valid, set two_factor_enabled = true

// Login with 2FA
1. User enters username/password
2. If valid, check two_factor_enabled
3. If enabled, return { requires2FA: true }
4. User enters 6-digit code
5. If valid, issue tokens
```

4. **Security Considerations**
   - Generate backup codes (10x 8-character codes)
   - Store backup codes hashed
   - Allow user to regenerate codes
   - Offer recovery options (trusted device, backup email)

---

## 6. Security Headers

### Status
Not fully implemented.

### Implementation Steps

1. **Install Helmet**
```bash
npm install helmet
```

2. **Configure Security Headers**
```typescript
// server/index.ts
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: { policy: "same-site" },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: "deny" },
  hidePoweredBy: true,
  hmacCors: false,
  httpStrictTransportSecurity: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  ieNoOpen: true,
  noSniff: true,
  originAgentCluster: true,
  permittedCrossDomainPolicies: { permittedPolicies: "none" },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  xssFilter: true,
}));
```

3. **Additional Headers**
```typescript
// Add custom security headers
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});
```

---

## 7. Input Validation & Sanitization

### Status
Basic validation exists, but could be stronger.

### Recommendations

1. **Use Zod for All Inputs**
   - Validate request body schemas
   - Sanitize HTML content
   - Validate email/format

2. **Example Schema**
```typescript
import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").optional(),
  email: z.string().email("Invalid email").optional(),
  phoneNumber: z.string().min(10, "Invalid phone number").optional(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  captchaToken: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
```

3. **Request Validation Middleware**
```typescript
export function validate(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      return res.status(400).json({ error: "Invalid input", details: error });
    }
  };
}

// Usage
authRouter.post("/login", validate(loginSchema), loginHandler);
```

---

## 8. Session Management

### Status
Basic token refresh implemented.

### Recommendations

1. **Token Rotation**
   - Issue new refresh token on each refresh
   - Revoke old token
   - Prevent token replay attacks

2. **Session Activity Tracking**
   ```sql
   ALTER TABLE auth_tokens ADD COLUMN lastUsedAt TIMESTAMP;
   ```
   - Update `lastUsedAt` on each token use
   - Invalidate tokens unused for 30 days

3. **Active Session Management**
   - Allow users to view active sessions
   - Allow users to sign out from all devices
   - Show login locations/time

---

## 9. Monitoring & Alerting

### Recommendations

1. **Log Security Events**
   ```typescript
   // Log failed logins, password resets, role changes
   logger.info('auth:failed_login', { 
     ip: req.ip,
     username: req.body.username,
     reason: 'invalid_password' 
   });
   ```

2. **Alert on Suspicious Activity**
   - Multiple failed logins from same IP
   - New country/region login
   - Role changes (if superuser)
   - Unusual request patterns

3. **Use Logging Service**
   - Sentry (error tracking)
   - Logflare/Logtail (log aggregation)
   - Datadog (monitoring + alerts)

---

## 10. Database Security

### Recommendations

1. **Environment Variables**
   - Use `.env` file (gitignored)
   - Never commit to version control
   - Use secrets manager in production (AWS Secrets Manager, HashiCorp Vault)

2. **Database Connection**
   - Use SSL/TLS for production DB connections
   - Restrict database access to app server IP only
   - Use least-privilege database user

3. **Backup Strategy**
   - Automatic daily backups
   - Encrypt backups
   - Test restore procedures monthly

---

## Implementation Priority

### 🔴 Critical (Do First)
1. ✅ JWT secret validation (DONE)
2. ✅ Password policy (DONE)
3. ✅ Role validation (DONE)
4. **Password reset rate limiting**
5. **Account lockout**
6. **Security headers**

### 🟡 High Priority (Do Soon)
7. Email verification system
8. CAPTCHA after failed attempts
9. Input validation enhancement

### 🟢 Medium Priority (Plan For)
10. Two-factor authentication
11. Session management improvements
12. Monitoring & alerting

---

## Testing Checklist

After implementing security features, test:
- [ ] Rate limiting works (try 6+ attempts)
- [ ] Captcha appears after 3 failed attempts
- [ ] Account locks out for 15min after 5 failures
- [ ] Password reset limited to 5/hour per email
- [ ] emails sent for verification/password reset
- [ ] 2FA flow works correctly
- [ ] Security headers present in response
- [ ] Input validation rejects invalid data
- [ ] Revoked tokens cannot be used
- [ ] Expired tokens rejected

---

## References

- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [OWASP Rate Limiting Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Rate_Limiting_Cheat_Sheet.html)
- [JWT Security Best Practices](https://auth0.com/docs/security/tokens/jwt-security)
