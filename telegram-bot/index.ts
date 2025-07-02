import TelegramBot from 'node-telegram-bot-api';
import { db } from '../server/db.js';
import { storage } from '../server/storage.js';
import { tutorPersonas, getPersonaByKey, generatePersonaResponse } from '../shared/tutorPersonas.js';
import { calculateLevel, getXPProgress } from '../shared/badgeSystem.js';
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
  messageCount?: number;
  startTime?: Date;
  subject?: string;
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
    // Increment message count
    session.messageCount = (session.messageCount || 0) + 1;
    userSessions.set(chatId.toString(), session);
    
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
  
  // Update user session with all required fields
  session.currentAgent = agent;
  session.sessionId = tutorSession.id;
  session.messageCount = 0;
  session.startTime = new Date();
  session.subject = agent.subjects[0] || 'general';
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

// Session completion and badge awarding
async function completeSession(chatId: number, sessionData: {
  sessionId: number;
  userId: number;
  subject?: string;
  messageCount?: number;
  startTime?: Date;
}) {
  try {
    const startTime = sessionData.startTime || new Date();
    const messageCount = sessionData.messageCount || 1;
    const subject = sessionData.subject || 'general';
    
    const duration = Math.floor((Date.now() - startTime.getTime()) / (1000 * 60)); // minutes
    const difficulty = Math.min(Math.max(Math.floor(messageCount / 3), 1), 5); // 1-5 scale
    
    // Award session rewards
    const rewards = await storage.awardSessionRewards(sessionData.userId, {
      sessionId: sessionData.sessionId,
      subject,
      duration,
      messagesExchanged: messageCount,
      difficulty
    });
    
    // Send completion message
    let message = `🎉 *Session Complete!*\n\n`;
    message += `📊 *Your Progress:*\n`;
    message += `• Points earned: ${rewards.pointsEarned} XP\n`;
    message += `• Duration: ${duration} minutes\n`;
    message += `• Messages exchanged: ${messageCount}\n\n`;
    
    if (rewards.levelUp) {
      message += `🎊 *LEVEL UP!* You're now level ${await getUserLevel(sessionData.userId)}!\n\n`;
    }
    
    if (rewards.badgesEarned.length > 0) {
      message += `🏆 *New Badges Earned:*\n`;
      for (const badge of rewards.badgesEarned) {
        message += `${badge.icon} *${badge.name}* - ${badge.description}\n`;
      }
      message += `\n`;
    }
    
    // Show progress to next level
    const profile = await storage.getStudentProfile(sessionData.userId);
    if (profile) {
      const progress = getXPProgress(profile);
      message += `📈 *Level Progress:* ${progress.current}/${progress.needed} XP (${progress.progress}%)\n`;
      message += `🔥 *Current Streak:* ${profile.currentStreak} days\n`;
    }
    
    bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    
  } catch (error) {
    console.error('Error completing session:', error);
    bot.sendMessage(chatId, '⚠️ Session completed but there was an error calculating rewards.');
  }
}

// Helper function to get user level
async function getUserLevel(userId: number): Promise<number> {
  const profile = await storage.getStudentProfile(userId);
  return profile ? profile.level : 1;
}

// Command to check badges and progress
bot.onText(/\/progress/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from?.id || chatId;
  
  try {
    const profile = await storage.getStudentProfile(userId);
    if (!profile) {
      bot.sendMessage(chatId, '📊 Start your first tutoring session to begin tracking progress!');
      return;
    }
    
    const userBadges = await storage.getUserBadges(userId);
    const progress = getXPProgress(profile);
    
    let message = `📊 *Your Learning Progress*\n\n`;
    message += `🎯 *Level:* ${profile.level}\n`;
    message += `✨ *Experience:* ${profile.experiencePoints} XP\n`;
    message += `📈 *Progress to next level:* ${progress.current}/${progress.needed} XP (${progress.progress}%)\n`;
    message += `🎓 *Sessions completed:* ${profile.totalSessionsCompleted}\n`;
    message += `🔥 *Current streak:* ${profile.currentStreak} days\n`;
    message += `🏆 *Longest streak:* ${profile.longestStreak} days\n\n`;
    
    if (userBadges.length > 0) {
      message += `🏅 *Your Badges (${userBadges.length}):*\n`;
      // Get badge details
      for (const userBadge of userBadges.slice(0, 5)) { // Show first 5 badges
        const badge = await storage.getBadge(userBadge.badgeId);
        if (badge) {
          message += `${badge.icon} ${badge.name}\n`;
        }
      }
      if (userBadges.length > 5) {
        message += `... and ${userBadges.length - 5} more!\n`;
      }
    } else {
      message += `🏅 *No badges yet* - Complete sessions to earn your first badge!\n`;
    }
    
    bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    
  } catch (error) {
    console.error('Error fetching progress:', error);
    bot.sendMessage(chatId, '⚠️ Error fetching your progress. Please try again.');
  }
});

// Command to end current session
bot.onText(/\/end/, async (msg) => {
  const chatId = msg.chat.id;
  const session = userSessions.get(chatId.toString());
  
  if (!session || !session.sessionId) {
    bot.sendMessage(chatId, '❌ No active session to end.');
    return;
  }
  
  // End the session in database
  await storage.endTutorSession(session.sessionId);
  
  // Award rewards and show progress
  await completeSession(chatId, {
    sessionId: session.sessionId,
    userId: session.userId,
    subject: session.subject,
    messageCount: session.messageCount,
    startTime: session.startTime
  });
  
  // Clear session
  userSessions.delete(chatId.toString());
  
  bot.sendMessage(chatId, '👋 Session ended. Use /tutor to start a new session or /progress to view your achievements!');
});

// Error handling
bot.on('polling_error', (error) => {
  console.error('Polling error:', error);
});

console.log('🚀 Telegram bot started successfully!');

export { bot };