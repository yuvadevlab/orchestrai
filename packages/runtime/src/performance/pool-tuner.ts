/**
 * @file pool-tuner.ts
 * @description Connection pool size dynamic tuner for PostgreSQL and Redis.
 * @module @orchestrai/runtime/performance
 */

/** Connection pool tuning recommendations */
export interface PoolConfig {
  readonly minConnections: number;
  readonly maxConnections: number;
  readonly idleTimeoutMs: number;
  readonly connectionTimeoutMs: number;
}

/**
 * Calculates optimal connection pool parameters based on CPU cores and worker concurrency.
 */
export class PoolTuner {
  /**
   * Calculates dynamic PostgreSQL connection pool settings.
   * Formula: max = (CPU cores * 2) + effective_spindle_count + concurrency_boost
   *
   * @param cpuCores - Number of available logical CPU cores.
   * @param workerConcurrency - Active background worker concurrency level.
   * @returns Configured PoolConfig object.
   */
  public static calculatePgPool(cpuCores: number, workerConcurrency: number): PoolConfig {
    const cores = Math.max(1, cpuCores);
    const workers = Math.max(1, workerConcurrency);

    const maxConnections = Math.min(100, cores * 2 + workers);
    const minConnections = Math.max(2, Math.floor(maxConnections / 4));

    return {
      minConnections,
      maxConnections,
      idleTimeoutMs: 30_000,
      connectionTimeoutMs: 5_000,
    };
  }
}
