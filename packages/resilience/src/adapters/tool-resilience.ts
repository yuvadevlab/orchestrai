/**
 * Out-of-the-box resilience pipeline configured for external tool executions.
 *
 * @module @orchestrai/resilience/adapters
 */

import { ResiliencePipeline } from "@/pipeline";
import type { FallbackHandler } from "@/fallback";

/**
 * Options tailoring resilience policies for agent tool executions.
 */
export interface ToolResilienceOptions<T> {
  /** Descriptive name of the tool (e.g. 'web_scraper', 'bash_executor') */
  readonly toolName?: string;
  /** Bounded timeout for tool execution in milliseconds (default: 15000ms) */
  readonly timeoutMs?: number;
  /** Maximum concurrent tool executions across workers (default: 10) */
  readonly maxConcurrency?: number;
  /** Circuit breaker failure threshold before tripping (default: 3) */
  readonly failureThreshold?: number;
  /** Circuit breaker cooldown duration in milliseconds (default: 10000ms) */
  readonly cooldownMs?: number;
  /** Optional fallback handler producing default safe output on failure */
  readonly fallbackHandler?: FallbackHandler<T>;
}

/**
 * Creates a pre-configured ResiliencePipeline tailored for external tool executions.
 *
 * @template T - Return type of tool execution
 * @param options - Customization options
 * @returns Configured ResiliencePipeline instance
 */
export function createToolResiliencePipeline<T>(
  options: ToolResilienceOptions<T> = {},
): ResiliencePipeline<T> {
  const toolName = options.toolName ?? "agent_tool";
  const builder = ResiliencePipeline.builder<T>()
    .withTimeout(options.timeoutMs ?? 15000, {
      operationName: `tool_execution:${toolName}`,
    })
    .withBulkhead({
      name: `bulkhead:tool:${toolName}`,
      maxConcurrent: options.maxConcurrency ?? 10,
      maxQueueSize: 10,
    })
    .withCircuitBreaker({
      name: `circuit_breaker:tool:${toolName}`,
      failureThreshold: options.failureThreshold ?? 3,
      successThreshold: 1,
      cooldownMs: options.cooldownMs ?? 10000,
    })
    .withRetry({
      maxAttempts: 2,
      initialDelayMs: 300,
      maxDelayMs: 3000,
      backoffStrategy: "exponential",
      jitterStrategy: "full",
    });

  if (options.fallbackHandler) {
    builder.withFallback(options.fallbackHandler);
  }

  return builder.build();
}
