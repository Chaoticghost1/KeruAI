-- Student-set AI assistant name for Materiales de Estudio (revision) chat only
ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS revision_assistant_name TEXT;
