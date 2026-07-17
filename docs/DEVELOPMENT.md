# Development Guide

## Keru.ai Suite — Local Setup & Development

---

## 1. Prerequisites

- **Node.js:** 20+
- **npm:** 10+
- **PostgreSQL:** Local install, **Docker** (recommended), or [Neon](https://neon.tech) serverless

> **Driver note:** `server/db.ts` auto-selects the DB driver. Neon URLs (`*.neon.tech`) use `@neondatabase/serverless` (WebSocket). All other URLs use the standard `pg` TCP driver. No code change is needed to switch between them.

---

## 2. Quick Start

```bash
# Clone repository
cd StudyBuddyAI

# Install dependencies
npm install

# Configure environment (copy .env.example to .env)
cp .env.example .env
# Edit .env with DATABASE_URL, JWT_SECRET, OPENAI_API_KEY

# Push schema to database
npm run db:push

# Start development server
npm run dev
```

Visit `http://localhost:5000`

---

## 3. npm Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server (Vite + Express) — uses `cross-env` for `NODE_ENV=development` on all platforms |
| `npm run build` | Build frontend + backend for production |
| `npm run start` | Run production build (`node dist/index.js`) |
| `npm run check` | TypeScript check (`tsc`) |
| `npm run db:push` | Push Drizzle schema to database |

---

## 4. Environment Variables

### Required
| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret for access tokens |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens |

### Optional (AI Features)
| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | OpenAI API key for GPT |
| `PERPLEXITY_API_KEY` | Perplexity fallback |

### Optional (Telegram Bot)
| Variable | Description |
|----------|-------------|
| `TELEGRAM_BOT_TOKEN` | Telegram bot token |

### Optional (Web Interface)
| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | API base URL (for local dev) |

---

## 5. Project Conventions

### Frontend
- **Icons:** `lucide-react` for UI; `react-icons/fa` for social
- **Language:** Use `useLanguage()` from `LanguageContext` (not local state)
- **Styling:** Tailwind CSS + shadcn/ui

### Backend
- **Validation:** Zod schemas
- **Storage:** IStorage interface in `server/storage.ts`
- **Legacy auth:** `POST/GET /api/users*` are kept for scripts/tools; use `/api/auth/register` and `/api/auth/me` in the app.
- **Future OAuth:** `getUserByGoogleId` and `getUserByFacebookId` exist in storage for future Google/Facebook login; no routes or frontend use them yet.

### Known Constraints
| Constraint | Reason |
|------------|--------|
| `vite.config.ts` READ-ONLY | Modifying breaks Replit environment |
| No dark mode | User declined |
| Service worker cache v5 | Bump version in `client/public/sw.js` for new assets |

---

## 6. Troubleshooting

### Cache and fresh data (classes not showing)

Offline and request caching are disabled; the app fetches fresh data from the server. If classes or other data don’t appear after a deploy or config change, clear site data and service workers once:

**Chrome / Edge**

1. Open DevTools (F12) → **Application** tab.
2. **Storage** → **Clear site data** (check all) → confirm.
3. **Service Workers** → Unregister any listed.
4. Close DevTools and hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac).

**Firefox**

1. Open DevTools (F12) → **Storage** tab → delete all for this site.
2. In the address bar open `about:serviceworkers` → Unregister any for this origin.
3. Close DevTools and hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac).

If it still fails: clear all browser data for the site (Settings → Privacy), restart the browser, or try an incognito/private window.

### Classes Navigation
| Role | Path | What you see |
|------|------|--------------|
| Anyone | `/classes` or sidebar → Conectar → Clases y Grupos | Class Groups page |
| Teacher/Admin | `/admin#classes` or Admin → Clases y Grupos | Same page, manage classes |
| Student | Join with invite code from teacher | My chat groups |

### API Diagnostic Script
Run full API workflow checks: `npm run diagnose` (with dev server running). Tests auth, budget, games, assignments, blog, admin endpoints. See `scripts/diagnose-api.mjs`.

### Vite Cache Errors (chunk-XXXX.js not found)
```bash
rm -rf node_modules/.vite
npm run dev
```
Then hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)

### Service Worker Stale Cache
1. DevTools → Application → Service Workers → Unregister
2. Or bump cache version in `client/public/sw.js`
3. Refresh twice for new service worker to activate

### Language Toggle Not Working
Ensure page uses shared context:
```typescript
// CORRECT
const { language, setLanguage } = useLanguage();

// WRONG — breaks global toggle
const [language, setLanguage] = useState('es');
```

### Database Connection Issues
- Verify `DATABASE_URL` format.
- **Local/Docker:** ensure Postgres is listening on the port in `DATABASE_URL` (default `5432`). With Docker: `docker ps` should show `studybuddy-postgres` and `docker logs studybuddy-postgres` should show `ready`.
- **Neon:** ensure the connection string includes `neon.tech` and the pooler is enabled; the serverless driver connects over WebSocket.
- The app auto-picks the driver — local/non-Neon URLs use the `pg` TCP driver, Neon URLs use `@neondatabase/serverless`. If you see a `wss://.../v2` connection error, you are running a non-Neon URL through the serverless path; switch `DATABASE_URL` to a plain `postgresql://` string (the `pg` driver handles it).
- Run `npm run db:push` after schema changes.

### Error boundaries and rate limiting (Phase 1)
- **Error boundaries:** React errors are caught by `client/src/components/ErrorBoundary.tsx`, which wraps the app and the main content area. A fallback UI with "Reload" and "Go home" is shown if a component throws.
- **Rate limiting:** Applied to all `/api` routes (150 requests per 15 minutes per IP). Login and register use a stricter limit (10 per 15 min per IP). Configured in `server/middleware/rate-limit.ts` and mounted in `server/index.ts` and `server/routes/auth.ts`.

### Tests
- Run: `npm run test` (single run) or `npm run test:watch` (watch mode).
- Test files: `server/**/*.test.ts` and `server/**/*.spec.ts`.
- Phase 1 coverage is minimal (unit tests for shared helpers); API/integration tests can be added later with a test database.

---

## 7. Utility Scripts

| Script | Purpose |
|--------|---------|
| `npm run test` | Run Vitest tests (unit tests in `server/**/*.test.ts`) |
| `npm run test:watch` | Run Vitest in watch mode |
| `npm run init-badges` | Initialize badge definitions (uses `.env` for DB) |
| `npm run seed:math` | Seed MathMaster problems (~120; skips if table has data) |
| `npm run seed:language` | Seed LinguaPlay problems (~120; skips if table has data) |
| `npm run seed:games` | Run both seed:math and seed:language |
| **`npm run setup:games`** | **One-shot: db:push + init-badges + seed:games (ready to go)** |
| `scripts/create-admin.ts` | Create or reset admin user (run `npm run create-admin`) |
| `scripts/reset-admin-password.ts` | Reset admin password (legacy; prefer `create-admin`) |
| `scripts/test-badge-system.ts` | Test badge logic |
| `scripts/diagnose-api.mjs` | API workflow diagnostic (run `npm run diagnose`) |

**Game content and CSV:** You do **not** need CSV files to run the games. The seed scripts ship with ~120 math and ~120 language problems. If later you want to add hundreds more (e.g. from a spreadsheet), you can export to CSV and add a small import in `scripts/seed-math-problems.ts` / `scripts/seed-language-problems.ts` that reads the CSV and inserts rows; the table columns match the checklist templates in `docs/GAMES.md`.

---

## 8. Key Files

| File | Purpose |
|------|---------|
| `shared/schema.ts` | Database schema |
| `server/storage.ts` | Storage layer interface |
| `server/routes/index.ts` | API route registration |
| `client/src/contexts/LanguageContext.tsx` | Shared language state |
| `client/src/lib/protected-route.tsx` | Route protection |
| `client/public/sw.js` | Service worker |
| `shared/tutorPersonas.ts` | AI tutor personas |
