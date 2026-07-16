# Workflows, UX & Study Materials

Single reference for student/teacher flows, study materials (Materiales de estudio), Content vs Assignments, and applied fixes.

---

## 1. Materiales de estudio – single entry point

**Materiales de estudio** (Study Materials) is the **single student-facing page** for assigned materials. Students go to **/revision** (sidebar: Aprender → Materiales de Estudio, or Dashboard card).

- **Depends on:** (1) Student has at least one teacher in "Your teachers" (Class Groups), (2) Student is in at least one **approved** class, (3) Teacher has assigned content to that student. If (1) or (2) is missing, the page shows a prominent **Get started** card with one button: **Go to Class Groups**.
- **Feature flag:** The sidebar link is hidden when the system feature `revision_materials` is disabled (Admin → System Settings). The page at /revision is still reachable via Dashboard or direct URL; when the feature is off, consider showing a disabled message (optional).
- **403 from API:** If the student has teachers but no approved class, the API `GET /api/assignments/revision/materials` returns **403** with message "Your teacher must approve you in a class before you can access study materials". The page shows this message and a **Go to Class Groups** button so the student knows exactly what to do.

---

## 2. Fixes applied (workflow alignment)

- **Post-signup (student):** After registration as student, redirect to **/classes** so they land on "Your teachers" and "Join a class" first.
- **Dashboard (student):** If the student has no teachers or no approved class, a **"Get started"** card is shown at the top with copy that directs them to Class Groups. Button links to `/classes`.
- **Materiales de estudio (Revision):** Single page at /revision. When the student has no teachers or no approved class, a prominent **Get started** card is shown with link to Class Groups. When the API returns 403 (no approved class), the same-style card shows the error message and **Go to Class Groups**. Naming unified to "Materiales de Estudio" / "Study Materials" (sidebar, dashboard card, page title). i18n for dashboard card and revision page.
- **Assign dialogs (teacher/admin):** Both "Assign to student(s)" and "Create assignment" dialogs include a prerequisite hint: students must have the teacher in "Your teachers" (Class Groups) and be in an approved class.
- **Admin:** Content Management and **Student Assignments** are grouped under **Content & Learning** so teachers have one place for study materials and assignments.

**Files changed:** `auth-page.tsx`, `Dashboard.tsx`, `content.ts`, `admin-dashboard.tsx`, `StudentRevision.tsx`.

---

## 3. Student workflow

| Step | Where | What |
|------|--------|------|
| 1 | Signup | No topics/teachers at signup; after register, **redirect to /classes**. |
| 2 | /dashboard | If no teachers or no approved class, **Get started** card → link to Class Groups. |
| 3 | **Class Groups** (/classes) | **Your teachers:** Add/remove teachers (multiple). **Join a class:** Enter invite code → pending → teacher approves. **My chat groups:** Open class chat. |
| 4 | **Materiales de estudio** (/revision) | Single page for study materials. Shows a **Get started** card (with link to Class Groups) if no teachers or no approved class. Otherwise shows the list of assigned materials; empty list means teacher has not assigned yet. |

**How the student adds more teachers/classes:** Only in **Class Groups**: "Your teachers" (add/remove) and "Join a class" (invite code). Multiple teachers and multiple classes supported.

**When does the student select teachers?** In Class Groups, section "Your teachers" / "Mis profesores," before any assignment. They can select multiple teachers.

---

## 4. Teacher workflow

| Step | Where | What |
|------|--------|------|
| 1 | /dashboard | Quick panel: Content Management, Clases y Grupos, Mentor Materials (links to /admin#...). |
| 2 | **Admin → Clases y Grupos** (or /classes) | Create class → get invite code → share. Approve join requests. Same page = class chat. |
| 3 | **Admin → Content & Learning** | **Content Management:** Upload content and **Assign** to students. **Student Assignments:** List assignment records; Create assignment (content + student). Both under the same section. |

Flow: **create class → share code → upload content → assign content to students.**

---

## 5. Chats and classes

**Chats align with classes.** One class = one chat on the Class Groups page. Teacher creates class and share code; student joins with code and, once approved, sees "My chat groups" and that class's chat. Adding a teacher in "Your teachers" does not create a chat; the chat comes from **joining a class** that that teacher owns.

---

## 6. Admin: Content & Learning (teacher UX)

All study-materials actions live under **Content & Learning** so teachers are not scattered across sections.

| Admin section | What it is | Main actions |
|---------------|------------|--------------|
| **Content Management** | **Your** materials (files, PDFs). Each item has an owner (teacher). | Upload, edit, delete, publish. **Assign to student(s)** on each row to give students access. |
| **Student Assignments** | The **links**: "student X has been assigned content Y". | Read-only list. To assign, use Content Management. |
| **All content (read-only)** | Platform-wide list of all uploaded content. | View only. No assign/edit here; use Content Management. |

- **Content** = a learning material (file), stored once. **Assignment** = linking a student to a content item so they see it in Materiales de estudio (they need that teacher in Class Groups and an approved class).
- **Single place to assign:** use **Assign to student(s)** on each content row in **Content Management** only. Student Assignments is view-only (no duplicate "Create assignment").
- **Who appears in the Assign dialog:** For teachers, the list is **students who are in at least one of your classes** (they joined with your invite code) **or** **students who have you in "Your teachers"** (Class Groups). So if a student has joined your class and/or added you as teacher, they appear. Superusers see all students.
- In Content Management, a blue workflow callout explains: materials live here → Assign to student(s) on each row → students see them in Materiales de estudio when they have you as teacher and an approved class.

---

## 7. UX pain points and recommendations

**Pain points:** Two entry points for "assign"; terminology (Content vs Assignments); student may not discover "Mis profesores" first; materials path depends on student doing Class Groups before Revision.

**Recommendations:** (1) Consider single place to create assignments or clearer labels. (2) Keep prerequisite hint in assign dialogs. (3) Keep "Classes first" messaging on dashboard and Materiales de estudio Get started card. (4) Content + Student Assignments are grouped under Admin **Content & Learning**. (5) Glossary: "Content" = a learning material (file); "Assignment" = link so student sees it in Materiales de estudio (subject to teacher selection and class approval).
