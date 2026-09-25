/**
 * @file packages/prompts/src/index.ts
 * @description Public entrypoint for `@orchestrai/prompts`.
 *
 * ─── Package Invariant ─────────────────────────────────────────────
 * This package is the centralized repository for prompt templates, system instructions,
 * and specialist personas. It has zero external dependencies beyond `@orchestrai/shared-types`.
 * ───────────────────────────────────────────────────────────────────
 * @module @orchestrai/prompts
 */

export * from "./system";
export * from "./personas";
export * from "./templates";
