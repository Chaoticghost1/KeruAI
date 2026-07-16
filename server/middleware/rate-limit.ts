import rateLimit from "express-rate-limit";

/** General API rate limit: 150 requests per 15 minutes per IP */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
  message: { error: "Too many requests. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

/** Stricter limit for auth (login/register): 10 requests per 15 minutes per IP */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Too many attempts. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});
