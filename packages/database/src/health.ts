/**
 * @file packages/database/src/health.ts
 * @description Health check probes and latency diagnostics for PostgreSQL.
 * @module @orchestrai/database
 */

import { getOrCreatePool } from "./pool";
import type { DatabaseHealthStatus } from "./types";

/**
 * Executes a round-trip connectivity probe (`SELECT 1`) to verify database health and pool stats.
 *
 * @returns DatabaseHealthStatus object containing latency and pool metrics
 */
export async function checkDatabaseHealth(): Promise<DatabaseHealthStatus> {
  const startTime = Date.now();

  try {
    const pool = getOrCreatePool();
    // Execute low-overhead ping query
    await pool.query("SELECT 1 AS ping");
    const latencyMs = Date.now() - startTime;

    return {
      isHealthy: true,
      latencyMs,
      poolStats: {
        totalCount: pool.totalCount,
        idleCount: pool.idleCount,
        waitingCount: pool.waitingCount,
      },
    };
  } catch (error) {
    const latencyMs = Date.now() - startTime;
    return {
      isHealthy: false,
      latencyMs,
      poolStats: {
        totalCount: 0,
        idleCount: 0,
        waitingCount: 0,
      },
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
