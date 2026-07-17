import { describe, it, expect } from "vitest";
import { chunkText, estimateTokens, buildRagContext } from "../lib/content-chunker";

describe("estimateTokens", () => {
  it("returns 0 for empty text", () => {
    expect(estimateTokens("")).toBe(0);
  });
  it("estimates ~chars/4", () => {
    expect(estimateTokens("a".repeat(400))).toBe(100);
  });
});

describe("chunkText", () => {
  it("returns empty for empty input", () => {
    expect(chunkText("")).toEqual([]);
  });

  it("splits long text into multiple bounded chunks", () => {
    const big = Array.from({ length: 60 }, (_, i) => `Paragraph ${i} about algebra and fractions.`).join("\n");
    const chunks = chunkText(big, { maxTokensPerChunk: 50 });
    expect(chunks.length).toBeGreaterThan(1);
    for (const c of chunks) {
      expect(c.tokenCount).toBeLessThanOrEqual(50 + 50); // allow overlap tail
      expect(c.text.length).toBeGreaterThan(0);
    }
    // chunk indices are sequential
    chunks.forEach((c, i) => expect(c.chunkIndex).toBe(i));
  });

  it("keeps a small paragraph as a single chunk", () => {
    const chunks = chunkText("Short note about photosynthesis.");
    expect(chunks.length).toBe(1);
    expect(chunks[0].chunkIndex).toBe(0);
  });
});

describe("buildRagContext", () => {
  it("returns empty string when no chunks", () => {
    expect(buildRagContext([])).toBe("");
  });
  it("formats chunk text with markers", () => {
    const ctx = buildRagContext([{ text: "El agua hierve a 100C." }, { text: "La fotosintesis usa luz." }], 6);
    expect(ctx).toContain("[[1]]");
    expect(ctx).toContain("[[2]]");
    expect(ctx).toContain("CURRICULUM REFERENCE MATERIAL");
  });
  it("limits to maxChunks", () => {
    const ctx = buildRagContext(Array.from({ length: 10 }, (_, i) => ({ text: `c${i}` })), 2);
    expect(ctx).not.toContain("[[3]]");
  });
});
