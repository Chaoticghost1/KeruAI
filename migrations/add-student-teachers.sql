-- Student-selected teachers: students explicitly select teachers to see their revision materials
CREATE TABLE IF NOT EXISTS student_teachers (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  teacher_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS student_teachers_student_teacher_idx ON student_teachers (student_id, teacher_id);
