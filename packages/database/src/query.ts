/**
 * @file packages/database/src/query.ts
 * @description Parameterized query runner and atomic transaction manager for PostgreSQL.
 * @module @orchestrai/database
 */

import type { PoolClient, QueryResult, QueryResultRow } from "pg";
import { Logger, loggerWithConfig } from "@yuva-devlab/logger";
import { getOrCreatePool } from "./pool";

const logger = loggerWithConfig(new Logger("DatabaseQuery"));

/**
 * Executes a parameterized SQL query using the connection pool.
 *
 * @param text - SQL query string with parameter placeholders ($1, $2, etc.)
 * @param params - Array of parameter values matching placeholders
 * @returns QueryResult containing rows, count, and field metadata
 */
export async function executeQuery<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[],
): Promise<QueryResult<T>> {
  const pool = getOrCreatePool();
  const startTime = Date.now();
  const result = await pool.query<T>(text, params);
  const durationMs = Date.now() - startTime;

  // Log execution telemetry in debug level
  logger.debug("[DatabaseQuery] Query executed", {
    queryPreview: text.slice(0, 80),
    rowCount: result.rowCount,
    durationMs,
  });

  return result;
}

/**
 * Executes an operation within an isolated PostgreSQL transaction with automatic rollback on error.
 *
 * @param transactionCallback - Async function executing operations with dedicated client
 * @returns Result value returned by transaction callback
 */
export async function runInTransaction<T>(
  transactionCallback: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const pool = getOrCreatePool();
  const client = await pool.connect();

  try {
    // Begin transaction boundary
    await client.query("BEGIN");
    const result = await transactionCallback(client);
    // Commit transaction if callback completes without exception
    await client.query("COMMIT");
    return result;
  } catch (error) {
    // Roll back transaction on any failure to preserve consistency
    await client.query("ROLLBACK");
    logger.error("[DatabaseQuery] Transaction aborted and rolled back", {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  } finally {
    // Always release client back to pool regardless of outcome
    client.release();
  }
}
