/**
 * Type definitions and contracts for fallback and graceful degradation strategies.
 *
 * @module @orchestrai/resilience/fallback
 */

/**
 * Handler invoked to compute a graceful degradation value upon primary task failure.
 */
export type FallbackHandler<T> = (error: unknown) => Promise<T> | T;

/**
 * Configuration options for fallback policies.
 */
export interface FallbackOptions<T> {
  /** Predicate determining whether the encountered error qualifies for fallback activation */
  readonly shouldHandle?: (error: unknown) => boolean;
  /** Callback fired immediately when fallback execution is engaged */
  readonly onFallback?: (error: unknown, fallbackResult: T) => void;
}
