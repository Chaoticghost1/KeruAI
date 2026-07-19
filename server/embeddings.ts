/**
 * Embeddings producer for RAG.
 *
 * Picks up content_chunks with embeddingStatus 'none' | 'pending' and stores a
 * vector. The backend is pluggable via EMBEDDING_BACKEND:
 *   - "json"     : store the vector as a JSON array on the chunk (default, no DB extension needed)
 *   - "pgvector" : (reserved) store as a native pgvector column
 *
 * The actual embedding call is injected via `Embedder` so this module can be
 * unit-tested without network/OpenAI access.
 */

export type EmbeddingBackend = "json" | "pgvector";

export function resolveEmbeddingBackend(): EmbeddingBackend {
  const v = process.env.EMBEDDING_BACKEND?.trim().toLowerCase();
  if (v === "pgvector") return "pgvector";
  return "json";
}

export interface ChunkInput {
  id: number;
  text: string;
}

export type Embedder = (texts: string[]) => Promise<number[][]>;

/**
 * Process a batch of chunks: embed and persist. Returns how many were embedded.
 * `persist` defaults to the real storage save; tests may pass a fake.
 */
export async function embedChunks(
  chunks: ChunkInput[],
  embed: Embedder,
  persist: (chunkId: number, vector: number[]) => Promise<void>,
): Promise<number> {
  if (!chunks.length) return 0;
  const vectors = await embed(chunks.map((c) => c.text));
  if (vectors.length !== chunks.length) {
    throw new Error(`Embedder returned ${vectors.length} vectors for ${chunks.length} chunks`);
  }
  for (let i = 0; i < chunks.length; i++) {
    await persist(chunks[i].id, vectors[i]);
  }
  return chunks.length;
}

/**
 * Default OpenAI embedder. Lazy-loads the OpenAI client so this module stays
 * importable in environments without an API key (e.g. unit tests).
 */
export function createOpenAIEmbedder(model = "text-embedding-3-small"): Embedder {
  return async (texts: string[]): Promise<number[][]> => {
    const OpenAI = (await import("openai")).default;
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY is not configured for embeddings");
    const client = new OpenAI({ apiKey });
    const res = await client.embeddings.create({ model, input: texts });
    return res.data.map((d) => d.embedding as number[]);
  };
}
