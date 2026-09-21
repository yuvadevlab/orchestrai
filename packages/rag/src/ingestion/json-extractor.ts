/**
 * @file packages/rag/src/ingestion/json-extractor.ts
 * @description Ingestion extractor for structured JSON documents and knowledge records.
 */

import type { ITextExtractor, ExtractedDocument } from "./extractor.interface";

/**
 * Text extractor for structured JSON payloads.
 */
export class JsonExtractor implements ITextExtractor {
  /**
   * Determines if the MIME type represents JSON data.
   */
  canHandle(mimeType: string): boolean {
    const normalized = mimeType.toLowerCase().trim();
    return normalized === "application/json" || normalized.endsWith("+json");
  }

  /**
   * Parses JSON, flattens top-level attributes, and renders clean readable text.
   */
  async extract(rawContent: string | Buffer, mimeType: string): Promise<ExtractedDocument> {
    const textContent = typeof rawContent === "string" ? rawContent : rawContent.toString("utf-8");

    let parsed: unknown;
    try {
      parsed = JSON.parse(textContent);
    } catch {
      // If parsing fails, fall back to treating raw content as plain string
      return {
        text: textContent,
        metadata: { mimeType, parseError: true },
      };
    }

    let inferredTitle: string | undefined;
    const metadata: Record<string, unknown> = { mimeType };

    // Inspect object for common title/name attributes
    if (parsed !== null && typeof parsed === "object" && !Array.isArray(parsed)) {
      const obj = parsed as Record<string, unknown>;
      if (typeof obj.title === "string" && obj.title.trim()) {
        inferredTitle = obj.title.trim();
      } else if (typeof obj.name === "string" && obj.name.trim()) {
        inferredTitle = obj.name.trim();
      } else if (typeof obj.id === "string") {
        inferredTitle = `Document ${obj.id}`;
      }

      // Populate metadata with shallow primitive fields for filtering
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
          metadata[key] = value;
        }
      }
    }

    // Format readable representation for LLM chunk ingestion
    const text = typeof parsed === "string" ? parsed : JSON.stringify(parsed, null, 2);

    return {
      text,
      inferredTitle,
      metadata,
    };
  }
}
