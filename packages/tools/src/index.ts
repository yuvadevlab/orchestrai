/**
 * @file packages/tools/src/index.ts
 * @description Public API surface for `@orchestrai/tools`.
 *
 * ─── Package Invariant ─────────────────────────────────────────────
 * This package implements the Tool Execution and Security Perimeter layer.
 * It depends exclusively on `@orchestrai/core` and `@orchestrai/shared-types`.
 * ───────────────────────────────────────────────────────────────────
 */

// Tool contracts and interfaces
export * from "./interfaces";

// Security perimeter and sandbox jail utilities
export * from "./security";

// Tool registry and format converters
export * from "./registry";

// Sandboxed execution runner
export * from "./runner";

// Built-in tool implementations
export * from "./builtins";

// Capability enum, scoped grants, and grant evaluator
export * from "./capabilities";

// DENY-first RBAC/ABAC policy engine and memory store
export * from "./policy";

// Network allowlist (SSRF) and per-execution resource quota
export * from "./sandbox";

// Immutable sandbox context and full 5-layer security stack executor
export * from "./executor";

// SecurityAuditEvent schema, AuditLogger, and IAuditStore
export * from "./audit";
