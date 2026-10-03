---
name: orchestrai-context
description: Core context, architecture map, operational guidelines, and universal invariants for developing on the OrchestrAI platform.
---

# OrchestrAI Context Skill

Use this skill when developing, refactoring, or planning any feature within OrchestrAI.

## Platform Core Concepts

- **Agent Modes**:
  - `CHAT`: Conversational, minimal tool usage.
  - `PLAN`: Generates structured execution graphs and dependency DAGs before running.
  - `ACT`: High autonomy execution of tools with loop guards.
  - `AUTO`: Dynamic transition between planning, execution, verification, and human approval.
- **Execution Rail & Runners**:
  - Every step emits lifecycle events (`EXECUTION_STARTED`, `TOOL_CALLED`, `TOOL_COMPLETED`, `APPROVAL_REQUESTED`, `EXECUTION_COMPLETED`).
- **Human-in-the-Loop (HITL)**:
  - Dangerous tools (filesystem writes, external network, shell execution) trigger approval interrupts.
  - State persists to PostgreSQL checkpoints; execution resumes upon approval callback.
- **Multi-Tier Memory & Conversational RAG**:
  - 4 memory tiers: `USER_PREFERENCE`, `FACT`, `EPISODIC`, `TASK`.
  - Conversational RAG selectively prunes older conversation history, keeping only semantically relevant turns.
- **Resilience**:
  - Circuit breakers, exponential retries, 120s execution deadlines, and bulkheads wrap LLM turns.

## Prime Monorepo Invariants (Zero Exceptions)

1. **250-Line Limit**: NO file across `apps/*` or `packages/*` may exceed 250 LOC (decompose proactively at 200 lines).
2. **JSDoc & Comments**: Every exported symbol must have JSDoc; every conditional/guard must have an inline explanatory comment.
3. **Strict Enums**: Strictly compare with `Enum.KEY` from `@orchestrai/shared-types`. Never use raw string literals.
4. **Zero Hardcoded Models & Synthetic Agents**: All models and agents are DB- or env-driven (`DEFAULT_MODEL_NAME`). Never auto-seed fallback agents.
5. **Testing Policy**: Never write test cases or Storybook stories during phase implementation unless requested.
6. **Package Boundaries**: `@orchestrai/core` is pure with zero workspace dependencies. Dependencies flow inward.
7. **Dynamic Server-Driven Configuration (Big 3 Standard) & Centralized Regex**: Zero hardcoded runtime parameters (commands, prompts, steps, temperatures, cache/RAG limits). All runtime parameters must be database/control-plane-driven. All regexes must come from `@orchestrai/regex`.

## Monorepo Directory

- **Apps (`apps/*`)**: `console` (3001), `gateway` (4001), `realtime` (4002), `worker` (4003), `admin` (4004), `orchestrator` (gRPC 50051), `intelligence` (Python LangGraph 8082), `crawler` (Python Playwright 8083).
- **Packages (`packages/*`)**: `core`, `shared-types`, `database`, `models`, `tools`, `agent`, `runtime`, `memory`, `rag`, `semantic-cache`, `model-router`, `eval`, `prompts`, `billing`, `resilience`, `events`, `queue`, `grpc`, `observability`, `sdk`, `regex`.
- **Quality Gates**: `pnpm typecheck` (48 targets), `pnpm lint` (ESLint + Ruff), `pnpm format:check` (Prettier + Ruff).
