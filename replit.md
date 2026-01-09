# Replit MD

## Overview

This is a full-stack web application, "Keru.ai Suite", built with React and Express.js. It offers a multi-tool suite for educational and productivity purposes, including an AI study assistant, budget management, and travel information. The application aims to provide a modern single-page experience with a clean, responsive design.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application uses a monorepo structure separating client and server code.

**Key Architectural Decisions:**

*   **Frontend**: React (TypeScript, Vite, Wouter for routing)
*   **Backend**: Express.js (TypeScript)
*   **Database**: PostgreSQL with Drizzle ORM
*   **Styling**: Tailwind CSS with shadcn/ui components
*   **State Management**: React Query for server state
*   **Internationalization**: Custom LanguageContext for multi-language support (Spanish and English)
*   **Authentication**: JWT-based with access/refresh tokens and role-based access control.
*   **Data Flow**: Client requests via React Query -> Express API -> Storage Layer (PostgreSQL) -> JSON response cached by React Query.
*   **Admin Panel**: Role-based access for content management, user administration, and analytics.
*   **PWA**: Offline sync with JWT validation for queued mutations.

**UI/UX Decisions:**

*   Consistent UI patterns using shadcn/ui components.
*   Lucide React for UI icons, react-icons/fa for social media icons.
*   Clean, responsive design.

**Feature Specifications:**

*   **User Management**: CRUD operations for user entities.
*   **Budget Tracking**: Categories and transactions with CRUD.
*   **Study Notes**: Educational content storage with tags.
*   **Game Scores**: Tracking scores and achievements.
*   **AI Study Assistant**: Integration with AI for tutoring and content revision.
*   **Content Management**: Teachers can upload PDFs, images, documents; assignments with student submissions.
*   **Gamification**: Badges, levels, streaks, XP for student engagement.
*   **Analytics**: Privacy-compliant, anonymous user statistics for BudgetPal and chat analytics.
*   **Blog Management**: For the "Viajes y Cruceros" section.

## External Dependencies

**Frontend:**

*   **UI Components**: Radix UI primitives via shadcn/ui
*   **Styling**: Tailwind CSS
*   **Icons**: Lucide React, react-icons/fa
*   **Forms**: React Hook Form with Zod validation
*   **Date Handling**: date-fns
*   **Internationalization**: Shared LanguageContext

**Backend:**

*   **Database**: @neondatabase/serverless for PostgreSQL
*   **ORM**: Drizzle ORM
*   **Session Management**: connect-pg-simple for PostgreSQL session store
*   **Validation**: Zod

**Development Tools:**

*   **Build Tool**: Vite
*   **TypeScript**: Full-stack support
*   **Linting**: ESLint
*   **Development Server**: Hot reload with error overlay

## Frontend Routes

| Path | Component | Access |
|------|-----------|--------|
| `/` | LandingPage (unauthenticated) / Redirect to /dashboard (authenticated) | Public |
| `/auth` | AuthPage | Public |
| `/dashboard` | Dashboard | Protected |
| `/studybuddy` | StudyBuddy | Protected |
| `/revision` | StudentRevision | Protected (student only) |
| `/budgetpal` | BudgetPal | Protected |
| `/blog` | Blog | Protected |
| `/cruiseword` | CruiseWord | Protected |
| `/dao` | DAO | Protected |
| `/mentorship` | MentorshipHub | Protected |
| `/admin` | AdminDashboard | Protected (teacher/superuser) |

## Backend API Routes

| Prefix | Router | Purpose |
|--------|--------|---------|
| `/api/auth` | authRouter | Login, register, logout, token refresh, password reset |
| `/api/budget` | budgetRouter | Categories, transactions CRUD |
| `/api/study` | studyRouter | Study notes CRUD |
| `/api/games` | gamesRouter | Game scores |
| `/api/tutors` | tutorsRouter | AI tutor sessions, messages |
| `/api/progress` | progressRouter | Student progress, badges, streaks |
| `/api/content` | contentRouter | Teacher content submissions |
| `/api/assignments` | assignmentsRouter | Student assignments |
| `/api/admin` | adminRouter | Admin management, analytics |
| `/api/users` | (inline in index.ts) | User CRUD |

## Database Tables

| Table | Purpose |
|-------|---------|
| `users` | User accounts with roles (student, teacher, superuser) |
| `budgetCategories` | Budget category definitions per user |
| `budgetTransactions` | Individual budget transactions |
| `studyNotes` | Educational notes with tags |
| `gameScores` | Game scores and achievements |
| `tutorAgents` | AI tutor persona configurations |
| `tutorSessions` | AI tutoring session tracking |
| `tutorMessages` | Messages within tutor sessions |
| `studentProfiles` | Extended student data (XP, level, streaks) |
| `badges` | Badge definitions |
| `userBadges` | Earned badges per user |
| `studyStreaks` | Daily study streak tracking |
| `authTokens` | JWT tokens (access, refresh) |
| `contentSubmissions` | Teacher-uploaded content (PDFs, images) |
| `studentAssignments` | Assignments and submissions |
| `blogPosts` | Travel blog content |
| `mentorProfiles` | Mentor data for MentorshipHub |
| `communityPosts` | DAO community posts |

## Recent Changes (January 2026)

### Icon Library Migration
- **BEFORE**: FontAwesome classes (`fas fa-home`, `fab fa-facebook`)
- **AFTER**: lucide-react for UI icons, react-icons/fa for social icons
- FontAwesome CDN remains in index.html but is NOT used in React components

### Language Context Consolidation
All pages now use the shared LanguageContext:
```typescript
import { useLanguage } from '../contexts/LanguageContext';
const { language, setLanguage } = useLanguage();
```

Pages updated:
- CruiseWord.tsx
- BudgetPal.tsx  
- MentorshipHub.tsx

### CSS Fixes
- Removed `* { @apply border-border; }` that overrode custom styles
- Restored shadcn/ui default theme classes in Card and Tabs components

### Service Worker
- Cache version bumped to v5 in `client/public/sw.js`
- Forces browser to clear stale cached assets

## Troubleshooting

### Vite Cache Issues (Missing Chunk Files)
If you see errors like `The file does not exist at ".../chunk-XXXXX.js"`:

1. Clear Vite cache:
   ```bash
   rm -rf node_modules/.vite
   ```

2. Restart development server

3. Hard refresh browser: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)

4. If issues persist, unregister service worker:
   - DevTools → Application → Service Workers → Unregister

### Service Worker Cache Issues
The PWA uses aggressive caching. To force refresh:
1. Bump cache version in `client/public/sw.js`
2. Users need to refresh twice for new service worker

### Language Toggle Not Working Globally
Ensure the page uses shared LanguageContext, not local state:
```typescript
// WRONG
const [language, setLanguage] = useState('es');

// CORRECT
const { language, setLanguage } = useLanguage();
```

## Known Issues & Constraints

1. **Dark mode**: NOT implemented (user explicitly declined)
2. **vite.config.ts**: READ-ONLY - do not modify
3. **Some storage methods may be stubbed**: Check `server/storage.ts`
4. **Vite cache warnings**: Cosmetic, resolve after hard refresh

## Important Files

| File | Purpose |
|------|---------|
| `DOCUMENTATION.md` | Complete technical documentation |
| `shared/schema.ts` | Database schema (Drizzle) |
| `server/storage.ts` | Storage layer interface |
| `client/src/contexts/LanguageContext.tsx` | Shared language state |
| `client/public/sw.js` | Service worker (PWA caching) |
| `server/routes/index.ts` | API route registration |