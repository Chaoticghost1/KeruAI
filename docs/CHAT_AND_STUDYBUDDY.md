# Chat & StudyBuddy: Wiring and UI Reference

How tutor chat and class chat connect to the backend, and UI/style reference for both.

---

## Part 1: StudyBuddy Chat Wiring

**Frontend:** `client/src/pages/StudyBuddy.tsx` → `POST /api/tutors/messages`, plus `GET /api/tutors/sessions/:sessionId/messages`, `POST /api/tutors/sessions`, `PATCH .../end`. Mounted in `server/routes/index.ts` as `tutorsRouter`.

**Backend (POST /messages, `server/routes/tutors.ts`):**

1. **QA cache** — Same question (normalized hash) for this session/agent → return cached reply.
2. **N8N webhook (optional, per persona)** — Env: `N8N_WEBHOOK_<AGENT_KEY>` (e.g. `N8N_WEBHOOK_MATEMATICO_GUIA`). Fallback: `N8N_PERSONA_CHAT_URL` or `N8N_WEBHOOK_URL`. Server POSTs `studentMessage`, `sessionId`, `agentKey`, `subject`, `difficultyLevel`, `language`, `conversationHistory`, `studentProfile`. Response: JSON with `message` (or `output`/`text`/`content`/`result`/`response`). If valid, that is used and no in-app AI call.
3. **In-app AI (fallback)** — `server/ai-service.ts`: OpenAI first, then Perplexity, then rule-based.

**N8N:** Create one workflow per tutor with Webhook node; set per-persona URLs in `.env`; restart server. Request/response shape above. Workflow can call back for QA cache (`GET/POST .../api/tutors/qa-cache`).

**Troubleshooting:** If nothing reaches n8n, check server logs for `[N8N] No webhook URL for agentKey=...` and ensure `N8N_WEBHOOK_<UPPER_SNAKE_AGENT_KEY>` matches DB `agent_key`. Local dev: backend can stay on localhost; set webhook URL to your n8n (e.g. ngrok). For n8n callbacks to app, `BACKEND_URL` must be reachable from n8n.

---

## Part 2: Chat Page UI Extract

**StudyBuddy (tutor chat):** Page wrapper `min-h-screen bg-youth-surface p-6`, `max-w-6xl mx-auto`. Agent selection: Card, carousel, `rounded-youth-lg`, `bg-youth-primary` for primary button. Chat: Card `h-[600px]`, ScrollArea for messages, student bubble `bg-blue-600 text-white`, agent bubble `bg-slate-100 text-slate-900`, `max-w-[80%]`, textarea + send in bordered footer.

**Class Groups (class chat):** `client/src/pages/ClassGroups.tsx`. List view: container, grid, group rows with `MessageSquare` icon, invite code badge. Chat view: ScrollArea `h-[400px]`, bubbles: you `bg-blue-600`, teacher `bg-amber-100 text-amber-900`, others `bg-slate-100`. Modals: approve students, block chat (duration). Design tokens: `--youth-primary`, `--youth-accent`, `--youth-surface`, `rounded-youth-lg`; hard-coded blue/slate/amber/emerald for bubbles and actions.

**Components:** StudyBuddy uses Card, Button, Input, Textarea, Badge, Select, ScrollArea, Separator, Carousel. ClassGroups uses Card, Button, Input, Label, Badge, ScrollArea, Alert, Dialog, DropdownMenu, plus icons (Users, MessageSquare, Send, etc.).

Use this as the single reference when reworking chat look and feel.
