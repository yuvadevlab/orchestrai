/**
 * @file packages/events/src/index.ts
 * @description Public API surface for `@orchestrai/events` — Bus, Redis Streams, Outbox, and Distributed Consistency.
 */

// Domain event payload schemas, factories, and contracts
export * from "./contracts";

// In-memory event bus implementation
export * from "./bus";

// Redis Streams publisher and consumer group worker
export * from "./redis";

// Transactional Outbox pattern engine and poller
export * from "./outbox";

// Idempotency key tracking, records, and stores
export * from "./idempotency";

// Distributed locking engine and options
export * from "./lock";

// Logical vector clocks and causal event ordering
export * from "./ordering";

// Distributed Saga orchestrator with compensating transactions
export * from "./saga";

// Exactly-once processing deduplication handlers
export * from "./delivery";
