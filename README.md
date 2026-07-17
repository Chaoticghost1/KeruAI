# Keru.ai Suite

A multi-language educational and productivity platform for Honduras and Central America, combining AI tutoring, personal finance, travel content, and gamified learning.

---

## Overview

Keru.ai Suite provides:

- **AI Study Buddy** — 3 tutors (Math Buddy, Dr. Nova, Professor Quill) powered by OpenAI
- **BudgetPal** — Personal finance with Lempiras support
- **CruiseWord** — Vocabulary game for cruise/travel terminology
- **Travel Blog** — Cruise and travel content
- **Admin Panel** — User, content, and persona management
- **Gamification** — Badges, levels, streaks, XP

**Target:** Students, teachers, young adults in Honduras and Central America (Spanish-first, English-supported)

---

## Where We're At (Feb 2026)

| Area | Status |
|------|--------|
| **Core features** | Auth, AI tutors, BudgetPal, CruiseWord, Blog admin, Gamification — ✅ Working |
| **Student Revision** | ✅ Wired to assignments API; requires verified student |
| **Mentorship** | ✅ Full API + MentorshipHub UI wired |
| **Blog (public)** | ✅ `/api/blog/posts` + Blog page fetches and displays published posts |
| **DAO** | Static placeholder (no backend) |
| **Next priorities** | Error boundaries, automated tests, email service (verification/reset) |

See [docs/PROJECT_HEALTH.md](./docs/PROJECT_HEALTH.md) for details.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, TypeScript, Vite, Tailwind, shadcn/ui |
| Backend | Express.js, TypeScript |
| Database | PostgreSQL (Neon **or** local/Docker), Drizzle ORM |
| AI | OpenAI GPT (latest), Perplexity fallback |
| Offline | Disabled (caching removed; fresh data) |

---

## Quick Start

See **[QUICK_START.md](QUICK_START.md)** for minimal steps. Summary:

```bash
npm install && cp .env.example .env
npm run db:push && npm run create-admin && npm run dev
```

Then open `http://localhost:5000`. Admin user: `admin` / `admin@keru.ai` / `admin123`.

For full setup, env vars, and troubleshooting (including cache/data issues), see [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md).

---

## Database

The app works with **any** PostgreSQL. `server/db.ts` auto-detects the driver:

- **Neon** (`*.neon.tech` in `DATABASE_URL`) → uses `@neondatabase/serverless` (WebSocket) — no extra setup.
- **Local / Docker / other Postgres** → uses the standard `pg` TCP driver.

### Option A — Local Postgres with Docker (recommended for dev)

```bash
docker run -d --name studybuddy-postgres -p 5432:5432 \
  -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=studybuddyai \
  -v studybuddy-pgdata:/var/lib/postgresql/data postgres:16
```

Then set in `.env`:

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/studybuddyai
```

The data volume `studybuddy-pgdata` persists across container restarts. To stop/start: `docker stop studybuddy-postgres` / `docker start studybuddy-postgres`.

### Option B — Neon (serverless)

Set `DATABASE_URL` to your Neon connection string (must end in `neon.tech`). No local DB needed.

After choosing a database, run `npm run db:push` to create the schema, then `npm run create-admin`.

---

## Documentation

| Link | Description |
|------|-------------|
| [QUICK_START.md](QUICK_START.md) | Get running in a few steps |
| [docs/](docs/) | Full documentation index |
| [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) | Setup, env vars, troubleshooting |
| [docs/PROJECT_HEALTH.md](docs/PROJECT_HEALTH.md) | Feature status, technical debt |

---

## Project Structure

```
├── client/           # React frontend
├── server/           # Express API
├── shared/           # Schema, personas, badges
├── telegram-bot/     # Telegram bot (separate deployment)
├── scripts/          # Utility scripts
└── docs/             # All documentation
```

---

## Environment Variables

Required: `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`  
Optional: `OPENAI_API_KEY`, `PERPLEXITY_API_KEY`, `TELEGRAM_BOT_TOKEN`

See [docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md#4-environment-variables) for full list.

---

## License

MIT
