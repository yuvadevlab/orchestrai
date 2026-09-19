/**
 * @file packages/runtime/src/index.ts
 * @description Public API surface for `@orchestrai/runtime`.
 *
 * ─── Package Invariant ─────────────────────────────────────────────
 * This package implements the Directed StateGraph (DAG) Execution Engine,
 * Durable State Checkpointing, Rewind Time-Travel, Crash Recovery,
 * and Human-in-the-Loop (HITL) Clearance Architecture.
 * ───────────────────────────────────────────────────────────────────
 */

// Directed state graph DAG engine
export * from "./graph";

// Checkpoint persistence, serialization, rewind, and retention layers
export * from "./checkpoint";

// Core graph execution nodes
export * from "./nodes";

// High-level runtime execution coordinator
export * from "./engine";

// Execution crash recovery and resumption manager
export * from "./recovery";

// Human-in-the-Loop (HITL) approval gates, policies, decision engine, and watchdog
export * from "./hitl";
