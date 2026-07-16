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
| Database | PostgreSQL (Neon), Drizzle ORM |
| AI | OpenAI GPT-4, Perplexity fallback |
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
