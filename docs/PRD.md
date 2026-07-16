# Product Requirements Document (PRD)

## Keru.ai Suite

**Version:** 1.0  
**Last Updated:** February 2026  
**Status:** Active Development (Phase 1 complete)

---

## 1. Executive Summary

Keru.ai Suite is a multi-language educational and productivity platform designed for Honduras and Central America. It combines AI-powered tutoring, personal finance management, travel information, and gamified learning into a unified platform optimized for low-bandwidth environments.

---

## 2. Vision & Mission

**Vision:** Empower learners and young adults in Honduras and Central America through accessible, AI-enhanced education and practical life skills tools.

**Mission:** Provide a unified platform that delivers:
- Quality AI tutoring aligned with local curricula
- Financial literacy tools for informal workers and students
- Career and travel information (e.g., cruise industry)
- Community-driven features for local development

---

## 3. Target Market

| Segment | Geography | Primary Need |
|---------|-----------|--------------|
| Students | Honduras, Central America | AI tutoring, revision materials, gamified learning |
| Teachers | Honduras, Central America | Content management, student progress, grading |
| Administrators | Schools, institutions | User management, analytics |
| Young Adults | Honduras, Central America | Budget tracking, career resources |
| Travelers | Regional | Cruise/travel blog content |

**Primary Language:** Spanish (Honduras dialect)  
**Secondary Language:** English

---

## 4. User Personas

### Persona 1: María (Student, 14)
- Needs help with math, science, and language arts
- Limited internet; uses mobile often
- Motivated by gamification (badges, streaks, XP)
- Uses AI tutors for homework and exam prep

### Persona 2: Profesor Carlos (Teacher)
- Manages content and assignments for multiple classes
- Tracks student progress and grades
- Uploads PDFs, images, and documents
- Needs admin analytics and user management

### Persona 3: Ana (Young Adult, 22)
- Informal worker; needs budget tracking
- Curious about cruise industry jobs
- Uses BudgetPal for Lempiras
- Reads travel blog for career inspiration

### Persona 4: Admin Roberto (Superuser)
- Manages platform users and roles
- Manages blog content and AI personas
- Monitors analytics and system health

---

## 5. Core Features

### 5.1 AI Study Buddy
- **Description:** AI tutoring with 3 personas (Math Buddy, Dr. Nova, Professor Quill)
- **Acceptance Criteria:**
  - Users can select tutor and start session
  - OpenAI GPT-4 primary; Perplexity fallback
  - Conversations stored per session
  - XP and badges awarded for sessions
- **Status:** ✅ Implemented

### 5.2 BudgetPal
- **Description:** Personal finance with categories and transactions
- **Acceptance Criteria:**
  - Create/edit/delete categories and transactions
  - Lempiras currency support
  - Charts and summaries
  - Offline support
- **Status:** ✅ Implemented

### 5.3 CruiseWord Game
- **Description:** Vocabulary game for cruise/travel terminology
- **Acceptance Criteria:**
  - Game mechanics, scoring, levels
  - Scores stored and displayed
  - Bilingual support
- **Status:** ✅ Implemented

### 5.3a MathMaster Game
- **Description:** 6-level math game (Arithmetic → Calculus) with multiple-choice problems, links to Math Buddy.
- **Acceptance Criteria:** Level selector, problem fetch from API, score/leaderboard/progress, bilingual, offline cache.
- **Status:** ✅ Implemented (Phase 1). See [GAMES.md](docs/GAMES.md).

### 5.3b LinguaPlay Game
- **Description:** 6-level language game with modes (vocabulary, grammar, listening, spelling, pronunciation), links to Professor Quill.
- **Acceptance Criteria:** Level + mode selector, problem fetch, score/leaderboard/progress, bilingual, offline cache.
- **Status:** ✅ Implemented (Phase 1). See [GAMES.md](docs/GAMES.md).

### 5.4 Travel Blog
- **Description:** Cruise and travel content
- **Acceptance Criteria:**
  - View blog posts by category
  - Admin CRUD for posts
  - Categories: cruises, destinations, travel-tips, reviews
- **Status:** ✅ Implemented

### 5.5 Student Revision
- **Description:** Revision materials for students
- **Acceptance Criteria:**
  - Student-only access
  - Content from teacher assignments
  - AI-assisted revision (future)
- **Status:** ⚠️ Partial (UI exists; AI integration pending)

### 5.6 Admin Panel
- **Description:** User, content, and system management
- **Acceptance Criteria:**
  - User list, status, role changes, delete
  - Blog post CRUD
  - Bot persona CRUD
  - Analytics dashboard
- **Status:** ✅ Implemented

### 5.7 Gamification
- **Description:** Badges, levels, streaks, XP
- **Acceptance Criteria:**
  - Badge definitions and earning logic
  - Level/XP progression
  - Streak tracking
  - Profile display
- **Status:** ✅ Implemented

### 5.8 DAO & Mentorship
- **Description:** Community and mentorship features
- **Acceptance Criteria:**
  - Basic UI for DAO and MentorshipHub
  - Peer mentorship (future)
  - Community posts (future)
- **Status:** ⚠️ Partial — MentorshipHub **wired** to `/api/mentorship/*` (mentors, requests, sessions); DAO remains static placeholder with no backend

---

## 6. Non-Functional Requirements

### 6.1 Performance
- PWA with offline-first design
- Low-bandwidth optimized
- Service worker caching

### 6.2 Security
- JWT authentication (access + refresh tokens)
- Role-based access (student, teacher, superuser)
- bcrypt password hashing
- Input validation (Zod)

### 6.3 Internationalization
- Spanish (default)
- English
- Shared LanguageContext for all pages

### 6.4 Accessibility
- Responsive design (mobile-first)
- PWA installable
- Data Saver mode for constrained connections

---

## 7. Success Metrics

| Metric | Target |
|--------|--------|
| User registration | Growth rate |
| AI tutoring sessions | Sessions per user per week |
| BudgetPal usage | Active users, transactions |
| Gamification engagement | Badge earn rate, streak retention |
| Platform uptime | 99%+ |
| Load time (PWA) | < 3s on 3G |

---

## 8. Out of Scope (Current Phase)

- Dark mode (explicitly declined)
- Social login (Google/Facebook OAuth) — schema ready, not implemented
- Email verification — flow exists, no provider
- Password reset email — flow exists, no provider
- Full peer mentorship UI
- Full DAO governance logic
- Native mobile apps (PWA only)

---

## 9. Roadmap

### Phase 1: Core Stabilization (Completed Feb 2026)
- [x] Authentication, AI tutoring, budget, gamification
- [x] Game hub: CruiseWord, MathMaster, LinguaPlay (see [GAMES.md](docs/GAMES.md))
- [x] Fix orphaned code, consolidate components
- [x] Improve error handling

### Phase 2: Content & AI Enhancement
- [ ] PDF text extraction integration
- [ ] OCR for images
- [ ] AI-powered content revision
- [ ] Auto-generated practice questions

### Phase 3: Community Features
- [ ] Peer mentorship launch
- [ ] Community Q&A forum
- [ ] Teacher-student messaging

### Phase 4: Mobile & Distribution
- [ ] Enhanced PWA, push notifications
- [ ] Android/iOS wrapper (Capacitor)
- [ ] School partnerships

### Phase 5: Advanced Features
- [ ] Voice tutoring
- [ ] Video lessons
- [ ] AR/VR experiments

---

## 10. Constraints

| Constraint | Reason |
|------------|--------|
| vite.config.ts READ-ONLY | Modifying breaks Replit environment |
| No dark mode | User declined |
| Icons: lucide-react + react-icons/fa | Migration complete; FontAwesome not used in components |

---

## 11. Glossary

- **Lempiras:** Honduran currency (HNL)
- **PWA:** Progressive Web App
- **XP:** Experience points (gamification)
- **RAG:** Retrieval Augmented Generation (future AI feature)
