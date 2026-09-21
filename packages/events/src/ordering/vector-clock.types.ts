/**
 * @file packages/events/src/ordering/vector-clock.types.ts
 * @description Types and enums for logical vector clock causal ordering.
 */

/**
 * Mapping of node/agent identifiers to logical sequence counters.
 */
export type VectorClockMap = Record<string, number>;

/**
 * Comparison result when evaluating two vector clocks.
 */
export enum ClockComparison {
  /**
   * Clocks are identical across all nodes.
   */
  EQUAL = "EQUAL",

  /**
   * Clock A strictly causally precedes Clock B.
   */
  BEFORE = "BEFORE",

  /**
   * Clock A strictly causally succeeds Clock B.
   */
  AFTER = "AFTER",

  /**
   * Clocks are concurrent (neither causally precedes the other; split history).
   */
  CONCURRENT = "CONCURRENT",
}
