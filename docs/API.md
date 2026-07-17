# API Reference

> Auto-generated from route handlers. **Last updated:** July 2026. 124 endpoints.

## Base URL

All endpoints are prefixed with the server origin (e.g. `http://127.0.0.1:5000`). Auth: `Yes` = requires `Authorization: Bearer <accessToken>`.

---

## Admin

| Method | Path | Auth | File |
|--------|------|------|------|
| GET | `/api/admin/analytics` | Yes | admin.ts |
| GET | `/api/admin/analytics/detailed` | Yes | admin.ts |
| GET | `/api/admin/assignments` | Yes | admin.ts |
| GET | `/api/admin/blog-posts` | Yes | admin.ts |
| POST | `/api/admin/blog-posts` | Yes | admin.ts |
| DELETE | `/api/admin/blog-posts/:id` | Yes | admin.ts |
| PUT | `/api/admin/blog-posts/:id` | Yes | admin.ts |
| GET | `/api/admin/bot-personas` | Yes | admin.ts |
| POST | `/api/admin/bot-personas` | Yes | admin.ts |
| DELETE | `/api/admin/bot-personas/:id` | Yes | admin.ts |
| PUT | `/api/admin/bot-personas/:id` | Yes | admin.ts |
| GET | `/api/admin/budget-analytics` | Yes | admin.ts |
| GET | `/api/admin/chat-analytics` | Yes | admin.ts |
| GET | `/api/admin/class-chat-archives` | Yes | admin.ts |
| GET | `/api/admin/class-chat-archives/:id` | Yes | admin.ts |
| GET | `/api/admin/mentor-applications` | Yes | admin.ts |
| GET | `/api/admin/mentor-materials` | Yes | admin.ts |
| GET | `/api/admin/personas` | Yes | admin.ts |
| GET | `/api/admin/submissions` | Yes | admin.ts |
| GET | `/api/admin/system/api-keys` | Yes | admin.ts |
| GET | `/api/admin/system/bad-words-leaderboard` | Yes | admin.ts |
| GET | `/api/admin/system/features` | Yes | admin.ts |
| GET | `/api/admin/system/moderation` | Yes | admin.ts |
| GET | `/api/admin/users` | Yes | admin.ts |
| DELETE | `/api/admin/users/:id` | Yes | admin.ts |

---

## Assignments

| Method | Path | Auth | File |
|--------|------|------|------|
| POST | `/api/assignments/` | Yes | assignments.ts |
| POST | `/api/assignments/:id/grade` | Yes | assignments.ts |
| POST | `/api/assignments/:id/submit` | Yes | assignments.ts |
| GET | `/api/assignments/my` | Yes | assignments.ts |
| POST | `/api/assignments/revision/ai-help` | Yes | assignments.ts |
| GET | `/api/assignments/revision/content/:contentId` | Yes | assignments.ts |
| GET | `/api/assignments/revision/materials` | Yes | assignments.ts |
| POST | `/api/assignments/revision/session/start` | Yes | assignments.ts |

---

## Auth

| Method | Path | Auth | File |
|--------|------|------|------|
| POST | `/api/auth/forgot-password` | No | auth.ts |
| POST | `/api/auth/login` | No | auth.ts |
| POST | `/api/auth/logout` | Yes | auth.ts |
| GET | `/api/auth/me` | Yes | auth.ts |
| POST | `/api/auth/profile-image` | Yes | auth.ts |
| POST | `/api/auth/refresh` | No | auth.ts |
| POST | `/api/auth/register` | No | auth.ts |
| POST | `/api/auth/reset-password` | No | auth.ts |
| POST | `/api/auth/verify-email` | No | auth.ts |

---

## Blog

| Method | Path | Auth | File |
|--------|------|------|------|
| GET | `/api/blog/landing` | No | blog.ts |
| GET | `/api/blog/posts` | No | blog.ts |

---

## Budget

| Method | Path | Auth | File |
|--------|------|------|------|
| GET | `/api/budget/categories` | Yes | budget.ts |
| POST | `/api/budget/categories` | Yes | budget.ts |
| DELETE | `/api/budget/categories/:id` | Yes | budget.ts |
| PUT | `/api/budget/categories/:id` | Yes | budget.ts |
| GET | `/api/budget/transactions` | Yes | budget.ts |
| POST | `/api/budget/transactions` | Yes | budget.ts |
| DELETE | `/api/budget/transactions/:id` | Yes | budget.ts |
| PUT | `/api/budget/transactions/:id` | Yes | budget.ts |

---

## Captcha

| Method | Path | Auth | File |
|--------|------|------|------|
| POST | `/api/captcha/verify` | No | captcha.ts |

---

## Classes

| Method | Path | Auth | File |
|--------|------|------|------|
| POST | `/api/classes/` | Yes | classes.ts |
| DELETE | `/api/classes/:id(\\d+)` | Yes | classes.ts |
| GET | `/api/classes/:id(\\d+)` | Yes | classes.ts |
| GET | `/api/classes/:id/messages` | Yes | classes.ts |
| POST | `/api/classes/:id/messages` | Yes | classes.ts |
| POST | `/api/classes/join` | Yes | classes.ts |
| GET | `/api/classes/student` | Yes | classes.ts |
| GET | `/api/classes/teacher` | Yes | classes.ts |

---

## Content

| Method | Path | Auth | File |
|--------|------|------|------|
| GET | `/api/content/` | Yes | content.ts |
| POST | `/api/content/` | Yes | content.ts |
| DELETE | `/api/content/:id` | Yes | content.ts |
| POST | `/api/content/:id/publish` | Yes | content.ts |
| GET | `/api/content/chunks` | Yes | content.ts |
| GET | `/api/content/my` | Yes | content.ts |
| GET | `/api/content/sources/my` | Yes | content.ts |
| POST | `/api/content/upload` | Yes | content.ts |

---

## Games

| Method | Path | Auth | File |
|--------|------|------|------|
| GET | `/api/games/leaderboard/:gameName` | Yes | games.ts |
| GET | `/api/games/problems/linguaplay/:level` | Yes | games.ts |
| GET | `/api/games/problems/mathmaster/:level` | Yes | games.ts |
| GET | `/api/games/progress/:gameName` | Yes | games.ts |
| GET | `/api/games/scores` | Yes | games.ts |
| POST | `/api/games/scores` | Yes | games.ts |

---

## Mentorship

| Method | Path | Auth | File |
|--------|------|------|------|
| POST | `/api/mentorship/applications` | No | mentorship.ts |
| GET | `/api/mentorship/materials` | Yes | mentorship.ts |
| POST | `/api/mentorship/materials` | Yes | mentorship.ts |
| GET | `/api/mentorship/me` | Yes | mentorship.ts |
| GET | `/api/mentorship/mentors` | Yes | mentorship.ts |
| POST | `/api/mentorship/mentors` | Yes | mentorship.ts |
| GET | `/api/mentorship/requests` | Yes | mentorship.ts |
| POST | `/api/mentorship/requests` | Yes | mentorship.ts |
| GET | `/api/mentorship/sessions` | Yes | mentorship.ts |

---

## Progress/Gamification

| Method | Path | Auth | File |
|--------|------|------|------|
| GET | `/api/progress/badges` | No | progress.ts |
| GET | `/api/progress/badges/:id` | No | progress.ts |
| POST | `/api/progress/profile` | Yes | progress.ts |
| GET | `/api/progress/profile/:userId` | Yes | progress.ts |
| PUT | `/api/progress/profile/:userId` | Yes | progress.ts |
| POST | `/api/progress/session-complete/:sessionId` | No | progress.ts |
| GET | `/api/progress/stats/:userId` | No | progress.ts |
| GET | `/api/progress/streaks/:userId` | No | progress.ts |
| GET | `/api/progress/user-badges/:userId` | No | progress.ts |
| POST | `/api/progress/user-badges/:userId/:badgeId/view` | No | progress.ts |

---

## Students

| Method | Path | Auth | File |
|--------|------|------|------|
| GET | `/api/students/teachers` | Yes | students.ts |
| DELETE | `/api/students/teachers/:teacherId` | Yes | students.ts |
| POST | `/api/students/teachers/:teacherId` | Yes | students.ts |

---

## Study Notes

| Method | Path | Auth | File |
|--------|------|------|------|
| GET | `/api/study/notes` | Yes | study.ts |
| POST | `/api/study/notes` | Yes | study.ts |
| DELETE | `/api/study/notes/:id` | Yes | study.ts |
| PUT | `/api/study/notes/:id` | Yes | study.ts |

---

## Revision (Practice Packs)

Student Revision v2: AI practice generation + spaced-repetition revision packs. See [REVISION.md](./REVISION.md).

| Method | Path | Auth | File |
|--------|------|------|------|
| POST | `/api/study/practice` | Yes | study.ts |
| GET | `/api/revision/packs` | Yes | study.ts |
| GET | `/api/revision/packs/:id` | Yes | study.ts |
| POST | `/api/revision/packs/:id/offline` | Yes | study.ts |
| POST | `/api/revision/packs/:id/items/:itemId/review` | Yes | study.ts |

---

## /api/system

| Method | Path | Auth | File |
|--------|------|------|------|
| GET | `/api/system/features` | No | index.ts |
| GET | `/api/system/features` | No | index.ts |

---

## Teachers

| Method | Path | Auth | File |
|--------|------|------|------|
| GET | `/api/teachers/` | Yes | teachers.ts |
| GET | `/api/teachers/students` | Yes | teachers.ts |

---

## Tutors

| Method | Path | Auth | File |
|--------|------|------|------|
| GET | `/api/tutors/` | No | tutors.ts |
| GET | `/api/tutors/:agentKey` | No | tutors.ts |
| POST | `/api/tutors/messages` | No | tutors.ts |
| POST | `/api/tutors/qa-cache` | No | tutors.ts |
| GET | `/api/tutors/qa-cache/check` | No | tutors.ts |
| POST | `/api/tutors/sessions` | No | tutors.ts |
| GET | `/api/tutors/sessions/:sessionId/messages` | No | tutors.ts |
| GET | `/api/tutors/sessions/:userId` | No | tutors.ts |

---

## /api/users

| Method | Path | Auth | File |
|--------|------|------|------|
| POST | `/api/users` | No | index.ts |
| POST | `/api/users` | No | index.ts |
| GET | `/api/users/:id` | No | index.ts |
| GET | `/api/users/:id` | No | index.ts |
| GET | `/api/users/username/:username` | No | index.ts |
| GET | `/api/users/username/:username` | No | index.ts |

---

