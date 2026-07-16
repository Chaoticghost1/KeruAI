-- Add teacher_recognized to mentor_materials (badge: "TEACHER RECOGNIZED AND APPROVED MATERIAL")
ALTER TABLE mentor_materials
  ADD COLUMN IF NOT EXISTS teacher_recognized BOOLEAN NOT NULL DEFAULT false;
