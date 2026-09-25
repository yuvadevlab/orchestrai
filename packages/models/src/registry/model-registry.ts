/**
 * @file packages/models/src/registry/model-registry.ts
 * @description Singleton-friendly in-process model registry for OrchestrAI.
 *
 * ─── Architecture note ───────────────────────────────────────────────────────
 * The registry is NOT a database — it's an in-memory lookup table populated at
 * application startup (in apps/worker or apps/gateway) by reading environment
 * config and constructing adapters via the factory. The registry then acts as a
 * fast, synchronous resolver for the rest of the system.
 * ────────────────────────────────────────────────────────────────────────────
 */

import { OrchestrAIError } from "@orchestrai/core";
import type { ModelProvider } from "@orchestrai/core";
import type { ModelRegistryEntry, ModelRegistryKey } from "./model-registry.types";

/**
 * In-memory registry that maps `provider/modelName` keys to registered model entries.
 *
 * Usage pattern:
 * ```ts
 * const registry = new ModelRegistry();
 * registry.register({ identifier, capabilities, adapter });
 * const entry = registry.resolve("ollama", "qwen2.5:7b");
 * const response = await entry.adapter.invoke(request);
 * ```
 */
export class ModelRegistry {
  /**
   * Internal storage map using composite `provider/modelName` keys.
   * We use a Map (not a plain object) for O(1) lookup and explicit
   * iteration order — important when listing all registered models.
   */
  private readonly entries: Map<ModelRegistryKey, ModelRegistryEntry> = new Map();

  /**
   * Builds the composite registry key from provider and model name.
   * Kept private because callers should never need to construct keys manually.
   *
   * @param provider - The ModelProvider enum value
   * @param modelName - The provider-specific model string
   * @returns Composite key string `"provider/modelName"`
   */
  private buildKey(provider: ModelProvider, modelName: string): ModelRegistryKey {
    // Normalize to lowercase to prevent case-sensitive duplicates
    // (e.g. "Ollama" and "ollama" referring to the same provider)
    return `${provider.toLowerCase()}/${modelName}` as ModelRegistryKey;
  }

  /**
   * Registers a model entry into the registry.
   * Silently overwrites any existing entry with the same key — this allows
   * hot-reloading of adapter configuration at runtime without restart.
   *
   * @param entry - The model registry entry to store
   */
  register(entry: ModelRegistryEntry): void {
    const key = this.buildKey(entry.identifier.provider, entry.identifier.modelName);
    // Overwrite is intentional: later registrations (e.g. from config reload)
    // should win over earlier ones without throwing an error.
    this.entries.set(key, entry);
  }

  /**
   * Resolves a registered model entry by its provider and model name.
   *
   * @param provider - The ModelProvider to look up
   * @param modelName - The provider-specific model identifier string
   * @returns The registered ModelRegistryEntry
   * @throws {OrchestrAIError} with code NOT_FOUND if the model is not registered
   */
  resolve(provider?: ModelProvider, modelName?: string): ModelRegistryEntry {
    if (provider && modelName) {
      const key = this.buildKey(provider, modelName);
      const entry = this.entries.get(key);
      if (entry) return entry;
    }

    // Fall back to first registered default adapter if present
    const first = this.entries.values().next().value as ModelRegistryEntry | undefined;
    if (first !== undefined) {
      return first;
    }

    throw new OrchestrAIError(
      `No model adapter is registered. Call registry.register() at startup.`,
      "NOT_FOUND",
      404,
      { provider, modelName },
    );
  }

  /**
   * Returns all registered model entries as an ordered array.
   * Order matches insertion order (guaranteed by JavaScript Map semantics).
   *
   * @returns Snapshot array of all registered ModelRegistryEntry objects
   */
  listAll(): ModelRegistryEntry[] {
    return Array.from(this.entries.values());
  }

  /**
   * Returns all entries matching a specific provider.
   * Useful for building "available models" dropdowns scoped to a provider.
   *
   * @param provider - Provider to filter by
   * @returns Array of entries whose identifier.provider matches the given value
   */
  listByProvider(provider: ModelProvider): ModelRegistryEntry[] {
    // Filter the full entry list — O(n) but the registry is small (tens of models)
    return this.listAll().filter((entry) => entry.identifier.provider === provider);
  }

  /**
   * Returns the total count of registered model entries.
   * Useful for health-check endpoints to verify registry was populated at startup.
   *
   * @returns Number of registered entries
   */
  get size(): number {
    return this.entries.size;
  }

  /**
   * Removes all registered entries — primarily useful in test setup/teardown
   * to reset registry state between test cases.
   */
  clear(): void {
    this.entries.clear();
  }
}
