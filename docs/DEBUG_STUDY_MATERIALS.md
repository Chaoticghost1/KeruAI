# Debug: Study Materials / Assign Flow

When the server runs in **development** (`NODE_ENV !== 'production'`), or when `DEBUG_STUDY_MATERIALS=1` is set, it logs `[StudyMaterials]` lines to the **server terminal**. Use these to see why the assign list is empty or why a student sees no materials.

## 1. Assign dialog (teacher): who’s in the list?

When a teacher opens **Assign to student(s)** on a content row:

- **`GET /teachers/students`**  
  - `request`: `userId` (teacher), `role`, `limit`, `offset`.  
  - `response`: `total`, `dataLength`, `studentIds` (list of user ids returned).

- **`getStudentsInTeacherClassesPaginated`** (storage):  
  - `teacherId`  
  - `fromClassesCount` / `fromClassesUserIds`: students in **any of this teacher’s classes** (`class_members` + `classes.teacher_id`).  
  - `fromStudentTeachersCount` / `fromStudentTeachersStudentIds`: students who **have this teacher in “Your teachers”** (`student_teachers`).  
  - `combinedUniqueIds`: union of the two.  
  - `returning`: `total`, `dataLength`, `userIds` (after filtering to `role = 'student'`).

If the list is empty, check:

- `fromClassesCount` and `fromStudentTeachersCount`: both 0 → student never joined a class **and** never added this teacher in Class Groups.  
- `combinedUniqueIds` has ids but `returning.dataLength` is 0 → those users don’t have `role = 'student'` in `users`.

## 2. Teacher assigns content

When the teacher clicks **Assign**:

- **`POST /assignments`**  
  - `body received`: raw `studentId`, `contentId`.  
  - `validation failed`: if IDs are missing or invalid.  
  - `created`: `assignmentId`, `studentId`, `contentId`.  
  - `error`: if create failed.

## 3. Student: Materiales de estudio (revision materials)

When a student opens **Materiales de estudio**:

- **`GET /revision/materials`**  
  - `student context`: `studentId`, `selectedTeacherIds` (from “Your teachers”), `selectedTeacherCount`.  
  - `empty: no teachers selected`: student has no teachers in Class Groups → API returns `[]`.  
  - `approved class check`: `hasApprovedClass` (must be true to continue).  
  - `403: no approved class`: student has teachers but no approved class → 403.  
  - `assignments`: count and list of `{ id, contentId }` for this student.  
  - For each assignment filtered out: `assignment filtered out (no content or teacher not in selected)` with `contentId`, `contentTeacherId`, `inSelected`.  
  - `response`: `materialsCount` (final list length).

If the student sees no materials, check in order:

1. `selectedTeacherCount === 0` → add teacher in Class Groups.  
2. `hasApprovedClass === false` → student must join a class and teacher must approve.  
3. `assignments.count === 0` → teacher has not assigned any content to this student.  
4. Assignments exist but `assignment filtered out` for all → content’s `teacherId` is not in the student’s `selectedTeacherIds` (wrong teacher or student removed them).

## Turning logs on/off

- **Development:** logs are on by default.  
- **Production:** set `DEBUG_STUDY_MATERIALS=1` in the server env to enable.  
- **Development, turn off:** set `NODE_ENV=production` for that run, or remove the env check in `server/lib/debug-study-materials.ts`.
