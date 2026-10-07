/**
 * @file packages/database/src/seed-platform-data.ts
 * @description Centralized export for platform blueprints across cognitive policies, prompts, configs, and flags.
 * Sourced directly from modular seeders adhering strictly to the < 250 LOC rule.
 * @module @orchestrai/database
 */

export * from "./seeds/seed-cognitive-policies";
export * from "./seeds/seed-system-prompts";
export * from "./seeds/seed-platform-configs";
export * from "./seeds/seed-feature-flags";
