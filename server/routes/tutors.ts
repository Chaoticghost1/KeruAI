import { Router } from "express";
import { storage } from "../storage";
import {
  insertTutorSessionSchema,
  insertTutorMessageSchema,
} from "@shared/schema";
import { getPersonaByKey } from "@shared/tutorPersonas";
import { AITutorService } from "../ai-service.js";

export const tutorsRouter = Router();

tutorsRouter.get("/", async (req, res) => {
  try {
    const agents = await storage.getTutorAgents();
    res.json(agents);
  } catch (error) {
    console.error('Error fetching tutors:', error);
    res.status(500).json({ error: "Error fetching tutor agents" });
  }
});

tutorsRouter.get("/:agentKey", async (req, res) => {
  try {
    const agentKey = req.params.agentKey;
    const agent = await storage.getTutorAgentByKey(agentKey);
    if (!agent) {
      return res.status(404).json({ error: "Tutor agent not found" });
    }
    const persona = getPersonaByKey(agentKey);
    res.json({ agent, persona });
  } catch (error) {
    res.status(400).json({ error: "Error fetching tutor agent" });
  }
});

tutorsRouter.post("/sessions", async (req, res) => {
  try {
    const validatedSession = insertTutorSessionSchema.parse(req.body);
    const session = await storage.createTutorSession(validatedSession);
    
    const language = req.body.language || 'es';
    
    try {
      const agent = await storage.getTutorAgent(validatedSession.agentId);
      if (!agent) {
        throw new Error(`Agent not found: ${validatedSession.agentId}`);
      }
      
      const welcomeResponse = await AITutorService.initializeTutoringSession(
        agent.agentKey,
        validatedSession.subject,
        validatedSession.topic || undefined,
        validatedSession.difficultyLevel,
        language
      );
      
      await storage.createTutorMessage({
        sessionId: session.id,
        sender: 'agent',
        message: welcomeResponse.message,
        messageType: 'greeting',
        toolsUsed: welcomeResponse.toolsUsed
      });
    } catch (aiError) {
      const errorMessage = aiError instanceof Error ? aiError.message : 'Unknown error';
      console.warn('Failed to generate welcome message:', errorMessage);
    }
    
    res.json(session);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error creating tutor session:', errorMessage);
    res.status(500).json({ error: "Failed to create session" });
  }
});

tutorsRouter.get("/sessions/:userId", async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const sessions = await storage.getUserTutorSessions(userId);
    res.json(sessions);
  } catch (error) {
    res.status(400).json({ error: "Error fetching tutor sessions" });
  }
});

tutorsRouter.patch("/sessions/:sessionId/end", async (req, res) => {
  try {
    const sessionId = parseInt(req.params.sessionId);
    const endedSession = await storage.endTutorSession(sessionId);
    res.json(endedSession);
  } catch (error) {
    res.status(400).json({ error: "Error ending session" });
  }
});

tutorsRouter.post("/messages", async (req, res) => {
  try {
    const validatedMessage = insertTutorMessageSchema.parse(req.body);
    const message = await storage.createTutorMessage(validatedMessage);
    
    if (validatedMessage.sender === 'student') {
      try {
        const session = await storage.getTutorSession(validatedMessage.sessionId);
        if (session) {
          const agent = await storage.getTutorAgent(session.agentId);
          if (!agent) {
            throw new Error(`Agent not found: ${session.agentId}`);
          }
          
          const language = req.body.language || 'es';
          
          const sessionHistory = await storage.getSessionMessages(validatedMessage.sessionId);
          const conversationHistory = sessionHistory.map(msg => ({
            sender: msg.sender,
            message: msg.message,
            timestamp: msg.timestamp.toISOString()
          }));
          
          const aiResponse = await AITutorService.generateTutorResponse(
            agent.agentKey,
            validatedMessage.message,
            session.subject,
            session.difficultyLevel,
            conversationHistory,
            language
          );

          const agentMessage = await storage.createTutorMessage({
            sessionId: validatedMessage.sessionId,
            sender: 'agent',
            message: aiResponse.message,
            messageType: 'explanation',
            toolsUsed: aiResponse.toolsUsed
          });

          return res.json({ studentMessage: message, agentMessage });
        }
      } catch (aiError) {
        console.error('AI response generation failed:', aiError);
      }
    }
    
    res.json(message);
  } catch (error) {
    res.status(400).json({ error: "Invalid message data" });
  }
});

tutorsRouter.get("/sessions/:sessionId/messages", async (req, res) => {
  try {
    const sessionId = parseInt(req.params.sessionId);
    const messages = await storage.getSessionMessages(sessionId);
    res.json(messages);
  } catch (error) {
    res.status(400).json({ error: "Error fetching session messages" });
  }
});
