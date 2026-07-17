import { describe, it, expect, afterAll } from "vitest";
import { storage } from "./storage";
import { eq } from "drizzle-orm";
import { revisionPacks, revisionPackItems, practiceQuestionGenerations } from "../shared/schema";
import { getInitialSchedulingInfo, scheduleNextReview } from "./lib/spaced-repetition";

/**
 * Integration test for the Student Revision v2 storage layer.
 * Requires a reachable DATABASE_URL (local Postgres or Neon).
 */
describe("revision pack storage", () => {
  const userId = 1;
  let packId: number;
  let itemId: number;
  const generationIds: number[] = [];

  it("creates practice generations", async () => {
    const gen = await storage.createPracticeGeneration({
      userId,
      subject: "matematicas",
      topic: "fracciones",
      difficulty: 2,
      sourceType: "ai",
      rawPrompt: JSON.stringify({ subject: "matematicas" }),
      rawAnswer: null,
      structuredQuestion: { question: "2/4 = ?", answer: "1/2", explanation: "Simplify." },
    });
    expect(gen.id).toBeGreaterThan(0);
    generationIds.push(gen.id);
  });

  it("creates a revision pack and increments item count", async () => {
    const pack = await storage.createRevisionPack({
      userId,
      subject: "matematicas",
      topic: "fracciones",
      title: "Repaso: fracciones",
      metadata: { sourceTypes: ["ai"], generatedAt: new Date().toISOString() },
    });
    packId = pack.id;
    const item = await storage.addRevisionPackItem({
      packId,
      practiceGenerationId: generationIds[0],
      type: "question",
      schedulingInfo: getInitialSchedulingInfo("medium"),
    });
    itemId = item.id;

    const packs = await storage.getRevisionPacks(userId);
    const found = packs.find((p) => p.id === packId);
    expect(found?.itemCount).toBe(1);
  });

  it("returns pack items joined with their question content", async () => {
    const full = await storage.getRevisionPack(userId, packId);
    expect(full).toBeDefined();
    expect(full!.items.length).toBe(1);
    expect(full!.items[0].question?.structuredQuestion).toMatchObject({ answer: "1/2" });
  });

  it("reschedules an item after a review", async () => {
    const before = await storage.getRevisionPack(userId, packId);
    const current = before!.items[0].schedulingInfo as any;
    const next = scheduleNextReview(current, "easy");
    const updated = await storage.updateRevisionPackItem(itemId, { schedulingInfo: next });
    expect((updated.schedulingInfo as any).repetitions).toBe(1);
  });

  it("marks a pack offline ready", async () => {
    const updated = await storage.setPackOfflineReady(packId, true);
    expect(updated.offlineReady).toBe(true);
  });

  afterAll(async () => {
    const { db } = await import("./db");
    try {
      await db.delete(revisionPackItems).where(eq(revisionPackItems.packId, packId));
      await db.delete(revisionPacks).where(eq(revisionPacks.id, packId));
      for (const id of generationIds) {
        await db.delete(practiceQuestionGenerations).where(eq(practiceQuestionGenerations.id, id));
      }
    } catch {
      /* ignore cleanup errors */
    }
  });
});
