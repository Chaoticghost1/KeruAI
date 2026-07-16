-- MathMaster game: problems per level (1-6)
CREATE TABLE IF NOT EXISTS math_problems (
  id SERIAL PRIMARY KEY,
  level INTEGER NOT NULL CHECK (level BETWEEN 1 AND 6),
  topic TEXT,
  question_es TEXT NOT NULL,
  question_en TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer TEXT NOT NULL,
  explanation_es TEXT,
  explanation_en TEXT,
  category TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_math_problems_level ON math_problems(level);
CREATE INDEX IF NOT EXISTS idx_math_problems_category ON math_problems(category);
