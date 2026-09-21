/**
 * Out-of-the-box resilience pipeline configured for LLM model provider invocations.
 *
 * @module @orchestrai/resilience/adapters
 */

import { ResiliencePipeline } from "@/pipeline";
import type { FallbackHandler } from "@/fallback";

/**
 * Options tailoring resilience policies for LLM model calls.
 */
export interface ModelResilienceOptions<T> {
  /** Model provider or identifier name (e.g. 'openai-gpt-4o', 'ollama-llama3') */
  readonly modelName?: string;
  /** Bounded timeout for model completion in milliseconds (default: 60000ms) */
  readonly timeoutMs?: number;
  /** Maximum retry attempts for transient API drops (default: 3) */
  readonly maxRetries?: number;
  /** Maximum concurrent LLM requests to throttle provider bandwidth (default: 8) */
  readonly maxConcurrency?: number;
  /** Circuit breaker failure threshold before tripping (default: 5) */
  readonly failureThreshold?: number;
  /** Circuit breaker cooldown duration in milliseconds (default: 15000ms) */
  readonly cooldownMs?: number;
  /** Optional fallback handler (e.g. redirecting to secondary model) */
  readonly fallbackModelHandler?: FallbackHandler<T>;
}

/**
 * Creates a pre-configured, production-ready ResiliencePipeline tailored for LLM operations.
 *
 * @template T - Return type of the LLM generation call
 * @param options - Customization options
 * @returns Configured ResiliencePipeline instance
 */
export function createModelResiliencePipeline<T>(
  options: ModelResilienceOptions<T> = {},
): ResiliencePipeline<T> {
  const modelName = options.modelName ?? "llm_provider";
  const builder = ResiliencePipeline.builder<T>()
    .withTimeout(options.timeoutMs ?? 60000, {
      operationName: `model_completion:${modelName}`,
    })
    .withBulkhead({
      name: `bulkhead:model:${modelName}`,
      maxConcurrent: options.maxConcurrency ?? 8,
      maxQueueSize: 20,
    })
    .withCircuitBreaker({
      name: `circuit_breaker:model:${modelName}`,
      failureThreshold: options.failureThreshold ?? 5,
      successThreshold: 2,
      cooldownMs: options.cooldownMs ?? 15000,
    })
    .withRetry({
      maxAttempts: options.maxRetries ?? 3,
      initialDelayMs: 500,
      maxDelayMs: 8000,
      backoffStrategy: "exponential",
      jitterStrategy: "full",
    });

  if (options.fallbackModelHandler) {
    builder.withFallback(options.fallbackModelHandler);
  }

  return builder.build();
}
