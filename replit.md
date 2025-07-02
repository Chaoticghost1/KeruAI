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
- **Storage Interface**: Abstracted storage layer with in-memory implementation
- **Development Setup**: Hot reload with tsx and middleware logging

### Database Schema
- **Users Table**: Basic user structure with id, username, and password fields
- **Migration Support**: Drizzle Kit configured for schema migrations
- **Connection**: Uses Neon Database serverless PostgreSQL

## Data Flow

1. **Client Requests**: React components make API calls through React Query
2. **API Layer**: Express routes handle requests and interact with storage layer
3. **Storage Layer**: Abstracted interface allows switching between memory and database storage
4. **Response**: JSON responses are cached by React Query for optimal performance

The application currently uses in-memory storage but is configured to easily switch to PostgreSQL database when needed.

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
- July 02, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```