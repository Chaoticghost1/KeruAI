import { Router, NextFunction } from "express";
import { createHash } from "crypto";
import { storage } from "../storage";
import {
  insertTutorSessionSchema,
  insertTutorMessageSchema,
} from "@shared/schema";
import { getPersonaByKey } from "@shared/tutorPersonas";
import { AITutorService } from "../ai-service.js";

export const tutorsRouter = Router();

const AI_TIMEOUT_MS = 30000;
/** N8N webhook timeout (ms). Default 90s for slow/local LLMs. Override with N8N_TIMEOUT_MS (max 120s). */
const N8N_TIMEOUT_MS = (() => {
  const env = process.env.N8N_TIMEOUT_MS;
  if (env !== undefined && env !== '') {
    const n = parseInt(env, 10);
    if (!isNaN(n) && n > 0) return Math.min(n, 120000);
  }
  return 90000;
})();

/**
 * Resolve N8N webhook URL for a given tutor persona. Each persona can have its own workflow.
 * Env: N8N_WEBHOOK_<AGENT_KEY> (e.g. N8N_WEBHOOK_MATEMATICO_GUIA, N8N_WEBHOOK_DOCTORA_NOVA).
 * Agent key is normalized to UPPER_SNAKE_CASE for the env var name.
 * Fallback: N8N_PERSONA_CHAT_URL or N8N_WEBHOOK_URL for any agent without a dedicated webhook.
 */
function getN8nWebhookUrlForAgent(agentKey: string): string | undefined {
  const key = agentKey.replace(/-/g, '_').toUpperCase();
  const envVarName = `N8N_WEBHOOK_${key}`;
  const perPersona = process.env[envVarName];
  if (typeof perPersona === 'string' && perPersona.trim()) return perPersona.trim();
  const fallback = process.env.N8N_PERSONA_CHAT_URL || process.env.N8N_WEBHOOK_URL;
  return typeof fallback === 'string' && fallback.trim() ? fallback.trim() : undefined;
}

/** For dev logging: env var name we look up for a given agent (so you can check .env). */
function getN8nWebhookEnvVarName(agentKey: string): string {
  return `N8N_WEBHOOK_${agentKey.replace(/-/g, '_').toUpperCase()}`;
}

const N8N_DEBUG = process.env.N8N_DEBUG === 'true' || process.env.N8N_DEBUG === '1';

/** Try to get a string message from a value (object with output/text/message/content/result, or string). */
function extractMessageFromPayload(value: unknown): string | undefined {
  if (typeof value === 'string' && value.trim().length > 0) return value.trim();
  if (value === null || typeof value !== 'object') return undefined;
  const obj = value as Record<string, unknown>;
  const keys = ['message', 'output', 'text', 'content', 'result', 'response'];
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === 'string' && v.trim().length > 0) return v.trim();
  }
  for (const k of keys) {
    const v = obj[k];
    if (v !== null && typeof v === 'object') {
      const inner = extractMessageFromPayload(v);
      if (inner) return inner;
    }
  }
  return undefined;
}

/**
 * Call N8N webhook and return parsed { message, toolsUsed?, ... } or null.
 * Used for all agents (welcome + chat messages). Supports:
 * - Plain text body (e.g. n8n Respond to Webhook returning raw AI output)
 * - JSON with message/output/text/content/result/response (at any nesting level)
 */
async function callN8nWebhook(
  n8nUrl: string,
  body: {
    studentMessage: string;
    sessionId: number;
    agentKey: string;
    subject: string;
    difficultyLevel: number;
    language: string;
    conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
    studentProfile?: Record<string, unknown>;
  }
): Promise<{ message: string; toolsUsed?: string[]; difficulty?: number; engagement?: number } | null> {
  if (N8N_DEBUG) console.log('[N8N] Calling webhook url=%s', n8nUrl.replace(/\/[^/]+$/, '/...'));
  let res: Response;
  try {
    res = await Promise.race([
      fetch(n8nUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify(body)
      }),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('N8N timeout')), N8N_TIMEOUT_MS))
    ]);
  } catch (err) {
    if (N8N_DEBUG) console.warn('[N8N] Webhook request failed:', err instanceof Error ? err.message : err);
    throw err;
  }
  const rawText = await res.text();
  if (!res.ok) {
    if (N8N_DEBUG || process.env.NODE_ENV !== 'production') {
      console.warn('[N8N] Webhook HTTP %s body=%s', res.status, rawText.slice(0, 400));
    }
    return null;
  }
  const trimmed = rawText ? rawText.trim() : '';
  if (trimmed.length > 0) {
    const first = trimmed.charAt(0);
    if (first !== '{' && first !== '[' && first !== '"') {
      if (N8N_DEBUG) console.log('[N8N] Webhook 200 plain text response, length=%d', trimmed.length);
      return { message: trimmed, toolsUsed: ['n8n-workflow'] };
    }
  }
  let json: unknown;
  try {
    json = trimmed ? JSON.parse(rawText) : {};
  } catch {
    if (N8N_DEBUG || process.env.NODE_ENV !== 'production') {
      console.warn('[N8N] Webhook 200 but invalid JSON. Body (first 400 chars):', rawText.slice(0, 400));
    }
    return null;
  }
  const messageStr = extractMessageFromPayload(json);
  if (!messageStr) {
    if (N8N_DEBUG || process.env.NODE_ENV !== 'production') {
      const obj = (typeof json === 'object' && json !== null ? json : {}) as Record<string, unknown>;
      console.warn('[N8N] Webhook 200 but no message found. Parsed keys:', Object.keys(obj), 'Raw body (first 600 chars):', rawText.slice(0, 600));
    }
    return null;
  }
  if (N8N_DEBUG) console.log('[N8N] Webhook OK message length=%d', messageStr.length);
  const obj = (typeof json === 'object' && json !== null ? json : {}) as Record<string, unknown>;
  const agentResp = obj?.agentResponse ?? obj;
  const resp = (agentResp as Record<string, unknown>) ?? obj;
  return {
    message: messageStr,
    toolsUsed: Array.isArray(resp?.toolsUsed) ? (resp.toolsUsed as string[]) : ['n8n-workflow'],
    difficulty: typeof resp?.difficulty === 'number' ? resp.difficulty : undefined,
    engagement: typeof resp?.engagement === 'number' ? resp.engagement : undefined
  };
}

function normalizeQuestion(text: string): string {
  return text.toLowerCase().trim().replace(/\s+/g, " ").replace(/[^\w\sáéíóúñü]/gi, "");
}

function hashQuestion(normalized: string): string {
  return createHash("sha256").update(normalized).digest("hex");
}

tutorsRouter.get("/", async (req, res, next: NextFunction) => {
  try {
    const agents = await storage.getTutorAgents();
    
    if (!agents || agents.length === 0) {
      return res.json([]);
    }
    
    res.json(agents);
  } catch (error) {
    next(error);
  }
});

tutorsRouter.get("/qa-cache/check", async (req, res, next: NextFunction) => {
  try {
    const hash = req.query.hash as string;
    const sessionId = parseInt(req.query.sessionId as string);
    const agentKey = req.query.agentKey as string;
    if (!hash || isNaN(sessionId) || !agentKey) {
      return res.status(400).json({ error: "hash, sessionId, and agentKey are required" });
    }
    const cached = await storage.getCachedResponse(sessionId, agentKey, hash);
    if (cached) {
      const parsed = JSON.parse(cached.agentResponse);
      return res.json({ cached: true, agentResponse: parsed });
    }
    res.json({ cached: false });
  } catch (error) {
    next(error);
  }
});

tutorsRouter.post("/qa-cache", async (req, res, next: NextFunction) => {
  try {
    const { questionHash, sessionId, agentKey, studentMessage, agentResponse } = req.body;
    if (!questionHash || !sessionId || !agentKey || !studentMessage || agentResponse === undefined) {
      return res.status(400).json({ error: "questionHash, sessionId, agentKey, studentMessage, and agentResponse are required" });
    }
    const responseStr = typeof agentResponse === "string" ? agentResponse : JSON.stringify(agentResponse);
    await storage.saveCachedResponse(sessionId, agentKey, questionHash, studentMessage, responseStr);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

tutorsRouter.get("/:agentKey", async (req, res, next: NextFunction) => {
  try {
    const agentKey = req.params.agentKey;
    
    if (!agentKey || agentKey.trim().length === 0) {
      return res.status(400).json({ error: "Agent key is required" });
    }
    
    const agent = await storage.getTutorAgentByKey(agentKey);
    if (!agent) {
      return res.status(404).json({ error: "Tutor agent not found" });
    }
    
    const persona = getPersonaByKey(agentKey);
    res.json({ agent, persona });
  } catch (error) {
    next(error);
  }
});

tutorsRouter.post("/sessions", async (req, res, next: NextFunction) => {
  try {
    const validatedSession = insertTutorSessionSchema.parse(req.body);
    const session = await storage.createTutorSession(validatedSession);
    
    const language = req.body.language || 'es';
    
    const agent = await storage.getTutorAgent(validatedSession.agentId);
    if (!agent) {
      return res.status(404).json({ error: `Agent not found: ${validatedSession.agentId}` });
    }
    const dbPersona = await storage.getBotPersonaByKey(agent.agentKey);
    const studentProfile = await storage.getStudentProfile(validatedSession.userId);
    const profileContext = studentProfile ? {
      learningStyle: studentProfile.learningStyle,
      preferredDifficulty: studentProfile.preferredDifficulty,
      subjects: studentProfile.subjects,
      strugglingAreas: studentProfile.strugglingAreas
    } : undefined;
    
    const welcomeStudentMessage = validatedSession.topic
      ? (language === 'es'
          ? `Acabo de iniciar una sesión de ${validatedSession.subject} sobre ${validatedSession.topic}. Presentate y hacé una pregunta para empezar.`
          : `I'm starting a ${validatedSession.subject} session focused on ${validatedSession.topic}. Introduce yourself and ask an engaging question to begin.`)
      : (language === 'es'
          ? `Acabo de iniciar una sesión de ${validatedSession.subject}. Presentate y preguntame en qué área quiero profundizar.`
          : `I'm starting a ${validatedSession.subject} session. Introduce yourself and ask what I'd like to explore.`);
    
    const n8nWelcomeUrl = getN8nWebhookUrlForAgent(agent.agentKey);
    let welcomeResponse: { message: string; toolsUsed?: string[] };
    if (n8nWelcomeUrl) {
      try {
        if (N8N_DEBUG) console.log('[N8N] POST welcome → webhook agentKey=%s', agent.agentKey);
        const n8nWelcome = await callN8nWebhook(n8nWelcomeUrl, {
          studentMessage: welcomeStudentMessage,
          sessionId: session.id,
          agentKey: agent.agentKey,
          subject: validatedSession.subject,
          difficultyLevel: validatedSession.difficultyLevel,
          language,
          conversationHistory: [],
          studentProfile: profileContext ?? undefined
        });
        if (n8nWelcome) {
          welcomeResponse = { message: n8nWelcome.message, toolsUsed: n8nWelcome.toolsUsed };
          if (N8N_DEBUG) console.log('[N8N] Welcome from workflow length=%d', n8nWelcome.message.length);
        } else {
          if (process.env.NODE_ENV !== 'production' || N8N_DEBUG) {
            console.warn('[N8N] Welcome webhook returned no message → using in-app AI. See log above for response body.');
          }
          throw new Error('N8N welcome returned no message');
        }
      } catch (n8nErr) {
        if (process.env.NODE_ENV !== 'production' || N8N_DEBUG) {
          console.warn('[N8N] Welcome webhook failed, using in-app AI:', n8nErr instanceof Error ? n8nErr.message : n8nErr);
        }
        welcomeResponse = await Promise.race([
          AITutorService.initializeTutoringSession(
            agent.agentKey,
            validatedSession.subject,
            validatedSession.topic || undefined,
            validatedSession.difficultyLevel,
            language,
            dbPersona ?? undefined,
            profileContext
          ),
          new Promise((_, reject) => setTimeout(() => reject(new Error('AI timeout')), AI_TIMEOUT_MS))
        ]) as { message: string; toolsUsed?: string[] };
      }
    } else {
      welcomeResponse = await Promise.race([
        AITutorService.initializeTutoringSession(
          agent.agentKey,
          validatedSession.subject,
          validatedSession.topic || undefined,
          validatedSession.difficultyLevel,
          language,
          dbPersona ?? undefined,
          profileContext
        ),
        new Promise((_, reject) => setTimeout(() => reject(new Error('AI timeout')), AI_TIMEOUT_MS))
      ]) as { message: string; toolsUsed?: string[] };
    }
    
    try {
      await storage.createTutorMessage({
        sessionId: session.id,
        sender: 'agent',
        message: welcomeResponse.message,
        messageType: 'greeting',
        toolsUsed: welcomeResponse.toolsUsed
      });
    } catch (dbErr) {
      console.error('Failed to save welcome message:', dbErr);
      await storage.createTutorMessage({
        sessionId: session.id,
        sender: 'agent',
        message: language === 'es'
          ? "¡Hola! Estoy listo para ayudarte. ¿En qué puedo asistirte hoy?"
          : "Hello! I'm ready to help you. What can I assist you with today?",
        messageType: 'greeting'
      });
    }
    
    res.json(session);
  } catch (error) {
    next(error);
  }
});

tutorsRouter.get("/sessions/:userId", async (req, res, next: NextFunction) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId) || userId <= 0) {
      return res.status(400).json({ error: "Invalid user ID" });
    }
    
    const sessions = await storage.getUserTutorSessions(userId);
    res.json(sessions);
  } catch (error) {
    next(error);
  }
});

tutorsRouter.patch("/sessions/:sessionId/end", async (req, res, next: NextFunction) => {
  try {
    const sessionId = parseInt(req.params.sessionId);
    
    if (isNaN(sessionId) || sessionId <= 0) {
      return res.status(400).json({ error: "Invalid session ID" });
    }
    
    const session = await storage.getTutorSession(sessionId);
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }
    
    const endedSession = await storage.endTutorSession(sessionId);
    res.json(endedSession);
  } catch (error) {
    next(error);
  }
});

tutorsRouter.post("/messages", async (req, res, next: NextFunction) => {
  try {
    const validatedMessage = insertTutorMessageSchema.parse(req.body);
    
    if (!validatedMessage.message || validatedMessage.message.trim().length === 0) {
      return res.status(400).json({ error: "Message cannot be empty" });
    }
    
    const session = await storage.getTutorSession(validatedMessage.sessionId);
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }
    
    const message = await storage.createTutorMessage(validatedMessage);
    
    if (validatedMessage.sender === 'student') {
      const agent = await storage.getTutorAgent(session.agentId);
      if (!agent) {
        return res.status(404).json({ error: `Agent not found: ${session.agentId}` });
      }

      const normalized = normalizeQuestion(validatedMessage.message);
      const questionHash = hashQuestion(normalized);
      const skipCache = process.env.N8N_SKIP_CACHE === 'true' || process.env.N8N_SKIP_CACHE === '1';
      const cached = skipCache ? null : await storage.getCachedResponse(validatedMessage.sessionId, agent.agentKey, questionHash);
      if (cached) {
        if (process.env.NODE_ENV !== 'production') {
          console.log('[N8N] Skipping webhook: cache hit for agentKey=%s', agent.agentKey);
        }
        const parsed = JSON.parse(cached.agentResponse);
        const agentMessage = await storage.createTutorMessage({
          sessionId: validatedMessage.sessionId,
          sender: 'agent',
          message: parsed.message || parsed,
          messageType: 'explanation',
          toolsUsed: parsed.toolsUsed || ['cached']
        });
        return res.json({ studentMessage: message, agentMessage });
      }

      const dbPersona = await storage.getBotPersonaByKey(agent.agentKey);
      const studentProfile = await storage.getStudentProfile(session.userId);
      const profileContext = studentProfile ? {
        learningStyle: studentProfile.learningStyle,
        preferredDifficulty: studentProfile.preferredDifficulty,
        subjects: studentProfile.subjects,
        strugglingAreas: studentProfile.strugglingAreas
      } : undefined;
      
      const language = req.body.language || 'es';
      
      const sessionHistory = await storage.getSessionMessages(validatedMessage.sessionId);
      const conversationHistory = sessionHistory.map(msg => ({
        sender: msg.sender,
        message: msg.message,
        timestamp: msg.timestamp.toISOString()
      }));

      // Optional: try this persona's N8N webhook first (each tutor can have its own workflow). Falls back to in-app OpenAI/Perplexity if disabled or failing.
      const n8nUrl = getN8nWebhookUrlForAgent(agent.agentKey);
      let aiResponse: { message: string; toolsUsed?: string[]; difficulty?: number; engagement?: number } | null = null;
      if (!n8nUrl) {
        if (process.env.NODE_ENV !== 'production' || N8N_DEBUG) {
          console.log('[N8N] No webhook for agentKey=%s (env: %s). Using in-app AI.', agent.agentKey, getN8nWebhookEnvVarName(agent.agentKey));
        }
      } else {
        try {
          if (N8N_DEBUG) console.log('[N8N] POST message → webhook agentKey=%s', agent.agentKey);
          const n8nResult = await callN8nWebhook(n8nUrl, {
            studentMessage: validatedMessage.message,
            sessionId: validatedMessage.sessionId,
            agentKey: agent.agentKey,
            subject: session.subject,
            difficultyLevel: session.difficultyLevel,
            language,
            conversationHistory: conversationHistory.map(m => ({
              role: m.sender === 'student' ? 'user' as const : 'assistant' as const,
              content: m.message
            })),
            studentProfile: profileContext ?? undefined
          });
          if (n8nResult) {
            aiResponse = {
              message: n8nResult.message,
              toolsUsed: n8nResult.toolsUsed,
              difficulty: n8nResult.difficulty ?? session.difficultyLevel,
              engagement: n8nResult.engagement ?? 4
            };
            if (N8N_DEBUG) console.log('[N8N] Using workflow response length=%d', n8nResult.message.length);
          } else {
            if (process.env.NODE_ENV !== 'production' || N8N_DEBUG) {
              console.warn('[N8N] Webhook returned no message for agentKey=%s → using in-app AI. See log above for response body.', agent.agentKey);
            }
          }
        } catch (n8nErr) {
          console.warn('[N8N] Webhook failed for agentKey=%s → using in-app AI:', agent.agentKey, n8nErr instanceof Error ? n8nErr.message : n8nErr);
        }
      }

      if (!aiResponse) {
        if (process.env.NODE_ENV !== 'production' || N8N_DEBUG) {
          console.log('[N8N] Fallback: in-app AI (OpenAI/Perplexity) for agentKey=%s', agent.agentKey);
        }
        try {
          aiResponse = await Promise.race([
            AITutorService.generateTutorResponse(
            agent.agentKey,
            validatedMessage.message,
            session.subject,
            session.difficultyLevel,
            conversationHistory,
            language,
            dbPersona ?? undefined,
            profileContext
          ),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('AI timeout')), AI_TIMEOUT_MS)
          )
        ]) as { message: string; toolsUsed?: string[] };
        } catch (aiError) {
          console.error('AI Service Error:', aiError);
          aiResponse = {
            message: language === 'es'
              ? "Estoy teniendo problemas para procesar eso ahora mismo. ¿Puedes reformular tu pregunta?"
              : "I'm having trouble processing that right now. Can you rephrase your question?",
            toolsUsed: []
          };
        }
      }

      const agentMessage = await storage.createTutorMessage({
        sessionId: validatedMessage.sessionId,
        sender: 'agent',
        message: aiResponse.message,
        messageType: 'explanation',
        toolsUsed: aiResponse.toolsUsed
      });

      const toCache = JSON.stringify({ message: aiResponse.message, toolsUsed: aiResponse.toolsUsed, difficulty: aiResponse.difficulty, engagement: aiResponse.engagement });
      await storage.saveCachedResponse(validatedMessage.sessionId, agent.agentKey, questionHash, validatedMessage.message, toCache);

      return res.json({ studentMessage: message, agentMessage });
    }
    
    res.json(message);
  } catch (error) {
    next(error);
  }
});

tutorsRouter.get("/sessions/:sessionId/messages", async (req, res, next: NextFunction) => {
  try {
    const sessionId = parseInt(req.params.sessionId);
    
    if (isNaN(sessionId) || sessionId <= 0) {
      return res.status(400).json({ error: "Invalid session ID" });
    }
    
    const session = await storage.getTutorSession(sessionId);
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }
    
    const messages = await storage.getSessionMessages(sessionId);
    res.json(messages);
  } catch (error) {
    next(error);
  }
});
