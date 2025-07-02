// Simple script to run the Telegram bot locally for testing
const { spawn } = require('child_process');
const path = require('path');

console.log('🤖 Starting Telegram Bot...');
console.log('Make sure you have set your environment variables:');
console.log('- TELEGRAM_BOT_TOKEN');
console.log('- OPENAI_API_KEY'); 
console.log('- DATABASE_URL');
console.log('');

// Build the TypeScript files first
console.log('📦 Building TypeScript files...');
const buildProcess = spawn('npm', ['run', 'build'], { stdio: 'inherit' });

buildProcess.on('close', (code) => {
  if (code !== 0) {
    console.error('❌ Build failed');
    process.exit(1);
  }
  
  console.log('✅ Build completed');
  console.log('🚀 Starting Telegram bot...');
  
  // Start the bot
  const botProcess = spawn('node', ['dist/telegram-bot/bot-runner.js'], { 
    stdio: 'inherit',
    env: { ...process.env }
  });
  
  botProcess.on('close', (code) => {
    console.log(`Bot process exited with code ${code}`);
  });
  
  // Handle graceful shutdown
  process.on('SIGTERM', () => {
    console.log('Shutting down bot...');
    botProcess.kill('SIGTERM');
  });
  
  process.on('SIGINT', () => {
    console.log('Shutting down bot...');
    botProcess.kill('SIGINT');
  });
});