/**
 * @file packages/regex/src/index.ts
 * @description Centralized barrel export for all regular expressions and lexical patterns across OrchestrAI.
 *
 * ─── Package Invariant ─────────────────────────────────────────────
 * This package is the single source of truth for all regular expressions,
 * UUID validators, security redactions, network ranges, and URI patterns.
 * It has zero dependencies to ensure universal monorepo consumption.
 * ───────────────────────────────────────────────────────────────────
 * @module @orchestrai/regex
 */

export * from "./uuid.regex";
export * from "./mode.regex";
export * from "./security.regex";
export * from "./network.regex";
export * from "./uri.regex";
export * from "./text.regex";
export * from "./prompt.regex";
