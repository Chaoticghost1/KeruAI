-- LinguaPlay game: problems per level and mode
CREATE TABLE IF NOT EXISTS language_problems (
  id SERIAL PRIMARY KEY,
  level INTEGER NOT NULL CHECK (level BETWEEN 1 AND 6),
  mode TEXT NOT NULL,
  prompt_es TEXT NOT NULL,
  prompt_en TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer TEXT NOT NULL,
  explanation_es TEXT,
  explanation_en TEXT,
  audio_url TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_language_problems_level ON language_problems(level);
CREATE INDEX IF NOT EXISTS idx_language_problems_mode ON language_problems(mode);
