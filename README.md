# Keru.ai Suite

A multi-language educational and productivity platform for Honduras and Central America, combining AI tutoring, personal finance, travel content, and gamified learning.

---

## Overview

Keru.ai Suite provides:

- **AI Study Buddy** — 3 tutors (Math Buddy, Dr. Nova, Professor Quill) powered by OpenAI (env-configurable model, default `gpt-4o`)
- **BudgetPal** — Personal finance with Lempiras support
- **CruiseWord** — DB-fed vocabulary game (Duolingo Learn Path) for cruise/travel terminology
- **LinguaPlay** — DB-fed language game (vocabulary, grammar, listening) sharing the same Duolingo Learn Path
- **MathMaster** — Math game from arithmetic to calculus
- **Travel Blog** — Cruise and travel content
- **Student Revision** — Revision packs, AI practice generation, spaced-repetition review, and a mobile-first lesson viewer
- **Teacher Uploader** — Teachers upload PDF/image/text → RAG ingestion (chunking + embeddings)
- **Admin Panel** — User, content, persona, and embeddings management
- **Gamification** — Badges, levels, streaks, XP
- **Mobile-first UX** — `client/src/components/mobile/*` library (teacher uploader, lesson header/viewer, AI Buddy chat) with keyboard-safe + dynamic-layout hooks

**Target:** Students, teachers, young adults in Honduras and Central America (Spanish-first, English-supported)

---

## Where We're At (Jul 2026)

| Area | Status |
|------|--------|
| **Core features** | Auth, AI tutors, BudgetPal, CruiseWord, LinguaPlay, Blog admin, Gamification — ✅ Working |
| **AI model** | ✅ Env-configurable (`OPENAI_MODEL`, default `gpt-4o`); no fabricated model strings |
| **RAG / embeddings** | ✅ Content ingestion (`POST /api/content/upload`) + embeddings producer/worker (`EMBEDDING_BACKEND`, `EMBEDDING_WORKER_ENABLED`) |
| **Teacher uploader UI** | ✅ `client/src/pages/teacher/Upload.tsx` + `useUpload` hook |
| **Student Revision** | ✅ Packs, AI practice, spaced-repetition review + mobile viewer (`/revision/mobile`) |
| **Mentorship** | ✅ Full API + MentorshipHub UI wired |
| **Blog (public)** | ✅ `/api/blog/posts` + Blog page fetches and displays published posts |
| **LLM audit logging** | ✅ `llm_logs` table + `recordLlmCall()` wraps OpenAI completions |
| **COPPA consent** | ⚠️ Partial — `users.consentRequired` flag + `SYSTEM_REQUIRE_PARENTAL_CONSENT` signup gate; no dedicated consent UI yet |
| **CI** | ✅ `.github/workflows/ci.yml` (tsc → vitest → build) |
| **Mobile-first UX** | ✅ `client/src/components/mobile/*` (14+ passing Vitest/RTL tests) |
| **DAO** | Static placeholder (no backend) |
| **Next priorities** | Email service (verification/reset), full COPPA consent UI, SSO/OAuth config |

See [docs/PROJECT_HEALTH.md](./docs/PROJECT_HEALTH.md) for details and [audit-report.html](./audit-report.html) for the engineering audit.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, TypeScript, Vite, Tailwind, shadcn/ui |
| Backend | Express.js, TypeScript |
| Database | PostgreSQL (Neon **or** local/Docker), Drizzle ORM |
| AI | OpenAI GPT (model via `OPENAI_MODEL`, default `gpt-4o`), Perplexity fallback |
| Offline | Workbox/PWA caching for revision packs + uploaded files; LLM calls skipped offline (queued) |

---

## Quick Start

See **[QUICK_START.md](QUICK_START.md)** for minimal steps. Summary:

```bash
npm install && cp .env.example .env
npm run db:push && npm run create-admin && npm run setup:games && npm run dev
```

The `setup:games` script runs `db:push`, seeds badges, and seeds all game data
(math, language/LinguaPlay, cruise-word). **Games require seeded data** — without it
CruiseWord/LinguaPlay appear empty ("down").

Then open `http://localhost:3333` (default dev port). Admin user: `admin` / `admin@keru.ai` / `admin123`.

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

## Games (DB-fed)

CruiseWord and LinguaPlay are **database-driven** and share a generic Duolingo-style
Learn Path UI (`client/src/components/duolingo/*`). Data lives in:

- `cruise_word_words` — CruiseWord vocabulary (seeded by `scripts/seed-cruiseword-words.ts`)
- `language_problems` — LinguaPlay problems (seeded by `scripts/seed-language-problems.ts`)
- `math_problems` — MathMaster problems (seeded by `scripts/seed-math-problems.ts`)

Seed all of them with `npm run setup:games` (or individually: `npm run seed:cruiseword`,
`npm run seed:language`, `npm run seed:math`). If a game looks empty, re-run the seed.

Both games expose the same presentation: a Learn Path unit map (`/games/<game>/learn`)
plus quick-play modes.

---

## Budget (BudgetPal + mobile)

Personal finance for students, Honduras-first (Lempira default) with multi-currency support.
Two UIs share the same API (`/api/budget/*`, auth required):

- **Desktop** — `/budgetpal` (`client/src/pages/BudgetPal.tsx`): category budgets + progress bar.
- **Mobile** — `/budget/mobile` (`client/src/pages/BudgetMobile.tsx`): ported UI patterns from
  [gider.im-pwa](https://github.com/needim/gider.im-pwa) — `EntryRow` list with 44px tap targets,
  paid/unpaid toggle, bottom-sheet add/edit, FAB, multi-currency `MoneyInput`, `BudgetChart`
  (Recharts), AI tips, and gamification badges (logging streak + on-budget).

Features (Phase 1–3):
- Multi-currency transactions (HNL, USD, EUR, MXN, GTQ, NIO, CRC, COP, PEN, BRL, GBP, JPY); amounts
  normalized to HNL for totals/analytics.
- Recurring transactions (`budget_recurring`) expanded by a server engine (`server/lib/recurring.ts`,
  runs hourly; disable with `ENABLE_RECURRING=false`).
- Groups & tags (`budget_groups`, `budget_tags`) for organizing entries.
- Analytics (`GET /api/budget/analytics`): category breakdown + monthly trend.
- AI insights (`GET /api/budget/insights`): rule-based by default; set `ENABLE_BUDGET_AI=true` to use
  OpenAI (logged via `recordLlmCall`).
- Gamification (`GET /api/budget/gamification`): consecutive-day logging streak + on-budget status.

New schema tables: `budget_transactions` (added `currency`, `type`, `paid`, `groupId`, `tagId`,
`recurringId`), `budget_groups`, `budget_tags`, `budget_recurring`. Applied with `npm run db:push`.

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
Optional / feature flags:

| Var | Purpose |
|-----|---------|
| `OPENAI_API_KEY` | Primary LLM provider |
| `OPENAI_MODEL` | Model override (default `gpt-4o`) |
| `PERPLEXITY_API_KEY` | Fallback LLM provider |
| `EMBEDDING_BACKEND` | `json` (default) or `pgvector` for RAG embeddings |
| `EMBEDDING_WORKER_ENABLED` | `true` to drain the embedding queue on boot |
| `SYSTEM_REQUIRE_PARENTAL_CONSENT` | `true` to enforce COPPA consent at signup |
| `TELEGRAM_BOT_TOKEN` | Telegram bot |
| `ENABLE_RECURRING` | `false` to disable the recurring-transaction engine (default on) |
| `ENABLE_BUDGET_AI` | `true` to use OpenAI for budget insights (default rule-based) |

See [docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md#4-environment-variables) for full list.

---

## License

MIT
