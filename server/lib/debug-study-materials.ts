/**
 * Debug logging for study materials / assign flow.
 * Logs to server terminal when DEBUG_STUDY_MATERIALS=1 or in development (NODE_ENV !== 'production').
 */
const enabled =
  process.env.DEBUG_STUDY_MATERIALS === "1" ||
  process.env.DEBUG_STUDY_MATERIALS === "true" ||
  process.env.NODE_ENV !== "production";

export function debug(tag: string, message: string, data?: Record<string, unknown>): void {
  if (!enabled) return;
  const payload = data ? ` ${JSON.stringify(data)}` : "";
  console.log(`[StudyMaterials][${tag}] ${message}${payload}`);
}
