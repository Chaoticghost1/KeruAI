-- Mentor applications table (public sign-up, admin pre-approval)
CREATE TABLE IF NOT EXISTS mentor_applications (
  id SERIAL PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  city TEXT,
  subjects TEXT[] NOT NULL,
  credentials TEXT,
  diploma_urls TEXT[] DEFAULT '{}',
  experience TEXT,
  hourly_rate TEXT DEFAULT '0',
  grade_level INTEGER,
  availability TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  reviewed_by INTEGER REFERENCES users(id),
  reviewed_at TIMESTAMP,
  admin_notes TEXT,
  user_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Mentor materials (uploaded by mentors, admin approval required)
CREATE TABLE IF NOT EXISTS mentor_materials (
  id SERIAL PRIMARY KEY,
  mentor_id INTEGER NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT NOT NULL,
  grade_level TEXT,
  content_type TEXT NOT NULL,
  file_path TEXT,
  file_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending_review',
  admin_notes TEXT,
  reviewed_by INTEGER REFERENCES users(id),
  reviewed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
