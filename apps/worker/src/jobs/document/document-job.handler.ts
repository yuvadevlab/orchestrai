/**
 * @file apps/worker/src/jobs/document/document-job.handler.ts
 * @description Background job handler for document parsing, chunking, and indexing preparation.
 */

import { z } from "zod";
import { Logger, loggerWithConfig } from "@yuva-devlab/logger";
import { ValidationError, OrchestrAIError } from "@orchestrai/core";
import { ErrorCode, DocumentMimeType } from "@orchestrai/shared-types";

/** Module-level logger for document ingestion job handler */
const logger = loggerWithConfig(new Logger("DocumentJobHandler"));

/**
 * Payload contract for document indexing and chunking jobs.
 */
export const DocumentJobPayloadSchema = z.object({
  documentId: z.uuid().describe("Unique document identifier"),
  tenantId: z.uuid().describe("Owning tenant UUID"),
  sourceUri: z.string().min(1).describe("Storage URI or local file path"),
  mimeType: z.string().default(DocumentMimeType.PLAIN_TEXT).describe("MIME content type"),
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
  // 1. Validate payload against schema — reject malformed ingestion jobs early
  const parseResult = DocumentJobPayloadSchema.safeParse(rawPayload);
  if (!parseResult.success) {
    logger.error("handleDocumentJob: invalid document job payload", {
      issues: parseResult.error.issues,
    });
    throw new ValidationError(
      "Failed to parse document job payload: " + parseResult.error.message,
      parseResult.error.issues,
    );
  }

  const payload = parseResult.data;
  logger.info("handleDocumentJob: starting document ingestion job", {
    documentId: payload.documentId,
    tenantId: payload.tenantId,
    mimeType: payload.mimeType,
  });

  try {
    // Phase 16 RAG stub: Ingest and chunk text content
    const simulatedCharCount = 5000;
    // Calculate expected chunk count accounting for overlapping windows
    const chunkCount = Math.ceil(simulatedCharCount / (payload.chunkSize - payload.chunkOverlap));

    logger.info("handleDocumentJob: document ingestion complete", {
      documentId: payload.documentId,
      chunksCount: chunkCount,
      charactersProcessed: simulatedCharCount,
    });

    return {
      documentId: payload.documentId,
      chunksCount: chunkCount,
      charactersProcessed: simulatedCharCount,
      indexedAt: new Date().toISOString(),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error("handleDocumentJob: document ingestion failed", {
      documentId: payload.documentId,
      message,
    });
    throw new OrchestrAIError(
      `Document job failed for document '${payload.documentId}': ${message}`,
      ErrorCode.WORKER_ERROR,
      500,
      { documentId: payload.documentId },
    );
  }
}
