/**
 * @file packages/events/src/ordering/index.ts
 * @description Vector clock and causal event ordering exports.
 */

// VectorClockMap type and ClockComparison enum
export * from "./vector-clock.types";

// VectorClock class implementation
export * from "./vector-clock";

// OrderedDomainEvent schema and type definitions
export * from "./ordered-event.schema";
