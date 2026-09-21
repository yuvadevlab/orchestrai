/**
 * @file packages/memory/src/storage/postgres-memory-storage.ts
 * @description PostgreSQL adapter for memory_items table with pgvector cosine distance queries.
 */

import { MemoryType } from "@orchestrai/shared-types";
import type {
  IMemoryStorage,
  MemoryFilter,
  MemoryItem,
  MemorySearchQuery,
  ScoredMemoryItem,
} from "../contracts";
import type { IDatabaseQueryRunner } from "./database-runner.interface";

interface MemoryDbRow {
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
 * Production PostgreSQL storage adapter for durable agent memory with pgvector search.
 */
export class PostgresMemoryStorage implements IMemoryStorage {
  private readonly db: IDatabaseQueryRunner;

  constructor(db: IDatabaseQueryRunner) {
    this.db = db;
  }

  public async save(item: MemoryItem): Promise<void> {
    const vectorParam = item.embedding ? `[${item.embedding.join(",")}]` : null;
    const metadataParam = JSON.stringify(item.metadata);

    const sql = `
      INSERT INTO memory_items (
        memory_id, tenant_id, agent_id, conversation_id, memory_type, content, embedding, metadata, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7::vector, $8::jsonb, $9)
      ON CONFLICT (memory_id) DO UPDATE SET
        content = EXCLUDED.content,
        embedding = EXCLUDED.embedding,
        metadata = EXCLUDED.metadata,
        memory_type = EXCLUDED.memory_type;
    `;

    await this.db.query(sql, [
      item.memoryId,
      item.tenantId,
      item.agentId,
      item.conversationId ?? null,
      item.memoryType,
      item.content,
      vectorParam,
      metadataParam,
      item.createdAt,
    ]);
  }

  public async saveBatch(items: readonly MemoryItem[]): Promise<void> {
    for (const item of items) {
      await this.save(item);
    }
  }

  public async getById(memoryId: string): Promise<MemoryItem | null> {
    const sql = `SELECT * FROM memory_items WHERE memory_id = $1 LIMIT 1;`;
    const res = await this.db.query<MemoryDbRow>(sql, [memoryId]);
    const row = res.rows[0];
    return row ? this.mapRow(row) : null;
  }

  public async search(query: MemorySearchQuery): Promise<ScoredMemoryItem[]> {
    if (query.embedding && query.embedding.length > 0) {
      const vectorStr = `[${query.embedding.join(",")}]`;
      const sql = `
        SELECT *, 1 - (embedding <=> $1::vector) AS score
        FROM memory_items
        WHERE tenant_id = $2
          AND ($3::uuid IS NULL OR agent_id = $3::uuid)
          AND (embedding IS NOT NULL)
          AND (1 - (embedding <=> $1::vector)) >= $4
        ORDER BY embedding <=> $1::vector ASC
        LIMIT $5;
      `;
      const res = await this.db.query<MemoryDbRow>(sql, [
        vectorStr,
        query.tenantId,
        query.agentId ?? null,
        query.minScore,
        query.limit,
      ]);
      return res.rows.map((row) => ({
        item: this.mapRow(row),
        score: typeof row.score === "number" ? row.score : Number(row.score ?? 0),
      }));
    }

    // Text search fallback when no embedding is provided
    const sql = `
      SELECT *, 0.8 AS score
      FROM memory_items
      WHERE tenant_id = $1
        AND ($2::uuid IS NULL OR agent_id = $2::uuid)
        AND content ILIKE $3
      ORDER BY created_at DESC
      LIMIT $4;
    `;
    const res = await this.db.query<MemoryDbRow>(sql, [
      query.tenantId,
      query.agentId ?? null,
      `%${query.query}%`,
      query.limit,
    ]);
    return res.rows.map((row) => ({ item: this.mapRow(row), score: 0.8 }));
  }

  public async list(filter: MemoryFilter): Promise<MemoryItem[]> {
    const sql = `
      SELECT * FROM memory_items
      WHERE tenant_id = $1
        AND ($2::uuid IS NULL OR agent_id = $2::uuid)
        AND ($3::uuid IS NULL OR conversation_id = $3::uuid)
      ORDER BY created_at DESC
      LIMIT $4 OFFSET $5;
    `;
    const res = await this.db.query<MemoryDbRow>(sql, [
      filter.tenantId,
      filter.agentId ?? null,
      filter.conversationId ?? null,
      filter.limit,
      filter.offset,
    ]);
    return res.rows.map((row) => this.mapRow(row));
  }

  public async delete(memoryId: string): Promise<boolean> {
    const sql = `DELETE FROM memory_items WHERE memory_id = $1;`;
    await this.db.query(sql, [memoryId]);
    return true;
  }

  public async deleteByFilter(filter: MemoryFilter): Promise<number> {
    const sql = `
      DELETE FROM memory_items
      WHERE tenant_id = $1
        AND ($2::uuid IS NULL OR agent_id = $2::uuid)
        AND ($3::uuid IS NULL OR conversation_id = $3::uuid);
    `;
    await this.db.query(sql, [
      filter.tenantId,
      filter.agentId ?? null,
      filter.conversationId ?? null,
    ]);
    return 1;
  }

  public async pruneExpired(): Promise<number> {
    const sql = `
      DELETE FROM memory_items
      WHERE (metadata->>'expiresAt') IS NOT NULL
        AND (metadata->>'expiresAt')::timestamptz < NOW();
    `;
    await this.db.query(sql);
    return 0;
  }

  private mapRow(row: MemoryDbRow): MemoryItem {
    const metadata =
      typeof row.metadata === "string" ? JSON.parse(row.metadata) : (row.metadata ?? {});
    return {
      memoryId: row.memory_id,
      tenantId: row.tenant_id,
      agentId: row.agent_id,
      conversationId: row.conversation_id ?? undefined,
      memoryType: (row.memory_type as MemoryType) ?? MemoryType.EPISODIC,
      content: row.content,
      embedding: Array.isArray(row.embedding) ? row.embedding : undefined,
      metadata,
      importanceScore:
        typeof metadata.importanceScore === "number" ? metadata.importanceScore : 0.5,
      expiresAt: typeof metadata.expiresAt === "string" ? metadata.expiresAt : undefined,
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.created_at).toISOString(),
    };
  }
}
