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
