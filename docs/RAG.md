# Curriculum-aligned RAG

How Keru.ai makes AI Study Buddy personas curriculum-aware by ingesting teacher/student
materials (PDFs, images, plain text) and turning them into searchable content chunks used as
context for tutoring answers.

> Part of **Task Group 1**. Status: implemented (backend + frontend toggle + tests).

---

## 1. Data model (`shared/schema.ts`)

### `content_sources`
| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| owner_user_id | int → users | teacher/superuser who uploaded |
| subject | text | required |
| topic | text? | optional, e.g. "fracciones" |
| grade_level | text? | "1".."12" |
| file_type | text | `pdf` \| `image` \| `plain` |
| original_file_name | text? | |
| storage_location | text? | `/uploads/...` path |
| language | text | `es` (default) \| `en` |
| chunk_count / token_count | int | rollups |
| status | text | `processing` \| `ready` \| `failed` |
| created_at / updated_at | timestamp | |

Indexed: `(subject, topic)`, `owner_user_id`.

### `content_chunks`
| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| source_id | int → content_sources (cascade) | |
| language | text | `es` \| `en` |
| subject / topic / grade_level | text | copy of source for fast filtering |
| chunk_index | int | order within source |
| text | text | the chunk body |
| token_count | int | ~chars/4 estimate |
| embedding_status | text | `none` (vector search reserved for later) |

Indexed: `(subject, topic, grade_level)`, `language`, `source_id`.

---

## 2. Ingestion flow

```
Teacher uploads file + { subject, topic?, gradeLevel?, language? }
        │
        ▼  POST /api/content/upload  (auth: teacher/superuser, requireVerification)
        │
        ├─ createContentSource(status: 'processing')
        ├─ ContentProcessor.processFile()
        │     • pdf  → pdf-parse
        │     • image→ tesseract.js OCR (eng+spa)
        │     • txt/html → direct read / tag strip
        ├─ content-chunker.chunkText()  → overlapping token-bounded chunks
        ├─ createContentChunks(...)     → content_chunks rows
        └─ updateContentSource(chunkCount, tokenCount, status:'ready'|'failed')
```

`POST /api/content/upload` returns `{ source, chunkCount, message }`.

> `ContentProcessor` already existed (Phase 1) and provides PDF/OCR/text extraction, so the
> task's `pdf-extraction` / `ocr-service` abstractions are satisfied by reusing it rather than
> duplicating. `server/lib/content-chunker.ts` is the new dedicated chunking + tagging module.

---

## 3. Retrieval & AI grounding

- `GET /api/content/chunks?subject=&topic=&gradeLevel=&language=&limit=` → filtered chunks.
- `GET /api/content/sources/my` → teacher's uploaded sources.
- `AITutorService.fetchCurriculumContext(subject, {topic, gradeLevel, language, limit})`:
  calls `storage.findCurriculumChunks()` and returns a formatted prompt context block.

When a tutor session or message is sent with `curriculumMode: true`, the server fetches the
context and injects it into the persona system prompt. If no chunks match, the model falls back
to generic GPT knowledge (no error).

---

## 4. Client integration

`client/src/pages/StudyBuddy.tsx`:
- Subject selector (existing), plus new **Grade Level** selector and **Curriculum Mode** toggle.
- `startSession()` sends `{ subject, topic, gradeLevel, curriculumMode, difficultyLevel, language }`.
- `sendMessage()` sends `{ ...message, curriculumMode, gradeLevel }` so context persists per turn.

---

## 5. Tests

- `server/lib/content-chunker.test.ts` — unit tests for `chunkText`, `estimateTokens`, `buildRagContext`.
- `server/storage.rag.test.ts` — integration tests (needs `DATABASE_URL`): source/chunk create,
  `findCurriculumChunks`, `getMyContentSources`.

Run: `DATABASE_URL=... npx vitest run server/lib/content-chunker.test.ts server/storage.rag.test.ts`

---

## 6. Future work

- Vector embeddings (`embedding_status` column reserved) for semantic retrieval.
- Auto-generated practice questions from chunks (feeds Task Group 2).
- Teacher UI to review/edit chunks and delete sources.
