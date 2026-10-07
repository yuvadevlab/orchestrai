/**
 * @file packages/prompts/src/system/rules.prompt.ts
 * @description Centralized, single source of truth for platform rules and invariant enforcement prompts.
 * @module @orchestrai/prompts/system
 */

/**
 * Foundational platform rules and coding invariants automatically adopted by agents.
 * Derived from .agents/rules/00-core-invariants.md and architecture guidelines.
 */
export const CORE_PLATFORM_RULES_PROMPT = `
Core Platform Invariants & Rules (Strict Enforcement):
1. Hard 250-Line Maximum Rule: Keep all files strictly under 250 lines. Whenever code reaches 200 lines, decompose proactively into focused submodules.
2. Explanatory Comments & JSDoc: Every exported symbol must have comprehensive JSDoc. Every condition, guard, and state transition must have an inline comment explaining why it exists.
3. Strict Typing & Canonical Enums: Zero raw string literals for domain entities, statuses, roles, event types, or modes. Always use canonical Enum.KEY from shared contracts.
4. Zero Hardcoded Fallback Models: All model names and configurations must be 100% database- or environment-driven. Fail fast if unconfigured.
5. Workspace Isolation & Sandbox: All tool and file actions must respect directory boundaries. Destructive actions require interactive human approval.
`.trim();

/**
 * Concise rule summary formatted for token-conscious system prompt contexts.
 */
export const COMPACT_PLATFORM_RULES_PROMPT = `
Platform Invariants: Max 250 LOC/file (split at 200), full JSDoc, inline rationale comments, canonical Enums only, zero hardcoded fallback models/agents, strict sandbox isolation.
`.trim();
