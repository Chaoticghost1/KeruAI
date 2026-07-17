-- Curriculum-aligned RAG: content sources (uploaded materials) + content chunks
-- Applied via `npm run db:push` (Drizzle). SQL kept for reference/reproducibility.

CREATE TABLE IF NOT EXISTS content_sources (
  id SERIAL PRIMARY KEY,
  owner_user_id INTEGER NOT NULL REFERENCES users(id),
  subject TEXT NOT NULL,
  topic TEXT,
  grade_level TEXT,
  file_type TEXT NOT NULL,
  original_file_name TEXT,
  storage_location TEXT,
  language TEXT NOT NULL DEFAULT 'es',
  chunk_count INTEGER NOT NULL DEFAULT 0,
  token_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'ready',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS content_sources_subject_topic_idx ON content_sources (subject, topic);
CREATE INDEX IF NOT EXISTS content_sources_owner_idx ON content_sources (owner_user_id);

CREATE TABLE IF NOT EXISTS content_chunks (
  id SERIAL PRIMARY KEY,
  source_id INTEGER NOT NULL REFERENCES content_sources(id) ON DELETE CASCADE,
  language TEXT NOT NULL DEFAULT 'es',
  subject TEXT NOT NULL,
  topic TEXT,
  grade_level TEXT,
  chunk_index INTEGER NOT NULL,
  text TEXT NOT NULL,
  token_count INTEGER NOT NULL DEFAULT 0,
  embedding_status TEXT NOT NULL DEFAULT 'none',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS content_chunks_rag_idx ON content_chunks (subject, topic, grade_level);
CREATE INDEX IF NOT EXISTS content_chunks_language_idx ON content_chunks (language);
CREATE INDEX IF NOT EXISTS content_chunks_source_idx ON content_chunks (source_id);
