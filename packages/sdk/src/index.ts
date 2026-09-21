/**
 * @file packages/sdk/src/index.ts
 * @description Central entry point and public API exports for `@orchestrai/sdk`.
 */

import { OrchestrAIClient } from "./client";
import type { OrchestrAIClientOptions } from "./types";

export * from "./types";
export * from "./security";
export * from "./errors";
export * from "./transport";
export * from "./streaming";
export * from "./resources";
export * from "./client";

/**
 * Convenient factory function creating an initialized OrchestrAIClient.
 *
 * @param options - Client initialization options (credentials, endpoints, budgets)
 * @returns Configured OrchestrAIClient instance
 */
export function createOrchestrAIClient(options: OrchestrAIClientOptions = {}): OrchestrAIClient {
  return new OrchestrAIClient(options);
}
