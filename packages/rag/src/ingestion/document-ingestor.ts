/**
 * @file packages/rag/src/ingestion/document-ingestor.ts
 * @description Coordinator for media-type text extractors in document ingestion.
 */

import { RagError } from "@orchestrai/core";
import type { ITextExtractor, ExtractedDocument } from "./extractor.interface";
import { TextExtractor } from "./text-extractor";
import { JsonExtractor } from "./json-extractor";

/**
 * Options supplied when ingesting raw content.
 */
export interface IngestContentOptions {
  /** Source location or file path */
  sourceUri: string;
  /** Explicit title override (defaults to inferred title or sourceUri) */
  title?: string;
  /** Media MIME type (defaults to text/plain) */
  mimeType?: string;
  /** Additional custom metadata tags to attach */
  metadata?: Record<string, unknown>;
}

/**
 * Complete document extraction payload ready for chunking and storage.
 */
export interface IngestedDocumentPayload {
  /** Resolved document title */
  title: string;
  /** Document source URI */
  sourceUri: string;
  /** Media MIME type */
  mimeType: string;
  /** Extracted plain text */
  text: string;
  /** Combined system and user metadata */
  metadata: Record<string, unknown>;
}

/**
 * High-level coordinator managing pluggable format extractors.
 */
export class DocumentIngestor {
  private readonly extractors: ITextExtractor[] = [];

  constructor(customExtractors: ITextExtractor[] = []) {
    // Register default extractors followed by any custom pluggable extractors
    this.extractors.push(new TextExtractor());
    this.extractors.push(new JsonExtractor());
    for (const ext of customExtractors) {
      this.extractors.unshift(ext);
    }
  }

  /**
   * Resolves the appropriate extractor and extracts text and metadata.
   *
   * @param rawContent - Raw text or buffer content
   * @param options - Ingestion options
   * @returns Ingested document payload
   */
  async ingest(
    rawContent: string | Buffer,
    options: IngestContentOptions,
  ): Promise<IngestedDocumentPayload> {
    const mimeType = options.mimeType ?? "text/plain";

    // Find the first registered extractor that supports this media type
    const extractor = this.extractors.find((ext) => ext.canHandle(mimeType));
    if (!extractor) {
      throw new RagError(`No text extractor registered for media type: '${mimeType}'`, {
        mimeType,
        sourceUri: options.sourceUri,
      });
    }

    const extracted: ExtractedDocument = await extractor.extract(rawContent, mimeType);

    // Resolve title hierarchy: user explicit title > extractor inferred title > sourceUri
    const title = options.title ?? extracted.inferredTitle ?? options.sourceUri;

    // Merge extracted metadata with user metadata (user overrides extracted)
    const mergedMetadata = {
      ...extracted.metadata,
      ...(options.metadata ?? {}),
    };

    return {
      title,
      sourceUri: options.sourceUri,
      mimeType,
      text: extracted.text,
      metadata: mergedMetadata,
    };
  }
}
