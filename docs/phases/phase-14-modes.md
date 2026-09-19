# Phase 14: `packages/agent` — Agent Modes (CHAT / PLAN / ACT / AUTO)

## Objectives

Establish the enterprise operational mode subsystem (`@orchestrai/agent`) for OrchestrAI, providing:

1. **Core Operating Modes & Invariant**:
   - `CHAT`: No external side-effects; pure conversational dialogue with strict blocking of mutation tools.
   - `PLAN`: Read-only exploration and inspection tools allowed (`ToolPermissionLevel.READ_ONLY`). Enforces structured task deconstruction before any modifications occur.
   - `ACT`: Autonomous tool execution loop with authorized mutations governed by operator clearance tiers and HITL safety gates.
   - `AUTO`: Application-controlled routing dynamically selecting the appropriate operational mode.
   - _Core Invariant_: "The LLM proposes behavior; the application enforces permissions and mode constraints." Mode is not a security boundary on its own; authorization remains authoritative.

2. **Structured Planning Engine (`src/modes/plan/`)**:
   - `plan.schema.ts`: Zod schemas for `PlanStep` (`id`, `title`, `description`, `toolTarget`, `dependencies`, `status`, `verificationCriteria`), `PlanStepStatus`, and `Plan`.
   - `plan-parser.ts`: Extracts structured plans from model outputs across Markdown JSON blocks, XML `<plan>` tags, or raw payloads.
   - `plan-tracker.ts`: Tracks plan execution state, dependency resolution, step state progression (`PENDING` -> `IN_PROGRESS` -> `COMPLETED`), and overall completion percentage.

3. **Mode Constraint Enforcement (`src/modes/enforcement/`)**:
   - `mode-constraint.types.ts`: `ModeCheckResult` and `ModeEnforcerOptions`.
   - `mode-constraint-enforcer.ts`: Evaluates proposed tool calls before dispatch, guaranteeing that an LLM cannot execute tools forbidden by its active mode.

4. **Application-Controlled Dynamic Mode Routing (`src/modes/routing/`)**:
   - `mode-router.interface.ts`: `IModeRouter` and `ModeRoutingContext`.
   - `heuristic-mode-router.ts`: Fast, zero-latency rule-based classifier evaluating lexical markers, intent verbs, and question styles to route to `CHAT`, `PLAN`, or `ACT`.

5. **Mode Controller & Transition History (`src/modes/controller/`)**:
   - `mode-controller.ts`: Manages current operational mode, tracks transition audit trail (`ModeTransitionRecord`), and invokes listeners.

6. **Agent Loop Integration (`src/loop/`)**:
   - `step-tool-executor.ts`: Extracted modular tool execution handler enforcing loop detection, mode constraints, HITL gates, and sandbox runs.
   - `agent-loop.ts`: Integrated mode-filtered tool lists, dynamic AUTO mode routing, plan extraction, and step execution.

---

## Directory Structure

```text
packages/agent/src/
├── builder/
│   ├── agent-builder.ts
│   └── index.ts
├── compiler/
│   ├── compiler.types.ts
│   ├── prompt-compiler.ts
│   └── index.ts
├── loop/
│   ├── agent-loop.ts
│   ├── agent-runner.ts
│   ├── step-result.types.ts
│   ├── step-tool-executor.ts
│   ├── tool-message-converter.ts
│   └── index.ts
├── modes/
│   ├── controller/
│   │   ├── mode-controller.ts
│   │   └── index.ts
│   ├── enforcement/
│   │   ├── mode-constraint.types.ts
│   │   ├── mode-constraint-enforcer.ts
│   │   └── index.ts
│   ├── plan/
│   │   ├── plan.schema.ts
│   │   ├── plan-parser.ts
│   │   ├── plan-tracker.ts
│   │   └── index.ts
│   ├── routing/
│   │   ├── mode-router.interface.ts
│   │   ├── heuristic-mode-router.ts
│   │   └── index.ts
│   ├── act-mode.strategy.ts
│   ├── auto-mode.strategy.ts
│   ├── chat-mode.strategy.ts
│   ├── mode-resolver.ts
│   ├── mode-strategy.interface.ts
│   ├── plan-mode.strategy.ts
│   └── index.ts
├── state/
│   ├── agent-state-machine.ts
│   ├── loop-detector.ts
│   └── index.ts
└── index.ts
```

---

## Verification & Invariants

- **Prime Invariant 1 (250-Line Rule)**: All 34 files in `packages/agent/src/` are strictly < 175 lines (longest file is `agent-loop.ts` at 173 lines).
- **Prime Invariant 2 (JSDoc & Rationale)**: Every exported symbol includes comprehensive JSDoc and every control flow statement has rationale comments.
- **Prime Invariant 3 (Package Boundaries)**: Relies cleanly on `@orchestrai/core`, `@orchestrai/shared-types`, `@orchestrai/models`, and `@orchestrai/tools`.
- **Testing Policy**: 0 test cases added per user directive.
- **Quality Gates**: `pnpm --filter @orchestrai/agent build` (ESM, CJS, DTS clean), repo-wide `pnpm typecheck` (21 of 21 projects passing), `pnpm lint` (0 warnings), and monorepo `pnpm build` (12 of 12 packages passing).
