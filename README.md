# Keru.ai Suite

A comprehensive multi-language educational and productivity suite featuring AI tutors, budget management, and interactive tools.

## Features

- **AI Study Buddy**: Interactive tutoring with 3 specialized AI personas
  - Math Buddy: Mathematics tutor with step-by-step explanations
  - Dr. Nova: Science explorer for biology, chemistry, and physics
  - Professor Quill: Language arts mentor for literature and writing
- **Budget Tracker**: Personal finance management with categories and transactions
- **Travel Content**: Information and tools for travelers
- **Games**: Interactive educational games with scoring
- **Multi-language Support**: Spanish and English interfaces

## Architecture

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Express.js + TypeScript  
- **Database**: PostgreSQL with Drizzle ORM
- **AI System**: Persona-based responses with extensible GPT integration

## Deployment

### Frontend (Vercel)
1. Deploy to Vercel with these settings:
   - Build Command: `npm run build`
   - Output Directory: `dist/public`
   - Environment Variables: `VITE_API_URL=your-backend-url`

### Backend (Railway/Render)
1. Deploy Express server separately
2. Set environment variables: `DATABASE_URL`, `NODE_ENV=production`
3. Run `npm run db:push` to initialize database

## Development

```bash
npm install
npm run dev
```

Visit http://localhost:5000 to see the application.

## Database Setup

The application uses PostgreSQL with the following main tables:
- Users and authentication
- Tutor agents and sessions
- Budget categories and transactions
- Study notes and game scores
- Student profiles and preferences

Run `npm run db:push` to apply the schema to your database.