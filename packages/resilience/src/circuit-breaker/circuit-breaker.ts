/**
 * Robust Circuit Breaker state machine preventing cascading failures across external dependencies.
 *
 * @module @orchestrai/resilience/circuit-breaker
 */

import { CircuitBreakerOpenError } from "./circuit-breaker-error";
import type {
  CircuitBreakerOptions,
  CircuitBreakerMetrics,
  CircuitState,
} from "./circuit-breaker.types";

/**
 * Circuit Breaker state machine protecting system boundaries by failing fast when
 * downstream dependencies become unhealthy.
 */
export class CircuitBreaker {
  public readonly name: string;
  private state: CircuitState = "CLOSED";
  private consecutiveFailures = 0;
  private consecutiveSuccesses = 0;
  private totalCalls = 0;
  private totalRejections = 0;
  private lastFailureTime: number | null = null;
  private lastSuccessTime: number | null = null;
  private nextAttemptTime: number | null = null;

  private readonly failureThreshold: number;
  private readonly successThreshold: number;
  private readonly cooldownMs: number;
  private readonly isFailurePredicate: (error: unknown) => boolean;
  private readonly onStateChange?: (from: CircuitState, to: CircuitState, name: string) => void;

  /**
   * Initializes a new CircuitBreaker.
   *
   * @param options - Configuration options
   */
  public constructor(options: CircuitBreakerOptions = {}) {
    this.name = options.name ?? "default_circuit_breaker";
    this.failureThreshold = Math.max(1, options.failureThreshold ?? 5);
    this.successThreshold = Math.max(1, options.successThreshold ?? 2);
    this.cooldownMs = Math.max(100, options.cooldownMs ?? 10000);
    this.isFailurePredicate = options.isFailure ?? ((): boolean => true);
    this.onStateChange = options.onStateChange;
  }

  /**
   * Executes an asynchronous operation through the circuit breaker boundary.
   *
   * @template T - Return type
   * @param fn - Asynchronous function to invoke
   * @returns Resolved result of fn
   * @throws {CircuitBreakerOpenError} When circuit is OPEN
   */
  public async execute<T>(fn: () => Promise<T>): Promise<T> {
    this.totalCalls++;

    // Evaluate if OPEN circuit has passed its cooldown period
    if (this.state === "OPEN") {
      if (this.nextAttemptTime !== null && Date.now() >= this.nextAttemptTime) {
        // Cooldown has elapsed: transition to HALF_OPEN to probe dependency health
        this.transitionTo("HALF_OPEN");
      } else {
        // Cooldown still active: fail fast immediately
        this.totalRejections++;
        throw new CircuitBreakerOpenError(
          this.name,
          this.cooldownMs,
          this.nextAttemptTime ?? Date.now(),
        );
      }
    }

    try {
      const result = await fn();
      this.handleSuccess();
      return result;
    } catch (err: unknown) {
      if (this.isFailurePredicate(err)) {
        this.handleFailure();
      }
      throw err;
    }
  }

  /**
   * Records a successful execution and updates state accordingly.
   */
  private handleSuccess(): void {
    this.lastSuccessTime = Date.now();
    this.consecutiveFailures = 0;

    if (this.state === "HALF_OPEN") {
      this.consecutiveSuccesses++;
      // If consecutive probe calls meet success threshold, recover to CLOSED
      if (this.consecutiveSuccesses >= this.successThreshold) {
        this.transitionTo("CLOSED");
      }
    }
  }

  /**
   * Records a failed execution and trips circuit if threshold is reached.
   */
  private handleFailure(): void {
    this.lastFailureTime = Date.now();
    this.consecutiveFailures++;

    if (this.state === "HALF_OPEN") {
      // In HALF_OPEN, ANY single failure immediately trips circuit back to OPEN
      this.transitionTo("OPEN");
    } else if (this.state === "CLOSED" && this.consecutiveFailures >= this.failureThreshold) {
      // In CLOSED, trip to OPEN once failure threshold is breached
      this.transitionTo("OPEN");
    }
  }

  /**
   * Transitions circuit to target state and fires listeners.
   */
  private transitionTo(newState: CircuitState): void {
    if (this.state === newState) {
      return;
    }

    const previousState = this.state;
    this.state = newState;

    if (newState === "OPEN") {
      this.nextAttemptTime = Date.now() + this.cooldownMs;
      this.consecutiveSuccesses = 0;
    } else if (newState === "CLOSED") {
      this.nextAttemptTime = null;
      this.consecutiveFailures = 0;
      this.consecutiveSuccesses = 0;
    } else if (newState === "HALF_OPEN") {
      this.consecutiveSuccesses = 0;
    }

    if (this.onStateChange) {
      this.onStateChange(previousState, newState, this.name);
    }
  }

  /** Retrieves the active circuit breaker state */
  public getState(): CircuitState {
    // If state is OPEN and cooldown has elapsed, return HALF_OPEN
    if (
      this.state === "OPEN" &&
      this.nextAttemptTime !== null &&
      Date.now() >= this.nextAttemptTime
    ) {
      return "HALF_OPEN";
    }
    return this.state;
  }

  /** Retrieves real-time operational metrics */
  public getMetrics(): CircuitBreakerMetrics {
    return {
      name: this.name,
      state: this.getState(),
      consecutiveFailures: this.consecutiveFailures,
      consecutiveSuccesses: this.consecutiveSuccesses,
      totalCalls: this.totalCalls,
      totalRejections: this.totalRejections,
      lastFailureTime: this.lastFailureTime,
      lastSuccessTime: this.lastSuccessTime,
      nextAttemptTime: this.nextAttemptTime,
    };
  }

  /** Manually resets the circuit breaker to closed state */
  public reset(): void {
    this.transitionTo("CLOSED");
  }

  /** Manually forces breaker into OPEN state */
  public forceOpen(): void {
    this.transitionTo("OPEN");
  }

  /** Manually forces breaker into CLOSED state */
  public forceClose(): void {
    this.transitionTo("CLOSED");
  }
}
