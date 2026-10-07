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
2. **Detailed JSDoc & Explanatory Block Comments**:
   - Every exported symbol (function, class, interface, type, schema, page component) MUST have a comprehensive JSDoc block.
   - Every conditional (`if/else/switch`), guard clause, async call, calculation, and state transition MUST have an explanatory comment explaining **why** it exists and what edge case it handles to enable manual debugging of AI-generated code.
3. **Strict Package Boundaries & Authoritative Barrels**:
   - `@orchestrai/core` is the absolute source of truth with ZERO internal workspace dependencies.
   - All shared contracts, enums, schemas, and event types must originate from `@orchestrai/core` or `@orchestrai/shared-types`.
   - **Barrel Imports**: Always import from barrel index files (e.g. `@orchestrai/shared-types`, `@/features/tools/api`) rather than deep sub-paths (e.g. `../folder/**` or `@/folder/sub/sub/file.ts`).
   - **No Conflicting Barrels**: Every directory has at most one single barrel file (`index.ts`). Never maintain competing files like `constants.ts` next to a `constants/` folder.
4. **Standardized Logger Formatting (`@yuva-devlab/logger`)**:
   - Instantiate logger as `new Logger("ClassName")` (or `loggerWithConfig(new Logger("ClassName"))`).
   - Log message pattern: `"methodName: description of action"` with metadata object as second argument (e.g. `this.logger.info("listProviders: fetching providers", { tenantId })`).
   - Do NOT duplicate the class name in the message string (avoid `"[ClassName] description"` or `"[MethodName]"`).
5. **Zero Hardcoded Strings, Keys, Models & Strict Enum Usage**:
   - NO raw hardcoded string literals or magic numbers for domain entities, statuses, roles, event types, modes, scopes, HTTP methods (`HttpMethod`), outcomes (`StepOutcome`), or state transitions.
   - Parameter keys, route params, query keys, headers (e.g. `QUERY_PARAMS.PROVIDER_ID`, `ROUTE_PARAMS.AGENT_ID`, `ADMIN_ROUTES.LLM_PROVIDER`) must be centralized constants.
   - Always compare and branch using `Enum.KEY` (e.g. `status === ExecutionStatus.COMPLETED`).
   - Zero hardcoded fallback model constants (`DEFAULT_FALLBACK_CANDIDATE`, `"gemma4:31b-cloud"`, `"qwen2.5:7b"`). All models must be DB- or env-driven.
   - Zero hardcoded fallback responses in API hooks (e.g. `use-platform-welcome.ts` must not return static mock chips; must be server-driven).
   - Zero synthetic agent auto-seeding (`DEFAULT_SUPERVISOR`, `Lead Orchestrator`). Fail fast if not found.
6. **Dynamic Server-Driven Configuration (Big 3 Standard) & Centralized Regex**:
   - All operational parameters, slash commands, system prompts, max execution steps, temperatures, and suggestions must be dynamic and served via Gateway APIs.
   - All regular expressions across all apps and packages must originate from `@orchestrai/regex`. Zero inline regexes.
7. **Conventional Commits & Quality Gates**:
   - Commits must pass `commitlint` (format: `<type>(<scope>): <subject>`).
   - Pre-commit hooks run `lint-staged` with zero ESLint warnings (`--max-warnings=0`).
   - Typechecks must pass: `pnpm typecheck`.
8. **Phase Implementation Testing Policy (Strict)**:
   - While implementing roadmap phases, **DO NOT** write or implement test cases (unit tests, e2e tests, integration tests) or Storybook stories unless explicitly instructed by the user.
   - Focus strictly on production contracts, domain logic, schemas, adapters, state machines, and UI components.
9. **Continuous Session Continuity**:
   - Leave the codebase in an unambiguous, continuation-ready state at the end of every session.
   - Always update [`PROGRESS.md`](PROGRESS.md) and log in [`IMPLEMENTATION-LOG.md`](IMPLEMENTATION-LOG.md).
