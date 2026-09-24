/**
 * @file packages/database/src/types.ts
 * @description Type definitions for database connection configuration, query options, and health metrics.
 * @module @orchestrai/database
 */

import type { PoolConfig } from "pg";

/**
 * Database client configuration options.
 */
export interface DatabaseConfig extends Partial<PoolConfig> {
  /** Full connection string URI (e.g. postgresql://user:pass@localhost:5432/db) */
  connectionString?: string;
  /** Maximum number of active connections in the pool */
  maxPoolSize?: number;
  /** Idle client timeout in milliseconds before closing connection */
  idleTimeoutMillis?: number;
  /** Connection establishment timeout in milliseconds */
  connectionTimeoutMillis?: number;
}

/**
 * Result structure returned from database health and connectivity probes.
 */
export interface DatabaseHealthStatus {
  /** Whether database is reachable and accepting queries */
  isHealthy: boolean;
  /** Round-trip ping latency in milliseconds */
  latencyMs: number;
  /** Current active and idle connections in pool */
  poolStats: {
    totalCount: number;
    idleCount: number;
    waitingCount: number;
  };
  /** Error message if connectivity probe failed */
  error?: string;
}

/**
 * Tenant context parameters for row-level isolated queries.
 */
export interface TenantScope {
  /** Unique tenant identifier enforcing data boundary */
  tenantId: string;
  /** Optional user identifier within the tenant scope */
  userId?: string;
}
