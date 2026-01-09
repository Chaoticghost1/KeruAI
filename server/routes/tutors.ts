import { Router, NextFunction } from "express";
import { storage } from "../storage";
import {
  insertTutorSessionSchema,
  insertTutorMessageSchema,
} from "@shared/schema";
import { getPersonaByKey } from "@shared/tutorPersonas";
import { AITutorService } from "../ai-service.js";

export const tutorsRouter = Router();

const AI_TIMEOUT_MS = 30000;

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
    
    let welcomeResponse;
    try {
      welcomeResponse = await Promise.race([
        AITutorService.initializeTutoringSession(
          agent.agentKey,
          validatedSession.subject,
          validatedSession.topic || undefined,
          validatedSession.difficultyLevel,
          language
        ),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('AI timeout')), AI_TIMEOUT_MS)
        )
      ]) as { message: string; toolsUsed?: string[] };
      
      await storage.createTutorMessage({
        sessionId: session.id,
        sender: 'agent',
        message: welcomeResponse.message,
        messageType: 'greeting',
        toolsUsed: welcomeResponse.toolsUsed
      });
    } catch (aiError) {
      console.error('AI Service Error during session init:', aiError);
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
      
      const language = req.body.language || 'es';
      
      const sessionHistory = await storage.getSessionMessages(validatedMessage.sessionId);
      const conversationHistory = sessionHistory.map(msg => ({
        sender: msg.sender,
        message: msg.message,
        timestamp: msg.timestamp.toISOString()
      }));
      
      let aiResponse;
      try {
        aiResponse = await Promise.race([
          AITutorService.generateTutorResponse(
            agent.agentKey,
            validatedMessage.message,
            session.subject,
            session.difficultyLevel,
            conversationHistory,
            language
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

      const agentMessage = await storage.createTutorMessage({
        sessionId: validatedMessage.sessionId,
        sender: 'agent',
        message: aiResponse.message,
        messageType: 'explanation',
        toolsUsed: aiResponse.toolsUsed
      });

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
