/**
 * @file packages/rag/src/chunking/chunker.interface.ts
 * @description Contracts and options for text chunking and boundary splitting.
 */

/**
 * Text splitting strategy for document chunking.
 */
export type ChunkStrategy = "sentence" | "paragraph" | "fixed";

/**
 * Configuration options governing the text chunker.
 */
export interface ChunkOptions {
  /**
   * Target maximum tokens per chunk.
   * Defaults to 512 tokens.
   */
  maxTokens?: number;

  /**
   * Overlap token count between adjacent sequential chunks.
   * Prevents loss of context across chunk borders.
   * Defaults to 64 tokens.
   */
  overlapTokens?: number;

  /**
   * Boundary segmentation strategy.
   * Defaults to "sentence".
   */
  strategy?: ChunkStrategy;
}

/**
 * Result of a single chunk generated from a source document.
 */
export interface TextChunkResult {
  /** Sequential zero-based ordinal index */
  chunkIndex: number;
  /** Chunk plain text content */
  content: string;
  /** Estimated or calculated token count */
  tokenCount: number;
  /** Start character offset in original document */
  startOffset: number;
  /** End character offset in original document */
  endOffset: number;
}

/**
 * Contract for text chunking implementations.
 */
export interface ITextChunker {
  /**
   * Splits a raw text string into granular, overlapping chunks.
   *
   * @param text - Source document plain text
   * @param options - Chunk sizing and overlap options
   * @returns Array of chunk results
   */
  chunk(text: string, options?: ChunkOptions): TextChunkResult[];
}
