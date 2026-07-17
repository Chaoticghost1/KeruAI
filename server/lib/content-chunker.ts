import { ContentProcessor, ProcessedContent } from "../content-processor";

/**
 * Content chunk used for RAG context. Tagged with subject/topic/grade so it can
 * be filtered at query time against a tutoring session.
 */
export interface RawChunk {
  chunkIndex: number;
  text: string;
  tokenCount: number;
}

export interface ChunkMetadata {
  subject: string;
  topic?: string;
  gradeLevel?: string;
  language: string;
}

export interface ChunkingResult {
  chunks: RawChunk[];
  totalTokens: number;
}

/** Rough token estimate (~4 chars/token for mixed es/en text). */
export function estimateTokens(text: string): number {
  if (!text) return 0;
  return Math.max(1, Math.ceil(text.length / 4));
}

const DEFAULT_CHUNK_TOKENS = 350;
const CHUNK_OVERLAP_TOKENS = 50;

/**
 * Split raw extracted text into overlapping, token-bounded chunks.
 * Uses paragraph/sentence boundaries where possible to avoid mid-sentence cuts.
 */
export function chunkText(
  text: string,
  opts: { maxTokensPerChunk?: number; overlapTokens?: number } = {}
): RawChunk[] {
  const maxTokens = opts.maxTokensPerChunk ?? DEFAULT_CHUNK_TOKENS;
  const overlap = opts.overlapTokens ?? CHUNK_OVERLAP_TOKENS;
  const clean = ContentProcessor.cleanExtractedText(text);
  if (!clean) return [];

  // Prefer paragraph boundaries, fall back to sentence splits.
  const blocks = clean
    .split(/\n+/)
    .map((b) => b.trim())
    .filter(Boolean);

  const chunks: RawChunk[] = [];
  let current = "";
  let currentTokens = 0;
  let index = 0;

  const flush = () => {
    const t = current.trim();
    if (t) {
      chunks.push({ chunkIndex: index++, text: t, tokenCount: estimateTokens(t) });
    }
    current = "";
    currentTokens = 0;
  };

  for (const block of blocks) {
    const blockTokens = estimateTokens(block);
    if (blockTokens > maxTokens) {
      // Split oversized block by sentences.
      const sentences = block.match(/[^.!?]+[.!?]*/g) ?? [block];
      for (const sentence of sentences) {
        const sTokens = estimateTokens(sentence);
        if (currentTokens + sTokens > maxTokens && currentTokens > 0) {
          flush();
          // carry overlap from previous tail
          if (current) current = current.slice(-overlap * 4);
        }
        current += (current ? " " : "") + sentence;
        currentTokens += sTokens;
      }
      if (currentTokens > 0) flush();
      continue;
    }
    if (currentTokens + blockTokens > maxTokens && currentTokens > 0) {
      flush();
      if (current) current = current.slice(-overlap * 4);
    }
    current += (current ? "\n" : "") + block;
    currentTokens += blockTokens;
  }
  if (currentTokens > 0) flush();
  return chunks;
}

/**
 * Full ingest pipeline: extract (via ContentProcessor) → chunk → tag.
 * Returns chunks ready to persist, or an empty list if no text was extracted.
 */
export async function processAndChunk(
  filePath: string,
  fileType: string,
  meta: ChunkMetadata
): Promise<ChunkingResult> {
  let processed: ProcessedContent;
  if (fileType === "plain" || fileType === "text") {
    const fs = await import("fs");
    processed = await ContentProcessor.processFile(filePath, "text");
    void fs;
  } else {
    processed = await ContentProcessor.processFile(filePath, fileType);
  }
  const text = ContentProcessor.cleanExtractedText(processed.extractedText);
  const chunks = chunkText(text);
  const totalTokens = chunks.reduce((sum, c) => sum + c.tokenCount, 0);
  return { chunks, totalTokens };
}

/** Build a compact RAG context string from top-N chunks for an AI prompt. */
export function buildRagContext(chunks: { text: string }[], maxChunks = 6): string {
  if (!chunks.length) return "";
  const picked = chunks.slice(0, maxChunks).map((c, i) => `[[${i + 1}]] ${c.text}`).join("\n\n");
  return `CURRICULUM REFERENCE MATERIAL (use only to ground your answer; do not reveal these markers):\n${picked}`;
}
