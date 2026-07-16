import { storage } from "./storage";

export interface ModerationSettings {
  blockedUsernamePatterns: string[];
  blockedEmailPatterns: string[];
  blockedWords: string[];
  signupRateLimitPerIpPerHour: number;
  chatMessagesPerUserPerMinute: number;
}

const DEFAULT_MODERATION: ModerationSettings = {
  blockedUsernamePatterns: [],
  blockedEmailPatterns: [],
  blockedWords: [],
  signupRateLimitPerIpPerHour: 0,
  chatMessagesPerUserPerMinute: 0,
};

export async function getModerationFromStorage(): Promise<ModerationSettings> {
  const stored = await storage.getSystemSetting("moderation");
  if (stored && typeof stored === "object" && !Array.isArray(stored)) {
    const s = stored as Record<string, unknown>;
    return {
      blockedUsernamePatterns: Array.isArray(s.blockedUsernamePatterns)
        ? (s.blockedUsernamePatterns as string[])
        : DEFAULT_MODERATION.blockedUsernamePatterns,
      blockedEmailPatterns: Array.isArray(s.blockedEmailPatterns)
        ? (s.blockedEmailPatterns as string[])
        : DEFAULT_MODERATION.blockedEmailPatterns,
      blockedWords: Array.isArray(s.blockedWords)
        ? (s.blockedWords as string[])
        : DEFAULT_MODERATION.blockedWords,
      signupRateLimitPerIpPerHour:
        typeof s.signupRateLimitPerIpPerHour === "number"
          ? s.signupRateLimitPerIpPerHour
          : DEFAULT_MODERATION.signupRateLimitPerIpPerHour,
      chatMessagesPerUserPerMinute:
        typeof s.chatMessagesPerUserPerMinute === "number"
          ? s.chatMessagesPerUserPerMinute
          : DEFAULT_MODERATION.chatMessagesPerUserPerMinute,
    };
  }
  return { ...DEFAULT_MODERATION };
}

/** Returns true if the string matches any pattern. Patterns are case-insensitive; * = any chars, ? = one char. */
function matchesPattern(value: string, pattern: string): boolean {
  const normalized = value.trim().toLowerCase();
  const p = pattern.trim().toLowerCase();
  if (!p) return false;
  const regex = new RegExp(
    "^" + p.replace(/\*/g, ".*").replace(/\?/g, ".") + "$",
    "i"
  );
  return regex.test(normalized);
}

/**
 * Check if registration is allowed for the given username and optional email.
 * Returns { allowed: true } or { allowed: false, reason: string }.
 */
export async function checkRegistrationAllowed(
  username: string,
  email?: string | null
): Promise<{ allowed: true } | { allowed: false; reason: string }> {
  const mod = await getModerationFromStorage();
  const u = (username || "").trim();
  if (!u) {
    return { allowed: false, reason: "Username is required." };
  }
  for (const pattern of mod.blockedUsernamePatterns) {
    if (matchesPattern(u, pattern)) {
      return {
        allowed: false,
        reason: "This username is not allowed. Please choose another.",
      };
    }
  }
  if (email) {
    const e = (email as string).trim().toLowerCase();
    for (const pattern of mod.blockedEmailPatterns) {
      if (matchesPattern(e, pattern)) {
        return {
          allowed: false,
          reason: "This email domain or pattern is not allowed.",
        };
      }
    }
  }
  return { allowed: true };
}

/** Check if message contains any blocked word (case-insensitive). Returns first match or null. */
export function containsBlockedWord(
  message: string,
  blockedWords: string[]
): string | null {
  const text = (message || "").trim().toLowerCase();
  if (!text || blockedWords.length === 0) return null;
  for (const w of blockedWords) {
    const word = w.trim().toLowerCase();
    if (!word) continue;
    if (text.includes(word)) return word;
  }
  return null;
}

const BAD_WORD_ATTEMPTS_KEY = "bad_word_attempts";
const BAD_WORD_ATTEMPTS_MAX = 2000;

export interface BadWordAttempt {
  userId: number;
  word: string;
  at: string;
}

export async function recordBadWordAttempt(
  userId: number,
  word: string
): Promise<void> {
  const raw = await storage.getSystemSetting(BAD_WORD_ATTEMPTS_KEY);
  const list: BadWordAttempt[] = Array.isArray(raw)
    ? (raw as BadWordAttempt[])
    : [];
  list.push({
    userId,
    word: (word || "").trim().toLowerCase(),
    at: new Date().toISOString(),
  });
  const trimmed =
    list.length > BAD_WORD_ATTEMPTS_MAX
      ? list.slice(-BAD_WORD_ATTEMPTS_MAX)
      : list;
  await storage.setSystemSetting(BAD_WORD_ATTEMPTS_KEY, trimmed);
}

export async function getBadWordLeaderboard(): Promise<
  { userId: number; count: number; lastWord: string; lastAt: string }[]
> {
  const raw = await storage.getSystemSetting(BAD_WORD_ATTEMPTS_KEY);
  const list: BadWordAttempt[] = Array.isArray(raw) ? (raw as BadWordAttempt[]) : [];
  const byUser = new Map<
    number,
    { count: number; lastWord: string; lastAt: string }
  >();
  for (const a of list) {
    const cur = byUser.get(a.userId);
    const count = (cur?.count ?? 0) + 1;
    byUser.set(a.userId, {
      count,
      lastWord: a.word,
      lastAt: a.at,
    });
  }
  return [...byUser.entries()]
    .map(([userId, v]) => ({ userId, ...v }))
    .sort((a, b) => b.count - a.count);
}
