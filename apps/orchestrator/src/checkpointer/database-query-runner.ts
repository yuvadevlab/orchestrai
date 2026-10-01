/**
 * @file apps/orchestrator/src/checkpointer/database-query-runner.ts
 * @description PostgreSQL connection pool query runner adapter implementing runtime IDatabaseQueryRunner.
 * @module apps/orchestrator/checkpointer
 */

import { getOrCreatePool } from "@orchestrai/database";
import type { IDatabaseQueryRunner } from "@orchestrai/runtime";

type PoolInstance = ReturnType<typeof getOrCreatePool>;

/**
 * Adapter delegating raw parameterized queries from checkpointers to the pg.Pool instance.
 */
export class PoolDatabaseQueryRunner implements IDatabaseQueryRunner {
  constructor(private readonly pool: PoolInstance = getOrCreatePool()) {}

  /**
   * Executes parameterized SQL statement against PostgreSQL connection pool.
   *
   * @param sql - Parameterized SQL query
   * @param params - Values for query parameters ($1, $2, etc.)
   * @returns Array of resulting typed rows
   */
  public async query<TRow = unknown>(sql: string, params?: unknown[]): Promise<TRow[]> {
    const result = await this.pool.query(sql, params);
    return result.rows as TRow[];
  }
}
