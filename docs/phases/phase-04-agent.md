# Phase 4: `packages/agent` — Agent Loop & State Transitions

## Objectives

Establish the autonomous reasoning brain and execution loop for OrchestrAI, providing agents with:

1. An iterative **Observe-Reason-Act** execution loop.
2. A state machine managing dynamic step indices, context variables, and termination flags.
3. An infinite loop detector that detects action repetition.
4. A multi-layer prompt compiler that synthesizes personas, mode rules, and context variables.
5. Pluggable operational mode strategies (`CHAT`, `PLAN`, `ACT`, `AUTO`).
6. A Human-in-the-Loop (HITL) pause mechanism when destructive tools are invoked.
7. A fluent `AgentBuilder` API for constructing validated agent configurations.

## Package Location

`packages/agent/`

## Invariant Rules & Dependency Flow

1. Sits in the **Core Domain / Agent Orchestration Layer**.
2. Depends on `@orchestrai/core`, `@orchestrai/shared-types`, `@orchestrai/models` (for `ILlmAdapter`), and `@orchestrai/tools` (for `ToolRegistry` and `executeTool`).
3. Does **not** import from storage or infrastructure layers (`infrastructure/*`, `@orchestrai/queue`, `apps/*`).
4. Strictly adheres to the **250-line rule** per file, with modular decomposition.

## Modules Implemented

```text
packages/agent/src/
├── state/
│   ├── loop-detector.ts           # Sliding action fingerprint history for loop detection
│   ├── agent-state-machine.ts     # Step counters, context variable store, invariant guards
│   └── index.ts
├── compiler/
│   ├── compiler.types.ts          # Prompt compilation options and inputs
│   ├── prompt-compiler.ts         # Assembles persona, mode rules, context, and history
│   └── index.ts
├── modes/
│   ├── mode-strategy.interface.ts # IModeStrategy contract (instructions, tool filters)
│   ├── chat-mode.strategy.ts      # CHAT mode: conversational focus, non-destructive tools
│   ├── plan-mode.strategy.ts      # PLAN mode: structured task decomposition before action
│   ├── act-mode.strategy.ts       # ACT mode: fast direct autonomous tool execution
│   ├── auto-mode.strategy.ts      # AUTO mode: adaptive orchestrator
│   ├── mode-resolver.ts           # Strategy factory by AgentMode enum
│   └── index.ts
├── loop/
│   ├── step-result.types.ts       # StepOutcome and AgentStepResult schemas
│   ├── tool-message-converter.ts  # Converts ToolResult to AIMessage
│   ├── agent-runner.ts            # runAgentUntilHalt multi-step execution runner
│   ├── agent-loop.ts              # AgentLoop single-step cycle controller
│   └── index.ts
├── builder/
│   ├── agent-builder.ts           # Fluent builder for AgentDefinition records
│   └── index.ts
└── index.ts                       # Public API barrel export
```

## Key Architectural Decisions

1. **State Machine Invariant Protection (`AgentStateMachine`)**:
   Prevents step progression if an execution run is already terminated or has exceeded `maxSteps`. Guarantees clean serialization of context variables across reasoning cycles.
2. **Deterministic Action Fingerprinting (`LoopDetector`)**:
   Sorts argument keys and serializes tool calls into fingerprints. Halts execution if an agent invokes the exact same failing action 3 consecutive times, preventing token drain and runaway loops.
3. **Pluggable Mode Strategies (Strategy Pattern)**:
   Instead of cluttering the loop with mode conditionals, `resolveModeStrategy()` injects customized system guidance and filters accessible tools (e.g. restricting `PLAN` mode to `READ_ONLY` exploration tools).
4. **Human-in-the-Loop Clean Suspension**:
   When an LLM requests a `DANGEROUS` tool, the loop generates an approval UUID, assigns `pendingApprovalId` on the state machine, and returns `WAITING_FOR_APPROVAL` without executing the tool, enabling the client UI to review and clear the action.
