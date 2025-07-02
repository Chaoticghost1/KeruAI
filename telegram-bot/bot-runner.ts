import { execSync } from 'child_process';
import { bot } from './index.js';

async function initializeDatabase() {
  console.log('🔄 Initializing database schema...');
  try {
    // Run database migrations
    execSync('npm run db:push', { stdio: 'inherit' });
    console.log('✅ Database schema initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    process.exit(1);
  }
}

async function startBot() {
  console.log('🤖 Starting Telegram bot...');
  
  // Initialize database first
  await initializeDatabase();
  
  // Bot is already initialized in index.ts, just keep the process running
  console.log('🚀 Telegram bot is running and ready to receive messages!');
  console.log('📱 Bot commands:');
  console.log('   /start - Start the bot');
  console.log('   /math - Mathematics tutor');
  console.log('   /science - Science tutor');
  console.log('   /language - Language arts tutor');
  console.log('   /help - Show help');
  console.log('   /end - End session');
  
  // Handle graceful shutdown
  process.on('SIGTERM', () => {
    console.log('🛑 Received SIGTERM, shutting down gracefully...');
    bot.stopPolling();
    process.exit(0);
  });
  
  process.on('SIGINT', () => {
    console.log('🛑 Received SIGINT, shutting down gracefully...');
    bot.stopPolling();
    process.exit(0);
  });
}

startBot().catch((error) => {
  console.error('💥 Fatal error starting bot:', error);
  process.exit(1);
});