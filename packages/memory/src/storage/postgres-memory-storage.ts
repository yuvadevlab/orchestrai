/**
 * @file packages/memory/src/storage/postgres-memory-storage.ts
 * @description PostgreSQL adapter for memory_items table with pgvector cosine distance queries.
 * Delegates SQL query strings to the centralized `postgres-queries` catalog.
 */

import type {
  IMemoryStorage,
  MemoryFilter,
  MemoryItem,
  MemorySearchQuery,
  ScoredMemoryItem,
} from "../contracts";
import type { IDatabaseQueryRunner } from "./database-runner.interface";
import {
  MEMORY_SQL_QUERIES,
  buildListMemoryQuery,
  buildDeleteByFilterQuery,
  type MemoryDbRow,
} from "./postgres-queries";
import { mapMemoryRow } from "./postgres-row-mappers";

/**
 * Production PostgreSQL storage adapter for durable agent memory with pgvector search.
 */
export class PostgresMemoryStorage implements IMemoryStorage {
  constructor(private readonly db: IDatabaseQueryRunner) {}

  public async save(item: MemoryItem): Promise<void> {
    const vectorParam = item.embedding ? `[${item.embedding.join(",")}]` : null;
    const metadataParam = JSON.stringify(item.metadata);

    await this.db.query(MEMORY_SQL_QUERIES.UPSERT_MEMORY, [
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
    const res = await this.db.query<MemoryDbRow>(MEMORY_SQL_QUERIES.GET_BY_ID, [memoryId]);
    const row = res.rows[0];
    return row ? mapMemoryRow(row) : null;
  }

  public async search(query: MemorySearchQuery): Promise<ScoredMemoryItem[]> {
    if (query.embedding && query.embedding.length > 0) {
      const vectorStr = `[${query.embedding.join(",")}]`;
      const res = await this.db.query<MemoryDbRow>(MEMORY_SQL_QUERIES.VECTOR_SEARCH, [
        vectorStr,
        query.tenantId,
        query.agentId ?? null,
        query.minScore,
        query.limit,
      ]);
      return res.rows.map((row) => ({
        item: mapMemoryRow(row),
        score: Number(row.score ?? 0),
      }));
    }

    // Text search fallback
    const res = await this.db.query<MemoryDbRow>(MEMORY_SQL_QUERIES.TEXT_SEARCH, [
      `%${query.query}%`,
      query.tenantId,
      query.agentId ?? null,
      query.limit,
    ]);
    return res.rows.map((row) => ({
      item: mapMemoryRow(row),
      score: 1.0,
    }));
  }

  public async list(filter: MemoryFilter): Promise<MemoryItem[]> {
    const { sql, params } = buildListMemoryQuery(filter);
    const res = await this.db.query<MemoryDbRow>(sql, params);
    return res.rows.map((row) => mapMemoryRow(row));
  }

  public async delete(memoryId: string): Promise<boolean> {
    const res = await this.db.query(MEMORY_SQL_QUERIES.DELETE_BY_ID, [memoryId]);
    return (res.rowCount ?? 0) > 0;
  }

  public async deleteByFilter(filter: MemoryFilter): Promise<number> {
    const { sql, params } = buildDeleteByFilterQuery(filter);
    const res = await this.db.query(sql, params);
    return res.rowCount ?? 0;
  }

  public async pruneExpired(beforeDate: Date = new Date()): Promise<number> {
    const res = await this.db.query(MEMORY_SQL_QUERIES.PRUNE_EXPIRED, [beforeDate.toISOString()]);
    return res.rowCount ?? 0;
  }
}
