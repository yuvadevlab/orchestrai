# OrchestrAI Agent Guidelines

The master instructions for all AI agents (Antigravity, Claude Code, GitHub Copilot, Cursor) are located in:
[`.agents/AGENTS.md`](.agents/AGENTS.md)

All agents must read and adhere to:

1. [`.agents/rules/00-core-invariants.md`](.agents/rules/00-core-invariants.md) — 250-line rule, code splitting, detailed JSDoc, explanatory comments.
2. [`.agents/rules/architecture.md`](.agents/rules/architecture.md) — Monorepo boundaries and inward dependency flows.
3. [`.agents/rules/coding-standards.md`](.agents/rules/coding-standards.md) — Strict TypeScript and Zod validation.
4. [`.agents/rules/session-continuity.md`](.agents/rules/session-continuity.md) — Session handoff protocol and progress tracking.
5. [`PROGRESS.md`](PROGRESS.md) — Live phase tracking checklist.
6. **Testing Policy** — While implementing phases, DO NOT implement test cases (unit, e2e, integration) or Storybook stories until explicitly requested by the user.
7. **Zero Hardcoded Strings, Models & Strict Enum Usage** — NO raw hardcoded string literals for domain entities, statuses, roles, event types, modes, scopes, or state transitions (always use shared `Enum.KEY`); zero hardcoded fallback model constants (`DEFAULT_FALLBACK_CANDIDATE`, `"gemma4:31b-cloud"`, `"qwen2.5:7b"`); zero synthetic fallback agents or auto-seeding.
8. **Dynamic Server-Driven Configuration (Big 3 Standard) & Centralized Regex** — NO client or worker application may hardcode operational parameters (slash commands, system prompts, max execution steps, sampling temperatures, compaction thresholds, cache similarity/TTL, RAG chunking parameters, retention policies, or starter suggestions). All operational behaviors must be dynamic, database- or control-plane-driven, served via Gateway APIs (`/api/v1/platform/...`), and cached with stale-while-revalidate IndexedDB persistence. All regexes must originate from `@orchestrai/regex`.
