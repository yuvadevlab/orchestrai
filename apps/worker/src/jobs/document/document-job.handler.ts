/**
 * @file apps/worker/src/jobs/document/document-job.handler.ts
 * @description Background job handler for document parsing, chunking, and indexing preparation.
 */

import { z } from "zod";
import { ValidationError, OrchestrAIError } from "@orchestrai/core";

/**
 * Payload contract for document indexing and chunking jobs.
 */
export const DocumentJobPayloadSchema = z.object({
  documentId: z.string().uuid().describe("Unique document identifier"),
  tenantId: z.string().uuid().describe("Owning tenant UUID"),
  sourceUri: z.string().min(1).describe("Storage URI or local file path"),
  mimeType: z.string().default("text/plain").describe("MIME content type"),
  chunkSize: z.number().int().positive().default(1000).describe("Target characters per chunk"),
  chunkOverlap: z
    .number()
    .int()
    .nonnegative()
    .default(200)
    .describe("Character overlap between chunks"),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

export type DocumentJobPayload = z.infer<typeof DocumentJobPayloadSchema>;

/**
 * Result of document ingestion and chunking.
 */
export interface DocumentJobResult {
  readonly documentId: string;
  readonly chunksCount: number;
  readonly charactersProcessed: number;
  readonly indexedAt: string;
}

/**
 * Handles processing of a document ingestion job.
 *
 * @param rawPayload - Raw job data received from queue.
 * @returns Ingestion summary result.
 */
export async function handleDocumentJob(rawPayload: unknown): Promise<DocumentJobResult> {
  const parseResult = DocumentJobPayloadSchema.safeParse(rawPayload);
  if (!parseResult.success) {
    throw new ValidationError(
      "Failed to parse document job payload: " + parseResult.error.message,
      parseResult.error.issues,
    );
  }

  const payload = parseResult.data;

  try {
    // Phase 16 RAG stub: Ingest and chunk text content
    const simulatedCharCount = 5000;
    const chunkCount = Math.ceil(simulatedCharCount / (payload.chunkSize - payload.chunkOverlap));

    return {
      documentId: payload.documentId,
      chunksCount: chunkCount,
      charactersProcessed: simulatedCharCount,
      indexedAt: new Date().toISOString(),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new OrchestrAIError(
      `Document job failed for document '${payload.documentId}': ${message}`,
      "WORKER_ERROR",
      500,
      { documentId: payload.documentId },
    );
  }
}
