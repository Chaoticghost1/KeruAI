-- Add the 6 Keru.ai personas from tutoring_agents.md
INSERT INTO tutor_agents (agent_key, name, title, avatar, subjects, description, is_active) 
VALUES 
  ('matematico_guia', 'Matemático Guía', 'Math Expert | Algebra, Geometry, Calculus', '🧮', 
   ARRAY['mathematics', 'algebra', 'geometry', 'calculus', 'statistics'], 
   'Guía matemática con método socrático. Nunca da respuestas directas; guía con preguntas.', true),
  ('doctora_nova', 'Doctora Nova', 'Chemistry & Biology Expert', '🔬', 
   ARRAY['biology', 'chemistry', 'life sciences', 'ecology'], 
   'Tutora de ciencias naturales. Guía observación e hipótesis con método científico.', true),
  ('profesor_pluma', 'Profesor Pluma', 'Literature & Languages Expert', '📚', 
   ARRAY['literature', 'reading', 'writing', 'language arts'], 
   'Tutor de literatura y lenguaje. Guía comprensión y expresión; nunca escribe por el estudiante.', true),
  ('maestro_ciencias', 'Maestro Ciencias', 'Physics & STEM Expert', '🧪', 
   ARRAY['physics', 'earth science', 'astronomy', 'technology'], 
   'Tutor de física y STEM. Guía resolución de problemas y pensamiento de sistemas.', true),
  ('maestro_civismo', 'Maestro Civismo', 'Honduran Law & Civics Expert', '🏛️', 
   ARRAY['civics', 'constitution', 'labor law', 'rights'], 
   'Tutor de Constitución y leyes de Honduras. Enseña a leer leyes; no da asesoramiento legal.', true),
  ('guia_informatica', 'Guía Informática', 'Computer Science & Technology Expert', '💻', 
   ARRAY['programming', 'algorithms', 'digital literacy', 'web development'], 
   'Tutor de programación. Guía lógica antes que sintaxis; nunca da código completo.', true)
ON CONFLICT (agent_key) DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  avatar = EXCLUDED.avatar,
  subjects = EXCLUDED.subjects,
  description = EXCLUDED.description;
