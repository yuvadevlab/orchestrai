/**
 * Out-of-the-box resilience pipeline configured for database transactions and queries.
 *
 * @module @orchestrai/resilience/adapters
 */

import { ResiliencePipeline } from "@/pipeline";

/**
 * Options tailoring resilience policies for database queries.
 */
export interface DatabaseResilienceOptions {
  /** Database operation name */
  readonly operationName?: string;
  /** Bounded timeout for query in milliseconds (default: 5000ms) */
  readonly timeoutMs?: number;
  /** Maximum concurrent database connections allowed through this bulkhead (default: 20) */
  readonly maxConcurrency?: number;
  /** Maximum retry attempts on transient connection drops (default: 3) */
  readonly maxRetries?: number;
}

/**
 * Creates a pre-configured ResiliencePipeline tailored for database operations.
 *
 * @template T - Return type of query
 * @param options - Customization options
 * @returns Configured ResiliencePipeline instance
 */
export function createDatabaseResiliencePipeline<T>(
  options: DatabaseResilienceOptions = {},
): ResiliencePipeline<T> {
  const operationName = options.operationName ?? "database_query";
  return ResiliencePipeline.builder<T>()
    .withTimeout(options.timeoutMs ?? 5000, {
      operationName: `db:${operationName}`,
    })
    .withBulkhead({
      name: `bulkhead:db:${operationName}`,
      maxConcurrent: options.maxConcurrency ?? 20,
      maxQueueSize: 50,
    })
    .withRetry({
      maxAttempts: options.maxRetries ?? 3,
      initialDelayMs: 100,
      maxDelayMs: 2000,
      backoffStrategy: "exponential",
      jitterStrategy: "full",
    })
    .build();
}
