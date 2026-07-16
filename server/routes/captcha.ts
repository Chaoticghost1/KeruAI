import { Router, type Request, type Response, type NextFunction } from 'express';

const captchaRouter = Router();

captchaRouter.post("/verify", async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: "CAPTCHA token is required" });
    }

    const secretKey = process.env.CAPTCHA_SECRET_KEY;
    if (!secretKey) {
      console.warn("CAPTCHA_SECRET_KEY not configured - CAPTCHA verification skipped");
      return res.json({ success: true });
    }

    const verificationUrl = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
    
    const formData = new URLSearchParams();
    formData.append("secret", secretKey);
    formData.append("response", token);
    formData.append("remoteip", req.ip || req.socket.remoteAddress || "");

    const response = await fetch(verificationUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData
    });

    const result = await response.json();
    
    res.json({
      success: result.success,
      challengeTs: result["challenge_ts"],
      hostname: result.hostname,
      errorCodes: result["error-codes"]
    });
  } catch (error) {
    console.error("CAPTCHA verification error:", error);
    res.status(500).json({ error: "CAPTCHA verification failed" });
  }
});

export default captchaRouter;
