---
name: orchestrai-context
description: Core context, architecture map, and operational guidelines for developing on the OrchestrAI platform.
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
  - Every step emits lifecycle events (`step_start`, `tool_call`, `tool_result`, `step_complete`, `human_approval_required`).
  - Runners represent active executing subagents or tasks attached to an execution rail.
- **Human-in-the-Loop (HITL)**:
  - Dangerous tools (file system writes, external API calls, shell execution) trigger approval interrupts.
  - State is persisted to PostgreSQL checkpoints; execution resumes upon approval callback.

## Monorepo Mapping

- **Contracts**: Always check [`packages/core`](file:///Users/yuvarajpattabi/Yuva/yuva-devlab/Repos/orchestrai/packages/core) before writing any API payload or model.
- **Queueing**: BullMQ jobs go through [`packages/queue`](file:///Users/yuvarajpattabi/Yuva/yuva-devlab/Repos/orchestrai/packages/queue) and are consumed by [`apps/worker`](file:///Users/yuvarajpattabi/Yuva/yuva-devlab/Repos/orchestrai/apps/worker).
- **Events**: Cross-service communication goes through [`packages/events`](file:///Users/yuvarajpattabi/Yuva/yuva-devlab/Repos/orchestrai/packages/events).
- **Status & Handoff**: Always check [`PROGRESS.md`](file:///Users/yuvarajpattabi/Yuva/yuva-devlab/Repos/orchestrai/PROGRESS.md).
