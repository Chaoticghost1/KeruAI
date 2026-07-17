import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { storage } from "./storage";
import { eq } from "drizzle-orm";
import { contentChunks, contentSources } from "../shared/schema";

/**
 * Integration test for the curriculum RAG storage layer.
 * Requires a reachable DATABASE_URL (local Postgres or Neon).
 */
describe("curriculum RAG storage", () => {
  let sourceId: number;

  it("creates a content source", async () => {
    const source = await storage.createContentSource({
      ownerUserId: 1,
      subject: "matematicas",
      topic: "fracciones",
      gradeLevel: "7",
      fileType: "pdf",
      language: "es",
    });
    expect(source.id).toBeGreaterThan(0);
    sourceId = source.id;
  });

  it("creates and reads chunks for the source", async () => {
    await storage.createContentChunks([
      { sourceId, language: "es", subject: "matematicas", topic: "fracciones", gradeLevel: "7", chunkIndex: 0, text: "Una fraccion representa una parte de un todo.", tokenCount: 12 },
      { sourceId, language: "es", subject: "matematicas", topic: "fracciones", gradeLevel: "7", chunkIndex: 1, text: "Para sumar fracciones se necesita comun denominador.", tokenCount: 12 },
    ]);
    const chunks = await storage.getChunksBySource(sourceId);
    expect(chunks.length).toBe(2);
  });

  it("finds curriculum chunks by subject/topic", async () => {
    const found = await storage.findCurriculumChunks({ subject: "matematicas", topic: "fracciones", language: "es", limit: 6 });
    expect(found.length).toBeGreaterThanOrEqual(2);
    expect(found.every((c) => c.subject === "matematicas")).toBe(true);
  });

  it("lists teacher sources", async () => {
    const sources = await storage.getMyContentSources(1);
    expect(sources.some((s) => s.id === sourceId)).toBe(true);
  });

  afterAll(async () => {
    if (sourceId) {
      await storage.updateContentSource(sourceId, { status: "failed" });
      // cascade delete chunks; source delete best-effort
      try {
        await (await import("./db")).db.delete(contentChunks).where(eq(contentChunks.sourceId, sourceId));
        await (await import("./db")).db.delete(contentSources).where(eq(contentSources.id, sourceId));
      } catch {
        /* ignore cleanup errors */
      }
    }
  });
});
