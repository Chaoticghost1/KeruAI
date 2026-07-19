import OpenAI from "openai";
import { tutorPersonas, getPersonaByKey, generatePersonaResponse } from '../shared/tutorPersonas.js';
import { storage } from './storage';
import { buildRagContext } from './lib/content-chunker.js';

const PERPLEXITY_BASE_URL = 'https://api.perplexity.ai';
const PERPLEXITY_MODEL = 'sonar';

/**
 * Resolve the OpenAI chat model to use.
 * Env-override: OPENAI_MODEL (defaults to a real, widely-available model).
 * NOTE: a previously hard-coded "gpt-5" value never existed as a public model
 * and would fail at runtime — the default here is a safe GA model.
 */
export function resolveOpenAIModel(): string {
  const fromEnv = process.env.OPENAI_MODEL?.trim();
  if (fromEnv) return fromEnv;
  return 'gpt-4o';
}

/**
 * Generate short, friendly budget insights from aggregated spend data.
 * Flagged by ENABLE_BUDGET_AI (default false). When disabled or no API key,
 * returns a rule-based summary so the feature degrades gracefully.
 */
export interface BudgetInsightInput {
  totalIncomeHnl: number;
  totalExpenseHnl: number;
  byCategory: { category: string; expenseHnl: number; incomeHnl: number }[];
  language?: "es" | "en";
  userId?: number;
}

export async function generateBudgetInsights(input: BudgetInsightInput): Promise<string[]> {
  const lang = input.language ?? "es";
  const ruleBased = (): string[] => {
    const tips: string[] = [];
    const remaining = input.totalIncomeHnl - input.totalExpenseHnl;
    if (input.totalIncomeHnl === 0 && input.totalExpenseHnl === 0) {
      return [lang === "es" ? "Empieza registrando tu primer gasto o ingreso." : "Start by logging your first expense or income."];
    }
    if (remaining < 0) {
      tips.push(lang === "es" ? "Estás gastando más de lo que ingresas. Revisa tus categorías mayores." : "You're spending more than you earn. Review your top categories.");
    } else {
      tips.push(lang === "es" ? `Vas bien: te sobran L ${Math.round(remaining)} este periodo.` : `You're on track: L ${Math.round(remaining)} left this period.`);
    }
    const top = [...input.byCategory].sort((a, b) => b.expenseHnl - a.expenseHnl)[0];
    if (top && top.expenseHnl > 0) {
      tips.push(lang === "es" ? `Tu categoría con más gasto es "${top.category}".` : `Your top spending category is "${top.category}".`);
    }
    return tips;
  };

  if (process.env.ENABLE_BUDGET_AI !== "true") return ruleBased();

  try {
    const { openai: key } = await getApiKeys();
    if (!key) return ruleBased();

    const prompt =
      lang === "es"
        ? `Eres un asesor financiero amigable para jóvenes en Honduras. Con estos datos (en lempiras HNL), da 3 consejos cortos y prácticos: ingresos=${Math.round(input.totalIncomeHnl)}, gastos=${Math.round(input.totalExpenseHnl)}, categorías=${JSON.stringify(input.byCategory.map((c) => ({ c: c.category, g: Math.round(c.expenseHnl) })))}. Responde solo como lista numerada, máximo 12 palabras por consejo.`
        : `You are a friendly financial advisor for youth in Honduras. Given this data (in HNL lempira), give 3 short practical tips: income=${Math.round(input.totalIncomeHnl)}, expenses=${Math.round(input.totalExpenseHnl)}, categories=${JSON.stringify(input.byCategory.map((c) => ({ c: c.category, g: Math.round(c.expenseHnl) })))}. Reply as a numbered list, max 12 words per tip.`;

    const completion = await openai.chat.completions.create({
      model: resolveOpenAIModel(),
      messages: [{ role: "user", content: prompt }],
      temperature: 0.6,
      max_tokens: 200,
    });

    await recordLlmCall({
      provider: "openai",
      model: resolveOpenAIModel(),
      userId: input.userId,
      usage: completion.usage
        ? {
            promptTokens: completion.usage.prompt_tokens,
            completionTokens: completion.usage.completion_tokens,
            totalTokens: completion.usage.total_tokens,
          }
        : undefined,
      status: "success",
    });

    const text = completion.choices[0]?.message?.content ?? "";
    const lines = text
      .split("\n")
      .map((l) => l.replace(/^\d+[.)]\s*/, "").trim())
      .filter(Boolean);
    return lines.length ? lines : ruleBased();
  } catch (err) {
    console.warn("[budget-ai] insight generation failed, using rules:", err instanceof Error ? err.message : err);
    return ruleBased();
  }
}

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

/**
 * Best-effort LLM audit logging. Never throws — failures are logged and swallowed
 * so they can never break a tutoring response.
 */
async function recordLlmCall(params: {
  provider: "openai" | "perplexity";
  model: string;
  userId?: number;
  teacherId?: number;
  agentKey?: string;
  usage?: { promptTokens?: number; completionTokens?: number; totalTokens?: number };
  status?: "success" | "error";
}): Promise<void> {
  try {
    await storage.createLlmLog({
      provider: params.provider,
      model: params.model,
      userId: params.userId ?? null,
      teacherId: params.teacherId ?? null,
      agentKey: params.agentKey ?? null,
      promptTokens: params.usage?.promptTokens ?? 0,
      completionTokens: params.usage?.completionTokens ?? 0,
      totalTokens: params.usage?.totalTokens ?? 0,
      status: params.status ?? "success",
    });
  } catch (err) {
    console.warn("[llm-log] failed to record call:", err instanceof Error ? err.message : err);
  }
}

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
    studentProfile?: StudentProfileContext | null,
    curriculumContext?: string
  ): Promise<AITutorResponse> {
    try {
      // Use DB persona (admin-created) system prompt when provided
      if (dbPersona?.systemPrompt) {
        return this.generateResponseWithDBPersona(dbPersona, studentMessage, subject, difficultyLevel, sessionHistory, language, studentProfile, curriculumContext);
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

${curriculumContext ? curriculumContext + "\n" : ""}

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
        model: resolveOpenAIModel(),
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: studentMessage }
        ],
        response_format: { type: "json_object" },
        max_completion_tokens: 1500
      });

      await recordLlmCall({
        provider: "openai",
        model: resolveOpenAIModel(),
        userId: (studentProfile as any)?.userId,
        agentKey,
        usage: response.usage ? {
          promptTokens: response.usage.prompt_tokens,
          completionTokens: response.usage.completion_tokens,
          totalTokens: response.usage.total_tokens,
        } : undefined,
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
    studentProfile?: StudentProfileContext | null,
    curriculumContext?: string
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
 ${curriculumContext ? curriculumContext + "\n" : ""}
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
        model: resolveOpenAIModel(),
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: studentMessage }
        ],
        response_format: { type: "json_object" },
        max_completion_tokens: 1500
      });
      await recordLlmCall({
        provider: "openai",
        model: resolveOpenAIModel(),
        agentKey: dbPersona?.name,
        usage: response.usage ? {
          promptTokens: response.usage.prompt_tokens,
          completionTokens: response.usage.completion_tokens,
          totalTokens: response.usage.total_tokens,
        } : undefined,
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
   * Generate structured practice questions for Student Revision v2.
   * Returns an array of { question, options?, answer, explanation? } objects.
   * Falls back to a simple templated question if the AI is unavailable.
   */
  static async generatePracticeQuestions(
    subject: string,
    opts: { topic?: string; difficulty?: number; count?: number; language?: string } = {}
  ): Promise<Array<{ question: string; options?: string[]; answer: string; explanation?: string }>> {
    const count = Math.min(Math.max(opts.count ?? 5, 1), 20);
    const difficulty = opts.difficulty ?? 2;
    const language = opts.language === "en" ? "en" : "es";
    const topicLine = opts.topic ? ` about ${opts.topic}` : "";

    const prompt = `Generate ${count} practice ${subject} questions${topicLine} at difficulty ${difficulty}/3 for a student in Honduras.
Return ONLY a JSON array (no markdown), each item: { "question": string, "options": string[4] (for multiple choice) or null, "answer": string, "explanation": string }.
Language: ${language === "en" ? "English" : "Spanish"}.`;

    try {
      const { openai: openaiKey } = await getApiKeys();
      const client = openaiKey ? new OpenAI({ apiKey: openaiKey }) : openai;
      const response = await client.chat.completions.create({
        model: resolveOpenAIModel(),
        messages: [
          { role: "system", content: "You are a curriculum question generator. Output valid JSON only." },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
        max_completion_tokens: 2000,
      });
      await recordLlmCall({
        provider: "openai",
        model: resolveOpenAIModel(),
        usage: response.usage ? {
          promptTokens: response.usage.prompt_tokens,
          completionTokens: response.usage.completion_tokens,
          totalTokens: response.usage.total_tokens,
        } : undefined,
      });
      const content = response.choices[0].message.content;
      if (!content) throw new Error("No content from OpenAI");
      // The model may wrap the array in an object; extract the array.
      const parsed = JSON.parse(content);
      const arr = Array.isArray(parsed) ? parsed : parsed.questions ?? parsed.items ?? [];
      if (!Array.isArray(arr)) throw new Error("Unexpected practice question shape");
      return arr.slice(0, count).map((q: any) => ({
        question: String(q.question ?? ""),
        options: Array.isArray(q.options) ? q.options.map(String) : undefined,
        answer: String(q.answer ?? ""),
        explanation: q.explanation ? String(q.explanation) : undefined,
      }));
    } catch (error) {
      console.warn("generatePracticeQuestions failed, using fallback:", error);
      // Deterministic fallback so revision still works offline of AI.
      return Array.from({ length: count }, (_, i) => ({
        question:
          language === "en"
            ? `Practice ${subject} question #${i + 1}${opts.topic ? " on " + opts.topic : ""}. (AI unavailable — review your notes.)`
            : `Pregunta de práctica de ${subject} #${i + 1}${opts.topic ? " sobre " + opts.topic : ""}. (IA no disponible — repasa tus apuntes.)`,
        answer: language === "en" ? "Review your class material." : "Repasa tu material de clase.",
        explanation: undefined,
      }));
    }
  }

  /**
   * Retrieve top-N curriculum chunks as grounded context for a tutoring session.
   * Returns empty string when no matching material exists (caller falls back to generic GPT).
   */
  static async fetchCurriculumContext(
    subject: string,
    opts: { topic?: string; gradeLevel?: string; language?: string; limit?: number } = {}
  ): Promise<string> {
    try {
      const chunks = await storage.findCurriculumChunks({
        subject,
        topic: opts.topic,
        gradeLevel: opts.gradeLevel,
        language: opts.language,
        limit: opts.limit ?? 6,
      });
      if (!chunks.length) return "";
      return buildRagContext(chunks.map((c) => ({ text: c.text })));
    } catch (error) {
      console.warn("fetchCurriculumContext failed:", error);
      return "";
    }
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
    studentProfile?: StudentProfileContext | null,
    curriculumMode: boolean = false
  ): Promise<AITutorResponse> {
    if (!dbPersona) {
      const persona = getPersonaByKey(agentKey);
      if (!persona) throw new Error(`Persona not found: ${agentKey}`);
    }

    const curriculumContext = curriculumMode
      ? await this.fetchCurriculumContext(subject, { topic, language })
      : "";

    const welcomePrompt = topic 
      ? `I'm starting a ${subject} tutoring session focused on ${topic}. Please introduce yourself and ask an engaging question to begin.`
      : `I'm starting a ${subject} tutoring session. Please introduce yourself and ask what specific area I'd like to explore.`;

    return this.generateTutorResponse(agentKey, welcomePrompt, subject, difficultyLevel, [], language, dbPersona, studentProfile, curriculumContext);
  }
}