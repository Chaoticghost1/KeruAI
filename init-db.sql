-- Initialize the database with required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- The tables will be created automatically by Drizzle
-- This script is mainly for any additional setup

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tutor_sessions_user_id ON tutor_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_tutor_sessions_agent_id ON tutor_sessions(agent_id);
CREATE INDEX IF NOT EXISTS idx_tutor_messages_session_id ON tutor_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_tutor_messages_timestamp ON tutor_messages(timestamp);

-- Insert default tutor agents if they don't exist
INSERT INTO tutor_agents (agent_key, name, title, avatar, subjects, description, is_active) 
VALUES 
  ('math_buddy', 'Math Buddy', 'Friendly Mathematics Tutor', '🧮', 
   ARRAY['mathematics', 'algebra', 'geometry', 'calculus'], 
   'I''m your friendly mathematics companion! I love helping students discover the beauty of math through step-by-step explanations and encouraging guidance.', 
   true),
  ('science_explorer', 'Dr. Nova', 'Curious Science Explorer', '🔬', 
   ARRAY['biology', 'chemistry', 'physics', 'earth science'], 
   'Hello, fellow scientist! I''m Dr. Nova, and I''m passionate about exploring the wonders of science through hands-on investigation and discovery.', 
   true),
  ('wordsmith_mentor', 'Professor Quill', 'Literary Arts Mentor', '📚', 
   ARRAY['language arts', 'literature', 'writing', 'reading'], 
   'Greetings, young scholar! I''m Professor Quill, your guide through the rich landscape of language, literature, and the art of written expression.', 
   true)
ON CONFLICT (agent_key) DO NOTHING;