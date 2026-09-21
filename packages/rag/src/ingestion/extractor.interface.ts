/**
 * @file packages/rag/src/ingestion/extractor.interface.ts
 * @description Contract for media-type text extractors in document ingestion.
 */

/**
 * Result of extracting text and structured metadata from a document source.
 */
export interface ExtractedDocument {
  /** Cleaned extracted plain text content */
  text: string;
  /** Extracted structured metadata attributes */
  metadata: Record<string, unknown>;
  /** Title inferred from headers or metadata if available */
  inferredTitle?: string;
}

/**
 * Common contract for pluggable format-specific text extractors.
 */
export interface ITextExtractor {
  /**
   * Evaluates whether this extractor can parse the specified MIME type.
   *
   * @param mimeType - Normalized MIME media type string
   * @returns True if extractor supports the media type
   */
  canHandle(mimeType: string): boolean;

  /**
   * Extracts clean text and metadata from raw document contents.
   *
   * @param rawContent - Raw text or buffer content
   * @param mimeType - Media type identifier
   * @returns Extracted document result
   */
  extract(rawContent: string | Buffer, mimeType: string): Promise<ExtractedDocument>;
}
