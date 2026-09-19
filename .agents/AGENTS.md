# AGENTS.md — AI Agent Operating Instructions for OrchestrAI

Welcome, Agent. You are pair-programming on **OrchestrAI**, a local-first, modular AI agent orchestration platform.

> **FOR ALL AI ASSISTANTS (Antigravity, Claude Code, GitHub Copilot, Cursor):**
> Master invariants and rules are indexed below. Read and adhere to the relevant rulebooks in `.agents/rules/`.

---

## 1. Modular Rulebook Index

| Rulebook               | Path                                                           | Primary Scope                                                                           |
| :--------------------- | :------------------------------------------------------------- | :-------------------------------------------------------------------------------------- |
| **Core Invariants**    | [`00-core-invariants.md`](.agents/rules/00-core-invariants.md) | 250-line rule, code splitting, detailed JSDoc, explanatory comments, package boundaries |
| **Architecture**       | [`architecture.md`](.agents/rules/architecture.md)             | Layer hierarchy, local-first stack, state machines & outbox pattern                     |
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
