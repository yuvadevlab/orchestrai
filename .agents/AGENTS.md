# AGENTS.md — AI Agent Operating Instructions for OrchestrAI

Welcome, Agent. You are pair-programming on **OrchestrAI**, an enterprise-grade distributed AI agent orchestration platform designed for high-scale autonomous swarms, cognitive reasoning, and sandboxed execution.

> **FOR ALL AI ASSISTANTS (Antigravity, Claude Code, GitHub Copilot, Cursor):**
> Master invariants and rules are indexed below. Read and adhere to the relevant rulebooks in `.agents/rules/`.

---

## 1. Modular Rulebook Index

| Rulebook               | Path                                                           | Primary Scope                                                                           |
| :--------------------- | :------------------------------------------------------------- | :-------------------------------------------------------------------------------------- |
| **Core Invariants**    | [`00-core-invariants.md`](.agents/rules/00-core-invariants.md) | 250-line rule, code splitting, detailed JSDoc, explanatory comments, package boundaries |
| **Architecture**       | [`architecture.md`](.agents/rules/architecture.md)             | Layer hierarchy, distributed execution stack, state machines & outbox pattern           |
| **Coding Standards**   | [`coding-standards.md`](.agents/rules/coding-standards.md)     | Strict TypeScript, Zod schemas, error handling & pure functions                         |
| **Session Continuity** | [`session-continuity.md`](.agents/rules/session-continuity.md) | Handoff protocol, PROGRESS.md checklist, continuation state                             |

---

## 2. Prime Invariants (Zero Exceptions)

1. **Hard 250-Line Maximum Rule**:
   - NO file across `apps/*` or `packages/*` may exceed **250 lines of code**.
   - Whenever a file approaches or reaches **200 lines**, decompose it immediately into focused sub-modules.
   - Every file must have a single, clear responsibility.
2. **Detailed JSDoc & Explanatory Comments**:
   - Every exported symbol (function, class, interface, type, schema) MUST have a comprehensive JSDoc block.
   - Every conditional (`if/else/switch`), guard clause, and state transition MUST have an inline comment explaining **why** it exists and what business invariant or edge case it handles.
3. **Strict Package Boundaries**:
   - `@orchestrai/core` is the absolute source of truth with ZERO internal workspace dependencies.
   - All shared contracts, enums, schemas, and event types must originate from `@orchestrai/core`. Never duplicate.
4. **Conventional Commits & Quality Gates**:
   - Commits must pass `commitlint` (format: `<type>(<scope>): <subject>`).
   - Pre-commit hooks run `lint-staged` with zero ESLint warnings (`--max-warnings=0`).
   - Typechecks must pass: `pnpm typecheck`.
5. **Phase Implementation Testing Policy (Strict)**:
   - While implementing roadmap phases, **DO NOT** write or implement test cases (unit tests, e2e tests, integration tests) or Storybook stories unless explicitly instructed by the user.
   - Focus strictly on production contracts, domain logic, schemas, adapters, state machines, and UI components.
6. **Continuous Session Continuity**:
   - Leave the codebase in an unambiguous, continuation-ready state at the end of every session.
   - Always update [`PROGRESS.md`](PROGRESS.md) and log in [`IMPLEMENTATION-LOG.md`](IMPLEMENTATION-LOG.md).
7. **Zero Hardcoded Strings, Models & Strict Enum Usage**:
   - NO raw hardcoded string literals or magic numbers for domain entities, statuses, roles, event types, modes, scopes, or state transitions.
   - All statuses, events, roles, and modes must be canonical enums in `@orchestrai/shared-types`.
   - Always check and compare using `Enum.KEY` (e.g. `status === ExecutionStatus.COMPLETED`, `role === MessageRole.USER`), NEVER bare strings like `"completed"`.
   - NO hardcoded fallback model constants (e.g. `"gemma4:31b-cloud"`, `"qwen2.5:7b"`) or fallback candidate objects (`DEFAULT_FALLBACK_CANDIDATE`). All models must be DB- or env-driven.
   - NO synthetic agent auto-seeding (`DEFAULT_SUPERVISOR`, `Lead Orchestrator`). If a tenant has no agent, fail fast and instruct the user to create one in the Studio.
8. **Dynamic Server-Driven Configuration (Big 3 Standard) & Centralized Regex**:
   - NO client or worker application may hardcode operational parameters (slash commands, system prompts, max execution steps, sampling temperatures, compaction thresholds, cache similarity/TTL, RAG chunking parameters, retention policies, or starter suggestions).
   - All operational behaviors must be dynamic, database- or control-plane-driven, served via Gateway APIs (`/api/v1/platform/...`), and cached with stale-while-revalidate IndexedDB persistence.
   - All regular expressions across all apps and packages must originate from `@orchestrai/regex`. Zero inline regexes.
