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

## 5. Universal Verification Checklist

Before completing any task, verify:

- [ ] No file exceeds 250 lines of code (decomposed proactively at 200 lines).
- [ ] All exported symbols have complete JSDoc annotations.
- [ ] All conditionals, guards, and branching logic have explanatory inline comments.
- [ ] Shared contracts originate from `@orchestrai/core` without cross-package duplication.
- [ ] `pnpm lint` and `pnpm typecheck` pass with zero errors and zero warnings.
- [ ] Commit messages conform to `commitlint.config.ts`.
