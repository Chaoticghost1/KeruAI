import OpenAI from "openai";
import { tutorPersonas, getPersonaByKey, generatePersonaResponse } from '../shared/tutorPersonas.js';

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

// Perplexity AI client setup
const perplexity = {
  apiKey: process.env.PERPLEXITY_API_KEY,
  baseURL: 'https://api.perplexity.ai',
  model: 'llama-3.1-sonar-small-128k-online'
};

export interface AITutorResponse {
  message: string;
  toolsUsed: string[];
  difficulty: number;
  engagement: number;
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
    language: string = 'es'
  ): Promise<AITutorResponse> {
    try {
      const persona = getPersonaByKey(agentKey);
      if (!persona) {
        throw new Error(`Persona not found: ${agentKey}`);
      }

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
      const systemPrompt = `You are ${persona.name}, ${persona.title}. 

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

Respond as ${persona.name} would, maintaining your unique personality while providing helpful tutoring. Be encouraging, educational, and match the difficulty level. Keep responses focused and not too lengthy.

Recent conversation context:
${conversationHistory}

Provide your response in JSON format:
{
  "message": "Your tutoring response as ${persona.name}",
  "toolsUsed": ["explanation", "example", "encouragement"],
  "difficulty": 1-3,
  "engagement": 1-5
}`;

      const response = await openai.chat.completions.create({
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
      console.error('OpenAI API Error:', error);
      console.log('Trying Perplexity AI as fallback...');
      
      // Try Perplexity AI as fallback
      try {
        return await this.generatePerplexityResponse(agentKey, studentMessage, subject, difficultyLevel, sessionHistory, language);
      } catch (perplexityError) {
        console.error('Perplexity AI Error:', perplexityError);
        
        // Final fallback to rule-based persona response
        const persona = getPersonaByKey(agentKey);
        const fallbackMessage = persona 
          ? generatePersonaResponse(persona, { messageType: 'encouragement' })
          : "I'm here to help you learn! Could you please rephrase your question?";

        return {
          message: fallbackMessage,
          toolsUsed: ["rule-based-fallback"],
          difficulty: difficultyLevel,
          engagement: 3
        };
      }
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
    language: string = 'es'
  ): Promise<AITutorResponse> {
    const persona = getPersonaByKey(agentKey);
    if (!persona) {
      throw new Error(`Persona not found: ${agentKey}`);
    }

    // Build conversation context
    const conversationHistory = sessionHistory
      .slice(-4) // Last 4 messages for context (Perplexity has different limits)
      .map(msg => `${msg.sender}: ${msg.message}`)
      .join('\n');

    // Get language instruction
    const languageInstruction = language === 'en' 
      ? 'IMPORTANT: Respond in English only.' 
      : 'IMPORTANTE: Responde solo en español.';

    // Create persona-driven system prompt
    const systemPrompt = `You are ${persona.name}, ${persona.title}. 

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

Respond as ${persona.name} would, maintaining your unique personality while providing helpful tutoring. Be encouraging, educational, and match the difficulty level. Keep responses focused and educational.

Recent conversation:
${conversationHistory}

Provide a helpful tutoring response that includes factual, up-to-date information when relevant.`;

    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: studentMessage }
    ];

    const response = await fetch(`${perplexity.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexity.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: perplexity.model,
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
      throw new Error(`Perplexity API error: ${response.status} ${response.statusText}`);
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
    language: string = 'es'
  ): Promise<AITutorResponse> {
    const persona = getPersonaByKey(agentKey);
    if (!persona) {
      throw new Error(`Persona not found: ${agentKey}`);
    }

    const welcomePrompt = topic 
      ? `I'm starting a ${subject} tutoring session focused on ${topic}. Please introduce yourself and ask an engaging question to begin.`
      : `I'm starting a ${subject} tutoring session. Please introduce yourself and ask what specific area I'd like to explore.`;

    return this.generateTutorResponse(agentKey, welcomePrompt, subject, difficultyLevel, [], language);
  }
}