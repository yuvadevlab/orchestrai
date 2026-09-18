/**
 * @file packages/models/src/registry/model-registry.types.ts
 * @description Type definitions for entries stored in the ModelRegistry.
 */

import type { ModelIdentifier, ModelCapabilities } from "@orchestrai/core";
import type { ILlmAdapter } from "@/interfaces";

/**
 * A registered model entry combining its identifier, capability matrix,
 * and the resolved adapter instance that will execute requests.
 *
 * Learning note — why store the adapter instance here?
 * The registry acts as an object pool. Rather than constructing a new
 * OllamaAdapter on every request (which might re-establish connections),
 * we construct it once at registration time and reuse the same instance.
 * This is the Flyweight pattern applied to adapter management.
 */
export interface ModelRegistryEntry {
  /** Full model identifier — provider, name, context window, endpoint */
  readonly identifier: ModelIdentifier;

  /** Feature capability matrix for routing decisions (e.g. skip if !supportsVision) */
  readonly capabilities: ModelCapabilities;

  /**
   * The live adapter instance responsible for executing requests to this model.
   * Lazy-initialised by the factory; must satisfy ILlmAdapter.
   */
  readonly adapter: ILlmAdapter;
}

/**
 * Composite lookup key used internally by the registry map.
 * Format: `"<provider>/<modelName>"` — e.g. `"ollama/qwen2.5:7b"`
 */
export type ModelRegistryKey = `${string}/${string}`;
