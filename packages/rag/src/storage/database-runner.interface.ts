/**
 * @file packages/rag/src/storage/database-runner.interface.ts
 * @description Decoupled database query runner contract for PostgreSQL storage.
 */

/**
 * Structural query runner interface satisfied by pg.Pool, pg.Client, or an ORM connection.
 */
export interface IDatabaseQueryRunner {
  /**
   * Executes a parameterized SQL query.
   *
   * @param sql - Parameterized SQL statement string with $1, $2 placeholders
   * @param params - Query parameters
   * @returns Result rows typed as R
   */
  query<R = Record<string, unknown>>(
    sql: string,
    params?: unknown[],
  ): Promise<{ rows: R[]; rowCount?: number | null }>;
}
