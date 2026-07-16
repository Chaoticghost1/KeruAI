# Centro de Mentores — Backlog & Future Work

**Last updated:** February 2026  
**Scope:** Mentor application flow, credential verification, material approval, and platform integration.

---

## Current Status

| Area | Status | Notes |
|------|--------|-------|
| MentorshipHub UI | ✅ OK | Find Mentor, Become Mentor, My Sessions; wired to API |
| Mentor listing API | ✅ OK | `GET /api/mentorship/mentors` with filters |
| Become Mentor (in-app) | ⚠️ Direct | No admin pre-approval; any logged-in user can create mentor profile |
| Landing page link | ❌ Missing | No Centro de Mentores or "Become Mentor" CTA |
| Mentor application flow | ❌ Missing | No public sign-up form; no credential/diploma collection |
| Admin pre-approval | ❌ Missing | No admin workflow to check credentials and pre-approve mentors |
| Mentor material upload | ⚠️ Partial | Teachers can upload via content API; no dedicated mentor materials |
| Admin material approval | ❌ Missing | Content can be self-published; no admin crosscheck |

---

## Desired Flow

1. **Landing page** → "Become a Mentor" CTA → sign-up form
2. **Mentor sign-up form** → User fills form (credentials, diplomas, etc.) → Admin receives
3. **Admin** → Checks credentials → Pre-approves or rejects
4. **Mentor** → After approval, uploads teaching material
5. **Admin** → Cross-checks and approves material before it goes live

---

## Gaps to Address

1. Public mentor application form (`/mentor-apply`)
2. `mentor_applications` table with status (pending, approved, rejected)
3. Admin: Mentor Applications section (list, approve, reject)
4. `mentor_materials` table with admin approval status
5. Admin: Mentor Materials approval section
6. Landing page: Add Centro de Mentores card + CTA

---

## Implementation Plan

| # | Task | Status |
|---|------|--------|
| 1 | Create `mentor_applications` and `mentor_materials` schema | Planned |
| 2 | Add storage methods + public `POST /api/mentorship/applications` | Planned |
| 3 | Create MentorApply page (public form) + route `/mentor-apply` | Planned |
| 4 | Add Centro de Mentores section + CTA on landing page | Planned |
| 5 | Admin: Mentor Applications section | Planned |
| 6 | Mentor materials upload API + Admin approval section | Planned |
