/**
 * Student profile type aligned with backend student_profiles schema.
 * Used by StudyBuddy, StudentProfile page, and progress APIs.
 */
export interface StudentProfile {
  id: number;
  userId: number;
  learningStyle: string | null; // visual | auditory | kinesthetic
  preferredDifficulty: number;
  subjects: string[];
  strugglingAreas: string[];
  preferences: string | null; // JSON
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  totalSessionsCompleted: number;
  level: number;
  experiencePoints: number;
  revisionAssistantName?: string | null; // AI assistant name for Materiales de Estudio only
  createdAt: string;
  updatedAt: string;
}

/** Payload for creating a student profile (POST). Backend omits id, createdAt, updatedAt. */
export type StudentProfileCreate = {
  userId: number;
  learningStyle?: string | null;
  preferredDifficulty?: number;
  subjects?: string[];
  strugglingAreas?: string[];
  preferences?: string | null;
  totalPoints?: number;
  currentStreak?: number;
  longestStreak?: number;
  totalSessionsCompleted?: number;
  level?: number;
  experiencePoints?: number;
  revisionAssistantName?: string | null;
};

/** Payload for updating a student profile (PUT). */
export type StudentProfileUpdate = Partial<Pick<StudentProfile,
  'learningStyle' | 'preferredDifficulty' | 'subjects' | 'strugglingAreas' | 'preferences' |
  'totalPoints' | 'currentStreak' | 'longestStreak' | 'totalSessionsCompleted' | 'level' | 'experiencePoints' | 'revisionAssistantName'>>;
