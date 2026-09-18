/**
 * @file packages/models/src/index.ts
 * @description Public API surface for `@orchestrai/models`.
 *
 * Package invariant: This package sits in the Infrastructure Adapter layer.
 * It depends on `@orchestrai/core` for all shared contracts and must never
 * be imported by `@orchestrai/core`. Dependency direction is strictly downward.
 *
 * What this package exports:
 *  - ILlmAdapter interface + LlmRequest / LlmResponse / LlmStreamChunk types
 *  - ModelRegistry class for in-process model resolution
 *  - Provider adapters: OllamaAdapter, OpenAiAdapter, AnthropicAdapter
 *  - Config schemas for each adapter (for runtime validation)
 *  - createAdapter() factory function for ergonomic adapter construction
 *  - Pure utilities: mergeUsage(), estimateCost(), enrichUsageWithCost()
 *  - Pricing constants: MODEL_PRICING, resolvePricing()
 */

// ── Interface contract ────────────────────────────────────────────────────────
export * from "./interfaces";

// ── Registry ─────────────────────────────────────────────────────────────────
export * from "./registry";

// ── Provider adapters + their config schemas ──────────────────────────────────
export * from "./adapters";

// ── Factory ───────────────────────────────────────────────────────────────────
export * from "./factory";

// ── Usage utilities + pricing ─────────────────────────────────────────────────
export * from "./utils";
