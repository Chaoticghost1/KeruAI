import "dotenv/config";
import { errorHandler } from './middleware/error-handler';
import { apiLimiter } from './middleware/rate-limit';
import helmet from 'helmet';
import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { maybeStartEmbeddingWorker } from "./embeddingsRunner.js";

const app = express();

// Security headers with Helmet
const isDev = app.get("env") === "development";
app.use(helmet({
                  contentSecurityPolicy: {
                    directives: {
                      defaultSrc: ["'self'"],
                      scriptSrc: isDev
                        ? ["'self'", "'unsafe-inline'", "'unsafe-eval'"]
                        : ["'self'"],
                      styleSrc: ["'self'", "'unsafe-inline'", "https:", "data:"],
                      imgSrc: ["'self'", "data:", "https:", "blob:"],
                      connectSrc: isDev
                        ? ["'self'", "http://127.0.0.1:7242", "http://localhost:*", "http://127.0.0.1:*", "ws:", "wss:"]
                        : ["'self'", "http://127.0.0.1:7242"],
                      fontSrc: ["'self'", "https:", "data:"],
                      objectSrc: ["'none'"],
                      mediaSrc: ["'self'", "https:", "data:"],
                      frameSrc: ["'self'", "https:"]
                    }
                  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  frameguard: { action: "deny" },
  hidePoweredBy: true,
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  ieNoOpen: true,
  noSniff: true,
  originAgentCluster: true,
  permittedCrossDomainPolicies: { permittedPolicies: "none" },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  xssFilter: true
}));

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Rate limit API (150 req/15 min per IP). Auth routes use a stricter limit in auth router.
app.use("/api", apiLimiter);

// #region agent log (guarded by DEBUG_AGENT_INGEST; leave unset in production)
const _dbg = process.env.DEBUG_AGENT_INGEST
  ? (m: string, d?: object) => fetch('http://127.0.0.1:7242/ingest/5a811126-3bcf-4744-9ff0-298a7797a469', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'server/index.ts', message: m, data: d || {}, timestamp: Date.now(), sessionId: 'debug-session', hypothesisId: 'H1' }) }).catch(() => {})
  : () => {};
// #endregion
(async () => {
  _dbg('registerRoutes starting', {});
  await registerRoutes(app);
  _dbg('registerRoutes done, creating server', {});
  const server = createServer(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  maybeStartEmbeddingWorker();

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Port configurable via PORT env (default 5000). Use 3000 if 5000 is reserved on Windows.
  const port = Number(process.env.PORT) || 5000;
  const host = process.env.HOST || "127.0.0.1";
  server.listen(port, host, () => {
    log(`serving on port ${port}`);
    _dbg('server listening', { port, host, env: app.get('env') });
  });
})();
// Error handling middleware - MUST BE LAST
app.use(errorHandler);
