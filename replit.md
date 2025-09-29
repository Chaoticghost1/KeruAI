# Replit MD

## Overview

This is a full-stack web application built with React and Express.js, designed as a multi-tool suite called "Keru.ai Suite". The application provides various educational and productivity tools including an AI study assistant, budget management, travel information, and more. The application is structured as a modern single-page application with a clean, responsive design using Tailwind CSS and shadcn/ui components.

## System Architecture

The application follows a monorepo structure with clear separation between client and server code:

- **Frontend**: React-based SPA with TypeScript, using Vite as the build tool
- **Backend**: Express.js server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM (configured but not fully implemented)
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: React Query for server state management
- **Routing**: Wouter for client-side routing

## Key Components

### Frontend Architecture
- **Component Library**: Uses shadcn/ui components for consistent UI patterns
- **Routing**: Wouter provides lightweight client-side routing
- **Internationalization**: Custom language context supporting Spanish and English
- **State Management**: React Query handles API interactions and caching
- **Build System**: Vite with TypeScript support and hot module replacement

### Backend Architecture
- **Server Framework**: Express.js with TypeScript
- **Database Layer**: Drizzle ORM configured for PostgreSQL
- **Storage Interface**: Abstracted storage layer with PostgreSQL database implementation
- **Development Setup**: Hot reload with tsx and middleware logging

### Database Schema
- **Users Table**: User management with id, username, password, email, and timestamps
- **Budget Categories**: Financial tracking categories with budget limits and spending totals
- **Budget Transactions**: Individual financial transactions linked to categories
- **Study Notes**: Educational content storage with tags and subject organization
- **Game Scores**: Gaming achievement tracking with scores, levels, and completion status
- **Relations**: Fully modeled relationships between all entities using Drizzle ORM
- **Migration Support**: Drizzle Kit configured for schema migrations
- **Connection**: Uses Neon Database serverless PostgreSQL

## Data Flow

1. **Client Requests**: React components make API calls through React Query
2. **API Layer**: Express routes handle requests and interact with storage layer
3. **Storage Layer**: Abstracted interface allows switching between memory and database storage
4. **Response**: JSON responses are cached by React Query for optimal performance

The application now uses PostgreSQL database with full CRUD operations for all data entities including users, budget tracking, study notes, and game scores.

## External Dependencies

### Frontend Dependencies
- **UI Components**: Radix UI primitives via shadcn/ui
- **Styling**: Tailwind CSS with custom design tokens
- **Icons**: Font Awesome and Lucide icons
- **Forms**: React Hook Form with Zod validation
- **Date Handling**: date-fns library

### Backend Dependencies
- **Database**: @neondatabase/serverless for PostgreSQL connection
- **ORM**: Drizzle ORM for type-safe database operations
- **Session Management**: connect-pg-simple for PostgreSQL session store
- **Validation**: Zod for runtime type validation

### Development Tools
- **Build Tool**: Vite with React plugin
- **TypeScript**: Full TypeScript support across the stack
- **Linting**: ESLint configuration
- **Development Server**: Hot reload with error overlay

## Deployment Strategy

The application is configured for deployment with the following approach:

1. **Build Process**: 
   - Frontend: Vite builds React app to `dist/public`
   - Backend: esbuild bundles server code to `dist/index.js`

2. **Production Setup**:
   - Static files served from built React app
   - Express server handles API routes and serves the SPA
   - Database migrations can be run via `npm run db:push`

3. **Environment Configuration**:
   - DATABASE_URL required for PostgreSQL connection
   - NODE_ENV determines development vs production behavior

4. **Replit Integration**:
   - Configured with Replit-specific development tools
   - Runtime error overlay for better debugging experience

## Changelog

```
Changelog:
- July 02, 2025. Initial setup - React/Express app with multi-language support
- July 02, 2025. Added comprehensive PostgreSQL database with Drizzle ORM
  - Created users, budget_categories, budget_transactions, study_notes, game_scores tables
  - Implemented full CRUD API endpoints for all entities
  - Database relations properly modeled with foreign keys
  - Replaced in-memory storage with database storage layer
- July 02, 2025. Transformed into Telegram Bot with LLM Integration
  - Built complete Telegram bot interface with persona-driven AI tutors
  - Integrated OpenAI GPT-4 for intelligent responses with fallback system
  - Created Docker containerization with PostgreSQL for production deployment
  - Added comprehensive bot commands and session management
  - Configured for deployment via Docker Compose with health monitoring
- July 02, 2025. Implemented Comprehensive Badge & Reward System
  - Created complete gamification system with badges, levels, streaks, and experience points
  - Added 16 predefined badges across categories: milestone, streak, subject, achievement
  - Implemented automatic reward calculation and badge awarding after sessions
  - Built level progression system with XP requirements and progress tracking
  - Added Telegram bot commands for progress viewing (/progress, /end)
  - Created web interface progress dashboard showing badges, level, and achievements
  - Integrated session completion tracking with difficulty and engagement metrics
- July 02, 2025. Built Complete Role-Based Admin Panel with Secure Authentication
  - Implemented native JWT-based authentication system with access/refresh tokens
  - Added support for multiple login methods: username, email, phone, Google, Facebook
  - Created role-based access control: superuser, teacher, student permissions
  - Built comprehensive admin dashboard for content management and user administration
  - Developed teacher content submission system (PDFs, images, whiteboards, HTML)
  - Added student assignment system with submissions and grading functionality
  - Created public landing page with marketing content and clickable login/signup
  - Implemented protected routes with role-based permissions and verification requirements
  - Fixed all database schema mismatches and authentication API endpoints
  - Verified complete authentication flow: registration, login, protected access working
- July 02, 2025. Enhanced Admin Panel with Advanced Management Features
  - Created comprehensive admin dashboard with 6 specialized sections
  - Implemented Study Buddy bot persona management for Telegram integration
  - Added BudgetPal analytics with privacy-compliant anonymous user statistics
  - Built chat analytics dashboard with request frequency tracking
  - Developed complete blog post management system for Viajes y Cruceros section
  - Added super admin controls for CruiseWord, DAO, and AethosByte management
  - Created new database tables: blog_posts and bot_personas with full CRUD operations
  - Implemented privacy-focused analytics showing transaction patterns without personal data
  - Built API endpoints for all admin features with proper authentication and authorization
  - Fixed admin panel authentication and added comprehensive admin management interface
```

## AI-Assisted Content Revision Implementation Plan

### Implementation Approach for Teacher Upload + AI Revision System

**Current Status Analysis:**
- ✅ Teacher content upload system (PDFs, images, documents) - COMPLETE
- ✅ Assignment system with student submissions - COMPLETE  
- ✅ AI tutor integration (OpenAI GPT with personas) - COMPLETE
- ❌ Direct AI analysis of uploaded content - MISSING
- ❌ Student revision interface for uploaded materials - MISSING
- ❌ Content processing pipeline (OCR, text extraction) - MISSING

**Implementation Phases:**

### Phase 1: Content Processing Pipeline
**Goal:** Make uploaded content AI-accessible
- Add PDF text extraction using `pdf-parse` library
- Implement OCR for image-based content (screenshots, whiteboard photos)
- Store extracted text in database for AI reference
- Create content embeddings for semantic search
- Update database schema to include extracted content text

### Phase 2: Student Revision Interface  
**Goal:** Build dedicated student pages for AI-assisted revision
- Create student dashboard showing available revision materials
- Build content viewer for PDFs/images with AI assistant sidebar
- Implement interactive revision sessions where students can ask questions about uploaded content
- Add progress tracking for each topic/material
- Create student-specific protected routes

### Phase 3: AI Integration with Content (Future)
**Goal:** Connect AI tutors to teacher uploads
- Modify AI service to include uploaded content context
- Implement RAG (Retrieval Augmented Generation) to reference specific materials
- Allow AI to cite specific pages/sections from uploads
- Generate practice questions from uploaded content

### Phase 4: Enhanced Features (Future)
**Goal:** Add intelligent revision capabilities
- Auto-generate summaries of uploaded lessons
- Create flashcards and quizzes from content
- Provide personalized study recommendations
- Track which concepts students struggle with

**Implementation Priority:**
1. **Immediate** - Create student revision page with content viewer
2. **Short-term** - Add text extraction from PDFs
3. **Medium-term** - Integrate AI with extracted content
4. **Long-term** - Advanced features like auto-quiz generation

## User Preferences

```
Preferred communication style: Simple, everyday language.
```