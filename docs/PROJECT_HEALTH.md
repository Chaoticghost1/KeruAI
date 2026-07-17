# Project Health Report

## Keru.ai Suite — July 2026

---

## Working Features ✅

| Feature | Status |
|---------|--------|
| User Registration & Login | ✅ JWT, roles, bcrypt |
| AI Study Buddy | ✅ 3 personas, OpenAI + Perplexity |
| BudgetPal | ✅ Categories, transactions, Lempiras, real-time hooks |
| CruiseWord Game | ✅ Scores, leaderboard, my scores wired |
| MathMaster Game | ✅ Wired — scores, leaderboard, problems, XP/badges/streak to profile |
| LinguaPlay Game | ✅ Wired — scores, leaderboard, problems (level+mode), XP/badges/streak to profile |
| Travel Blog | ✅ View, admin CRUD |
| Admin Panel | ✅ Users, blog, personas, analytics, moderation, API-key mgmt |
| Gamification | ✅ Badges, levels, streaks, XP |
| Language Toggle | ✅ Spanish/English |
| Data Saver Mode | ✅ Toggle |
| Protected Routes | ✅ Auth + role checks |
| MentorshipHub | ✅ Wired — `/api/mentorship/*` (mentors, applications, requests, sessions, materials) |
| Class Groups | ✅ Teacher-created classes, invite codes, chat archives |
| Student Profile | ✅ Profile page + student/teacher linkage |
| Security Middleware | ✅ Helmet, rate limiting, account lockout, CAPTCHA, security logging |
| Local / Docker Postgres | ✅ `pg` TCP driver auto-selected for non-Neon URLs |

---

## Partial / Pending ⚠️

| Feature | Status |
|---------|--------|
| Student Revision | ✅ **Wired** — uses `/api/assignments/revision/*`; requires verified student |
| DAO | Static UI; no backend API |
| Blog (public read) | ✅ **Fixed** — `/api/blog/posts` public endpoint + Blog page fetches and displays published posts |
| Offline / PWA | **Disabled** — Caching and offline functionality removed; all data fetched fresh from server |
| Email Verification | Flow exists; no email provider |
| Password Reset | Flow exists; no email provider (rate-limited + throttled) |
| `tsc` typecheck | ⚠️ Some errors remain (iteration target, route component typing) — `npm run check` not fully clean |

---

## Technical Debt

| Issue | Severity | Status |
|-------|----------|--------|
| No automated tests | High | Addressed — Vitest added; minimal unit tests (see `npm run test`) |
| IStorage interface gaps | Medium | Addressed — Analytics methods typed in `server/storage.ts` |
| Error boundaries missing | Medium | Addressed — `client/src/components/ErrorBoundary.tsx` |
| Rate limiting missing | Medium | Addressed — `server/middleware/rate-limit.ts` (+ auth & password-reset limiters) |
| Security headers missing | Medium | Addressed — Helmet CSP/HSTS in `server/index.ts` |
| Account lockout / CAPTCHA | Medium | Addressed — `server/middleware/*` |
| Some `any` types in admin routes | Low | Addressed — catch blocks use `unknown` + `getErrorMessage()` |
| `tsc` strict errors | Low | Pending — `--downlevelIteration` / route typing |

---

## Known Constraints

| Constraint | Description |
|------------|-------------|
| vite.config.ts | Mostly fixed — Replit plugins; avoid breaking dev banner/cartographer |
| Dark mode | NOT implemented (user declined) |
| Icons | lucide-react + react-icons/fa; Font Awesome via CDN stylesheet |

---

## Security / npm audit

- **Resolved:** Critical (form-data, qs) and high, plus esbuild moderate, addressed via `package.json` overrides and `node-telegram-bot-api@^0.67.0`. Run `npm run audit` to re-check.
- **Accepted risk (4 moderate):** `request` (GHSA-p8p7-x288-28g6, SSRF). Brought in by `node-telegram-bot-api` → `@cypress/request-promise` → `request`. The `request` package is deprecated with no fix. Mitigation: Telegram bot only sends outbound requests to Telegram’s API (we control the URL), so SSRF exposure is limited. Revisit if replacing the Telegram client.
- **Hardened (Jul 2026):** Added Helmet security headers, layered rate limiting (general 150/15m, auth 10/15m, password-reset 5/hr), account lockout, password-reset throttling, CAPTCHA on sensitive routes, and a security event logger. `.env` is git-ignored and never committed.

---

## Immediate Actions

1. ~~Fix IStorage interface to match implementation~~ — Done
2. ~~Wire BudgetPal frontend to `/api/budget/*`~~ — Done
3. ~~Wire MentorshipHub to `/api/mentorship/*`~~ — Done
4. ~~**Add public blog read endpoint**~~ — Done: `/api/blog/posts` + Blog page wired
5. ~~Implement offline sync~~ — Offline disabled; fresh data only (revisit if re-enabling)
6. ~~Add error boundaries to React app~~ — Done: `ErrorBoundary` wraps app and main content
7. Set up email service (verification, reset)
8. ~~Add automated tests~~ — Done: Vitest + unit tests; run `npm run test`
9. ~~Add security middleware (Helmet, rate-limit, lockout, CAPTCHA)~~ — Done
10. ~~Local/Docker Postgres support~~ — Done: `pg` driver auto-selected
11. Clean up remaining `tsc` typecheck errors
