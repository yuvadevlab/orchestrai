/**
 * @file packages/memory/src/storage/postgres-row-mappers.ts
 * @description Row mapping functions transforming PostgreSQL records to MemoryItem entities.
 * Enforces defensive schema boundary validation via Zod.
 */

import { MemoryType } from "@orchestrai/shared-types";
import { MemoryItemSchema, type MemoryItem } from "../contracts";
import type { MemoryDbRow } from "./postgres-queries";

/**
 * Maps a relational database row from `memory_items` to a validated MemoryItem entity.
 *
 * @param row - Raw database record row
 * @returns Validated MemoryItem entity
 */
export function mapMemoryRow(row: MemoryDbRow): MemoryItem {
  let parsedMetadata: Record<string, unknown> = {};
  if (typeof row.metadata === "string") {
    try {
      parsedMetadata = JSON.parse(row.metadata) as Record<string, unknown>;
    } catch {
      parsedMetadata = {};
    }
  } else if (row.metadata && typeof row.metadata === "object") {
    parsedMetadata = row.metadata;
  }

  let embeddingArray: number[] | undefined;
  if (typeof row.embedding === "string") {
    const cleaned = row.embedding.replace(/^\[|\]$/g, "").trim();
    if (cleaned.length > 0) {
      embeddingArray = cleaned.split(",").map(Number);
    }
  } else if (Array.isArray(row.embedding)) {
    embeddingArray = row.embedding;
  }

  const rawCreatedAt =
    row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at);

  const mapped = {
    memoryId: row.memory_id,
    tenantId: row.tenant_id,
    agentId: row.agent_id,
    conversationId: row.conversation_id ?? undefined,
    memoryType: (row.memory_type as MemoryType) || MemoryType.EPISODIC,
    content: row.content,
    embedding: embeddingArray,
    metadata: parsedMetadata,
    importanceScore:
      typeof parsedMetadata.importanceScore === "number" ? parsedMetadata.importanceScore : 0.5,
    expiresAt: typeof parsedMetadata.expiresAt === "string" ? parsedMetadata.expiresAt : undefined,
    createdAt: rawCreatedAt,
    updatedAt: rawCreatedAt,
  };

  // Defensive validation: ensures DB column drift throws immediately with field trace
  return MemoryItemSchema.parse(mapped);
}
