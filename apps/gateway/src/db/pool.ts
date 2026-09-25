/**
 * @file apps/gateway/src/db/pool.ts
 * @description PostgreSQL connection pool management and transaction execution for Gateway services.
 * @module apps/gateway/db
 */

import { Pool, type PoolClient, type QueryResult, type QueryResultRow } from "pg";
import { Logger, loggerWithConfig } from "@yuva-devlab/logger";
import { loadGatewayConfig } from "@/config";

const logger = loggerWithConfig(new Logger("DatabasePool"));

let poolInstance: Pool | null = null;

/**
 * Returns the singleton PostgreSQL connection pool instance.
 *
 * @returns Configured pg.Pool
 */
export function getDbPool(): Pool {
  if (!poolInstance) {
    const config = loadGatewayConfig();
    const connectionString = config.databaseUrl || process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error(
        "Missing required DATABASE_URL. Ensure DATABASE_URL is declared in environment.",
      );
    }

    poolInstance = new Pool({
      connectionString,
      max: config.dbPoolMax,
      idleTimeoutMillis: config.dbPoolIdleTimeoutMs,
      connectionTimeoutMillis: config.dbPoolConnectionTimeoutMs,
    });

    poolInstance.on("error", (err) => {
      logger.error("[DatabasePool] Unexpected idle client error", { error: err.message });
    });

    logger.info("[DatabasePool] Initialized PostgreSQL connection pool", {
      connectionString: connectionString.replace(/:[^:@]+@/, ":****@"),
    });
  }

  return poolInstance;
}

/**
 * Executes a parameterized query using a pool client.
 *
 * @param text - SQL query string
 * @param params - Query parameters
 * @returns QueryResult
 */
export async function dbQuery<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[],
): Promise<QueryResult<T>> {
  const pool = getDbPool();
  const start = Date.now();
  const result = await pool.query<T>(text, params);
  const duration = Date.now() - start;

  logger.debug("[DatabasePool] Executed query", {
    query: text.slice(0, 80),
    rowCount: result.rowCount,
    durationMs: duration,
  });

  return result;
}

/**
 * Executes operations within an atomic PostgreSQL transaction.
 *
 * @param fn - Callback executing queries on the isolated PoolClient
 * @returns Result of callback function
 */
export async function withTransaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const pool = getDbPool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    logger.error("[DatabasePool] Transaction rolled back due to error", {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Closes all pool connections during graceful shutdown.
 */
export async function closeDbPool(): Promise<void> {
  if (poolInstance) {
    logger.info("[DatabasePool] Draining database connection pool");
    await poolInstance.end();
    poolInstance = null;
  }
}
