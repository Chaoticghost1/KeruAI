# Deployment Guide

## Keru.ai Suite — Web, Telegram Bot, Docker

---

## 1. Overview

Keru.ai Suite supports multiple deployment modes:

| Mode | Components | Use Case |
|------|------------|----------|
| Web | Client + Server | Full web interface |
| Telegram Bot | telegram-bot/ + shared/ | AI tutoring via Telegram |
| Docker | Bot + optional Postgres | Production bot deployment |

---

## 2. Web Interface Deployment

### Development
```bash
npm run dev
```
Server: `http://localhost:5000`

### Production Build
```bash
npm run build
```
Output:
- Frontend: `dist/public/`
- Backend: `dist/index.js`

### Production Run
```bash
NODE_ENV=production npm run start
```

### Replit
- Connect GitHub repo
- Replit handles Node.js and PostgreSQL (Neon)
- Set env vars: `DATABASE_URL`, `JWT_SECRET`, `OPENAI_API_KEY`
- **Note:** Do not modify `vite.config.ts` — breaks Replit

### Vercel / Other Platforms
- Build command: `npm run build`
- Output directory: `dist/public` (static) + backend as serverless (if supported)
- **Note:** `vercel.json` was removed to avoid Docker conflicts; add back if needed for Vercel-only deployment

---

## 3. Telegram Bot Deployment

### Prerequisites
1. **Bot Token:** Message [@BotFather](https://t.me/botfather) → `/newbot`
2. **OpenAI API Key:** [OpenAI Platform](https://platform.openai.com/api-keys)
3. **Database:** PostgreSQL (Neon, Railway, etc.)

### Environment
```bash
cp .env.telegram .env
# Edit .env:
# TELEGRAM_BOT_TOKEN=...
# OPENAI_API_KEY=...
# DATABASE_URL=...
```

### Bot Commands
| Command | Description |
|---------|-------------|
| `/start` | Welcome and tutor selection |
| `/math` | Math Buddy |
| `/science` | Dr. Nova |
| `/language` | Professor Quill |
| `/help` | Available commands |
| `/end` | End current session |

### Docker Deployment
```bash
# Start stack
docker-compose up -d

# View logs
docker-compose logs -f telegram-bot

# Stop
docker-compose down
```

### Railway / Render
1. Connect GitHub
2. Set env vars: `TELEGRAM_BOT_TOKEN`, `OPENAI_API_KEY`, `DATABASE_URL`
3. Build/deploy from root or `telegram-bot` directory

---

## 4. Build Process Separation

| Build | Command | Output |
|-------|---------|--------|
| Web | `npm run build` | `dist/public` + `dist/index.js` |
| Bot | Docker handles TS compilation | Containerized bot |

- **Web:** Optional for local/dev
- **Bot:** Can run standalone with shared schema
- **Database:** Shared PostgreSQL for both

---

## 5. Deployment Conflicts Resolved

### Removed
- `vercel.json` — was causing Docker conflicts

### Clarified
- **Web:** Uses `VITE_API_URL` (optional, local dev)
- **Telegram Bot:** Uses `TELEGRAM_BOT_TOKEN`, `OPENAI_API_KEY`, `DATABASE_URL`
- No conflicts between web and bot env vars

### Current Architecture
```
StudyBuddyAI/
├── client/              # React web interface
├── server/              # Express API (shared)
├── telegram-bot/        # Telegram bot
├── shared/              # Schemas, personas
├── docker-compose.yml   # Bot deployment
├── Dockerfile           # Bot container
└── .env.telegram        # Bot env template
```

---

## 6. Environment Reference

### Required (Both Modes)
| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | JWT access token secret |
| `JWT_REFRESH_SECRET` | JWT refresh token secret |

### Web Interface
| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | AI tutoring |
| `PERPLEXITY_API_KEY` | AI fallback (optional) |

### Telegram Bot
| Variable | Description |
|----------|-------------|
| `TELEGRAM_BOT_TOKEN` | From @BotFather |
| `OPENAI_API_KEY` | GPT responses |

### Replit Auto
| Variable | Description |
|----------|-------------|
| `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE` | Replit PostgreSQL |

---

## 7. Monitoring & Health

### Web
- Check `http://localhost:5000` (or production URL)
- API health: `/api/...` endpoints

### Telegram Bot
```bash
docker-compose logs -f telegram-bot
```

### Database
```bash
# Docker
docker-compose exec postgres pg_isready

# Direct
psql $DATABASE_URL -c "SELECT COUNT(*) FROM tutor_agents;"
```

---

## 8. Cost Estimates

| Component | Est. Cost |
|-----------|-----------|
| OpenAI API | ~$0.002 per conversation turn |
| Hosting (VPS) | $5–20/month |
| Neon PostgreSQL | Free tier or ~$5/month |
| Railway/Render | Free tier available |
