/**
 * Error raised when a call is rejected because the circuit breaker is OPEN.
 *
 * @module @orchestrai/resilience/circuit-breaker
 */

/**
 * Standard fast-fail error thrown when attempting to execute across an OPEN circuit breaker.
 */
export class CircuitBreakerOpenError extends Error {
  /** Machine-readable error code */
  public readonly code = "CIRCUIT_BREAKER_OPEN" as const;
  /** Name of the unhealthy dependency */
  public readonly breakerName: string;
  /** Duration of the active cooldown in milliseconds */
  public readonly cooldownMs: number;
  /** Estimated epoch timestamp when probe calls will be permitted */
  public readonly resetAt: number;

  /**
   * Constructs a new CircuitBreakerOpenError.
   *
   * @param breakerName - Name of the circuit breaker
   * @param cooldownMs - Cooldown duration in milliseconds
   * @param resetAt - Estimated epoch timestamp of probe availability
   */
  public constructor(breakerName: string, cooldownMs: number, resetAt: number) {
    super(
      `Circuit breaker '${breakerName}' is OPEN. Fast-failing calls until cooldown expires at ${new Date(
        resetAt,
      ).toISOString()}`,
    );
    this.name = "CircuitBreakerOpenError";
    this.breakerName = breakerName;
    this.cooldownMs = cooldownMs;
    this.resetAt = resetAt;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}
