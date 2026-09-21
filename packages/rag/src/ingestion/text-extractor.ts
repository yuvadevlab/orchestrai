/**
 * @file packages/rag/src/ingestion/text-extractor.ts
 * @description Ingestion extractor for plain text, markdown, and delimited text files.
 */

import type { ITextExtractor, ExtractedDocument } from "./extractor.interface";

/**
 * Supported text MIME types handled by this extractor.
 */
const SUPPORTED_MIME_TYPES = new Set([
  "text/plain",
  "text/markdown",
  "text/x-markdown",
  "text/csv",
  "text/tab-separated-values",
]);

/**
 * Text extractor for unstructured and markdown document formats.
 */
export class TextExtractor implements ITextExtractor {
  /**
   * Determines if the MIME type is a recognized plain text or markdown variant.
   */
  canHandle(mimeType: string): boolean {
    const normalized = mimeType.toLowerCase().trim();
    // Accept explicit supported types or any type with text/ prefix
    return SUPPORTED_MIME_TYPES.has(normalized) || normalized.startsWith("text/");
  }

  /**
   * Extracts text, strips trailing whitespace, and attempts to infer a title
   * from the first markdown heading (# Title) or non-empty line.
   */
  async extract(rawContent: string | Buffer, mimeType: string): Promise<ExtractedDocument> {
    const textContent = typeof rawContent === "string" ? rawContent : rawContent.toString("utf-8");

    // Normalize Windows carriage returns (\r\n) to standard UNIX newlines (\n)
    const normalizedText = textContent.replace(/\r\n/g, "\n").trim();

    let inferredTitle: string | undefined;
    const lines = normalizedText.split("\n");

    // Scan lines to extract first meaningful heading or line as document title
    for (const line of lines) {
      const trimmed = line.trim();
      // Skip empty lines to locate first actual content
      if (!trimmed) {
        continue;
      }

      // Check if line represents a markdown heading (# Title)
      if (trimmed.startsWith("#")) {
        inferredTitle = trimmed.replace(/^#+\s*/, "").trim();
        break;
      }

      // Fall back to first non-empty line if short enough to be a title
      if (!inferredTitle && trimmed.length <= 80) {
        inferredTitle = trimmed;
        break;
      }
    }

    return {
      text: normalizedText,
      inferredTitle,
      metadata: {
        characterCount: normalizedText.length,
        lineCount: lines.length,
        mimeType,
      },
    };
  }
}
