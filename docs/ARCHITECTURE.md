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
│                     (Neon Serverless)                            │
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
| Database | PostgreSQL (Neon) | Data persistence |
| ORM | Drizzle | DB operations |
| AI | OpenAI GPT-4 | AI tutoring |
| Offline | — | Disabled (caching removed; fresh data only) |
| PWA | — | Service worker unregisters; no PWA install |

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
│   ├── routes/                # API routers
│   │   ├── admin.ts
│   │   ├── auth.ts
│   │   ├── blog.ts
│   │   ├── budget.ts
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
│   ├── ai-service.ts
│   ├── auth.ts
│   ├── db.ts
│   ├── storage.ts
│   └── index.ts
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
│   ├── init-badges.ts
│   ├── reset-admin-password.ts
│   └── test-badge-system.ts
│
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

---

## 7. Offline & PWA (Currently Disabled)

Offline and PWA caching were disabled to resolve stale data issues. All data is fetched fresh from the server.

- **IndexedDB:** Code exists but initialization is disabled
- **Service worker:** Unregisters itself; no request interception
- **Data Saver mode:** Toggle exists but caching is off
- **To re-enable:** See `client/src/lib/offline-config.ts`; requires proper cache invalidation strategy

---

## 8. Security Model

- JWT access token (short expiry) + refresh token
- Role-based access: student, teacher, superuser
- bcrypt password hashing
- Zod validation on inputs
- Drizzle parameterized queries (SQL injection prevention)

---

## 9. Deployment Modes

| Mode | Components | Port |
|------|------------|------|
| Web (dev) | Client + Server | 5000 |
| Web (prod) | Built client + Express | 5000 |
| Telegram bot | telegram-bot/ + shared/ | — |
| Docker | Bot + optional Postgres | — |

See [DEPLOYMENT.md](./DEPLOYMENT.md) for details.
