/**
 * Type definitions and contracts for circuit breakers.
 *
 * @module @orchestrai/resilience/circuit-breaker
 */

/**
 * Valid states of the circuit breaker state machine.
 */
export type CircuitState = "CLOSED" | "OPEN" | "HALF_OPEN";

/**
 * Options configuring a circuit breaker instance.
 */
export interface CircuitBreakerOptions {
  /** Name identifying the monitored external dependency */
  readonly name?: string;
  /** Number of consecutive failures before tripping from CLOSED to OPEN (default: 5) */
  readonly failureThreshold?: number;
  /** Number of consecutive successes required in HALF_OPEN to recover to CLOSED (default: 2) */
  readonly successThreshold?: number;
  /** Cooldown duration in milliseconds while OPEN before testing HALF_OPEN probe (default: 10000) */
  readonly cooldownMs?: number;
  /** Custom predicate deciding if an encountered error counts towards breaker failure */
  readonly isFailure?: (error: unknown) => boolean;
  /** Callback fired whenever state transitions occur */
  readonly onStateChange?: (from: CircuitState, to: CircuitState, breakerName: string) => void;
}

/**
 * Operational metrics exposed by a circuit breaker.
 */
export interface CircuitBreakerMetrics {
  /** Name of the circuit breaker */
  readonly name: string;
  /** Current state of the breaker */
  readonly state: CircuitState;
  /** Total consecutive failures tracked */
  readonly consecutiveFailures: number;
  /** Total successful probe attempts in current HALF_OPEN state */
  readonly consecutiveSuccesses: number;
  /** Total calls processed across lifetime */
  readonly totalCalls: number;
  /** Total calls rejected while circuit was OPEN */
  readonly totalRejections: number;
  /** Epoch timestamp of the last failure or null */
  readonly lastFailureTime: number | null;
  /** Epoch timestamp of the last success or null */
  readonly lastSuccessTime: number | null;
  /** Epoch timestamp when current OPEN state will enter HALF_OPEN cooldown probe */
  readonly nextAttemptTime: number | null;
}
