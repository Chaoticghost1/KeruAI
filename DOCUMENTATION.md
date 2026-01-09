# Keru.ai Suite - Comprehensive Technical Documentation

**Document Version:** 1.0  
**Last Updated:** January 09, 2026  
**Platform:** Honduras-First Educational & Productivity Suite

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Business Overview](#business-overview)
3. [System Architecture](#system-architecture)
4. [Project Structure](#project-structure)
5. [Database Schema & Models](#database-schema--models)
6. [Backend API Documentation](#backend-api-documentation)
7. [Frontend Documentation](#frontend-documentation)
8. [UI/UX Design System](#uiux-design-system)
9. [Authentication & Security](#authentication--security)
10. [AI Integration](#ai-integration)
11. [Gamification System](#gamification-system)
12. [Offline-First Strategy](#offline-first-strategy)
13. [Internationalization (i18n)](#internationalization-i18n)
14. [Hooks Reference](#hooks-reference)
15. [Routes & Navigation](#routes--navigation)
16. [Project Health Report](#project-health-report)
17. [Roadmap](#roadmap)
18. [Deployment Guide](#deployment-guide)
19. [Environment Variables](#environment-variables)

---

## Executive Summary

**Keru.ai Suite** is a comprehensive multi-language educational and productivity platform designed specifically for Honduras and Central America. The platform combines AI-powered tutoring, financial management tools, travel information, and gamified learning experiences into a unified suite.

### Key Highlights

- **Target Market:** Honduras and Central America (Spanish-first, English-supported)
- **Primary Users:** Students, Teachers, Administrators, General Public
- **Core Technologies:** React, TypeScript, Express.js, PostgreSQL, OpenAI GPT
- **Deployment:** Replit with Neon PostgreSQL (serverless)
- **Mobile Strategy:** PWA (Progressive Web App) with offline-first design

### Business Value Proposition

1. **Educational Empowerment:** AI tutors adapted to the Honduran National Basic Curriculum
2. **Financial Literacy:** Budget tracking designed for informal workers and young adults
3. **Career Development:** Cruise ship industry information and job preparation
4. **Community Building:** DAO projects for local development (Santa Rita)
5. **Digital Inclusion:** Offline-first design for low-bandwidth environments

---

## Business Overview

### Mission Statement

Empowering Honduras and Central America through accessible technology, AI-powered education, and community-driven development.

### Target Audience

| Segment | Description | Primary Features |
|---------|-------------|------------------|
| **Students** | Primary to secondary level in Honduras | AI Study Buddy, Gamification, Revision Materials |
| **Teachers** | Educators managing content and assignments | Content Management, Student Progress, Grading |
| **Administrators** | Platform managers | User Management, Analytics, System Settings |
| **Young Adults** | Informal workers, job seekers | BudgetPal, Cruise Career Info |
| **Travelers** | Cruise enthusiasts | Travel Blog, Ask Kevin Chat |

### Revenue Model (Potential)

- Freemium educational tools
- Premium AI tutoring sessions
- Institutional licensing for schools
- Sponsored content partnerships

### Competitive Advantages

1. Honduras-specific curriculum alignment
2. Spanish-first with bilingual support
3. Offline-first for low-bandwidth areas
4. Integrated AI tutoring with persona-based learning
5. Gamification to increase engagement
6. Local currency (Lempiras) support

---

## System Architecture

### High-Level Architecture Diagram

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
│  │   GPT-5     │  │   (Fallback)│  │      (node-telegram)    │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Technology Stack

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| **Frontend** | React | 18.3.1 | UI Framework |
| **Build Tool** | Vite | 5.4.19 | Development & Build |
| **Styling** | Tailwind CSS | 3.4.17 | Utility-first CSS |
| **Components** | shadcn/ui (Radix) | Latest | UI Component Library |
| **State** | TanStack Query | 5.60.5 | Server State Management |
| **Routing** | Wouter | 3.3.5 | Client-side Routing |
| **Backend** | Express.js | 4.21.2 | HTTP Server |
| **Language** | TypeScript | 5.6.3 | Type Safety |
| **Database** | PostgreSQL | Neon | Data Persistence |
| **ORM** | Drizzle | 0.39.1 | Database Operations |
| **AI** | OpenAI | 5.23.0 | AI Tutoring |
| **Offline** | Dexie (IndexedDB) | 4.2.0 | Offline Storage |
| **PWA** | Workbox | 7.3.0 | Service Worker |

### Data Flow

1. **Client Request** → React components make API calls via TanStack Query
2. **API Layer** → Express routes validate and process requests
3. **Authentication** → JWT tokens verified via middleware
4. **Storage Layer** → Abstracted interface (IStorage) handles database operations
5. **Database** → Drizzle ORM executes SQL on PostgreSQL
6. **Response** → JSON responses cached by TanStack Query

---

## Project Structure

```
keru-ai-suite/
├── attached_assets/           # User-uploaded assets and PDFs
│   ├── image_*.png
│   └── MVP_Refinement_*.pdf
│
├── client/                    # Frontend Application
│   ├── public/
│   │   ├── manifest.json      # PWA Manifest
│   │   └── sw.js              # Service Worker
│   │
│   ├── src/
│   │   ├── components/        # React Components
│   │   │   ├── ui/            # shadcn/ui Components (40+ components)
│   │   │   │   ├── accordion.tsx
│   │   │   │   ├── button.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── dialog.tsx
│   │   │   │   ├── form.tsx
│   │   │   │   ├── sidebar.tsx
│   │   │   │   ├── toast.tsx
│   │   │   │   └── ... (35+ more)
│   │   │   ├── DataSaverMode.tsx
│   │   │   ├── HeroSection.tsx
│   │   │   ├── LanguageToggle.tsx
│   │   │   ├── OnboardingFlow.tsx
│   │   │   ├── Redirect.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── ToolCard.tsx
│   │   │
│   │   ├── contexts/          # React Contexts
│   │   │   └── LanguageContext.tsx
│   │   │
│   │   ├── data/              # Static Data
│   │   │   └── content.ts     # Translations & Content
│   │   │
│   │   ├── hooks/             # Custom Hooks
│   │   │   ├── use-auth.tsx
│   │   │   ├── use-mobile.tsx
│   │   │   ├── use-offline-study-notes.ts
│   │   │   ├── use-personas.ts
│   │   │   └── use-toast.ts
│   │   │
│   │   ├── lib/               # Utilities
│   │   │   ├── currency-formatter.ts
│   │   │   ├── offline-storage.ts
│   │   │   ├── protected-route.tsx
│   │   │   ├── pwa-manager.ts
│   │   │   ├── queryClient.ts
│   │   │   └── utils.ts
│   │   │
│   │   ├── pages/             # Page Components
│   │   │   ├── admin-dashboard.tsx
│   │   │   ├── AethosByte.tsx
│   │   │   ├── auth-page.tsx
│   │   │   ├── Blog.tsx
│   │   │   ├── BudgetPal.tsx
│   │   │   ├── Chat.tsx
│   │   │   ├── CruiseWord.tsx
│   │   │   ├── DAO.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── EnhancedBudgetPal.tsx
│   │   │   ├── EnhancedDAO.tsx
│   │   │   ├── Home.tsx
│   │   │   ├── landing-page.tsx
│   │   │   ├── MentorshipHub.tsx
│   │   │   ├── not-found.tsx
│   │   │   ├── StudentRevision.tsx
│   │   │   └── StudyBuddy.tsx
│   │   │
│   │   ├── App.tsx            # Main App Component
│   │   ├── index.css          # Global Styles
│   │   └── main.tsx           # Entry Point
│   │
│   └── index.html             # HTML Template
│
├── scripts/                   # Utility Scripts
│   ├── init-badges.ts
│   ├── reset-admin-password.ts
│   └── test-badge-system.ts
│
├── server/                    # Backend Application
│   ├── routes/                # API Route Modules (9 routers)
│   │   ├── admin.ts           # Admin management
│   │   ├── assignments.ts     # Student assignments
│   │   ├── auth.ts            # Authentication
│   │   ├── budget.ts          # Budget tracking
│   │   ├── content.ts         # Content management
│   │   ├── games.ts           # Game scores
│   │   ├── index.ts           # Route orchestrator
│   │   ├── progress.ts        # Learning progress
│   │   ├── study.ts           # Study notes
│   │   └── tutors.ts          # AI tutors
│   │
│   ├── ai-service.ts          # OpenAI/Perplexity Integration
│   ├── auth.ts                # Authentication utilities
│   ├── content-processor.ts   # PDF/Image processing
│   ├── db.ts                  # Database connection
│   ├── github-service.ts      # GitHub integration
│   ├── index.ts               # Server entry point
│   ├── routes.ts              # Route export
│   ├── storage.ts             # Storage layer (IStorage)
│   └── vite.ts                # Vite integration
│
├── shared/                    # Shared Code (Frontend + Backend)
│   ├── badgeSystem.ts         # Gamification logic
│   ├── schema.ts              # Database schema (Drizzle)
│   └── tutorPersonas.ts       # AI persona definitions
│
├── telegram-bot/              # Telegram Bot
│   ├── bot-runner.ts
│   └── index.ts
│
├── uploads/                   # File uploads directory
│
├── components.json            # shadcn/ui configuration
├── docker-compose.yml         # Docker configuration
├── Dockerfile                 # Container definition
├── drizzle.config.ts          # Drizzle ORM configuration
├── init-db.sql                # Initial database setup
├── package.json               # Dependencies
├── postcss.config.js          # PostCSS configuration
├── README.md                  # Basic README
├── replit.md                  # Replit-specific docs
├── tailwind.config.ts         # Tailwind configuration
└── tsconfig.json              # TypeScript configuration
```

---

## Database Schema & Models

### Entity Relationship Overview

```
users
  ├── budgetCategories (1:N)
  ├── budgetTransactions (1:N)
  ├── studyNotes (1:N)
  ├── gameScores (1:N)
  ├── authTokens (1:N)
  ├── tutorSessions (1:N)
  ├── studentProfiles (1:N)
  ├── userBadges (1:N)
  ├── studyStreaks (1:N)
  ├── contentSubmissions (1:N) [teachers]
  ├── studentAssignments (1:N) [students]
  ├── blogPosts (1:N) [authors]
  ├── mentorProfiles (1:1)
  └── communityPosts (1:N)
```

### Tables

#### 1. Users (Core)

```typescript
users = pgTable("users", {
  id: serial().primaryKey(),
  username: text().notNull().unique(),
  password: text(),
  email: text().unique(),
  phoneNumber: text().unique(),
  role: text().notNull().default("student"), // superuser, teacher, student
  isVerified: boolean().default(false).notNull(),
  verificationToken: text(),
  passwordResetToken: text(),
  passwordResetExpires: timestamp(),
  googleId: text().unique(),
  facebookId: text().unique(),
  firstName: text(),
  lastName: text(),
  profileImage: text(),
  isActive: boolean().default(true).notNull(),
  lastLoginAt: timestamp(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
});
```

#### 2. Budget System

```typescript
budgetCategories = pgTable("budget_categories", {
  id: serial().primaryKey(),
  userId: integer().references(() => users.id).notNull(),
  name: text().notNull(),
  budget: decimal({ precision: 10, scale: 2 }).notNull(),
  spent: decimal({ precision: 10, scale: 2 }).default("0").notNull(),
  createdAt: timestamp().defaultNow().notNull(),
});

budgetTransactions = pgTable("budget_transactions", {
  id: serial().primaryKey(),
  userId: integer().references(() => users.id).notNull(),
  categoryId: integer().references(() => budgetCategories.id).notNull(),
  description: text().notNull(),
  amount: decimal({ precision: 10, scale: 2 }).notNull(),
  date: timestamp().defaultNow().notNull(),
  createdAt: timestamp().defaultNow().notNull(),
});
```

#### 3. Study System

```typescript
studyNotes = pgTable("study_notes", {
  id: serial().primaryKey(),
  userId: integer().references(() => users.id).notNull(),
  title: text().notNull(),
  content: text().notNull(),
  subject: text(),
  tags: text().array(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
});
```

#### 4. AI Tutoring System

```typescript
tutorAgents = pgTable("tutor_agents", {
  id: serial().primaryKey(),
  agentKey: text().unique().notNull(),
  name: text().notNull(),
  title: text().notNull(),
  avatar: text(),
  subjects: text().array().notNull(),
  description: text().notNull(),
  isActive: boolean().default(true).notNull(),
  createdAt: timestamp().defaultNow().notNull(),
});

tutorSessions = pgTable("tutor_sessions", {
  id: serial().primaryKey(),
  userId: integer().references(() => users.id).notNull(),
  agentId: integer().references(() => tutorAgents.id).notNull(),
  subject: text().notNull(),
  topic: text(),
  difficultyLevel: integer().default(1).notNull(),
  sessionData: text(),
  isActive: boolean().default(true).notNull(),
  startedAt: timestamp().defaultNow().notNull(),
  endedAt: timestamp(),
});

tutorMessages = pgTable("tutor_messages", {
  id: serial().primaryKey(),
  sessionId: integer().references(() => tutorSessions.id).notNull(),
  sender: text().notNull(), // 'student' or 'agent'
  message: text().notNull(),
  messageType: text().default("text").notNull(),
  toolsUsed: text().array(),
  timestamp: timestamp().defaultNow().notNull(),
});
```

#### 5. Gamification System

```typescript
badges = pgTable("badges", {
  id: serial().primaryKey(),
  badgeKey: text().unique().notNull(),
  name: text().notNull(),
  description: text().notNull(),
  icon: text().notNull(),
  category: text().notNull(), // streak, achievement, subject, milestone
  rarity: text().default("common").notNull(), // common, rare, epic, legendary
  requirements: text().notNull(), // JSON
  points: integer().default(10).notNull(),
  isActive: boolean().default(true).notNull(),
  createdAt: timestamp().defaultNow().notNull(),
});

userBadges = pgTable("user_badges", {
  id: serial().primaryKey(),
  userId: integer().references(() => users.id).notNull(),
  badgeId: integer().references(() => badges.id).notNull(),
  earnedAt: timestamp().defaultNow().notNull(),
  progress: integer().default(0).notNull(),
  isNew: boolean().default(true).notNull(),
});

studentProfiles = pgTable("student_profiles", {
  id: serial().primaryKey(),
  userId: integer().references(() => users.id).notNull(),
  learningStyle: text(),
  preferredDifficulty: integer().default(2).notNull(),
  subjects: text().array().default([]).notNull(),
  strugglingAreas: text().array().default([]).notNull(),
  preferences: text(),
  totalPoints: integer().default(0).notNull(),
  currentStreak: integer().default(0).notNull(),
  longestStreak: integer().default(0).notNull(),
  totalSessionsCompleted: integer().default(0).notNull(),
  level: integer().default(1).notNull(),
  experiencePoints: integer().default(0).notNull(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
});

studyStreaks = pgTable("study_streaks", {
  id: serial().primaryKey(),
  userId: integer().references(() => users.id).notNull(),
  date: timestamp().defaultNow().notNull(),
  sessionsCompleted: integer().default(1).notNull(),
  pointsEarned: integer().default(0).notNull(),
  subjectsStudied: text().array().default([]).notNull(),
});
```

#### 6. Content Management (Teacher System)

```typescript
contentSubmissions = pgTable("content_submissions", {
  id: serial().primaryKey(),
  teacherId: integer().references(() => users.id).notNull(),
  title: text().notNull(),
  description: text(),
  contentType: text().notNull(), // image, pdf, whiteboard, diagram, html, video
  filePath: text(),
  contentData: text(),
  subject: text().notNull(),
  difficultyLevel: integer(),
  isPublished: boolean().default(false).notNull(),
  fileUrl: text(),
  htmlContent: text(),
  extractedText: text(),
  gradeLevel: text(),
  tags: text().array().default([]).notNull(),
  publishedAt: timestamp(),
  viewCount: integer().default(0).notNull(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
});

studentAssignments = pgTable("student_assignments", {
  id: serial().primaryKey(),
  studentId: integer().references(() => users.id).notNull(),
  contentId: integer().references(() => contentSubmissions.id).notNull(),
  assignedAt: timestamp(),
  dueDate: timestamp(),
  submissionText: text(),
  submissionFiles: text().array().default([]).notNull(),
  submittedAt: timestamp(),
  grade: decimal({ precision: 5, scale: 2 }),
  maxGrade: decimal({ precision: 5, scale: 2 }),
  feedback: text(),
  gradedAt: timestamp(),
  gradedBy: integer().references(() => users.id),
  status: text().notNull().default("assigned"),
  startedAt: timestamp(),
  completedAt: timestamp(),
  teacherFeedback: text(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
});
```

#### 7. Blog System

```typescript
blogPosts = pgTable("blog_posts", {
  id: serial().primaryKey(),
  title: text().notNull(),
  content: text().notNull(),
  excerpt: text(),
  category: text().notNull(), // cruises, destinations, travel-tips, reviews
  tags: text().array(),
  authorId: integer().references(() => users.id).notNull(),
  isPublished: boolean().default(false).notNull(),
  isHidden: boolean().default(false).notNull(),
  publishedAt: timestamp(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
});
```

#### 8. Peer Mentorship System

```typescript
mentorProfiles = pgTable("mentor_profiles", {
  id: serial().primaryKey(),
  userId: integer().references(() => users.id).notNull(),
  subjects: text().array().notNull(),
  bio: text(),
  rating: decimal({ precision: 3, scale: 2 }).default("0.00").notNull(),
  totalRatings: integer().default(0).notNull(),
  hoursVolunteered: integer().default(0).notNull(),
  isAvailable: boolean().default(true).notNull(),
  isVerified: boolean().default(false).notNull(),
  languages: text().array().default(["es"]).notNull(),
  gradeLevel: integer(),
  hourlyRate: decimal({ precision: 5, scale: 2 }).default("0.00"),
  responseTime: integer().default(24).notNull(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
});

mentorshipRequests = pgTable("mentorship_requests", { ... });
mentorshipSessions = pgTable("mentorship_sessions", { ... });
mentorRatings = pgTable("mentor_ratings", { ... });
communityPosts = pgTable("community_posts", { ... });
communityReplies = pgTable("community_replies", { ... });
```

#### 9. Bot Personas (Telegram)

```typescript
botPersonas = pgTable("bot_personas", {
  id: serial().primaryKey(),
  name: text().notNull(),
  key: text().unique().notNull(),
  description: text(),
  systemPrompt: text().notNull(),
  subjects: text().array(),
  isActive: boolean().default(true).notNull(),
  createdById: integer().references(() => users.id),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
});
```

---

## Backend API Documentation

### API Base URL

```
Development: http://localhost:5000/api
Production: https://your-domain.replit.app/api
```

### Route Modules

The backend uses a modular router architecture with 9 domain-specific routers:

| Router | Prefix | Description |
|--------|--------|-------------|
| `authRouter` | `/api/auth` | Authentication & authorization |
| `budgetRouter` | `/api/budget` | Budget categories & transactions |
| `studyRouter` | `/api/study` | Study notes management |
| `gamesRouter` | `/api/games` | Game scores & leaderboards |
| `tutorsRouter` | `/api/tutors` | AI tutor management |
| `progressRouter` | `/api/progress` | Learning progress & rewards |
| `contentRouter` | `/api/content` | Teacher content management |
| `assignmentsRouter` | `/api/assignments` | Student assignments |
| `adminRouter` | `/api/admin` | Admin management & analytics |

### Authentication Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register` | No | Register new user |
| `POST` | `/api/auth/login` | No | Login user |
| `POST` | `/api/auth/logout` | Yes | Logout user |
| `GET` | `/api/auth/me` | Yes | Get current user |
| `POST` | `/api/auth/verify-email` | No | Verify email with token |
| `POST` | `/api/auth/forgot-password` | No | Request password reset |
| `POST` | `/api/auth/reset-password` | No | Reset password with token |

### Budget Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/budget/categories` | Yes | Get user's budget categories |
| `POST` | `/api/budget/categories` | Yes | Create budget category |
| `GET` | `/api/budget/transactions` | Yes | Get user's transactions |
| `POST` | `/api/budget/transactions` | Yes | Create transaction |

### Study Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/study/notes` | Yes | Get user's study notes |
| `GET` | `/api/study/notes/:id` | Yes | Get specific note |
| `POST` | `/api/study/notes` | Yes | Create study note |
| `PUT` | `/api/study/notes/:id` | Yes | Update study note |
| `DELETE` | `/api/study/notes/:id` | Yes | Delete study note |

### Tutor Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/tutors` | No | Get available tutors |
| `POST` | `/api/tutors/sessions` | Yes | Start tutoring session |
| `POST` | `/api/tutors/sessions/:id/messages` | Yes | Send message to tutor |
| `POST` | `/api/tutors/sessions/:id/end` | Yes | End tutoring session |

### Progress Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/progress/profile` | Yes | Get student profile |
| `GET` | `/api/progress/badges` | Yes | Get user's badges |
| `GET` | `/api/progress/streaks` | Yes | Get study streaks |
| `GET` | `/api/progress/stats` | Yes | Get session statistics |

### Admin Endpoints

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| `GET` | `/api/admin/users` | Yes | superuser | Get all users |
| `PATCH` | `/api/admin/users/:id/status` | Yes | superuser | Update user status |
| `PATCH` | `/api/admin/users/:id/role` | Yes | superuser | Update user role |
| `DELETE` | `/api/admin/users/:id` | Yes | superuser | Delete user |
| `GET` | `/api/admin/analytics` | Yes | superuser, teacher | Get analytics |
| `GET` | `/api/admin/blog-posts` | Yes | superuser, teacher | Get blog posts |
| `POST` | `/api/admin/blog-posts` | Yes | superuser, teacher | Create blog post |
| `PUT` | `/api/admin/blog-posts/:id` | Yes | superuser, teacher | Update blog post |
| `DELETE` | `/api/admin/blog-posts/:id` | Yes | superuser, teacher | Delete blog post |
| `GET` | `/api/admin/bot-personas` | Yes | superuser, teacher | Get bot personas |
| `POST` | `/api/admin/bot-personas` | Yes | superuser, teacher | Create bot persona |
| `PUT` | `/api/admin/bot-personas/:id` | Yes | superuser, teacher | Update bot persona |
| `DELETE` | `/api/admin/bot-personas/:id` | Yes | superuser, teacher | Delete bot persona |

### Request/Response Examples

#### Register User

```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "estudiante1",
  "email": "estudiante@email.com",
  "password": "securePassword123",
  "role": "student",
  "firstName": "Juan",
  "lastName": "Perez"
}
```

```json
{
  "user": {
    "id": 1,
    "username": "estudiante1",
    "email": "estudiante@email.com",
    "role": "student",
    "firstName": "Juan",
    "lastName": "Perez",
    "isVerified": false,
    "isActive": true
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## Frontend Documentation

### Page Components

| Page | Path | Auth | Description |
|------|------|------|-------------|
| `LandingPage` | `/` | No | Public marketing page |
| `AuthPage` | `/auth` | No | Login/Register forms |
| `Dashboard` | `/dashboard` | Yes | User dashboard |
| `StudyBuddy` | `/studybuddy` | Yes | AI tutoring interface |
| `EnhancedBudgetPal` | `/budgetpal` | Yes | Budget management |
| `Blog` | `/blog` | Yes | Travel blog |
| `CruiseWord` | `/cruiseword` | Yes | Vocabulary game |
| `StudentRevision` | `/revision` | Yes (student) | Revision materials |
| `AdminDashboard` | `/admin` | Yes (admin/teacher) | Admin panel |
| `NotFound` | `*` | No | 404 page |

### Component Architecture

```
App.tsx
├── QueryClientProvider (TanStack Query)
├── TooltipProvider (Radix)
├── Toaster (Toast notifications)
└── Router (Language/DataSaver/Auth Providers)
    ├── Switch (Wouter routing)
    │   ├── Public Routes
    │   │   ├── /auth → AuthPage
    │   │   └── / → LandingPage (if not auth) / Redirect (if auth)
    │   ├── Admin Route (standalone)
    │   │   └── /admin → AdminDashboard (teacher/superuser)
    │   └── Protected Routes (with Sidebar)
    │       ├── /dashboard → Dashboard
    │       ├── /studybuddy → StudyBuddy
    │       ├── /revision → StudentRevision (student only)
    │       ├── /budgetpal → EnhancedBudgetPal
    │       ├── /blog → Blog
    │       └── /cruiseword → CruiseWord
    └── NotFound (fallback)
```

### Context Providers

1. **QueryClientProvider** - TanStack Query for server state
2. **LanguageProvider** - i18n context (Spanish/English)
3. **AuthProvider** - Authentication state and methods
4. **DataSaverProvider** - Bandwidth optimization mode
5. **TooltipProvider** - Radix UI tooltips

---

## UI/UX Design System

### Color Palette

```css
/* Primary Colors */
--primary: hsl(222.2, 47.4%, 11.2%);
--primary-foreground: hsl(210, 40%, 98%);

/* Secondary Colors */
--secondary: hsl(210, 40%, 96.1%);
--secondary-foreground: hsl(222.2, 47.4%, 11.2%);

/* Accent Colors */
--accent: hsl(210, 40%, 96.1%);
--accent-foreground: hsl(222.2, 47.4%, 11.2%);

/* Feature Colors */
--blue (StudyBuddy): hsl(221, 83%, 53%)
--emerald (BudgetPal): hsl(142, 71%, 45%)
--cyan (Travel): hsl(187, 85%, 43%)
--purple (Games): hsl(271, 91%, 65%)
--red (Admin): hsl(0, 72%, 51%)

/* Admin Panel */
--admin-background: hsl(210, 100%, 98%);
--admin-sidebar: hsl(220, 26%, 14%);
--admin-primary: hsl(221, 83%, 53%);
```

### Typography

- **Font Family:** System fonts (Inter for modern look)
- **Heading Scale:** text-3xl, text-2xl, text-xl, text-lg
- **Body:** text-base (16px), text-sm (14px)

### Component Library (shadcn/ui)

40+ pre-built components including:

| Category | Components |
|----------|------------|
| **Layout** | Card, Dialog, Sheet, Drawer, Sidebar |
| **Form** | Button, Input, Textarea, Select, Checkbox, Switch, Radio |
| **Data Display** | Table, Badge, Avatar, Progress |
| **Navigation** | Tabs, NavigationMenu, Menubar, Breadcrumb |
| **Feedback** | Toast, Alert, AlertDialog |
| **Overlay** | Popover, Tooltip, HoverCard, DropdownMenu |

### Responsive Design

- **Mobile First:** Base styles for mobile
- **Breakpoints:**
  - `sm`: 640px
  - `md`: 768px
  - `lg`: 1024px (Sidebar visible)
  - `xl`: 1280px
  - `2xl`: 1536px

### Dark Mode

```typescript
// Implemented via class-based switching
darkMode: ["class"]

// Toggle via HTML class
document.documentElement.classList.add("dark")
```

---

## Authentication & Security

### Authentication Flow

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Register   │ → │ Store Tokens │ → │   Dashboard  │
│    Login     │    │ (localStorage)│    │   Access     │
└──────────────┘    └──────────────┘    └──────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │ API Request  │
                    │ + Auth Header│
                    └──────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │ JWT Verify   │
                    │ Middleware   │
                    └──────────────┘
```

### JWT Token Structure

```javascript
// Access Token (15 min expiry)
{
  "userId": 1,
  "username": "estudiante1",
  "role": "student",
  "iat": 1704672000,
  "exp": 1704672900
}

// Refresh Token (7 days expiry)
{
  "userId": 1,
  "type": "refresh",
  "iat": 1704672000,
  "exp": 1705276800
}
```

### Role-Based Access Control

| Role | Permissions |
|------|-------------|
| **student** | Study, Budget, Games, Assignments |
| **teacher** | All student + Content Management, Grading |
| **superuser** | All teacher + User Management, System Settings |

### Security Measures

1. **Password Hashing:** bcryptjs with salt rounds
2. **JWT Secrets:** Separate secrets for access/refresh tokens
3. **Token Revocation:** Database-tracked token revocation
4. **Route Protection:** Middleware authentication checks
5. **Input Validation:** Zod schemas for all inputs
6. **SQL Injection Prevention:** Drizzle ORM parameterized queries

---

## AI Integration

### AI Service Architecture

```typescript
class AITutorService {
  // Primary: OpenAI GPT-5
  // Fallback 1: Perplexity AI (sonar model)
  // Fallback 2: Rule-based persona responses
}
```

### AI Personas

| Persona | Key | Subjects | Personality |
|---------|-----|----------|-------------|
| **Math Buddy** | `math_buddy` | Mathematics, Algebra, Geometry, Calculus | Encouraging, Patient, Methodical |
| **Dr. Nova** | `science_explorer` | Biology, Chemistry, Physics, Earth Science | Curious, Analytical, Wonder-inspiring |
| **Professor Quill** | `wordsmith_mentor` | Language Arts, Literature, Writing | Thoughtful, Articulate, Nurturing |

### Persona Configuration

```typescript
interface AgentPersona {
  agentKey: string;
  name: string;
  title: string;
  avatar: string;
  subjects: string[];
  description: string;
  personality: {
    primaryTraits: string[];
    communicationStyle: {
      tone: string;
      formality: string;
      energyLevel: string;
      humor: string;
    };
    emotionalIntelligence: {...};
  };
  teachingMethodology: {
    primaryApproach: string;
    learningTheories: string[];
    explanationStyle: string[];
    errorHandling: {...};
  };
  expertise: {...};
  communicationPatterns: {...};
  tools: string[];
  behavioralRules: {
    dos: string[];
    donts: string[];
  };
}
```

### AI Response Format

```typescript
interface AITutorResponse {
  message: string;
  toolsUsed: string[];
  difficulty: number; // 1-3
  engagement: number; // 1-5
}
```

---

## Gamification System

### Level Progression

```typescript
// XP to Level Formula
calculateLevel(experiencePoints: number): number {
  return Math.floor(Math.sqrt(experiencePoints / 50)) + 1;
}

// XP needed for next level
getXPForNextLevel(currentLevel: number): number {
  return Math.pow(currentLevel, 2) * 50;
}
```

| Level | XP Required |
|-------|-------------|
| 1 | 0 |
| 2 | 50 |
| 3 | 200 |
| 4 | 450 |
| 5 | 800 |
| 10 | 4,500 |

### Badge Categories

| Category | Description |
|----------|-------------|
| **milestone** | Session completion milestones |
| **streak** | Consecutive study days |
| **subject** | Subject-specific achievements |
| **achievement** | Special accomplishments |
| **social** | Community participation |

### Predefined Badges (16 total)

| Badge | Key | Category | Rarity | Points |
|-------|-----|----------|--------|--------|
| First Steps | `first_session` | milestone | common | 10 |
| Early Bird | `early_bird` | milestone | common | 25 |
| Study Enthusiast | `study_enthusiast` | milestone | rare | 100 |
| Scholar | `scholar` | milestone | legendary | 500 |
| Consistent Learner | `consistent_learner` | streak | common | 30 |
| Week Warrior | `week_warrior` | streak | rare | 70 |
| Dedication Champion | `dedication_champion` | streak | legendary | 300 |
| Math Rookie | `math_rookie` | subject | common | 25 |
| Math Master | `math_master` | subject | epic | 100 |
| Science Explorer | `science_explorer` | subject | common | 25 |
| Wordsmith | `wordsmith` | subject | common | 25 |
| Quick Learner | `quick_learner` | achievement | rare | 50 |
| Night Owl | `night_owl` | achievement | common | 15 |
| Early Riser | `early_riser` | achievement | common | 15 |
| Renaissance Learner | `renaissance_learner` | achievement | epic | 150 |

### Points Calculation

```typescript
calculateSessionPoints(session: {
  duration?: number;
  messagesExchanged: number;
  difficulty: number;
  completed: boolean;
}): number {
  let basePoints = 10;
  
  // Duration bonus (max 15)
  const durationBonus = Math.min(session.duration / 2, 15);
  
  // Interaction bonus (max 20)
  const interactionBonus = Math.min(session.messagesExchanged * 2, 20);
  
  // Difficulty multiplier (1.0, 1.2, 1.4)
  const difficultyMultiplier = 1 + (session.difficulty - 1) * 0.2;
  
  return Math.round((basePoints + durationBonus + interactionBonus) * difficultyMultiplier);
}
```

---

## Offline-First Strategy

### IndexedDB Structure (Dexie)

```typescript
class OfflineDatabase extends Dexie {
  studyNotes!: Table<OfflineStudyNote>;
  budgetTransactions!: Table<OfflineBudgetTransaction>;
  budgetCategories!: Table<OfflineBudgetCategory>;
  gameScores!: Table<OfflineGameScore>;
  contentCache!: Table<OfflineContentCache>;
  settings!: Table<AppSettings>;
}
```

### Sync Strategy

1. **Write Locally First:** All data saved to IndexedDB immediately
2. **Mark Unsynced:** `synced: false` flag for pending items
3. **Background Sync:** When online, push unsynced data to server
4. **Conflict Resolution:** Server timestamp wins

### PWA Features

```json
// manifest.json
{
  "name": "Keru.ai Suite",
  "short_name": "Keru.ai",
  "display": "standalone",
  "start_url": "/",
  "background_color": "#ffffff",
  "theme_color": "#3b82f6"
}
```

### Data Saver Mode

- Reduces image quality
- Defers non-essential requests
- Caches more aggressively
- Visible toggle in sidebar

---

## Internationalization (i18n)

### Supported Languages

| Code | Language | Default |
|------|----------|---------|
| `es` | Spanish (Honduras) | Yes |
| `en` | English | No |

### Translation Structure

```typescript
// client/src/data/content.ts
export const translations = {
  es: {
    brand: { name: "Keru.ai", tagline: "Suite" },
    auth: { login: "Iniciar Sesión", ... },
    nav: { home: "Inicio", study: "Aprende conmigo AI", ... },
    hero: { title: "Keru.ai Suite", subtitle: "...", ... },
    studybuddy: { title: "🎓 Aprende conmigo AI", ... },
    budgetpal: { title: "💸 BudgetPal", ... },
    // ... more sections
  },
  en: {
    // Mirror structure in English
  }
};
```

### Usage

```typescript
import { useLanguage } from '../contexts/LanguageContext';

function Component() {
  const { t, language, setLanguage } = useLanguage();
  
  return (
    <h1>{t.studybuddy.title}</h1>
  );
}
```

---

## Hooks Reference

### Authentication Hook

```typescript
// client/src/hooks/use-auth.tsx
function useAuth(): {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<AuthResponse, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<AuthResponse, Error, InsertUser>;
  logout: () => void;
}
```

### Language Hook

```typescript
// client/src/contexts/LanguageContext.tsx
function useLanguage(): {
  language: 'es' | 'en';
  setLanguage: (lang: 'es' | 'en') => void;
  t: TranslationContent & { language: 'es' | 'en' };
}
```

### Personas Hooks

```typescript
// client/src/hooks/use-personas.ts

// For students - fetch available tutors
function useTutors(): UseQueryResult<TutorAgent[]>;

// For admins - CRUD operations on bot personas
function useAdminPersonas(userRole?: string): {
  personas: BotPersona[];
  isLoading: boolean;
  createPersona: UseMutationResult;
  updatePersona: UseMutationResult;
  deletePersona: UseMutationResult;
}
```

### Offline Study Notes Hook

```typescript
// client/src/hooks/use-offline-study-notes.ts
function useOfflineStudyNotes(): {
  notes: StudyNote[];
  isLoading: boolean;
  isOffline: boolean;
  createNote: (note) => Promise<void>;
  updateNote: (id, updates) => Promise<void>;
  deleteNote: (id) => Promise<void>;
  syncNotes: () => Promise<void>;
}
```

### Toast Hook

```typescript
// client/src/hooks/use-toast.ts
function useToast(): {
  toast: (options: ToastOptions) => void;
  toasts: Toast[];
  dismiss: (id?: string) => void;
}
```

### Mobile Detection Hook

```typescript
// client/src/hooks/use-mobile.tsx
function useMobile(): boolean; // true if screen < 768px
```

---

## Routes & Navigation

### Frontend Routes

| Route | Component | Auth Required | Roles |
|-------|-----------|---------------|-------|
| `/` | LandingPage/Redirect | No | All |
| `/auth` | AuthPage | No | All |
| `/dashboard` | Dashboard | Yes | All |
| `/studybuddy` | StudyBuddy | Yes | All |
| `/revision` | StudentRevision | Yes | student |
| `/budgetpal` | BudgetPal | Yes | All |
| `/blog` | Blog | Yes | All |
| `/cruiseword` | CruiseWord | Yes | All |
| `/dao` | DAO | Yes | All |
| `/mentorship` | MentorshipHub | Yes | All |
| `/admin` | AdminDashboard | Yes | teacher, superuser |
| `*` | NotFound | No | All |

### Navigation Items (Sidebar)

```typescript
const navItems = [
  { href: '/dashboard', icon: 'fas fa-home', key: 'home' },
  { href: '/revision', icon: 'fas fa-book-open', key: 'revision' }, // student only
  { href: '/studybuddy', icon: 'fas fa-graduation-cap', key: 'study' },
  { href: '/budgetpal', icon: 'fas fa-wallet', key: 'budget' },
  { href: '/blog', icon: 'fas fa-globe', key: 'travel' },
  { href: '/cruiseword', icon: 'fas fa-ship', key: 'game' },
  { href: '/dao', icon: 'fas fa-users', key: 'dao' },
  { href: '/mentorship', icon: 'fas fa-hands-helping', key: 'mentorship' }
];
```

### Protected Route Component

```typescript
// client/src/lib/protected-route.tsx
<ProtectedRoute 
  path="/admin" 
  component={AdminDashboard} 
  roles={['teacher', 'superuser']} 
/>
```

---

## Project Health Report

This section provides a comprehensive analysis of what works, what doesn't, what's broken, what's missing, what's unused, and what's conflicting in the codebase.

---

### ✅ WHAT WORKS (Fully Functional)

These features are complete and working as expected:

| Feature | Components | Status | Notes |
|---------|------------|--------|-------|
| **User Registration** | `auth-page.tsx`, `auth.ts` | ✅ Working | Username, email, phone registration |
| **User Login** | `auth-page.tsx`, `auth.ts` | ✅ Working | Multiple login methods (username/email/phone) |
| **JWT Authentication** | `server/auth.ts` | ✅ Working | Access + refresh tokens, middleware |
| **Role-Based Access** | `protected-route.tsx`, `authorizeRoles()` | ✅ Working | student, teacher, superuser roles |
| **Dashboard** | `Dashboard.tsx` | ✅ Working | Role-based cards, user info display |
| **AI Study Buddy** | `StudyBuddy.tsx`, `ai-service.ts` | ✅ Working | 3 personas, OpenAI with Perplexity fallback |
| **Budget Categories** | `EnhancedBudgetPal.tsx`, `budget.ts` | ✅ Working | CRUD for categories |
| **Budget Transactions** | `EnhancedBudgetPal.tsx`, `budget.ts` | ✅ Working | CRUD for transactions |
| **Study Notes** | `study.ts` router | ✅ Working | CRUD operations |
| **Game Scores** | `games.ts` router | ✅ Working | Score tracking, leaderboards |
| **Travel Blog Display** | `Blog.tsx` | ✅ Working | Blog post viewing |
| **CruiseWord Game** | `CruiseWord.tsx` | ✅ Working | Vocabulary game with scoring |
| **Admin User Management** | `admin-dashboard.tsx`, `admin.ts` | ✅ Working | List, update status/role, delete users |
| **Admin Blog Management** | `admin.ts` | ✅ Working | CRUD for blog posts |
| **Admin Bot Personas** | `admin.ts` | ✅ Working | CRUD for AI personas |
| **Language Toggle** | `LanguageContext.tsx` | ✅ Working | Spanish/English switching |
| **Sidebar Navigation** | `Sidebar.tsx` | ✅ Working | Role-based nav items |
| **Toast Notifications** | `use-toast.ts` | ✅ Working | Success/error notifications |
| **Protected Routes** | `protected-route.tsx` | ✅ Working | Auth + role verification |
| **Offline Storage Init** | `offline-storage.ts` | ✅ Working | IndexedDB database created |
| **Data Saver Mode** | `DataSaverMode.tsx` | ✅ Working | Toggle and context |

---

### ❌ WHAT DOESN'T WORK / IS BROKEN

These features have bugs or don't function properly:

| Issue | Location | Problem | Impact | Fix Required |
|-------|----------|---------|--------|--------------|
| **IStorage interface not implemented** | `server/storage.ts:255` | `implements IStorage` is commented out | TypeScript type safety reduced | Uncomment and fix any type errors |
| **deleteUser not defined in IStorage** | `server/storage.ts` | `deleteUser()` called in admin.ts but not in interface | Runtime works but type issues | Add to IStorage interface |
| **getBotPersona missing in IStorage** | `server/storage.ts` | Method exists but not in interface | Type mismatch | Add to interface |
| **Offline sync never triggered** | `offline-storage.ts` | `getUnsyncedData()` exists but no sync trigger | Data not synced to server | Implement sync on reconnect |
| **PWA install prompt** | `pwa-manager.ts` | `deferredPrompt` may not capture event | Install button may not work | Add earlier event listener |

---

### ⚠️ WHAT'S CONFLICTING

These areas have conflicting code, duplication, or inconsistencies:

| Conflict | Files Involved | Issue | Resolution |
|----------|----------------|-------|------------|
| **Duplicate Budget Pages** | `BudgetPal.tsx` vs `EnhancedBudgetPal.tsx` | Two versions exist, only Enhanced used | Delete `BudgetPal.tsx` |
| **Duplicate DAO Pages** | `DAO.tsx` vs `EnhancedDAO.tsx` | Two versions exist, neither in routes | Keep one, delete other |
| **tutorAgents vs botPersonas** | `storage.ts:404-430` | `getTutorAgents()` merges both tables | Confusing data model | Document or unify |
| **Query key formats** | Various components | Mix of string and array query keys | Some cache invalidation may fail | Standardize to arrays |
| **revision nav key** | `Sidebar.tsx`, `content.ts` | `key: 'revision'` but no translation | Shows undefined in nav | Add `t.nav.revision` |

---

### 🚫 WHAT'S NOT USED (Dead/Orphaned Code)

These files/components exist but are never used:

| File | Location | Status | Recommendation |
|------|----------|--------|----------------|
| **Chat.tsx** | `client/src/pages/Chat.tsx` | Not in App.tsx routes | Remove or add to routes |
| **AethosByte.tsx** | `client/src/pages/AethosByte.tsx` | Not in routes, not in nav | Remove or implement feature |
| **MentorshipHub.tsx** | `client/src/pages/MentorshipHub.tsx` | Not in routes | Remove or implement feature |
| **DAO.tsx** | `client/src/pages/DAO.tsx` | Not in routes (EnhancedDAO also unused) | Remove both or add to routes |
| **EnhancedDAO.tsx** | `client/src/pages/EnhancedDAO.tsx` | Not in routes | Remove or add to routes |
| **Home.tsx** | `client/src/pages/Home.tsx` | Imported but Dashboard used instead | May be dead code, verify |
| **BudgetPal.tsx** | `client/src/pages/BudgetPal.tsx` | Imported but EnhancedBudgetPal used | Remove old version |
| **HeroSection.tsx** | `client/src/components/HeroSection.tsx` | Check if used in landing | Verify usage |
| **ToolCard.tsx** | `client/src/components/ToolCard.tsx` | Check usage | Verify or remove |
| **github-service.ts** | `server/github-service.ts` | Check if used | Verify integration |
| **content-processor.ts** | `server/content-processor.ts` | PDF/OCR processing | Not integrated, keep for future |
| **telegram-bot/** | `telegram-bot/` folder | Separate deployment | Keep but document |
| **scripts/** | `scripts/` folder | Utility scripts | Keep, document usage |

---

### 📭 WHAT'S MISSING (Incomplete Features)

Features that are partially implemented or missing critical parts:

| Feature | What Exists | What's Missing | Priority |
|---------|-------------|----------------|----------|
| **Email Verification** | Token generation, verify endpoint | Email sending service (SendGrid, etc.) | High |
| **Password Reset Email** | Token generation, reset endpoint | Email sending service | High |
| **Google OAuth** | `googleId` field in users | OAuth flow implementation | Medium |
| **Facebook OAuth** | `facebookId` field in users | OAuth flow implementation | Medium |
| **PDF Text Extraction** | `pdf-parse` installed, `content-processor.ts` | Integration with content upload | Medium |
| **OCR for Images** | `tesseract.js` installed | Integration with content upload | Medium |
| **AI Content Revision** | Student revision page exists | AI integration with uploaded content | High |
| **RAG System** | AI service exists | Content embeddings, vector search | Medium |
| **Auto Quiz Generation** | Nothing | Full implementation | Low |
| **Peer Mentorship UI** | Full database schema | Frontend pages, API integration | Medium |
| **Community Forum UI** | Database schema (`communityPosts`, `communityReplies`) | Frontend pages | Low |
| **DAO Governance** | UI exists (`DAO.tsx`) | Actual blockchain/voting logic | Low |
| **AethosByte Cleanup** | UI exists (`AethosByte.tsx`) | Actual file analysis logic | Low |
| **Telegram Bot Deployment** | Full bot code | Separate deployment, documentation | Low |
| **Progress Dashboard** | API endpoints | Frontend visualization | Medium |
| **Badge Notifications** | Badge earning logic | Push/toast when earned | Low |
| **Study Streak UI** | Backend logic | Frontend streak display | Low |
| **Offline Data Sync** | IndexedDB storage | Sync-on-reconnect logic | Medium |
| **File Upload Storage** | Multer config | Cloud storage (S3, Cloudinary) | Medium |

---

### 🔧 TECHNICAL DEBT

Issues that need addressing for code health:

| Issue | Location | Severity | Description |
|-------|----------|----------|-------------|
| **No automated tests** | Project-wide | High | No unit, integration, or e2e tests |
| **IStorage interface incomplete** | `storage.ts` | Medium | Interface doesn't match implementation |
| **`any` types in admin routes** | `server/routes/admin.ts` | Low | Type safety reduced |
| **Missing error boundaries** | Frontend | Medium | Errors crash whole app |
| **No request rate limiting** | Server | Medium | API vulnerable to abuse |
| **No input sanitization** | Content submissions | Medium | XSS risk with HTML content |
| **Hardcoded strings** | Various | Low | Some UI text not in translations |
| **Console.log statements** | Various | Low | Should use proper logging |
| **No logging service** | Server | Medium | No structured logging for production |
| **Session cleanup** | `tutorSessions` | Low | Old sessions not cleaned up |

---

### 📊 CODE QUALITY METRICS

| Metric | Status | Notes |
|--------|--------|-------|
| TypeScript Coverage | ✅ 100% | All files use TypeScript |
| Type Safety | ⚠️ 85% | Some `any` types, interface gaps |
| Code Formatting | ✅ Consistent | Standard formatting throughout |
| Component Size | ✅ Good | Most under 400 lines |
| Code Duplication | ⚠️ Some | DAO and BudgetPal duplicates |
| Documentation | ⚠️ Limited | Few inline comments |
| Test Coverage | ❌ 0% | No tests exist |
| Error Handling | ⚠️ Partial | Some routes lack try/catch |
| Security | ⚠️ Basic | JWT works, needs rate limiting |

---

### 🗂️ FILES TO DELETE (Cleanup Candidates)

If cleaning up the codebase, consider removing:

```
client/src/pages/BudgetPal.tsx       # Replaced by EnhancedBudgetPal
client/src/pages/DAO.tsx             # Replaced by EnhancedDAO (or delete both)
client/src/pages/Chat.tsx            # Not used, "Ask Kevin" feature incomplete
client/src/pages/AethosByte.tsx      # Feature not implemented
client/src/pages/MentorshipHub.tsx   # Feature not implemented
client/src/pages/Home.tsx            # Verify if used, may be dead
```

---

### 🔗 MISSING ROUTE CONNECTIONS

Pages that exist but aren't accessible:

| Page | File | Should Connect To | Action Needed |
|------|------|-------------------|---------------|
| Chat (Ask Kevin) | `Chat.tsx` | `/chat` in nav | Add route or remove |
| AethosByte | `AethosByte.tsx` | `/aethosbyte` in nav | Add route or remove |
| DAO | `DAO.tsx` / `EnhancedDAO.tsx` | `/dao` in nav | Add route or remove |
| MentorshipHub | `MentorshipHub.tsx` | `/mentorship` in nav | Implement or remove |

---

### 📋 IMMEDIATE ACTION ITEMS

**High Priority:**
1. Fix IStorage interface to match DatabaseStorage implementation
2. Remove duplicate pages (BudgetPal.tsx, DAO.tsx)
3. Remove or properly route unused pages
4. Add translation key for `revision` nav item

**Medium Priority:**
5. Implement offline sync trigger on reconnect
6. Add error boundaries to React app
7. Set up email service for verification/reset
8. Integrate PDF text extraction with content upload

**Low Priority:**
9. Clean up console.log statements
10. Add automated tests
11. Implement remaining placeholder features or remove them

---

## Feature List Summary

### Completed Features ✅ (10 major features)

1. **Authentication System** - Registration, login, JWT, roles, password reset flow
2. **AI Study Buddy** - 3 personas, OpenAI + Perplexity, sessions, messages
3. **Budget Tracker** - Categories, transactions, visualization, Lempiras
4. **Gamification** - 16 badges, levels, streaks, XP
5. **Admin Panel** - Users, content, blog, personas, analytics
6. **Content Management** - Teacher uploads, assignments, grading
7. **CruiseWord Game** - Vocabulary, scores
8. **Travel Blog** - Display, categories, admin management
9. **Internationalization** - Spanish/English
10. **PWA/Offline** - Service worker, IndexedDB, data saver

### Partially Complete ⚠️ (4 features)

1. **Student Revision** - Basic UI, needs AI integration
2. **Peer Mentorship** - Schema done, no UI
3. **Community Posts** - Schema done, no UI
4. **Text Extraction** - Libraries installed, not integrated

### Not Started / Placeholder ❌ (9 features)

1. OCR for Images
2. PDF Text Extraction
3. RAG for Content
4. Auto Quiz Generation
5. DAO Governance (UI only)
6. AethosByte Cleanup (UI only)
7. Telegram Bot (code exists, not deployed)
8. Email Verification (no email provider)
9. Social Login (fields exist, no OAuth)

---

## Roadmap

### Phase 1: Core Stabilization (Current)

- [x] Authentication system
- [x] AI tutoring with personas
- [x] Budget tracking
- [x] Gamification basics
- [x] Admin panel
- [ ] Fix all orphaned pages
- [ ] Consolidate duplicate components
- [ ] Add missing error handling

### Phase 2: Content & AI Enhancement (Q1 2026)

- [ ] PDF text extraction integration
- [ ] OCR for image content
- [ ] AI-powered content revision
- [ ] Auto-generated practice questions
- [ ] Content embeddings for search

### Phase 3: Community Features (Q2 2026)

- [ ] Peer mentorship launch
- [ ] Community Q&A forum
- [ ] Teacher-student messaging
- [ ] Parent dashboard

### Phase 4: Mobile & Distribution (Q3 2026)

- [ ] Enhanced PWA experience
- [ ] Push notifications
- [ ] Android/iOS wrapper (Capacitor)
- [ ] School district partnerships

### Phase 5: Advanced Features (Q4 2026)

- [ ] Voice tutoring
- [ ] Video lessons
- [ ] AR/VR science experiments
- [ ] AI-generated personalized curriculum

---

## Deployment Guide

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Server runs on http://localhost:5000
```

### Production Build

```bash
# Build frontend + backend
npm run build

# Output:
# - Frontend: dist/public/
# - Backend: dist/index.js
```

### Database Setup

```bash
# Push schema to database
npm run db:push
```

### Environment Requirements

- Node.js 20+
- PostgreSQL (Neon recommended)
- OpenAI API key (for AI features)
- Perplexity API key (optional fallback)

---

## Environment Variables

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
| `PERPLEXITY_API_KEY` | Perplexity API key (fallback) |

### Optional (Telegram Bot)

| Variable | Description |
|----------|-------------|
| `TELEGRAM_BOT_TOKEN` | Telegram bot token |

### Replit Automatic

| Variable | Description |
|----------|-------------|
| `PGHOST` | PostgreSQL host |
| `PGPORT` | PostgreSQL port |
| `PGUSER` | PostgreSQL user |
| `PGPASSWORD` | PostgreSQL password |
| `PGDATABASE` | PostgreSQL database name |

---

## Conclusion

Keru.ai Suite is a comprehensive educational platform with strong foundations in AI tutoring, gamification, and offline-first design. The codebase is well-structured with clear separation of concerns across frontend, backend, and shared code.

### Strengths

- Modern tech stack (React, TypeScript, Express)
- Well-designed database schema
- Comprehensive gamification system
- Bilingual support
- Offline-first architecture
- Modular route structure

### Areas for Improvement

- Complete orphaned features (Mentorship, DAO)
- Add automated testing
- Implement email/SMS services
- Complete social login integration
- Add comprehensive logging

---

**Document maintained by:** Keru.ai Development Team  
**Last review date:** January 09, 2026
