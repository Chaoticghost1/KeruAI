/**
 * Shared helper for building revision packs from missed questions.
 *
 * Used by the games and assignments revision hooks so both features push
 * incorrectly-answered questions into a spaced-repetition pack the same way.
 */

import { storage } from "../storage";
import { getInitialSchedulingInfo } from "./spaced-repetition";
import type { RevisionPack } from "@shared/schema";

export type MissedSourceType = "game" | "assignment";

export interface MissedQuestion {
  topic?: string | null;
  [key: string]: unknown;
}

export interface BuildRevisionPackParams {
  userId: number;
  subject: string;
  topic?: string | null;
  title: string;
  sourceType: MissedSourceType;
  missed: MissedQuestion[];
  maxItems?: number;
}

/**
 * Persist missed questions as practice generations and bundle them into a new
 * revision pack. Returns the created pack, or null if there were no questions.
 */
export async function buildRevisionPackFromMissed(
  params: BuildRevisionPackParams,
): Promise<RevisionPack | null> {
  const { userId, subject, title, sourceType } = params;
  const missed = (params.missed ?? []).slice(0, params.maxItems ?? 25);
  if (missed.length === 0) return null;

  const generations = await Promise.all(
    missed.map((m) =>
      storage.createPracticeGeneration({
        userId,
        subject,
        topic: m?.topic ?? params.topic ?? null,
        difficulty: 2,
        sourceType,
        rawPrompt: JSON.stringify(m),
        rawAnswer: null,
        structuredQuestion: m as Record<string, unknown>,
      }),
    ),
  );

  const pack = await storage.createRevisionPack({
    userId,
    subject,
    topic: params.topic ?? null,
    title,
    metadata: { sourceTypes: [sourceType], generatedAt: new Date().toISOString() },
  });

  for (const gen of generations) {
    await storage.addRevisionPackItem({
      packId: pack.id,
      practiceGenerationId: gen.id,
      type: "question",
      schedulingInfo: getInitialSchedulingInfo("medium"),
    });
  }

  return pack;
}
