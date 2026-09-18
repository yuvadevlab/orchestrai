/**
 * @file packages/agent/src/index.ts
 * @description Public API surface for `@orchestrai/agent`.
 *
 * ─── Package Invariant ─────────────────────────────────────────────
 * This package implements the core Agent Loop, State Transitions,
 * Prompt Compilation, and Mode Strategies for OrchestrAI.
 * ───────────────────────────────────────────────────────────────────
 */

// Agent state machine and loop detection
export * from "./state";

// Prompt compilation pipeline
export * from "./compiler";

// Operating mode strategies (CHAT, PLAN, ACT, AUTO)
export * from "./modes";

// Step controller and execution loop engine
export * from "./loop";

// Fluent agent builder
export * from "./builder";
