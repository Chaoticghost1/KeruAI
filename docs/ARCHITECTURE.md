# System Architecture

## Keru.ai Suite

---

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser/PWA)                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   React     │  │  TanStack   │  │     Offline Storage     │  │
│  │   + Vite    │  │   Query     │  │    (IndexedDB/Dexie)    │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      EXPRESS.JS SERVER                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Routes    │  │   Auth      │  │     AI Service          │  │
│  │   (REST)    │  │   (JWT)     │  │   (OpenAI/Perplexity)   │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    Storage Layer (IStorage)                  ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     POSTGRESQL DATABASE                          │
│   Neon (serverless WS) OR local/Docker (pg TCP) — auto-selected  │
│                     via Drizzle ORM                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   OpenAI    │  │  Perplexity │  │      Telegram Bot       │  │
│  │   GPT-4     │  │   (Fallback)│  │      (node-telegram)    │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | React 18 | UI framework |
| Build | Vite 5 | Dev server & build |
| Styling | Tailwind CSS, shadcn/ui | Components & design |
| State | TanStack Query | Server state |
| Routing | Wouter | Client-side routing |
| Backend | Express.js | HTTP API |
| Language | TypeScript | Full-stack type safety |
| Database | PostgreSQL (Neon **or** local/Docker) | Data persistence |
| ORM | Drizzle | DB operations |
| AI | OpenAI GPT (latest) + Perplexity fallback | AI tutoring |
| Offline | — | Disabled (caching removed; fresh data only) |
| PWA | Service worker + manifest | Installable; offline caching disabled |

---

## 3. Project Structure

```
StudyBuddyAI/
├── client/                    # Frontend
│   ├── public/
│   │   ├── manifest.json      # PWA manifest
│   │   └── sw.js              # Service worker
│   └── src/
│       ├── components/        # React components
│       ├── contexts/          # LanguageContext, etc.
│       ├── data/              # content.ts (translations)
│       ├── hooks/             # use-auth, use-personas, etc.
│       ├── lib/               # Utils, offline-storage, etc.
│       ├── pages/             # Page components
│       ├── App.tsx
│       └── main.tsx
│
├── server/                    # Backend
│   ├── middleware/            # Security & cross-cutting
│   │   ├── error-handler.ts
│   │   ├── rate-limit.ts      # general + auth limiters
│   │   ├── password-reset-limit.ts
│   │   ├── account-lockout.ts
│   │   ├── security-logger.ts
│   │   └── captcha.ts
│   ├── routes/                # API routers
│   │   ├── admin.ts
│   │   ├── auth.ts
│   │   ├── blog.ts
│   │   ├── budget.ts
│   │   ├── captcha.ts          # CAPTCHA challenge endpoint
│   │   ├── classes.ts
│   │   ├── content.ts
│   │   ├── games.ts
│   │   ├── progress.ts
│   │   ├── study.ts
│   │   ├── tutors.ts
│   │   ├── assignments.ts
│   │   ├── mentorship.ts
│   │   ├── teachers.ts
│   │   └── students.ts
│   ├── lib/                    # debug helpers, etc.
│   ├── ai-service.ts
│   ├── auth.ts
│   ├── db.ts                  # driver auto-select (Neon vs pg)
│   ├── storage.ts             # IStorage + DatabaseStorage
│   ├── moderation.ts
│   └── index.ts               # middleware pipeline + bootstrap
│
├── shared/                    # Shared (client + server)
│   ├── schema.ts              # Drizzle schema (incl. math_problems, language_problems)
│   ├── badgeSystem.ts
│   └── tutorPersonas.ts
│
├── telegram-bot/              # Telegram bot (separate deployment)
│   ├── bot-runner.ts
│   └── index.ts
│
├── scripts/                   # Utilities
│   ├── create-admin.ts        # bootstrap superuser
│   ├── diagnose-api.mjs       # API workflow check
│   ├── seed-math-problems.ts
│   ├── seed-language-problems.ts
│   ├── init-badges.ts
│   └── test-badge-system.ts
│
├── migrations/                # Raw SQL migrations
├── docs/                      # All documentation
└── [config files]
```

---

## 4. Data Flow

1. **Client Request** → React components call API via TanStack Query
2. **API Layer** → Express routes validate and process requests
3. **Auth** → JWT verified via middleware
4. **Storage** → IStorage abstraction executes DB operations
5. **Database** → Drizzle ORM runs SQL on PostgreSQL
6. **Response** → JSON returned (TanStack Query with no caching for fresh data)

### Classes Data Flow (Example)
- **Create:** `POST /api/classes` → `storage.createClass()` → `classes` table
- **Fetch (teacher):** `GET /api/classes/teacher` → `storage.getTeacherClasses(teacherId)` → JSON array
- **Frontend:** `ClassGroups.tsx` uses `useQuery` with `/api/classes/teacher` or `/api/classes/student`
- **Display:** Same page at `/classes` and `/admin#classes`; `displayedClasses` from API

---

## 5. Frontend Architecture

### Providers (Top → Bottom)
- QueryClientProvider (TanStack Query)
- TooltipProvider (Radix)
- LanguageProvider
- DataSaverProvider
- AuthProvider

### Routes
| Path | Component | Auth | Roles |
|------|-----------|------|-------|
| `/` | LandingPage (or redirect to /dashboard if logged in) | No | — |
| `/auth` | AuthPage | No | — |
| `/mentor-apply` | MentorApply | No | — |
| `/dashboard` | Dashboard | Yes | All |
| `/studybuddy` | StudyBuddy | Yes | All |
| `/profile` | StudentProfile | Yes | student |
| `/revision` | StudentRevision | Yes | student |
| `/budgetpal` | BudgetPal | Yes | All |
| `/blog` | Blog | Yes | All |
| `/games` | GameHub | Yes | All |
| `/games/cruiseword` | CruiseWord | Yes | All |
| `/games/mathmaster` | MathMaster | Yes | All |
| `/games/linguaplay` | LinguaPlay | Yes | All |
| `/cruiseword` | Redirect to /games/cruiseword | Yes | All (legacy) |
| `/dao` | DAO (static placeholder) | Yes | All |
| `/mentorship` | MentorshipHub | Yes | All |
| `/classes` | ClassGroups | Yes | All |
| `/admin` | AdminDashboard | Yes | teacher, superuser |

### Key Hooks
- `useAuth` — Auth state and mutations
- `useLanguage` — i18n (via LanguageContext)
- `usePersonas` / `useTutors` — AI tutor data
- `useOfflineStudyNotes` — Offline notes (offline/caching disabled; code present)
- `useBudget` / `useBudgetCategories` / `useBudgetTransactions` — Budget CRUD (TanStack Query)
- `useMentors` / `useMentorshipRequests` / `useMentorshipSessions` — Mentorship API (via `use-mentorship.ts`)
- `useMobile` — Responsive breakpoint

---

## 6. Backend Architecture

### Route Modules
| Prefix | Purpose |
|--------|---------|
| `/api/auth` | Register, login, logout, token refresh |
| `/api/budget` | Categories, transactions |
| `/api/study` | Study notes |
| `/api/games` | Game scores, leaderboard, progress, problems (math/language) |
| `/api/tutors` | AI sessions, messages |
| `/api/progress` | Profile, badges, streaks |
| `/api/content` | Teacher content (GET /my, POST, PATCH, DELETE, publish) |
| `/api/assignments` | Student assignments (incl. revision endpoints) |
| `/api/classes` | Class groups, join, messages, member approval, moderation |
| `/api/blog` | Public blog (GET /posts) |
| `/api/teachers` | List teachers (for students to select) |
| `/api/students` | Student's selected teachers (GET/POST/DELETE) |
| `/api/admin` | Users, blog, personas, analytics, mentor applications/materials, assignments |
| `/api/mentorship` | Mentors, requests, sessions (peer mentorship) |
| `/api/system/features` | Feature flags (no auth) |

### AI Service
- Primary: OpenAI GPT-4
- Fallback: Perplexity
- Personas: Math Buddy, Dr. Nova, Professor Quill
- Config: `shared/tutorPersonas.ts`

### Storage Layer
- Interface: `IStorage` (in `server/storage.ts`)
- Implementation: `DatabaseStorage` (Drizzle ORM)
- Abstraction enables mocking for tests

### Middleware Pipeline (`server/index.ts`)
Request order:

1. **Helmet** — security headers (CSP, HSTS, etc.). CSP is relaxed in dev for Vite HMR.
2. **CORS** — permissive headers + OPTIONS preflight handler.
3. **`express.json()` / `urlencoded()`** — body parsing.
4. **Request logger** — duration + JSON snapshot for `/api` routes.
5. **`apiLimiter`** — 150 req / 15 min per IP on `/api`.
6. **Routes** — `registerRoutes(app)` mounts all routers (see §6).
7. **Error handlers** — route-level `err` handler, then `errorHandler` (last).
8. **`setupVite`** (dev) / `serveStatic` (prod).

Sensitive routes add their own limiters/middleware:
- `authLimiter` (10 req / 15 min) on login/register.
- `passwordResetLimiter` (5 / hour) on reset endpoints.
- `account-lockout` + `captcha` on login/reset after thresholds.

---

## 7. Offline & PWA

Offline caching was disabled to resolve stale-data issues; all data is fetched fresh from the server. The PWA shell (manifest + service worker) is still present and installable.

- **IndexedDB:** Code exists (`offline-storage.ts`) but initialization is disabled.
- **Service worker:** Present (`client/public/sw.js`); offline request interception disabled.
- **Data Saver mode:** Toggle exists; reduces payloads but does not cache.
- **To re-enable:** See `client/src/lib/offline-config.ts`; requires a cache-invalidation strategy.

---

Offline and PWA caching were disabled to resolve stale data issues. All data is fetched fresh from the server.

- **IndexedDB:** Code exists but initialization is disabled
- **Service worker:** Unregisters itself; no request interception
- **Data Saver mode:** Toggle exists but caching is off
- **To re-enable:** See `client/src/lib/offline-config.ts`; requires proper cache invalidation strategy

---

## 8. Security Model

- **Transport/headers:** Helmet (CSP, HSTS, frameguard, noSniff, referrerPolicy, etc.)
- **Auth:** JWT access token (short expiry) + refresh token; `authenticateToken` / `authorizeRoles` middleware
- **Roles:** student, teacher, superuser (RBAC on routes)
- **Passwords:** bcrypt hashing; account lockout after repeated failures
- **Rate limiting:** general (150/15 min), auth (10/15 min), password-reset (5/hr)
- **Abuse protection:** CAPTCHA on sensitive routes, password-reset throttling, security event logging
- **Validation:** Zod on inputs; Drizzle parameterized queries (SQL injection prevention)
- **Secrets:** `.env` git-ignored; never committed

---

## 9. Deployment Modes

| Mode | Components | Port |
|------|------------|------|
| Web (dev) | Client + Server | 5000 |
| Web (prod) | Built client + Express | 5000 |
| Telegram bot | telegram-bot/ + shared/ | — |
| Docker | Bot + optional Postgres | — |

See [DEPLOYMENT.md](./DEPLOYMENT.md) for details.
