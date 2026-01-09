# 🤖 Telegram Bot + Docker + LLM Deployment Guide

## Overview
Your AI tutoring system has been transformed into a Telegram bot with:
- **3 AI Tutors**: Math Buddy, Dr. Nova (Science), Professor Quill (Language Arts)
- **OpenAI GPT-4 Integration**: Real AI responses with personality-driven prompts
- **PostgreSQL Database**: Full conversation and session tracking
- **Docker Deployment**: Production-ready containerized setup

## Prerequisites

### 1. Create Telegram Bot
1. Message [@BotFather](https://t.me/botfather) on Telegram
2. Send `/newbot`
3. Choose a name: `Keru.ai Study Buddy`
4. Choose a username: `keru_ai_study_bot` (must end with 'bot')
5. Save the **Bot Token** you receive

### 2. Get OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create new API key
3. Save the key securely

## Quick Start

### 1. Configure Environment
```bash
# Copy the template and edit with your keys
cp .env.telegram .env

# Edit the file with your actual tokens:
# TELEGRAM_BOT_TOKEN=1234567890:ABC-DEF1234ghIkl-zyx57W2v1u123ew11
# OPENAI_API_KEY=sk-proj-abc123...
```

### 2. Deploy with Docker
```bash
# Start the complete stack
docker-compose up -d

# Check if everything is running
docker-compose ps

# View bot logs
docker-compose logs -f telegram-bot
```

### 3. Test Your Bot
1. Find your bot on Telegram using the username you created
2. Send `/start` to begin
3. Try `/math` and ask: "Can you help me solve x² + 5x + 6 = 0?"

## Bot Commands

| Command | Description |
|---------|-------------|
| `/start` | Welcome message and tutor selection |
| `/math` | Start session with Math Buddy 🧮 |
| `/science` | Start session with Dr. Nova 🔬 |
| `/language` | Start session with Professor Quill 📚 |
| `/help` | Show available commands |
| `/end` | End current tutoring session |

## Features

### 🎯 Persona-Driven AI Responses
Each tutor has a unique personality:
- **Math Buddy**: Encouraging, step-by-step approach
- **Dr. Nova**: Curious, experimental, hands-on
- **Professor Quill**: Scholarly, literary, expressive

### 📊 Full Session Tracking
- All conversations stored in PostgreSQL
- Session management with start/end tracking
- User profiles and learning preferences

### 🔄 Fallback System
- Primary: OpenAI GPT-4 responses
- Fallback: Rule-based persona responses
- Graceful error handling

## Production Deployment

### Using VPS/Cloud Server
```bash
# Clone your repository
git clone https://github.com/yourusername/keru-ai-suite.git
cd keru-ai-suite

# Set up environment
cp .env.telegram .env
# Edit .env with your tokens

# Deploy
docker-compose up -d
```

### Using Railway/Render
1. Connect your GitHub repository
2. Set environment variables:
   - `TELEGRAM_BOT_TOKEN`
   - `OPENAI_API_KEY`
   - `DATABASE_URL` (they provide PostgreSQL)
3. Deploy the `telegram-bot` directory

## Monitoring

### Check Bot Status
```bash
# View live logs
docker-compose logs -f telegram-bot

# Check database connections
docker-compose exec postgres psql -U keru_user -d keru_ai -c "SELECT COUNT(*) FROM tutor_agents;"
```

### Health Checks
The bot includes automatic health monitoring and will restart if it fails.

## Advanced Configuration

### Custom Personas
Edit `shared/tutorPersonas.ts` to modify tutor personalities and add new ones.

### Database Scaling
For high usage, consider:
- Connection pooling (already configured)
- Read replicas for analytics
- Redis for session caching

### LLM Optimization
- Adjust temperature in `generateAIResponse()` for creativity
- Modify max_tokens for response length
- Add conversation memory for context

## Troubleshooting

### Bot Not Responding
1. Check token: `docker-compose logs telegram-bot | grep "Bot Token"`
2. Verify network: `docker-compose exec telegram-bot ping api.telegram.org`
3. Check database: `docker-compose exec postgres pg_isready`

### OpenAI Errors
1. Verify API key format starts with `sk-`
2. Check quota: Visit OpenAI dashboard
3. Monitor usage costs

### Database Issues
```bash
# Reset database
docker-compose down -v
docker-compose up -d

# Manual database setup
docker-compose exec postgres psql -U keru_user -d keru_ai
```

## Cost Estimates

- **OpenAI API**: ~$0.002 per conversation turn
- **Hosting**: $5-20/month (VPS) or free tier (Railway/Render)
- **Database**: Included in hosting or ~$5/month

Your Telegram bot is now ready for deployment! 🚀

---

## Current Status (January 2026)

### Bot Dependencies
- `node-telegram-bot-api` - Telegram API wrapper
- `openai` - GPT integration for AI responses
- `@neondatabase/serverless` - PostgreSQL connection
- `drizzle-orm` - Database ORM

### Web Interface Status
The web interface runs independently with:
- **React + Vite** frontend on port 5000
- **Express.js** backend API
- **Service Worker** v5 for PWA caching

### Known Constraints
| Constraint | Description |
|------------|-------------|
| vite.config.ts | READ-ONLY - do not modify |
| Dark mode | NOT implemented (user declined) |
| Icons | lucide-react (UI), react-icons/fa (social) |
| Language | Shared LanguageContext required |

### Troubleshooting Vite Issues
If you see chunk file errors after updates:
```bash
rm -rf node_modules/.vite
npm run dev
```
Then hard refresh (`Ctrl+Shift+R` or `Cmd+Shift+R`)