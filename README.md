# Keru.ai Suite

A comprehensive multi-language educational and productivity platform designed for Honduras and Central America.

> **Full Documentation:** See [DOCUMENTATION.md](./DOCUMENTATION.md) for complete technical documentation including architecture, API reference, and project health report.

---

## Overview

Keru.ai Suite combines AI-powered tutoring, personal finance management, travel information, and gamified learning into a unified platform optimized for low-bandwidth environments.

### Target Audience
- **Students** - AI tutoring aligned with Honduran curriculum
- **Teachers** - Content management and student progress tracking
- **Administrators** - User management and analytics
- **Young Adults** - Budget tracking and career resources

---

## Features

### Core Features (Working)
- **AI Study Buddy** - 3 specialized AI tutors (Math Buddy, Dr. Nova, Professor Quill)
- **BudgetPal** - Personal finance with Lempiras currency support
- **CruiseWord Game** - Vocabulary learning with cruise ship terminology
- **Travel Blog** - Cruise and travel content
- **Admin Panel** - User, content, and blog management
- **Gamification** - Badges, levels, streaks, and XP

### Additional Features
- Multi-language support (Spanish/English)
- Role-based access control (student, teacher, superuser)
- Offline-first PWA design
- JWT authentication

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, TypeScript, Tailwind CSS, Shadcn/UI |
| Backend | Express.js, TypeScript |
| Database | PostgreSQL (Neon), Drizzle ORM |
| AI | OpenAI GPT-4, Perplexity fallback |
| Offline | IndexedDB, Service Worker, Workbox |

---

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5000`

---

## Project Status

| Category | Count |
|----------|-------|
| Working Features | 20+ |
| Broken/Issues | 5 |
| Conflicting Code | 5 |
| Unused Files | 12 |
| Incomplete Features | 18 |

See the **Project Health Report** in [DOCUMENTATION.md](./DOCUMENTATION.md#project-health-report) for full details.

---

## Key Files

| File | Purpose |
|------|---------|
| `DOCUMENTATION.md` | Complete technical documentation |
| `replit.md` | Replit-specific project notes |
| `shared/schema.ts` | Database models and types |
| `server/routes/` | API endpoints |
| `client/src/pages/` | Frontend pages |

---

## Database

Main tables:
- `users` - Authentication and profiles
- `botPersonas` - AI tutor configurations
- `tutorSessions` / `tutorMessages` - Chat history
- `budgetCategories` / `budgetTransactions` - Finance tracking
- `studentProfiles` / `userProgress` - Gamification data

```bash
# Push schema to database
npm run db:push
```

---

## Environment Variables

Required:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - JWT signing secret
- `OPENAI_API_KEY` - OpenAI API key

Optional:
- `PERPLEXITY_API_KEY` - Fallback AI provider
- `GITHUB_TOKEN` - GitHub integration

---

## Documentation

- [Full Technical Documentation](./DOCUMENTATION.md)
- [Telegram Bot Deployment](./TELEGRAM_DEPLOYMENT.md)
- [Deployment Conflicts Resolved](./DEPLOYMENT_CONFLICTS_RESOLVED.md)

---

## License

MIT
