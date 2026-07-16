-- Class chat archives: snapshot when a teacher deletes an empty class (super admin can view)
CREATE TABLE IF NOT EXISTS class_chat_archives (
  id SERIAL PRIMARY KEY,
  original_class_id INTEGER NOT NULL,
  class_name TEXT NOT NULL,
  teacher_id INTEGER NOT NULL REFERENCES users(id),
  subject TEXT,
  invite_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  archived_at TIMESTAMP NOT NULL DEFAULT NOW(),
  archived_by_user_id INTEGER NOT NULL REFERENCES users(id),
  messages_snapshot JSONB NOT NULL DEFAULT '[]',
  members_snapshot JSONB NOT NULL DEFAULT '[]'
);
