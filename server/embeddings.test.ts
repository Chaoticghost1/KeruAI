import { describe, it, expect, afterEach, vi } from "vitest";
import { embedChunks, resolveEmbeddingBackend } from "./embeddings";

describe("embedChunks", () => {
  const fakeEmbedder = async (texts: string[]): Promise<number[][]> =>
    texts.map((t) => [t.length, 0]);

  it("embeds zero chunks without calling persist", async () => {
    const persist = vi.fn();
    const n = await embedChunks([], fakeEmbedder, persist);
    expect(n).toBe(0);
    expect(persist).not.toHaveBeenCalled();
  });

  it("embeds each chunk and persists its vector", async () => {
    const saved: Array<[number, number[]]> = [];
    const n = await embedChunks(
      [
        { id: 1, text: "abc" },
        { id: 2, text: "defg" },
      ],
      fakeEmbedder,
      async (id, vector) => {
        saved.push([id, vector]);
      },
    );
    expect(n).toBe(2);
    expect(saved).toEqual([
      [1, [3, 0]],
      [2, [4, 0]],
    ]);
  });

  it("throws if the embedder returns a mismatched count", async () => {
    const bad = async () => [[1, 2]];
    await expect(
      embedChunks([{ id: 1, text: "a" }, { id: 2, text: "b" }], bad, async () => {}),
    ).rejects.toThrow(/returned 1 vectors for 2 chunks/);
  });
});

describe("resolveEmbeddingBackend", () => {
  const prev = process.env.EMBEDDING_BACKEND;
  afterEach(() => {
    if (prev === undefined) delete process.env.EMBEDDING_BACKEND;
    else process.env.EMBEDDING_BACKEND = prev;
  });

  it("defaults to json backend", () => {
    delete process.env.EMBEDDING_BACKEND;
    expect(resolveEmbeddingBackend()).toBe("json");
  });

  it("selects pgvector when configured", () => {
    process.env.EMBEDDING_BACKEND = "pgvector";
    expect(resolveEmbeddingBackend()).toBe("pgvector");
  });
});
