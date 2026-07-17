/**
 * Simple spaced-repetition scheduler (Leitner-style intervals).
 *
 * Each review records a difficulty rating from the student:
 *   - 'easy'   → long interval
 *   - 'medium' → medium interval
 *   - 'hard'   → short interval (review again soon)
 *
 * Intervals are in days. Repetitions increase the box; a 'hard' rating
 * resets progress so the item is reviewed more frequently.
 */

export type ReviewDifficulty = "easy" | "medium" | "hard";

export interface SchedulingInfo {
  nextReviewAt: string; // ISO timestamp
  difficulty: ReviewDifficulty;
  lastReviewedAt: string; // ISO timestamp
  repetitions: number;
  easeFactor: number; // SM-2-style multiplier (>= 1.3)
}

const DAY_MS = 24 * 60 * 60 * 1000;

// Base intervals (days) by repetition count, scaled by ease factor.
const BASE_INTERVALS = [1, 3, 7, 16, 35];

function intervalFor(repetitions: number, easeFactor: number): number {
  const base = BASE_INTERVALS[Math.min(repetitions, BASE_INTERVALS.length - 1)];
  return Math.max(1, Math.round(base * easeFactor));
}

export function getInitialSchedulingInfo(difficulty: ReviewDifficulty = "medium"): SchedulingInfo {
  const now = Date.now();
  const easeFactor = difficulty === "easy" ? 2.6 : difficulty === "medium" ? 2.0 : 1.6;
  return {
    nextReviewAt: new Date(now + intervalFor(0, easeFactor) * DAY_MS).toISOString(),
    difficulty,
    lastReviewedAt: new Date(now).toISOString(),
    repetitions: 0,
    easeFactor,
  };
}

/**
 * Compute the next scheduling info after a review.
 * `hard` resets repetitions to 0; `easy`/`medium` advance the box.
 */
export function scheduleNextReview(
  current: SchedulingInfo | null,
  difficulty: ReviewDifficulty,
  now: number = Date.now()
): SchedulingInfo {
  const prev = current ?? getInitialSchedulingInfo(difficulty);
  let repetitions = prev.repetitions;
  let easeFactor = prev.easeFactor;

  if (difficulty === "hard") {
    repetitions = 0;
    easeFactor = Math.max(1.3, easeFactor - 0.3);
  } else {
    repetitions = repetitions + 1;
    easeFactor = Math.min(3.0, easeFactor + (difficulty === "easy" ? 0.15 : 0.05));
  }

  return {
    nextReviewAt: new Date(now + intervalFor(repetitions, easeFactor) * DAY_MS).toISOString(),
    difficulty,
    lastReviewedAt: new Date(now).toISOString(),
    repetitions,
    easeFactor,
  };
}

/** Items due for review now (nextReviewAt <= now). */
export function isDue(info: SchedulingInfo | null, now: number = Date.now()): boolean {
  if (!info) return true;
  return new Date(info.nextReviewAt).getTime() <= now;
}
