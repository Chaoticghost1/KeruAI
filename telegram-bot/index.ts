import TelegramBot from 'node-telegram-bot-api';
import { db } from '../server/db.js';
import { storage } from '../server/storage.js';
import { tutorPersonas, getPersonaByKey, generatePersonaResponse } from '../shared/tutorPersonas.js';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Telegram bot
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN!, { polling: true });

// Store user sessions in memory (could be moved to database)
const userSessions = new Map<string, {
  currentAgent?: any;
  sessionId?: number;
  userId: number;
}>();

// Bot command handlers
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const username = msg.from?.username || `user_${chatId}`;
  
  // Create or get user
  let user = await storage.getUserByUsername(username);
  if (!user) {
    user = await storage.createUser({
      username,
      password: 'telegram_user', // Placeholder for Telegram users
      email: `${username}@telegram.bot`
    });
  }
  
  userSessions.set(chatId.toString(), { userId: user.id });
  
  const welcomeMessage = `
🎓 *Welcome to Keru.ai Study Buddy!*

I'm your AI tutoring assistant. Choose your tutor:

/math - Math Buddy 🧮 (Mathematics, Algebra, Calculus)
/science - Dr. Nova 🔬 (Biology, Chemistry, Physics)  
/language - Professor Quill 📚 (Literature, Writing, Reading)

/help - Show available commands
/end - End current session
  `;
  
  bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'Markdown' });
});

bot.onText(/\/math/, async (msg) => {
  await startTutorSession(msg.chat.id, 'math_buddy');
});

bot.onText(/\/science/, async (msg) => {
  await startTutorSession(msg.chat.id, 'science_explorer');
});

bot.onText(/\/language/, async (msg) => {
  await startTutorSession(msg.chat.id, 'wordsmith_mentor');
});

bot.onText(/\/help/, (msg) => {
  const helpMessage = `
📖 *Available Commands:*

*Start Tutoring:*
/math - Mathematics tutor
/science - Science tutor  
/language - Language arts tutor

*Session Management:*
/end - End current tutoring session
/status - Check current session status

*Getting Help:*
Just type your question naturally and your tutor will respond!

Example: "Can you help me solve x² + 5x + 6 = 0?"
  `;
  
  bot.sendMessage(msg.chat.id, helpMessage, { parse_mode: 'Markdown' });
});

bot.onText(/\/end/, async (msg) => {
  const session = userSessions.get(msg.chat.id.toString());
  if (session?.sessionId) {
    await storage.endTutorSession(session.sessionId);
    userSessions.delete(msg.chat.id.toString());
    bot.sendMessage(msg.chat.id, "✅ Tutoring session ended. Type /start to begin again!");
  } else {
    bot.sendMessage(msg.chat.id, "No active session to end.");
  }
});

// Handle regular messages (student questions)
bot.on('message', async (msg) => {
  // Skip if it's a command
  if (msg.text?.startsWith('/')) return;
  
  const chatId = msg.chat.id;
  const session = userSessions.get(chatId.toString());
  
  if (!session?.currentAgent || !session?.sessionId) {
    bot.sendMessage(chatId, "Please start a tutoring session first! Use /math, /science, or /language");
    return;
  }
  
  try {
    // Store student message
    const studentMessage = await storage.createTutorMessage({
      sessionId: session.sessionId,
      sender: 'student',
      message: msg.text || '',
      messageType: 'text'
    });
    
    // Generate AI response
    const aiResponse = await generateAIResponse(session.currentAgent, msg.text || '', session);
    
    // Store agent response
    await storage.createTutorMessage({
      sessionId: session.sessionId,
      sender: 'agent',
      message: aiResponse,
      messageType: 'response'
    });
    
    // Send response to user
    bot.sendMessage(chatId, aiResponse, { parse_mode: 'Markdown' });
    
  } catch (error) {
    console.error('Error handling message:', error);
    bot.sendMessage(chatId, "Sorry, I encountered an error. Please try again!");
  }
});

async function startTutorSession(chatId: number, agentKey: string) {
  const session = userSessions.get(chatId.toString());
  if (!session) {
    bot.sendMessage(chatId, "Please use /start first!");
    return;
  }
  
  // Get agent from database
  const agent = await storage.getTutorAgentByKey(agentKey);
  if (!agent) {
    bot.sendMessage(chatId, "Tutor not found!");
    return;
  }
  
  // Create tutoring session
  const tutorSession = await storage.createTutorSession({
    userId: session.userId,
    agentId: agent.id,
    subject: agent.subjects[0],
    topic: 'general',
    difficultyLevel: 2,
    isActive: true
  });
  
  // Update user session
  session.currentAgent = agent;
  session.sessionId = tutorSession.id;
  userSessions.set(chatId.toString(), session);
  
  // Get persona for greeting
  const persona = getPersonaByKey(agentKey);
  const greeting = persona ? generatePersonaResponse(persona, {
    messageType: 'greeting',
    studentMessage: ''
  }) : `Hello! I'm ${agent.name}, your ${agent.title}. How can I help you today?`;
  
  bot.sendMessage(chatId, `🎯 *${agent.name}* is now your tutor!\n\n${greeting}`, { 
    parse_mode: 'Markdown' 
  });
}

async function generateAIResponse(agent: any, studentMessage: string, session: any): Promise<string> {
  try {
    // Get persona for context
    const persona = getPersonaByKey(agent.agentKey);
    
    if (!persona) {
      return "I'm here to help! What would you like to learn about?";
    }
    
    // Create OpenAI prompt based on persona
    const systemPrompt = `You are ${persona.name}, a ${persona.title}.

Personality: ${persona.personality.primaryTraits.join(', ')}
Communication Style: ${persona.personality.communicationStyle.tone}, ${persona.personality.communicationStyle.formality}
Teaching Approach: ${persona.teachingMethodology.primaryApproach}
Subjects: ${persona.expertise.primarySubjects.join(', ')}

Key Behavioral Rules:
${persona.behavioralRules.dos.map(rule => `- ${rule}`).join('\n')}

Respond as this character would, helping the student with their question. Keep responses concise but helpful for Telegram format.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: studentMessage }
      ],
      max_tokens: 500,
      temperature: 0.7
    });
    
    return completion.choices[0].message.content || "I'd be happy to help you with that!";
    
  } catch (error) {
    console.error('OpenAI API error:', error);
    // Fallback to persona-based response
    const persona = getPersonaByKey(agent.agentKey);
    if (persona) {
      return generatePersonaResponse(persona, {
        messageType: 'explanation',
        studentMessage
      });
    }
    return "Let me think about that question and get back to you!";
  }
}

// Error handling
bot.on('polling_error', (error) => {
  console.error('Polling error:', error);
});

console.log('🚀 Telegram bot started successfully!');

export { bot };