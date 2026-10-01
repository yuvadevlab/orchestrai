/**
 * @file packages/shared-types/src/enums/intelligence.enums.ts
 * @description Enumerations governing model routing cascades, billing ledgers, and semantic caching.
 * @module @orchestrai/shared-types/enums
 */

/**
 * Routing strategy algorithms used by the model router.
 */
export enum RoutingStrategy {
  ROUND_ROBIN = "round_robin",
  LOWEST_LATENCY = "lowest_latency",
  LEAST_EXPENSIVE = "least_expensive",
  PRIORITY_FALLBACK = "priority_fallback",
}

/**
 * Diagnostic reason for triggering a provider fallback cascade.
 */
export enum RouterFallbackReason {
  RATE_LIMITED = "rate_limited",
  TIMEOUT = "timeout",
  PROVIDER_UNAVAILABLE = "provider_unavailable",
  CONTEXT_EXCEEDED = "context_exceeded",
  HTTP_ERROR = "http_error",
}

/**
 * Granular classification of cost-bearing usage entries in the billing ledger.
 */
export enum BillingLedgerEntryType {
  PROMPT = "prompt",
  COMPLETION = "completion",
  EMBEDDING = "embedding",
  TOOL_EXECUTION = "tool_execution",
}

/**
 * Enforcement actions executed by tenant budget quotas.
 */
export enum BillingEnforcementAction {
  ALLOW = "allow",
  WARN = "warn",
  THROTTLE = "throttle",
  BLOCK = "block",
}

/**
 * Lookup result classification from the semantic cache.
 */
export enum CacheHitStatus {
  HIT = "hit",
  MISS = "miss",
  EXPIRED = "expired",
  BYPASS = "bypass",
}
