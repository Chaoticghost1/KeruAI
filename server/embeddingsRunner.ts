/**
 * Embeddings runner: a small worker that drains the embedding queue on boot
 * (when EMBEDDING_WORKER_ENABLED=true) and can be triggered manually via
 * POST /api/admin/embeddings/run.
 */
import { storage } from "./storage";
import {
  embedChunks,
  createOpenAIEmbedder,
  resolveEmbeddingBackend,
} from "./embeddings.js";

const BATCH_SIZE = 50;

export interface EmbedRunResult {
  processed: number;
  remaining: number;
  backend: string;
}

/** Drain the embedding queue, one batch at a time, until empty or capped. */
export async function runEmbeddingWorker(maxBatches = 50): Promise<EmbedRunResult> {
  const embed = createOpenAIEmbedder();
  const backend = resolveEmbeddingBackend();
  let processed = 0;

  for (let i = 0; i < maxBatches; i++) {
    const chunks = await storage.getChunksForEmbedding(BATCH_SIZE);
    if (!chunks.length) break;
    const n = await embedChunks(
      chunks.map((c) => ({ id: c.id, text: c.text })),
      embed,
      (id, vector) => storage.saveChunkEmbedding(id, vector),
    );
    processed += n;
  }

  const counts = await storage.getEmbeddingStatusCounts();
  return { processed, remaining: counts.none + counts.pending, backend };
}

/** Boot the worker if enabled by env. Errors are logged but never crash startup. */
export function maybeStartEmbeddingWorker(): void {
  if (process.env.EMBEDDING_WORKER_ENABLED !== "true") return;
  console.log("[embeddings] worker enabled — draining embedding queue on boot");
  runEmbeddingWorker().then((r) => {
    console.log(`[embeddings] boot run complete: ${r.processed} embedded, ${r.remaining} remaining (backend=${r.backend})`);
  }).catch((err) => {
    console.error("[embeddings] boot run failed:", err instanceof Error ? err.message : err);
  });
}
