/**
 * Master entrypoint for `@orchestrai/resilience`.
 *
 * Provides enterprise-grade fault-tolerance primitives:
 * - Hierarchical Deadlines & Bounded Timeouts (`withTimeout`, `DeadlineContext`)
 * - Exponential Backoff with Jitter (`retryAsync`, full/equal/decorrelated jitter, error classifiers)
 * - Circuit Breaker State Machine (`CircuitBreaker`, fast-failing `CircuitBreakerOpenError`)
 * - Bulkhead Concurrency Isolation (`Bulkhead`, `BulkheadRejectedError`)
 * - Token Bucket Rate Limiting (`TokenBucket`, `RateLimitExceededError`)
 * - Fallback Graceful Degradation (`withFallback`)
 * - Composable Resilience Pipeline (`ResiliencePipeline`)
 * - Chaos Testing & Fault Injection (`ChaosInjector`)
 * - Pre-configured adapters for models, tools, and databases
 *
 * @module @orchestrai/resilience
 */

export * from "@/deadline";
export * from "@/retry";
export * from "@/circuit-breaker";
export * from "@/bulkhead";
export * from "@/fallback";
export * from "@/ratelimit";
export * from "@/pipeline";
export * from "@/chaos";
export * from "@/adapters";
