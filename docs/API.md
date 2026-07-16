# API Reference

## Keru.ai Suite Backend API

**Base URL:**
- Development: `http://localhost:5000/api`
- Production: `https://your-domain/api`

---

## Authentication

All protected endpoints require:
```http
Authorization: Bearer <access_token>
```

---

## Legacy / Internal Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/users` | No | Create user (legacy; prefer `/api/auth/register`) |
| `GET` | `/api/users/:id` | No | Get user by ID |
| `GET` | `/api/users/username/:username` | No | Get user by username |

These endpoints exist for compatibility. New code should use auth routes for registration. The frontend does not call these; they are retained for scripts or external tools.

---

## Auth Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register` | No | Register new user |
| `POST` | `/api/auth/login` | No | Login user |
| `POST` | `/api/auth/logout` | Yes | Logout user |
| `GET` | `/api/auth/me` | Yes | Get current user |
| `POST` | `/api/auth/refresh` | No | Refresh access token (body: `{ refreshToken }`) |
| `POST` | `/api/auth/verify-email` | No | Verify email with token |
| `POST` | `/api/auth/forgot-password` | No | Request password reset |
| `POST` | `/api/auth/reset-password` | No | Reset password with token |

### Register
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

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "estudiante1",  // or email, or phoneNumber
  "password": "securePassword123"
}
```

---

## Budget Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/budget/categories` | Yes | Get user's categories |
| `POST` | `/api/budget/categories` | Yes | Create category |
| `PUT` | `/api/budget/categories/:id` | Yes | Update category |
| `DELETE` | `/api/budget/categories/:id` | Yes | Delete category |
| `GET` | `/api/budget/transactions` | Yes | Get user's transactions |
| `POST` | `/api/budget/transactions` | Yes | Create transaction |
| `PUT` | `/api/budget/transactions/:id` | Yes | Update transaction |
| `DELETE` | `/api/budget/transactions/:id` | Yes | Delete transaction |

---

## Study Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/study/notes` | Yes | Get user's notes (list only; no single-note endpoint) |
| `POST` | `/api/study/notes` | Yes | Create note |
| `PUT` | `/api/study/notes/:id` | Yes | Update note |
| `DELETE` | `/api/study/notes/:id` | Yes | Delete note |

---

## Tutor Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/tutors` | No | Get available tutors |
| `GET` | `/api/tutors/sessions/:userId` | Yes | List user's tutor sessions (past sessions) |
| `POST` | `/api/tutors/sessions` | Yes | Start tutoring session |
| `POST` | `/api/tutors/messages` | Yes | Send message (body: sessionId, sender, message, messageType, language?) |
| `PATCH` | `/api/tutors/sessions/:sessionId/end` | Yes | End session |
| `GET` | `/api/tutors/sessions/:sessionId/messages` | Yes | Get session messages |

---

## Progress Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/progress/profile/:userId` | Yes | Get student profile (404 if none) |
| `POST` | `/api/progress/profile` | Yes | Create student profile (body: userId, learningStyle, preferredDifficulty, subjects, strugglingAreas, etc.) |
| `PUT` | `/api/progress/profile/:userId` | Yes | Update student profile (body: partial fields) |
| `GET` | `/api/progress/badges` | Yes | Get all badges |
| `GET` | `/api/progress/badges/:id` | Yes | Get single badge (admin/tools) |
| `GET` | `/api/progress/user-badges/:userId` | Yes | Get user's earned badges |
| `POST` | `/api/progress/user-badges/:userId/:badgeId/view` | Yes | Mark badge as viewed |
| `GET` | `/api/progress/streaks/:userId` | Yes | Get study streaks (optional UI) |
| `GET` | `/api/progress/stats/:userId` | Yes | Get session statistics (optional UI) |
| `POST` | `/api/progress/session-complete/:sessionId` | Yes | Award session rewards (body: userId, subject, duration?, messagesExchanged, difficulty). Called by web Study Buddy on end-session and by Telegram bot. |

---

## Games Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/games/scores` | Yes | Get user's game scores (optional `?game=gameName`) |
| `GET` | `/api/games/progress/:gameName` | Yes | Get reached level for game (max level from scores; response `{ level: number }`, default 1) |
| `POST` | `/api/games/scores` | Yes | Submit game score (body: gameName, score, level?, completed?). Response includes `rewards`: `{ pointsEarned, badgesEarned: [{ name, icon }], levelUp }`; profile/streak/badges updated server-side. |
| `GET` | `/api/games/leaderboard/:gameName` | No | Get top scores (e.g. `?limit=10`). Public. |
| `GET` | `/api/games/problems/mathmaster/:level` | Yes | Get MathMaster problems for level (1–6). Optional `?limit=50`. |
| `GET` | `/api/games/problems/linguaplay/:level` | Yes | Get LinguaPlay problems for level (1–6). Query `?mode=vocabulary` (default), `grammar`, `listening`, `spelling`, `pronunciation`. Optional `?limit=50`. |

---

## Teachers Endpoints

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| `GET` | `/api/teachers` | Yes | student, teacher, superuser | List registered teachers (isActive + isVerified) for students to select |

---

## Students Endpoints

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| `GET` | `/api/students/teachers` | Yes | student | Get current student's selected teachers |
| `POST` | `/api/students/teachers/:teacherId` | Yes | student | Select a teacher (add to my teachers) |
| `DELETE` | `/api/students/teachers/:teacherId` | Yes | student | Unselect a teacher |

---

## Classes Endpoints

Class groups: teachers create classes, students join via invite code. Teacher approves members before chat access.

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| `POST` | `/api/classes` | Yes | teacher, superuser | Create class (body: name, subject?) |
| `GET` | `/api/classes/teacher` | Yes | teacher, superuser | Get teacher's classes (query: teacherId for superuser) |
| `GET` | `/api/classes/student` | Yes | student | Get student's enrolled classes |
| `POST` | `/api/classes/join` | Yes | student | Join class (body: inviteCode) |
| `GET` | `/api/classes/:id` | Yes | — | Get class details + members (must be teacher, member, or superuser) |
| `DELETE` | `/api/classes/:id` | Yes | teacher, superuser | Delete class (teacher: only when empty; archives chat for super admin) |
| `PATCH` | `/api/classes/:id/members/:userId/approve` | Yes | teacher, superuser | Approve student in class |
| `PATCH` | `/api/classes/:id/terminate` | Yes | teacher, superuser | Terminate class chat |
| `PATCH` | `/api/classes/:id/archive` | Yes | teacher, superuser | Archive class chat |
| `PATCH` | `/api/classes/:id/block` | Yes | teacher, superuser | Block chat (body: minutes) |
| `PATCH` | `/api/classes/:id/unblock` | Yes | teacher, superuser | Unblock chat |
| `PATCH` | `/api/classes/:id/members/:userId/mute` | Yes | teacher, superuser | Mute student |
| `PATCH` | `/api/classes/:id/members/:userId/unmute` | Yes | teacher, superuser | Unmute student |
| `PATCH` | `/api/classes/:id/members/:userId/ban` | Yes | teacher, superuser | Ban student |
| `PATCH` | `/api/classes/:id/members/:userId/unban` | Yes | teacher, superuser | Unban student |
| `PATCH` | `/api/classes/:id/members/:userId/revoke-access` | Yes | teacher, superuser | Revoke student access |
| `PATCH` | `/api/classes/:id/members/:userId/restore-access` | Yes | teacher, superuser | Restore student access |
| `GET` | `/api/classes/:id/messages` | Yes | — | Get class chat messages (query: limit) |
| `POST` | `/api/classes/:id/messages` | Yes | — | Send class chat message (body: message) |

---

## Content Endpoints

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| `GET` | `/api/content` | Yes | verified | Get all published content (requireVerification) |
| `GET` | `/api/content/my` | Yes | teacher, superuser | Get current teacher's content |
| `POST` | `/api/content` | Yes | teacher, superuser | Upload content |
| `PATCH` | `/api/content/:id` | Yes | teacher, superuser | Update content (title, description, subject) |
| `DELETE` | `/api/content/:id` | Yes | teacher, superuser | Delete content |
| `POST` | `/api/content/:id/publish` | Yes | teacher, superuser | Publish content |

---

## Assignments Endpoints

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| `GET` | `/api/assignments/my` | Yes | student | Get current user's assignments |
| `POST` | `/api/assignments` | Yes | teacher, superuser | Create assignment (studentId, contentId) |
| `POST` | `/api/assignments/:id/submit` | Yes | student | Submit assignment (files, submissionText) |
| `POST` | `/api/assignments/:id/grade` | Yes | teacher, superuser | Grade assignment |
| `GET` | `/api/assignments/revision/materials` | Yes | student | Get revision materials (assignments + content) |
| `GET` | `/api/assignments/revision/content/:contentId` | Yes | student | Get content for revision (with access check) |
| `POST` | `/api/assignments/revision/session/start` | Yes | student | Start revision session (contentId, subject, topic) |
| `POST` | `/api/assignments/revision/ai-help` | Yes | student | AI help for revision (contentId, question, sessionId?) |

---

## Mentorship Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/mentorship/mentors` | Yes | List mentor profiles (query: subject, gradeLevel, isVolunteer) |
| `POST` | `/api/mentorship/mentors` | Yes | Create mentor profile (become a mentor) |
| `GET` | `/api/mentorship/requests` | Yes | Get mentorship requests (query: asMentor=true for mentor view) |
| `POST` | `/api/mentorship/requests` | Yes | Create mentorship request (mentorId, subject, description) |
| `GET` | `/api/mentorship/sessions` | Yes | Get user's mentorship sessions |

---

## Public Blog Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/blog/posts` | No | Get published blog posts (query: limit, offset) |

---

## Admin Endpoints

**Blog posts:** Read/create/update/delete via `/api/admin/blog-posts`. Requires `teacher` or `superuser` role.

**Admin-only API (no UI tabs yet):** `GET /api/admin/personas` (paginated), `GET /api/admin/submissions`, and `GET /api/admin/assignments` are available for tools or future admin panels; the current admin dashboard uses `GET /api/admin/bot-personas` for personas and does not list submissions or assignments in tabs.

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| `GET` | `/api/admin/users` | Yes | superuser | Get all users |
| `PATCH` | `/api/admin/users/:id/status` | Yes | superuser | Update user status (body: `isActive`) |
| `PATCH` | `/api/admin/users/:id/role` | Yes | superuser | Update user role (body: `role`) |
| `PATCH` | `/api/admin/users/:id/verify` | Yes | superuser | Verify/approve user |
| `DELETE` | `/api/admin/users/:id` | Yes | superuser | Delete user |
| `GET` | `/api/admin/analytics` | Yes | superuser, teacher | Get platform analytics |
| `GET` | `/api/admin/budget-analytics` | Yes | superuser | Get budget metrics |
| `GET` | `/api/admin/chat-analytics` | Yes | superuser, teacher | Get chat/tutor request metrics |
| `PATCH` | `/api/admin/system/features` | Yes | superuser | Toggle feature (body: `feature`, `enabled`) |
| `GET` | `/api/admin/blog-posts` | Yes | superuser, teacher | Get blog posts (query: limit, offset) |
| `POST` | `/api/admin/blog-posts` | Yes | superuser, teacher | Create blog post |
| `PUT` | `/api/admin/blog-posts/:id` | Yes | superuser, teacher | Update blog post |
| `DELETE` | `/api/admin/blog-posts/:id` | Yes | superuser, teacher | Delete blog post |
| `GET` | `/api/admin/bot-personas` | Yes | superuser, teacher | Get bot personas (query: limit, offset) |
| `GET` | `/api/admin/personas` | Yes | superuser, teacher | Get personas paginated |
| `POST` | `/api/admin/bot-personas` | Yes | superuser, teacher | Create persona (body: name, agentKey, systemPrompt, …) |
| `PUT` | `/api/admin/bot-personas/:id` | Yes | superuser, teacher | Update persona |
| `DELETE` | `/api/admin/bot-personas/:id` | Yes | superuser, teacher | Delete persona |
| `GET` | `/api/admin/submissions` | Yes | superuser, teacher | Get content submissions (query: published, limit, offset) |
| `GET` | `/api/admin/assignments` | Yes | superuser, teacher | Get all assignments (query: limit, offset) |
| `GET` | `/api/admin/mentor-applications` | Yes | superuser | List mentor applications (query: status, limit, offset) |
| `PATCH` | `/api/admin/mentor-applications/:id` | Yes | superuser | Approve or reject mentor application |
| `GET` | `/api/admin/mentor-materials` | Yes | superuser, teacher | List mentor materials (query: mentorId, status) |
| `PATCH` | `/api/admin/mentor-materials/:id` | Yes | superuser, teacher | Approve or reject mentor material |

---

## System Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/system/features` | No | Get feature flags for nav/UI (revision_materials, studybuddy_ai, budget_tracker, games, etc.) |

---

## Error Responses

| Status | Description |
|--------|-------------|
| 400 | Bad request (validation error) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient role) |
| 404 | Resource not found |
| 500 | Server error |

Standard error format:
```json
{
  "error": "Error message",
  "code": "ERROR_CODE"
}
```
