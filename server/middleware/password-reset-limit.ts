import rateLimit from "express-rate-limit";

/** Stricter limit for password reset: 5 requests per hour per email */
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  keyGenerator: (req) => {
    return typeof req.body.email === 'string' ? req.body.email : req.ip;
  },
  validate: { keyGeneratorIpFallback: false },
  message: { error: "Too many password reset attempts. Please try again in 1 hour." },
  standardHeaders: true,
  legacyHeaders: false,
});
