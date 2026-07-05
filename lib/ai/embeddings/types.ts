/**
 * Fixed embedding dimension for the pgvector column (`vector(768)` in
 * 0002_rag.sql). Every embedding provider must emit this many dimensions.
 */
export const EMBEDDING_DIM = 768;

export interface EmbeddingProvider {
  readonly name: string;
  /** Embed a batch of texts; returns one vector per input, in order. */
  embed(texts: string[]): Promise<number[][]>;
}
