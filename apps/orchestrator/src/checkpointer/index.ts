/**
 * @file apps/orchestrator/src/checkpointer/index.ts
 * @description Checkpointer factory and PostgreSQL persistence provider for OrchestrAI runtime graphs.
 * @module apps/orchestrator/checkpointer
 */

import { PostgresCheckpointer } from "@orchestrai/runtime";
import { PoolDatabaseQueryRunner } from "./database-query-runner";

export * from "./database-query-runner";

/**
 * Creates an instance of durable PostgresCheckpointer wired with the PostgreSQL query runner.
 *
 * @returns Configured PostgresCheckpointer instance
 */
export function createPostgresCheckpointer<TState = unknown>(): PostgresCheckpointer<TState> {
  const runner = new PoolDatabaseQueryRunner();
  return new PostgresCheckpointer<TState>(runner);
}
