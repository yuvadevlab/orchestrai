/**
 * @file packages/rag/src/context/context-builder.types.ts
 * @description Types and options for assembling retrieved knowledge chunks into prompt context.
 */

/**
 * Citation reference metadata associated with a context snippet.
 */
export interface ContextCitation {
  /** Numeric reference identifier (e.g. 1, 2) */
  citationId: number;
  /** Chunk identifier */
  chunkId: string;
  /** Parent document identifier */
  documentId: string;
  /** Document human-readable title */
  documentTitle: string;
  /** Source location URI or file path */
  sourceUri: string;
  /** Chunk ordinal index within document */
  chunkIndex: number;
}

/**
 * Options configuring prompt context assembly.
 */
export interface ContextBuildOptions {
  /**
   * Maximum total token budget allocated for context snippets.
   * Defaults to 2048 tokens.
   */
  maxTokens?: number;

  /**
   * Citation formatting style.
   * "bracket": [1] Title: ...
   * "footnote": Snippet text... [1]
   */
  citationStyle?: "bracket" | "footnote";

  /**
   * Whether to include document-level metadata attributes in citation header.
   * Defaults to false.
   */
  includeMetadata?: boolean;
}

/**
 * Formatted prompt context containing assembled text and citations.
 */
export interface FormattedContext {
  /** Ready-to-inject markdown prompt context string */
  contextText: string;
  /** Array of citations corresponding to included chunks */
  citations: ContextCitation[];
  /** Total estimated token count of the assembled context */
  totalTokens: number;
  /** Number of chunks successfully packed within token budget */
  chunkCount: number;
}
