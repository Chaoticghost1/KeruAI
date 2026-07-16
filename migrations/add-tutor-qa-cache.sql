-- Tutor QA Cache: store question-answer pairs for duplicate question detection (token savings)
CREATE TABLE IF NOT EXISTS tutor_qa_cache (
  id SERIAL PRIMARY KEY,
  session_id INTEGER NOT NULL REFERENCES tutor_sessions(id) ON DELETE CASCADE,
  agent_key TEXT NOT NULL,
  question_hash TEXT NOT NULL,
  student_message TEXT NOT NULL,
  agent_response TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(session_id, agent_key, question_hash)
);

CREATE INDEX IF NOT EXISTS idx_qa_cache_lookup ON tutor_qa_cache(session_id, agent_key, question_hash);
