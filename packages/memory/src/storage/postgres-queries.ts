/**
 * @file packages/memory/src/storage/postgres-queries.ts
 * @description Centralized SQL query catalog and typed row interfaces for agent memory storage.
 *
 * Invariant:
 * Pure SQL files are co-located in `packages/memory/src/storage/sql/` for rapid inspection,
 * database benchmarking, and direct psql debugging.
 */

import type { MemoryFilter } from "../contracts/memory-query.schema";

/**
 * Raw database record structure returned from `memory_items` table queries.
 */
export interface MemoryDbRow {
  memory_id: string;
  tenant_id: string;
  agent_id: string;
  conversation_id: string | null;
  memory_type: string;
  content: string;
  embedding: string | number[] | null;
  metadata: Record<string, unknown> | string;
  created_at: Date | string;
  score?: number | string;
}

/**
 * Master catalog of static SQL query statements for memory PostgreSQL storage.
 */
export const MEMORY_SQL_QUERIES = {
  /**
   * Upserts a memory item with vector embedding.
   */
  UPSERT_MEMORY: `
    INSERT INTO memory_items (
      memory_id, tenant_id, agent_id, conversation_id, memory_type, content, embedding, metadata, created_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7::vector, $8::jsonb, $9)
    ON CONFLICT (memory_id) DO UPDATE SET
      content = EXCLUDED.content,
      embedding = EXCLUDED.embedding,
      metadata = EXCLUDED.metadata,
      memory_type = EXCLUDED.memory_type;
  `,

  /**
   * Retrieves a single memory item by ID.
   */
  GET_BY_ID: `
    SELECT memory_id, tenant_id, agent_id, conversation_id, memory_type, content, embedding::text, metadata, created_at
    FROM memory_items
    WHERE memory_id = $1
    LIMIT 1;
  `,

  /**
   * Deletes a memory item by ID.
   */
  DELETE_BY_ID: `
    DELETE FROM memory_items
    WHERE memory_id = $1;
  `,

  /**
   * Deletes expired memory items past TTL.
   */
  PRUNE_EXPIRED: `
    DELETE FROM memory_items
    WHERE (metadata->>'expiresAt') IS NOT NULL
      AND (metadata->>'expiresAt')::timestamptz <= $1::timestamptz;
  `,

  /**
   * Vector similarity search query.
   */
  VECTOR_SEARCH: `
    SELECT memory_id, tenant_id, agent_id, conversation_id, memory_type, content, embedding::text, metadata, created_at,
           (1 - (embedding <=> $1::vector)) AS score
    FROM memory_items
    WHERE tenant_id = $2
      AND ($3::uuid IS NULL OR agent_id = $3::uuid)
      AND (embedding IS NOT NULL)
      AND (1 - (embedding <=> $1::vector)) >= $4
    ORDER BY embedding <=> $1::vector ASC
    LIMIT $5;
  `,

  /**
   * Keyword fallback search query.
   */
  TEXT_SEARCH: `
    SELECT memory_id, tenant_id, agent_id, conversation_id, memory_type, content, embedding::text, metadata, created_at,
           1.0 AS score
    FROM memory_items
    WHERE tenant_id = $2
      AND ($3::uuid IS NULL OR agent_id = $3::uuid)
      AND content ILIKE $1
    ORDER BY created_at DESC
    LIMIT $4;
  `,
} as const;

/**
 * Builds a parameterized query for listing memory items with dynamic filters.
 *
 * @param filter - Memory list filter
 * @returns Parameterized SQL and values array
 */
export function buildListMemoryQuery(filter: MemoryFilter): { sql: string; params: unknown[] } {
  const conditions: string[] = ["tenant_id = $1"];
  const params: unknown[] = [filter.tenantId];

  if (filter.agentId) {
    params.push(filter.agentId);
    conditions.push(`agent_id = $${params.length}`);
  }
  if (filter.conversationId) {
    params.push(filter.conversationId);
    conditions.push(`conversation_id = $${params.length}`);
  }
  if (filter.memoryTypes && filter.memoryTypes.length > 0) {
    params.push(filter.memoryTypes);
    conditions.push(`memory_type = ANY($${params.length}::varchar[])`);
  }
  if (filter.since) {
    params.push(filter.since);
    conditions.push(`created_at >= $${params.length}::timestamptz`);
  }

  params.push(filter.limit);
  const limitPlaceholder = `$${params.length}`;
  params.push(filter.offset);
  const offsetPlaceholder = `$${params.length}`;

  const sql = `
    SELECT memory_id, tenant_id, agent_id, conversation_id, memory_type, content, embedding::text, metadata, created_at
    FROM memory_items
    WHERE ${conditions.join(" AND ")}
    ORDER BY created_at DESC
    LIMIT ${limitPlaceholder} OFFSET ${offsetPlaceholder};
  `;

  return { sql, params };
}

/**
 * Builds a parameterized query for deleting memory items matching a filter.
 *
 * @param filter - Memory deletion filter
 * @returns Parameterized SQL and values array
 */
export function buildDeleteByFilterQuery(filter: MemoryFilter): { sql: string; params: unknown[] } {
  const conditions: string[] = ["tenant_id = $1"];
  const params: unknown[] = [filter.tenantId];

  if (filter.agentId) {
    params.push(filter.agentId);
    conditions.push(`agent_id = $${params.length}`);
  }
  if (filter.conversationId) {
    params.push(filter.conversationId);
    conditions.push(`conversation_id = $${params.length}`);
  }
  if (filter.memoryTypes && filter.memoryTypes.length > 0) {
    params.push(filter.memoryTypes);
    conditions.push(`memory_type = ANY($${params.length}::varchar[])`);
  }

  const sql = `
    DELETE FROM memory_items
    WHERE ${conditions.join(" AND ")};
  `;

  return { sql, params };
}
