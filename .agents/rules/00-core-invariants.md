# OrchestrAI Core Invariants & Universal Rules

> **MANDATORY FOR ALL AI AGENTS & CODING ASSISTANTS (Antigravity, Claude Code, GitHub Copilot, Cursor):**
> These core rules apply to every package, application, and file in the OrchestrAI monorepo. They must never be bypassed.

---

## 1. Hard Line-Count Rule — Maximum 250 Lines

1. **Strict 250-Line Maximum**: NO file in `apps/*`, `packages/*`, or infrastructure may exceed **250 lines of code**.
2. **Proactive Decomposition at 200 Lines**: Whenever a file approaches or reaches **200 lines**, immediately decompose it:
   - **Contracts & Schemas**: Split broad schemas into domain-specific files (`*.schema.ts`, `*.types.ts`, `*.constants.ts`).
   - **Agent Runtime & Nodes**: Extract sub-nodes, edge routers, and state transition handlers into individual module files.
   - **Tools & Executors**: Extract validator functions, error mappings, and execution sandboxes into dedicated helper files.
   - **Frontend Components**: Extract custom hooks, subcomponents, modal dialogues, and item renderers into dedicated files.
3. **Single Responsibility & Purpose**: Every file must have one clear, unambiguous responsibility. Avoid "kitchen-sink" utility or grab-bag files.

---

## 2. Documentation & Commenting Invariants

1. **Detailed JSDoc Comments**:
   - Every exported function, class, method, interface, type, and Zod schema MUST have comprehensive JSDoc documentation.
   - Document `@param`, `@returns`, `@throws`, and provide usage examples where non-trivial.
2. **Explanatory Inline Comments**:
   - Every conditional branch (`if`, `else`, `switch`), guard clause, state machine transition, and error-recovery block MUST have an inline comment explaining **why** the check exists, what business invariant is being protected, and what failure mode is handled.
   - Avoid trivial restatements (e.g., `// check if x is null`); explain the engineering intent (e.g., `// Ensure checkpoint exists before state rewind to prevent dangling execution graphs`).

---

## 3. Monorepo Package Boundaries & Inward Dependency Flow

```text
Apps (gateway, worker, realtime, console)
  │
  ▼
Domain Packages (agent, runtime, memory, rag, queue, events)
  │
  ▼
Infrastructure Adapters (models, tools, observability, sdk)
  │
  ▼
Core Contracts (@orchestrai/core)
```

- **Core Contract Purity**: `@orchestrai/core` contains shared domain contracts, Zod schemas, error definitions, and lifecycle event types. It has **zero internal workspace dependencies** and zero I/O side-effects.
- **Never Duplicate Contracts**: Enums, types, and schemas must never be duplicated across apps or packages. All shared types must originate from `@orchestrai/core`.
- **Pure Functions First**: Mathematical calculations, prompt assembly, and token budget calculations must be pure functions with zero database or network side-effects.

---

## 4. Conventional Commits & Quality Gates

- All commits must strictly adhere to the Conventional Commits specification enforced by `@commitlint/cli` and `husky`:
  - Format: `<type>(<scope>): <subject>`
  - Scopes: must match monorepo apps, packages, tooling, or infra.
- Pre-commit checks run `lint-staged`: ESLint with zero warnings (`--max-warnings=0`) and Prettier formatting.
- Typechecks must pass cleanly: `pnpm typecheck` across all packages.

---

## 5. Zero Hardcoded Strings, Constants, Models & Strict Enum Usage Invariant

- **Zero Raw String Literals for Domain Entities & Parameters**: NO raw hardcoded string literals or magic values may be stored, dispatched, or compared for domain entities, statuses, roles, event types, modes, scopes, HTTP methods (`HttpMethod`), outcomes (`StepOutcome`), parameter keys (`QUERY_PARAMS`, `ROUTE_PARAMS`), or state transitions.
- **Shared Canonical Enums**: ALL domain statuses, roles, modes, event names, and error codes MUST be defined as canonical TypeScript enums in `@orchestrai/shared-types` (or `@orchestrai/core`).
- **Always Check with `Enum.KEY`**: When checking, matching, or branching on any value, agents MUST use `Enum.KEY` (e.g., `status === ExecutionStatus.COMPLETED`, `event.type === OrchestratorEventType.START`, `role === MessageRole.USER`). Never use raw string comparisons like `status === "completed"` or `"user"`.
- **Zod Schemas Bound to Enums**: All validation schemas must use `z.nativeEnum(MyEnum)` or `z.enum([...])` sourced directly from canonical enum keys.
- **Centralized Parameter Keys & Constants**: Parameter keys (such as `providerId`, `agentId`, `executionId`, `sessionId`) and route paths must be defined in `@orchestrai/shared-types/constants`. Sourced from a single authoritative definition.
- **Zero Hardcoded Models or Fallback Constants**: NO hardcoded model names (e.g. `"gemma4:31b-cloud"`, `"qwen2.5:7b"`) or fallback candidate objects (e.g. `DEFAULT_FALLBACK_CANDIDATE`). All models must be dynamically resolved from database records or the `DEFAULT_MODEL_NAME` environment variable.
- **Zero Hardcoded Mock Responses**: Frontends and API hooks must NEVER return static mock arrays or chips as fallbacks. All data must be server-driven.
- **Zero Synthetic Agents or Auto-Seeding**: Never auto-seed or inject synthetic fallback agents (e.g. `DEFAULT_SUPERVISOR`, `Lead Orchestrator`) in service layers or repositories. If no agent exists, fail fast and explicitly instruct the user to create one in the Studio.

---

## 6. Barrel Imports & Standardized Logging (`@yuva-devlab/logger`)

- **Barrel Imports**: Always import from barrel index files (e.g. `@orchestrai/shared-types`, `@/features/tools/api`) rather than deep sub-paths (`../folder/**`). Every sub-module with multiple files must have a single authoritative `index.ts`. Never create conflicting barrel files (e.g. no `constants.ts` next to a `constants/` folder).
- **Logger Format**:
  - Instantiate via `new Logger("ClassName")` or `loggerWithConfig(new Logger("ClassName"))`.
  - Log messages MUST strictly follow `"methodName: description of the action"` with JSON metadata as the second parameter (e.g. `this.logger.info("listProviders: fetching providers", { tenantId })`).
  - Do NOT duplicate the class name in the message string (avoid `"[ClassName] description"`).

---

## 7. Dynamic Server-Driven Configuration Invariant (Big 3 Standard)

- **Zero Hardcoded Runtime Behaviors**: Following the enterprise architecture of OpenAI, Anthropic, and Google DeepMind, NO client or worker application may hardcode operational parameters that can require real-time adjustment, security mitigation, or experimentation.
- **Dynamic Database & Control Plane Sourcing**:
  - **Slash Commands & Capabilities**: Must be served dynamically via Gateway API (`GET /api/v1/platform/commands`) from the database, enabling instant disablement or customization without redeployment.
  - **System Prompts & Personas**: Must reside in a versioned Prompt Registry (database/control plane), allowing hot-patching of prompt regressions or injection mitigations in seconds.
  - **Execution & Model Hyperparameters**: Execution steps (`maxSteps`), sampling temperatures, context compaction thresholds, cache similarity thresholds, RAG chunking parameters, and memory retention policies must be database-driven and configurable per tenant or agent.
  - **Starter Suggestions & UI Catalogs**: Suggestion pills, starter templates, and catalog items must be loaded dynamically from the platform API.
- **The 4-Tier Configuration Hierarchy**:
  1. _Tier 1 (Database / Control Plane)_: Prompts, commands, models, temperatures, quotas, retention policies, suggestions.
  2. _Tier 2 (Real-time Feature Flags)_: Emergency kill switches (`disable_bash_tool`), circuit breakers, and A/B rollouts.
  3. _Tier 3 (12-Factor Infrastructure)_: Network ports, DB connection strings, pool sizes, and crypto secrets in `.env`.
  4. _Tier 4 (Permanent Code Invariants)_: Core protocol enums (`AgentMode`, `ExecutionStatus`), Zod schemas, and RFC regexes.
- **Client Offline-First Resilient Caching**: Frontends must consume server-driven configuration using TanStack Query backed by asynchronous IndexedDB stale-while-revalidate caching to guarantee instantaneous 0ms startup.

---

## 8. Phase Implementation Testing Policy (Strict)

- While implementing roadmap phases, **DO NOT** write or implement test cases (unit tests, e2e tests, integration tests) or Storybook stories unless explicitly instructed by the user.
- Focus effort and code strictly on production code: domain logic, state machines, Zod contracts, database schemas, API routes, event handlers, and polished UI screens.
- When quality gates run, verify with `pnpm typecheck` and `pnpm lint`. Do not add automated test suites during phase implementation without explicit user sign-off.

---

## 9. Universal Verification Checklist

Before completing any task, verify:

- [ ] No file exceeds 250 lines of code (decomposed proactively at 200 lines).
- [ ] All exported symbols have complete JSDoc annotations.
- [ ] All conditionals, guards, async calls, and calculations have explanatory inline block comments for manual debugging.
- [ ] Barrel imports are used instead of deep sub-paths, with zero competing barrel files.
- [ ] Loggers use `@yuva-devlab/logger` with `"methodName: description"` message format and JSON metadata.
- [ ] Zero hardcoded string literals, routes, or parameter keys; strict `Enum.KEY` usage.
- [ ] Zero fallback mock responses in API hooks or frontend components.
- [ ] Shared contracts originate from `@orchestrai/core` or `@orchestrai/shared-types` without cross-package duplication.
- [ ] Zero hardcoded runtime parameters; commands, prompts, and execution hyperparameters are dynamic (Big 3 Standard).
- [ ] All regexes are centralized in `@orchestrai/regex`.
- [ ] No test cases (unit, e2e, integration) or Storybook stories added during phase implementation unless requested.
- [ ] `pnpm lint` and `pnpm typecheck` pass with zero errors and zero warnings.
- [ ] Commit messages conform to `commitlint.config.ts`.
