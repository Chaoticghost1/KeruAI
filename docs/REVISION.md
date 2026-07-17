# Student Revision v2 (Practice Packs)

How Keru.ai turns practice questions — AI-generated, or missed in games/assignments — into
spaced-repetition **revision packs** that students study as flashcards.

> Part of **Task Group 2**. Status: implemented (backend + frontend flashcards + tests).

---

## 1. Data model (`shared/schema.ts`)

### `practice_question_generations`
| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| user_id | int → users | owner student |
| subject | text | required |
| topic | text? | optional |
| difficulty | int | 1–3 (default 2) |
| source_type | text | `ai` \| `teacher` \| `game` \| `assignment` |
| raw_prompt / raw_answer | text? | audit of generation |
| structured_question | jsonb | `{ question, options?, answer, explanation? }` |
| created_at | timestamp | |

Indexed: `user_id`, `subject`.

### `revision_packs`
| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| user_id | int → users | owner student |
| subject / topic / title | text | grouping + display |
| item_count | int | kept in sync on item add |
| offline_ready | bool | flagged when downloaded for offline |
| metadata | jsonb | `{ questions, sourceTypes, generatedAt }` |
| created_at / updated_at | timestamp | |

Indexed: `user_id`.

### `revision_pack_items`
| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| pack_id | int → revision_packs (cascade) | |
| practice_generation_id | int → practice_question_generations (set null) | the question |
| type | text | `question` \| `flashcard` |
| scheduling_info | jsonb | see spaced repetition below |
| created_at | timestamp | |

Indexed: `pack_id`.

---

## 2. Spaced repetition (`server/lib/spaced-repetition.ts`)

Leitner/SM-2-style scheduler. Each `scheduling_info` is:

```ts
{ nextReviewAt: ISO, difficulty: 'easy'|'medium'|'hard', lastReviewedAt: ISO, repetitions: number, easeFactor: number }
```

- `getInitialSchedulingInfo(difficulty)` — first schedule for a new item.
- `scheduleNextReview(current, difficulty, now?)` — `hard` resets repetitions and lowers ease
  (floored at 1.3); `easy`/`medium` advance the box and raise ease (capped at 3.0). Intervals
  grow with repetitions: base `[1, 3, 7, 16, 35]` days × ease factor.
- `isDue(info, now?)` — whether an item is due (null → due).

---

## 3. Generation sources

| Source | Trigger | Where |
|--------|---------|-------|
| AI | `POST /api/study/practice` | `study.ts` → `AITutorService.generatePracticeQuestions` (deterministic fallback if AI unavailable) |
| Game | `POST /api/games/scores` with `missedQuestions[]` | `games.ts` → `buildRevisionPackFromMissed` |
| Assignment | `POST /api/assignments/:id/grade` with grade < 60% | `assignments.ts` → AI practice for the assignment subject/topic |

The shared helper `server/lib/revision.ts#buildRevisionPackFromMissed` persists each missed
question as a `practice_question_generations` row and bundles them into a new pack, so games and
assignments behave identically.

---

## 4. Endpoints (`server/routes/study.ts`)

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/study/practice` | Generate + persist practice; create a pack. Body: `{ subject, topic?, difficulty?, count?, language?, packTitle? }` |
| GET | `/api/revision/packs` | List the student's packs (summary) |
| GET | `/api/revision/packs/:id` | Full pack; items joined with `question` content |
| POST | `/api/revision/packs/:id/offline` | Mark a pack `offline_ready` |
| POST | `/api/revision/packs/:id/items/:itemId/review` | Record a review (`{ difficulty }`) and reschedule |

`getRevisionPack` left-joins `practice_question_generations` so each item ships its
`structuredQuestion` for the flashcard UI.

---

## 5. Client integration

- `client/src/components/RevisionPacks.tsx` — packs grouped by subject; flashcard study mode
  (reveal answer → rate Hard/Medium/Easy) that calls the review endpoint and advances; a
  **Download for offline study** button that flags the pack and caches it via
  `saveRevisionPackOffline` (IndexedDB, TG3 groundwork).
- `client/src/pages/StudentRevision.tsx` — adds a **Practice Packs** tab alongside the existing
  class-materials revision view.
- `client/src/pages/StudyBuddy.tsx` — **Generate Practice** button creates a pack from the
  selected subject/topic and navigates to `/revision`.
- `client/src/lib/offline-storage.ts` — Dexie v2 adds a `revisionPacks` table plus
  `saveRevisionPackOffline` / `getOfflineRevisionPacks` / `getOfflineRevisionPack`.

---

## 6. Tests

- `server/lib/spaced-repetition.test.ts` — unit tests for scheduling/ease/interval/due logic.
- `server/storage.revision.test.ts` — integration (needs `DATABASE_URL`): generations, pack +
  item creation, joined read, review reschedule, offline flag.

Run: `DATABASE_URL=... npx vitest run server/lib/spaced-repetition.test.ts server/storage.revision.test.ts`

---

## 7. Future work

- Surface "due today" counts and prioritize due items in the study queue.
- Full offline study (read packs from IndexedDB when offline) — completed under Task Group 3.
- Feed review outcomes into the global mastery model — Task Group 4.
