import OpenAI from "openai";
import { tutorPersonas, getPersonaByKey, generatePersonaResponse } from '../shared/tutorPersonas.js';
import { storage } from './storage';

const PERPLEXITY_BASE_URL = 'https://api.perplexity.ai';
const PERPLEXITY_MODEL = 'sonar';

/** Resolve API keys: stored (System Settings) first, then env. Never returns raw keys to callers outside this file. */
export async function getApiKeys(): Promise<{ openai: string | undefined; perplexity: string | undefined }> {
  const stored = await storage.getSystemSetting('api_keys');
  const s = stored && typeof stored === 'object' && !Array.isArray(stored) ? (stored as Record<string, unknown>) : {};
  const openai = typeof s.openai === 'string' && s.openai.trim() ? s.openai.trim() : process.env.OPENAI_API_KEY;
  const perplexity = typeof s.perplexity === 'string' && s.perplexity.trim() ? s.perplexity.trim() : process.env.PERPLEXITY_API_KEY;
  return { openai, perplexity };
}

// Legacy module-level client (used only when getApiKeys not yet needed for a code path)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export interface AITutorResponse {
  message: string;
  toolsUsed: string[];
  difficulty: number;
  engagement: number;
}

/** DB persona (admin-created) for custom system prompt */
export interface DBPersona {
  name: string;
  description?: string | null;
  systemPrompt: string;
}

/** Student profile used to personalize Aprende conmigo AI */
export interface StudentProfileContext {
  learningStyle?: string | null;
  preferredDifficulty?: number;
  subjects?: string[];
  strugglingAreas?: string[];
  /** Display name for revision (Materiales de Estudio) assistant only */
  revisionAssistantName?: string | null;
  /** User's preferred language (es/en) */
  language?: 'es' | 'en' | null;
}

export class AITutorService {
  /**
   * Generate AI-powered tutoring response using OpenAI GPT-5 with Perplexity fallback
   */
  static async generateTutorResponse(
    agentKey: string,
    studentMessage: string,
    subject: string,
    difficultyLevel: number,
    sessionHistory: Array<{ sender: string; message: string; timestamp: string }> = [],
    language: string = 'es',
    dbPersona?: DBPersona | null,
    studentProfile?: StudentProfileContext | null
  ): Promise<AITutorResponse> {
    try {
      // Use DB persona (admin-created) system prompt when provided
      if (dbPersona?.systemPrompt) {
        return this.generateResponseWithDBPersona(dbPersona, studentMessage, subject, difficultyLevel, sessionHistory, language, studentProfile);
      }
      const persona = getPersonaByKey(agentKey);
      if (!persona) {
        throw new Error(`Persona not found: ${agentKey}`);
      }
      const displayName = (studentProfile?.revisionAssistantName?.trim() || persona.name);

      // Build conversation context
      const conversationHistory = sessionHistory
        .slice(-6) // Last 6 messages for context
        .map(msg => `${msg.sender}: ${msg.message}`)
        .join('\n');

      // Get language instruction
      const languageInstruction = language === 'en' 
        ? 'IMPORTANT: Respond in English only.' 
        : 'IMPORTANTE: Responde solo en español.';

      // Create persona-driven system prompt
      const studentProfileBlock = studentProfile && (studentProfile.learningStyle || studentProfile.preferredDifficulty != null || (studentProfile.subjects?.length) || (studentProfile.strugglingAreas?.length))
        ? `
STUDENT PROFILE (use to tailor your response):
- Learning style: ${studentProfile.learningStyle ?? 'not specified'}
- Preferred difficulty: ${studentProfile.preferredDifficulty ?? difficultyLevel}/3
- Subjects: ${(studentProfile.subjects?.length) ? studentProfile.subjects.join(', ') : 'not specified'}
- Struggling areas: ${(studentProfile.strugglingAreas?.length) ? studentProfile.strugglingAreas.join(', ') : 'not specified'}
Adapt your explanations and examples to this student's way of learning.`
        : '';

      const systemPrompt = `You are ${displayName}, ${persona.title}. 

${languageInstruction}

PERSONALITY: ${persona.personality.primaryTraits.join(', ')}
COMMUNICATION STYLE: ${persona.personality.communicationStyle.tone}, ${persona.personality.communicationStyle.formality}
TEACHING APPROACH: ${persona.teachingMethodology.primaryApproach}
SUBJECTS: ${persona.expertise.primarySubjects.join(', ')}

CURRENT SESSION:
- Subject: ${subject}
- Difficulty Level: ${difficultyLevel}/3 (1=Beginner, 2=Intermediate, 3=Advanced)
- Student Question: ${studentMessage}
${studentProfileBlock}

BEHAVIORAL RULES:
${persona.behavioralRules.dos.map(rule => `✓ ${rule}`).join('\n')}
${persona.behavioralRules.donts.map(rule => `✗ ${rule}`).join('\n')}

Respond as ${displayName} would, maintaining your unique personality while providing helpful tutoring. Be encouraging, educational, and match the difficulty level. Keep responses focused and not too lengthy.

Recent conversation context:
${conversationHistory}

Provide your response in JSON format:
{
  "message": "Your tutoring response as ${displayName}",
  "toolsUsed": ["explanation", "example", "encouragement"],
  "difficulty": 1-3,
  "engagement": 1-5
}`;

      const { openai: openaiKey } = await getApiKeys();
      const client = openaiKey ? new OpenAI({ apiKey: openaiKey }) : openai;
      const response = await client.chat.completions.create({
        model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: studentMessage }
        ],
        response_format: { type: "json_object" },
        max_completion_tokens: 1500
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error('No content in OpenAI response');
      }
      const result = JSON.parse(content);
      
      return {
        message: result.message || "I'm here to help you learn! What would you like to explore?",
        toolsUsed: Array.isArray(result.toolsUsed) ? result.toolsUsed : ["explanation"],
        difficulty: Math.max(1, Math.min(3, result.difficulty || difficultyLevel)),
        engagement: Math.max(1, Math.min(5, result.engagement || 3))
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.warn('OpenAI API unavailable:', errorMessage);
      console.log('Trying Perplexity AI as fallback...');
      
      // Try Perplexity AI as fallback
      try {
        return await this.generatePerplexityResponse(agentKey, studentMessage, subject, difficultyLevel, sessionHistory, language, dbPersona, studentProfile);
      } catch (perplexityError) {
        const perplexityErrorMessage = perplexityError instanceof Error ? perplexityError.message : 'Unknown error';
        console.warn('Perplexity AI unavailable:', perplexityErrorMessage);
        
        // Final fallback to rule-based persona response
        const persona = dbPersona || getPersonaByKey(agentKey);
        const fallbackName = (studentProfile?.revisionAssistantName?.trim() || persona?.name);
        const fallbackMessage = language === 'en' 
          ? (fallbackName 
            ? `Hello! I'm ${fallbackName}. I'm here to help you with ${subject}. While our AI system is temporarily unavailable, I can still provide basic guidance. What would you like to learn about?`
            : "I'm here to help you learn! While our AI system is temporarily unavailable, feel free to ask your question and I'll do my best to assist you.")
          : (fallbackName 
            ? `¡Hola! Soy ${fallbackName}. Estoy aquí para ayudarte con ${subject}. Aunque nuestro sistema de IA no está disponible temporalmente, aún puedo proporcionarte orientación básica. ¿Qué te gustaría aprender?`
            : "¡Estoy aquí para ayudarte a aprender! Aunque nuestro sistema de IA no está disponible temporalmente, siéntete libre de hacer tu pregunta e intentaré ayudarte.");

        return {
          message: fallbackMessage,
          toolsUsed: ["rule-based-fallback"],
          difficulty: difficultyLevel,
          engagement: 3
        };
      }
    }
  }

  /** Generate response using admin-created DB persona (systemPrompt only) */
  static async generateResponseWithDBPersona(
    dbPersona: DBPersona,
    studentMessage: string,
    subject: string,
    difficultyLevel: number,
    sessionHistory: Array<{ sender: string; message: string; timestamp: string }>,
    language: string = 'es',
    studentProfile?: StudentProfileContext | null
  ): Promise<AITutorResponse> {
    const conversationHistory = sessionHistory
      .slice(-6)
      .map(msg => `${msg.sender}: ${msg.message}`)
      .join('\n');
    const languageInstruction = language === 'en' 
      ? 'IMPORTANT: Respond in English only.' 
      : 'IMPORTANTE: Responde solo en español.';
    const profileBlock = studentProfile && (studentProfile.learningStyle || studentProfile.subjects?.length || studentProfile.strugglingAreas?.length)
      ? `\nSTUDENT PROFILE: Learning style: ${studentProfile.learningStyle ?? 'not specified'}. Subjects: ${(studentProfile.subjects?.length) ? studentProfile.subjects.join(', ') : 'not specified'}. Struggling areas: ${(studentProfile.strugglingAreas?.length) ? studentProfile.strugglingAreas.join(', ') : 'not specified'}. Adapt explanations to this student.\n`
      : '';
    const systemPrompt = `${dbPersona.systemPrompt}

${languageInstruction}
${profileBlock}
CURRENT SESSION:
- Subject: ${subject}
- Difficulty Level: ${difficultyLevel}/3 (1=Beginner, 2=Intermediate, 3=Advanced)
- Student Question: ${studentMessage}

Recent conversation context:
${conversationHistory}

Provide your response in JSON format:
{
  "message": "Your tutoring response as ${dbPersona.name}",
  "toolsUsed": ["explanation", "example", "encouragement"],
  "difficulty": 1-3,
  "engagement": 1-5
}`;
    try {
      const { openai: openaiKey } = await getApiKeys();
      const client = openaiKey ? new OpenAI({ apiKey: openaiKey }) : openai;
      const response = await client.chat.completions.create({
        model: "gpt-5",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: studentMessage }
        ],
        response_format: { type: "json_object" },
        max_completion_tokens: 1500
      });
      const content = response.choices[0].message.content;
      if (!content) throw new Error('No content in OpenAI response');
      const result = JSON.parse(content);
      return {
        message: result.message || "I'm here to help you learn!",
        toolsUsed: Array.isArray(result.toolsUsed) ? result.toolsUsed : ["explanation"],
        difficulty: Math.max(1, Math.min(3, result.difficulty || difficultyLevel)),
        engagement: Math.max(1, Math.min(5, result.engagement || 3))
      };
    } catch (error) {
      const fallbackMessage = language === 'en'
        ? `Hello! I'm ${dbPersona.name}. I'm here to help with ${subject}. What would you like to learn?`
        : `¡Hola! Soy ${dbPersona.name}. Estoy aquí para ayudarte con ${subject}. ¿Qué te gustaría aprender?`;
      return {
        message: fallbackMessage,
        toolsUsed: ["rule-based-fallback"],
        difficulty: difficultyLevel,
        engagement: 3
      };
    }
  }

  /**
   * Generate tutoring response using Perplexity AI
   */
  static async generatePerplexityResponse(
    agentKey: string,
    studentMessage: string,
    subject: string,
    difficultyLevel: number,
    sessionHistory: Array<{ sender: string; message: string; timestamp: string }> = [],
    language: string = 'es',
    dbPersona?: DBPersona | null,
    studentProfile?: StudentProfileContext | null
  ): Promise<AITutorResponse> {
    let systemPrompt: string;
    const conversationHistory = sessionHistory
      .slice(-4)
      .map(msg => `${msg.sender}: ${msg.message}`)
      .join('\n');
    const languageInstruction = language === 'en' 
      ? 'IMPORTANT: Respond in English only.' 
      : 'IMPORTANTE: Responde solo en español.';

    if (dbPersona?.systemPrompt) {
      systemPrompt = `${dbPersona.systemPrompt}\n\n${languageInstruction}\n\nCURRENT SESSION:\n- Subject: ${subject}\n- Difficulty Level: ${difficultyLevel}/3\n- Student Question: ${studentMessage}\n\nRecent conversation:\n${conversationHistory}\n\nProvide a helpful tutoring response.`;
    } else {
      const persona = getPersonaByKey(agentKey);
      if (!persona) throw new Error(`Persona not found: ${agentKey}`);
      const displayName = (studentProfile?.revisionAssistantName?.trim() || persona.name);
      systemPrompt = `You are ${displayName}, ${persona.title}. 

${languageInstruction}

PERSONALITY: ${persona.personality.primaryTraits.join(', ')}
COMMUNICATION STYLE: ${persona.personality.communicationStyle.tone}, ${persona.personality.communicationStyle.formality}
TEACHING APPROACH: ${persona.teachingMethodology.primaryApproach}
SUBJECTS: ${persona.expertise.primarySubjects.join(', ')}

CURRENT SESSION:
- Subject: ${subject}
- Difficulty Level: ${difficultyLevel}/3 (1=Beginner, 2=Intermediate, 3=Advanced)
- Student Question: ${studentMessage}

BEHAVIORAL RULES:
${persona.behavioralRules.dos.map(rule => `✓ ${rule}`).join('\n')}
${persona.behavioralRules.donts.map(rule => `✗ ${rule}`).join('\n')}

Respond as ${displayName} would, maintaining your unique personality while providing helpful tutoring. Be encouraging, educational, and match the difficulty level. Keep responses focused and educational.

Recent conversation:
${conversationHistory}

Provide a helpful tutoring response that includes factual, up-to-date information when relevant.`;
    }

    const { perplexity: perplexityKey } = await getApiKeys();
    const pKey = perplexityKey || process.env.PERPLEXITY_API_KEY;
    if (!pKey) throw new Error('Perplexity API key not configured. Set it in Admin → System Settings → Integration Status.');

    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: studentMessage }
    ];

    const response = await fetch(`${PERPLEXITY_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${pKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: PERPLEXITY_MODEL,
        messages,
        max_tokens: 1000,
        temperature: 0.2,
        top_p: 0.9,
        return_images: false,
        return_related_questions: false,
        search_recency_filter: "month",
        stream: false
      })
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`Perplexity API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content in Perplexity response');
    }

    return {
      message: content,
      toolsUsed: ["perplexity-ai", "explanation", "factual-search"],
      difficulty: difficultyLevel,
      engagement: 4 // Perplexity often provides engaging, factual responses
    };
  }

  /**
   * Get available tutor agents from personas
   */
  static getAvailableTutors() {
    return tutorPersonas.map(persona => ({
      id: persona.agentKey, // Use agentKey as ID for consistency
      agentKey: persona.agentKey,
      name: persona.name,
      title: persona.title,
      avatar: persona.avatar,
      subjects: persona.subjects,
      description: persona.description,
      isActive: true
    }));
  }

  /**
   * Initialize a tutoring session with welcome message
   */
  static async initializeTutoringSession(
    agentKey: string,
    subject: string,
    topic?: string,
    difficultyLevel: number = 2,
    language: string = 'es',
    dbPersona?: DBPersona | null,
    studentProfile?: StudentProfileContext | null
  ): Promise<AITutorResponse> {
    if (!dbPersona) {
      const persona = getPersonaByKey(agentKey);
      if (!persona) throw new Error(`Persona not found: ${agentKey}`);
    }

    const welcomePrompt = topic 
      ? `I'm starting a ${subject} tutoring session focused on ${topic}. Please introduce yourself and ask an engaging question to begin.`
      : `I'm starting a ${subject} tutoring session. Please introduce yourself and ask what specific area I'd like to explore.`;

    return this.generateTutorResponse(agentKey, welcomePrompt, subject, difficultyLevel, [], language, dbPersona, studentProfile);
  }
}