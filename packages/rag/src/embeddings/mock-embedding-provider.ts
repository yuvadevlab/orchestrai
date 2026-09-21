/**
 * @file packages/rag/src/embeddings/mock-embedding-provider.ts
 * @description Deterministic pseudo-embedding provider for local development, testing, and offline runs.
 */

import type { IEmbeddingProvider } from "./embedding-provider.interface";

/**
 * Standard pgvector default dimension matching PostgreSQL migration 0004.
 */
const DEFAULT_DIMENSION = 1536;

/**
 * Deterministic hash-based embedding generator.
 * Produces unit-length normalized vectors with repeatable cosine properties.
 */
export class MockEmbeddingProvider implements IEmbeddingProvider {
  readonly dimension: number;

  constructor(dimension: number = DEFAULT_DIMENSION) {
    this.dimension = dimension;
  }

  /**
   * Generates a deterministic normalized embedding for text based on string hashing.
   */
  async embedText(text: string): Promise<number[]> {
    const vector = new Array<number>(this.dimension).fill(0);
    const normalized = text.toLowerCase().trim();

    // Distribute character codes across vector indices
    for (let i = 0; i < normalized.length; i++) {
      const code = normalized.charCodeAt(i);
      const index = (code * 31 + i * 17) % this.dimension;
      const currentVal = vector[index] ?? 0;
      vector[index] = currentVal + 1.0 / (1 + (i % 7));
    }

    // Include word-level seed distribution
    const words = normalized.split(/\s+/);
    for (const word of words) {
      if (!word) {
        continue;
      }
      let wordHash = 0;
      for (let c = 0; c < word.length; c++) {
        wordHash = (wordHash << 5) - wordHash + word.charCodeAt(c);
        wordHash |= 0;
      }
      const wordIndex = Math.abs(wordHash) % this.dimension;
      const currentVal = vector[wordIndex] ?? 0;
      vector[wordIndex] = currentVal + 2.0;
    }

    // Normalize vector to unit length (L2 norm)
    let norm = 0;
    for (let i = 0; i < this.dimension; i++) {
      const vi = vector[i] ?? 0;
      norm += vi * vi;
    }
    const magnitude = Math.sqrt(norm);

    if (magnitude > 0) {
      for (let i = 0; i < this.dimension; i++) {
        const vi = vector[i] ?? 0;
        vector[i] = vi / magnitude;
      }
    } else {
      // Fallback unit vector if input was empty
      vector[0] = 1.0;
    }

    return vector;
  }

  /**
   * Generates embeddings for a batch of strings sequentially.
   */
  async embedBatch(texts: string[]): Promise<number[][]> {
    const results: number[][] = [];
    for (const text of texts) {
      results.push(await this.embedText(text));
    }
    return results;
  }
}
