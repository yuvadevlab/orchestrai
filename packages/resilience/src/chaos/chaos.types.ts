/**
 * Type definitions and contracts for synthetic fault injection and chaos testing.
 *
 * @module @orchestrai/resilience/chaos
 */

/**
 * Configuration options for chaos injection experiments.
 */
export interface ChaosConfig {
  /** Master toggle activating or deactivating fault injection (default: false) */
  readonly enabled?: boolean;
  /** Probability of injecting a failure, between 0.0 (never) and 1.0 (always) (default: 0) */
  readonly failureRate?: number;
  /** Minimum artificial delay in milliseconds to inject (default: 0) */
  readonly latencyMinMs?: number;
  /** Maximum artificial delay in milliseconds to inject (default: 0) */
  readonly latencyMaxMs?: number;
  /** Custom factory generating synthetic errors */
  readonly errorFactory?: (context?: string) => Error;
}

/**
 * Telemetry counters tracking chaos injection activity.
 */
export interface ChaosMetrics {
  /** Total operations passed through chaos boundary */
  readonly totalCalls: number;
  /** Total synthetic errors injected */
  readonly injectedFailures: number;
  /** Total synthetic latency delays injected */
  readonly injectedLatencies: number;
  /** Cumulative artificial milliseconds added */
  readonly totalInjectedDelayMs: number;
}
