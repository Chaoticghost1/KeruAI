# AI Tutoring Agents & Implementation

**Status:** Planned / roadmap. The app currently uses 3 tutors (Math Buddy, Dr. Nova, Professor Quill) from `shared/tutorPersonas.ts`. This doc describes the proposed expansion to 6 Honduras-focused agents and how to integrate them.

---

## Overview

- **Guided learning:** Socratic method; guide, never give direct answers. Adapt to learning style, difficulty, grade, struggling areas.
- **Student profile fields** (already in schema): `learningStyle`, `preferredDifficulty`, `subjects`, `strugglingAreas`, `gradeLevel`.
- **Honduras context:** Spanish Honduras dialect, local examples (markets, agriculture, infrastructure). Full system prompts live in admin persona presets and migrations (e.g. `add-keru-six-personas.sql`).

---

## Six proposed agents (quick reference)

| Agent | Focus | Key phrases (examples) |
|-------|--------|-------------------------|
| **Matemático Guía** | Math (Algebra → Calculus, Stats) | "¿Qué observás en este problema?", "¿Cuál sería el primer paso?" |
| **Doctora Nova** | Chemistry & Biology, natural sciences | "¿Qué observás cuando...?", "¿Por qué creés que pasó eso?" |
| **Profesor Pluma** | Literature, languages, writing, critical thinking | "¿Qué observás en el texto?", "¿Cuál es la idea principal?" |
| **Maestro Ciencias** | Physics, STEM, earth sciences | "¿Qué fuerzas actuán aquí?", "¿Cómo fluye la energía?" |
| **Maestro Civismo** | Honduran law, constitution, rights, labor | "¿Qué dice exactamente el artículo?", "¿Cómo se aplica esto?" |
| **Guía Informática** | Programming, algorithms, digital literacy | "¿Cuál es el primer paso lógico?", "¿Qué patrón ves?" |

**Rules (all agents):** Never give direct answer; use questions and hints; celebrate effort; adapt to student profile; use Honduras examples where relevant.

---

## Implementation summary

- **DB:** Personas stored in `bot_personas` (or equivalent); agent keys (e.g. `matematico_guia`) used for N8N webhook env vars (`N8N_WEBHOOK_MATEMATICO_GUIA`). Student profile fields above are already in `studentProfiles`.
- **Backend:** Tutors route (`/api/tutors/messages`) uses persona key, optional N8N webhook, then in-app AI (OpenAI → Perplexity → rule-based). Pass `studentProfile` and `conversationHistory` to N8N when configured.
- **Frontend:** StudyBuddy page selects agent, starts session, sends messages to `/api/tutors/messages`. No change needed for 6 agents if personas are seeded and UI lists them.
- **Content:** Seed 6 personas (names, keys, system prompts, subjects). Use migrations or admin "Bot Personas" to add/update. Full prompts are in admin-dashboard persona presets and in migration `add-keru-six-personas.sql`.

For N8N wiring and cache, see **CHAT_AND_STUDYBUDDY.md**.
