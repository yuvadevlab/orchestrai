/**
 * @file packages/memory/src/storage/database-runner.interface.ts
 * @description Decoupled database query runner contract for relational storage adapters.
 */

/**
 * Minimal query runner interface abstracting `pg.Pool`, `pg.Client`, or transaction runners.
 */
export interface IDatabaseQueryRunner {
  /**
   * Executes a parameterized SQL statement against the underlying database connection.
   *
   * @param sql - Parameterized SQL text ($1, $2, etc.).
   * @param params - Positional values mapped to query placeholders.
   * @returns Generic query result containing typed result rows.
   */
  query<T = unknown>(sql: string, params?: readonly unknown[]): Promise<{ rows: T[] }>;
}
