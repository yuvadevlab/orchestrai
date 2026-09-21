/**
 * @file packages/rag/src/contracts/document.schema.ts
 * @description Zod validation schemas and TypeScript types for ingested RAG documents.
 */

import { z } from "zod";

/**
 * Zod schema validating a persisted document record.
 */
export const DocumentSchema = z.object({
  /** Primary identifier for the document */
  documentId: z.uuid(),
  /** Tenant isolation partition ID */
  tenantId: z.uuid(),
  /** Human-readable document title */
  title: z.string().min(1).max(255),
  /** Source location URI (file path, URL, object storage key) */
  sourceUri: z.string().min(1),
  /** MIME media type identifier */
  mimeType: z.string().min(1).default("text/plain"),
  /** Structured arbitrary metadata attributes */
  metadata: z.record(z.string(), z.unknown()).default({}),
  /** Creation timestamp in ISO 8601 format */
  createdAt: z.iso.datetime(),
  /** Last update timestamp in ISO 8601 format */
  updatedAt: z.iso.datetime(),
});

/**
 * Canonical ingested document entity.
 */
export type Document = z.infer<typeof DocumentSchema>;

/**
 * Zod schema for document creation inputs.
 */
export const CreateDocumentInputSchema = z.object({
  /** Human-readable title */
  title: z.string().min(1).max(255),
  /** Source location URI or original file name */
  sourceUri: z.string().min(1),
  /** Optional MIME type override (defaults to text/plain) */
  mimeType: z.string().min(1).default("text/plain"),
  /** Optional metadata tags and attributes */
  metadata: z.record(z.string(), z.unknown()).default({}),
});

/**
 * Payload required to register a document in the storage layer.
 */
export type CreateDocumentInput = z.infer<typeof CreateDocumentInputSchema>;
