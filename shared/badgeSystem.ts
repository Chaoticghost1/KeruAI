import { Badge, StudentProfile } from './schema.js';

// Badge categories
export const BADGE_CATEGORIES = {
  MILESTONE: 'milestone',
  STREAK: 'streak', 
  SUBJECT: 'subject',
  ACHIEVEMENT: 'achievement',
  SOCIAL: 'social'
} as const;

// Badge rarities
export const BADGE_RARITIES = {
  COMMON: 'common',
  RARE: 'rare', 
  EPIC: 'epic',
  LEGENDARY: 'legendary'
} as const;

// Predefined badges with their requirements
export const PREDEFINED_BADGES = [
  // Milestone badges
  {
    badgeKey: 'first_session',
    name: 'First Steps',
    description: 'Complete your first tutoring session',
    icon: '🎯',
    category: BADGE_CATEGORIES.MILESTONE,
    rarity: BADGE_RARITIES.COMMON,
    requirements: JSON.stringify({ sessionsCompleted: 1 }),
    points: 10
  },
  {
    badgeKey: 'early_bird',
    name: 'Early Bird',
    description: 'Complete 5 tutoring sessions',
    icon: '🐣',
    category: BADGE_CATEGORIES.MILESTONE,
    rarity: BADGE_RARITIES.COMMON,
    requirements: JSON.stringify({ sessionsCompleted: 5 }),
    points: 25
  },
  {
    badgeKey: 'study_enthusiast',
    name: 'Study Enthusiast',
    description: 'Complete 25 tutoring sessions',
    icon: '📚',
    category: BADGE_CATEGORIES.MILESTONE,
    rarity: BADGE_RARITIES.RARE,
    requirements: JSON.stringify({ sessionsCompleted: 25 }),
    points: 100
  },
  {
    badgeKey: 'knowledge_seeker',
    name: 'Knowledge Seeker',
    description: 'Complete 50 tutoring sessions',
    icon: '🔍',
    category: BADGE_CATEGORIES.MILESTONE,
    rarity: BADGE_RARITIES.EPIC,
    requirements: JSON.stringify({ sessionsCompleted: 50 }),
    points: 250
  },
  {
    badgeKey: 'scholar',
    name: 'Scholar',
    description: 'Complete 100 tutoring sessions',
    icon: '🎓',
    category: BADGE_CATEGORIES.MILESTONE,
    rarity: BADGE_RARITIES.LEGENDARY,
    requirements: JSON.stringify({ sessionsCompleted: 100 }),
    points: 500
  },

  // Streak badges
  {
    badgeKey: 'consistent_learner',
    name: 'Consistent Learner',
    description: 'Study for 3 days in a row',
    icon: '🔥',
    category: BADGE_CATEGORIES.STREAK,
    rarity: BADGE_RARITIES.COMMON,
    requirements: JSON.stringify({ currentStreak: 3 }),
    points: 30
  },
  {
    badgeKey: 'week_warrior',
    name: 'Week Warrior',
    description: 'Study for 7 days in a row',
    icon: '⚔️',
    category: BADGE_CATEGORIES.STREAK,
    rarity: BADGE_RARITIES.RARE,
    requirements: JSON.stringify({ currentStreak: 7 }),
    points: 70
  },
  {
    badgeKey: 'dedication_champion',
    name: 'Dedication Champion',
    description: 'Study for 30 days in a row',
    icon: '👑',
    category: BADGE_CATEGORIES.STREAK,
    rarity: BADGE_RARITIES.LEGENDARY,
    requirements: JSON.stringify({ currentStreak: 30 }),
    points: 300
  },

  // Subject-specific badges
  {
    badgeKey: 'math_rookie',
    name: 'Math Rookie',
    description: 'Complete 5 math sessions',
    icon: '🧮',
    category: BADGE_CATEGORIES.SUBJECT,
    rarity: BADGE_RARITIES.COMMON,
    requirements: JSON.stringify({ subjectSessions: { mathematics: 5 } }),
    points: 25
  },
  {
    badgeKey: 'math_master',
    name: 'Math Master',
    description: 'Complete 20 math sessions',
    icon: '🎯',
    category: BADGE_CATEGORIES.SUBJECT,
    rarity: BADGE_RARITIES.EPIC,
    requirements: JSON.stringify({ subjectSessions: { mathematics: 20 } }),
    points: 100
  },
  {
    badgeKey: 'science_explorer',
    name: 'Science Explorer',
    description: 'Complete 5 science sessions',
    icon: '🔬',
    category: BADGE_CATEGORIES.SUBJECT,
    rarity: BADGE_RARITIES.COMMON,
    requirements: JSON.stringify({ subjectSessions: { science: 5 } }),
    points: 25
  },
  {
    badgeKey: 'wordsmith',
    name: 'Wordsmith',
    description: 'Complete 5 language arts sessions',
    icon: '✍️',
    category: BADGE_CATEGORIES.SUBJECT,
    rarity: BADGE_RARITIES.COMMON,
    requirements: JSON.stringify({ subjectSessions: { 'language arts': 5 } }),
    points: 25
  },

  // Achievement badges
  {
    badgeKey: 'quick_learner',
    name: 'Quick Learner',
    description: 'Complete 3 sessions in one day',
    icon: '⚡',
    category: BADGE_CATEGORIES.ACHIEVEMENT,
    rarity: BADGE_RARITIES.RARE,
    requirements: JSON.stringify({ sessionsInDay: 3 }),
    points: 50
  },
  {
    badgeKey: 'night_owl',
    name: 'Night Owl',
    description: 'Complete a session after 9 PM',
    icon: '🦉',
    category: BADGE_CATEGORIES.ACHIEVEMENT,
    rarity: BADGE_RARITIES.COMMON,
    requirements: JSON.stringify({ sessionAfterHour: 21 }),
    points: 15
  },
  {
    badgeKey: 'early_riser',
    name: 'Early Riser',
    description: 'Complete a session before 7 AM',
    icon: '🌅',
    category: BADGE_CATEGORIES.ACHIEVEMENT,
    rarity: BADGE_RARITIES.COMMON,
    requirements: JSON.stringify({ sessionBeforeHour: 7 }),
    points: 15
  },
  {
    badgeKey: 'renaissance_learner',
    name: 'Renaissance Learner',
    description: 'Study all three subjects (Math, Science, Language Arts)',
    icon: '🎨',
    category: BADGE_CATEGORIES.ACHIEVEMENT,
    rarity: BADGE_RARITIES.EPIC,
    requirements: JSON.stringify({ allSubjects: true }),
    points: 150
  },

  // CruiseWord game badges
  {
    badgeKey: 'cruiseword_first',
    name: 'First Voyage',
    description: 'Submit your first CruiseWord score',
    icon: '🛳️',
    category: BADGE_CATEGORIES.ACHIEVEMENT,
    rarity: BADGE_RARITIES.COMMON,
    requirements: JSON.stringify({ gameName: 'CruiseWord', minGames: 1 }),
    points: 15
  },
  {
    badgeKey: 'cruiseword_10',
    name: 'Deck Hand',
    description: 'Score 10 or more in CruiseWord',
    icon: '⚓',
    category: BADGE_CATEGORIES.ACHIEVEMENT,
    rarity: BADGE_RARITIES.COMMON,
    requirements: JSON.stringify({ gameName: 'CruiseWord', minScore: 10 }),
    points: 25
  },
  {
    badgeKey: 'cruiseword_50',
    name: 'Cruise Navigator',
    description: 'Score 50 or more in CruiseWord',
    icon: '🧭',
    category: BADGE_CATEGORIES.ACHIEVEMENT,
    rarity: BADGE_RARITIES.RARE,
    requirements: JSON.stringify({ gameName: 'CruiseWord', minScore: 50 }),
    points: 50
  },
  {
    badgeKey: 'cruiseword_100',
    name: 'Captain',
    description: 'Score 100 or more in CruiseWord',
    icon: '👑',
    category: BADGE_CATEGORIES.ACHIEVEMENT,
    rarity: BADGE_RARITIES.EPIC,
    requirements: JSON.stringify({ gameName: 'CruiseWord', minScore: 100 }),
    points: 100
  },

  // MathMaster game badges
  {
    badgeKey: 'mathmaster_first',
    name: 'Mathlete',
    description: 'Submit your first MathMaster score',
    icon: '🧮',
    category: BADGE_CATEGORIES.ACHIEVEMENT,
    rarity: BADGE_RARITIES.COMMON,
    requirements: JSON.stringify({ gameName: 'MathMaster', minGames: 1 }),
    points: 15
  },
  {
    badgeKey: 'mathmaster_10',
    name: 'Algebra Expert',
    description: 'Score 10 or more in MathMaster',
    icon: '📐',
    category: BADGE_CATEGORIES.ACHIEVEMENT,
    rarity: BADGE_RARITIES.COMMON,
    requirements: JSON.stringify({ gameName: 'MathMaster', minScore: 10 }),
    points: 25
  },
  {
    badgeKey: 'mathmaster_50',
    name: 'Calculus Master',
    description: 'Score 50 or more in MathMaster',
    icon: '∫',
    category: BADGE_CATEGORIES.ACHIEVEMENT,
    rarity: BADGE_RARITIES.RARE,
    requirements: JSON.stringify({ gameName: 'MathMaster', minScore: 50 }),
    points: 50
  },
  {
    badgeKey: 'mathmaster_streak',
    name: 'Perfect Streak',
    description: 'Play MathMaster 5 times',
    icon: '🔥',
    category: BADGE_CATEGORIES.ACHIEVEMENT,
    rarity: BADGE_RARITIES.RARE,
    requirements: JSON.stringify({ gameName: 'MathMaster', minGames: 5 }),
    points: 40
  },

  // LinguaPlay game badges
  {
    badgeKey: 'linguaplay_first',
    name: 'Polyglot',
    description: 'Submit your first LinguaPlay score',
    icon: '🌐',
    category: BADGE_CATEGORIES.ACHIEVEMENT,
    rarity: BADGE_RARITIES.COMMON,
    requirements: JSON.stringify({ gameName: 'LinguaPlay', minGames: 1 }),
    points: 15
  },
  {
    badgeKey: 'linguaplay_10',
    name: 'Grammar Guru',
    description: 'Score 10 or more in LinguaPlay',
    icon: '📝',
    category: BADGE_CATEGORIES.ACHIEVEMENT,
    rarity: BADGE_RARITIES.COMMON,
    requirements: JSON.stringify({ gameName: 'LinguaPlay', minScore: 10 }),
    points: 25
  },
  {
    badgeKey: 'linguaplay_50',
    name: 'Vocabulary Master',
    description: 'Score 50 or more in LinguaPlay',
    icon: '📚',
    category: BADGE_CATEGORIES.ACHIEVEMENT,
    rarity: BADGE_RARITIES.RARE,
    requirements: JSON.stringify({ gameName: 'LinguaPlay', minScore: 50 }),
    points: 50
  },
  {
    badgeKey: 'linguaplay_native',
    name: 'Native Ear',
    description: 'Play LinguaPlay 5 times',
    icon: '👂',
    category: BADGE_CATEGORIES.ACHIEVEMENT,
    rarity: BADGE_RARITIES.RARE,
    requirements: JSON.stringify({ gameName: 'LinguaPlay', minGames: 5 }),
    points: 40
  }
];

// Level calculation system
export function calculateLevel(experiencePoints: number): number {
  // Every 100 XP = 1 level, with increasing requirements
  return Math.floor(Math.sqrt(experiencePoints / 50)) + 1;
}

export function getXPForNextLevel(currentLevel: number): number {
  return Math.pow(currentLevel, 2) * 50;
}

export function getXPProgress(profile: StudentProfile): { current: number; needed: number; progress: number } {
  const currentLevel = profile.level;
  const nextLevelXP = getXPForNextLevel(currentLevel);
  const currentLevelXP = currentLevel === 1 ? 0 : getXPForNextLevel(currentLevel - 1);
  const neededXP = nextLevelXP - currentLevelXP;
  const currentXP = profile.experiencePoints - currentLevelXP;
  
  return {
    current: currentXP,
    needed: neededXP,
    progress: Math.round((currentXP / neededXP) * 100)
  };
}

// Point calculation
export function calculateSessionPoints(session: {
  duration?: number; // in minutes
  messagesExchanged: number;
  difficulty: number;
  completed: boolean;
}): number {
  if (!session.completed) return 0;
  
  let basePoints = 10;
  
  // Duration bonus (up to 30 minutes)
  if (session.duration) {
    const durationBonus = Math.min(session.duration / 2, 15);
    basePoints += durationBonus;
  }
  
  // Interaction bonus
  const interactionBonus = Math.min(session.messagesExchanged * 2, 20);
  basePoints += interactionBonus;
  
  // Difficulty multiplier
  const difficultyMultiplier = 1 + (session.difficulty - 1) * 0.2;
  
  return Math.round(basePoints * difficultyMultiplier);
}

// Badge checking functions
export function checkBadgeEligibility(
  badge: Badge, 
  profile: StudentProfile,
  sessionStats: {
    subjectSessions: Record<string, number>;
    todaySessions: number;
    sessionTime?: Date;
  }
): boolean {
  const requirements = JSON.parse(badge.requirements);
  
  // Check milestone requirements
  if (requirements.sessionsCompleted) {
    return profile.totalSessionsCompleted >= requirements.sessionsCompleted;
  }
  
  // Check streak requirements
  if (requirements.currentStreak) {
    return profile.currentStreak >= requirements.currentStreak;
  }
  
  // Check subject requirements
  if (requirements.subjectSessions) {
    for (const [subject, count] of Object.entries(requirements.subjectSessions)) {
      if ((sessionStats.subjectSessions[subject] || 0) < (count as number)) {
        return false;
      }
    }
    return true;
  }
  
  // Check daily session requirements
  if (requirements.sessionsInDay) {
    return sessionStats.todaySessions >= requirements.sessionsInDay;
  }
  
  // Check time-based requirements
  if (requirements.sessionAfterHour && sessionStats.sessionTime) {
    return sessionStats.sessionTime.getHours() >= requirements.sessionAfterHour;
  }
  
  if (requirements.sessionBeforeHour && sessionStats.sessionTime) {
    return sessionStats.sessionTime.getHours() < requirements.sessionBeforeHour;
  }
  
  // Check all subjects requirement
  if (requirements.allSubjects) {
    const requiredSubjects = ['mathematics', 'science', 'language arts'];
    return requiredSubjects.every(subject => 
      (sessionStats.subjectSessions[subject] || 0) > 0
    );
  }
  
  return false;
}

/** Game-score requirements: { gameName, minScore?, minGames? } */
export function checkBadgeEligibilityForGame(
  badge: Badge,
  gameName: string,
  gameStats: { count: number; maxScore: number }
): boolean {
  const requirements = JSON.parse(badge.requirements) as { gameName?: string; minScore?: number; minGames?: number };
  if (requirements.gameName && requirements.gameName !== gameName) return false;
  if (requirements.minScore != null && gameStats.maxScore < requirements.minScore) return false;
  if (requirements.minGames != null && gameStats.count < requirements.minGames) return false;
  return true;
}

/** Points awarded for a game score (capped to avoid XP inflation). */
export function calculateGameScorePoints(score: number, cap: number = 50): number {
  return Math.min(Math.max(0, score), cap);
}

export type BadgeCategory = typeof BADGE_CATEGORIES[keyof typeof BADGE_CATEGORIES];
export type BadgeRarity = typeof BADGE_RARITIES[keyof typeof BADGE_RARITIES];