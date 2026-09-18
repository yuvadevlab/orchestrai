# Phase 5: `packages/runtime` — Runtime & LangGraph Execution

## Objectives

Establish the Directed StateGraph (DAG) execution runtime and checkpointing engine for OrchestrAI, providing:

1. A typed, deterministic `StateGraph` builder supporting nodes, static edges, and conditional edge routers.
2. A `CompiledGraph` executor that traverses state transitions, automatically persists snapshots to an `ICheckpointer`, and handles execution pauses.
3. Pluggable checkpoint persistence (`ICheckpointer`) with a zero-dependency `MemoryCheckpointer` implementation.
4. The canonical agent graph nodes:
   - `ModelNode`: Prompt compilation and LLM inference.
   - `ToolEvaluatorNode`: Permission clearance and HITL pause detection.
   - `ToolExecutorNode`: Sandboxed execution of approved tools.
   - `ApprovalGateNode`: Suspension boundary when human approval is required.
5. The `OrchestrAIRuntime` coordinator for starting new workflow executions and resuming paused workflows upon operator resolution.

## Package Location

`packages/runtime/`

## Invariant Rules & Dependency Flow

1. Sits in the **Execution Engine / Runtime Layer**.
2. Depends on `@orchestrai/core`, `@orchestrai/shared-types`, `@orchestrai/models`, `@orchestrai/tools`, and `@orchestrai/agent`.
3. Does **not** depend on concrete database infrastructure (`infrastructure/postgres`, etc.). Checkpointers are accessed exclusively through the `ICheckpointer` interface.
4. Strictly adheres to the **250-line rule** per file, with modular decomposition.

## Modules Implemented

```text
packages/runtime/src/
├── graph/
│   ├── graph.types.ts             # START, END sentinels, NodeFunction, EdgeRouter, StepTransition
│   ├── state-graph.ts             # StateGraph builder: addNode, addEdge, addConditionalEdge, compile
│   ├── compiled-graph.ts          # CompiledGraph: node traversal with checkpointing and pause checks
│   └── index.ts
├── checkpoint/
│   ├── checkpoint.types.ts        # CheckpointRecord schema
│   ├── checkpointer.interface.ts  # ICheckpointer contract (save, loadLatest, load, list)
│   ├── memory-checkpointer.ts     # In-memory checkpointer implementation
│   └── index.ts
├── nodes/
│   ├── node.types.ts              # RuntimeGraphState and RuntimeNodeDependencies
│   ├── model-node.ts              # ModelNode: prompt compile + LLM invocation
│   ├── tool-evaluator-node.ts     # ToolEvaluatorNode: clearance checks & HITL detection
│   ├── tool-executor-node.ts      # ToolExecutorNode: sandboxed tool execution & history update
│   ├── approval-gate-node.ts      # ApprovalGateNode: suspension checkpoint
│   └── index.ts
├── engine/
│   ├── runtime-context.ts         # RuntimeEngineConfig options
│   ├── orchestrai-runtime.ts      # OrchestrAIRuntime coordinator (start, resume)
│   └── index.ts
└── index.ts                       # Public API barrel export
```

## Key Architectural Decisions

1. **Deterministic StateGraph Execution**:
   Graph traversal follows explicit node transitions governed by static or conditional edges (`START` -> `model` -> `tool_evaluator` -> `tool_executor` -> `model`). Cyclic loops enable multi-turn reasoning until completion or approval gates.
2. **Atomic Checkpointing Across Nodes**:
   Before and after every node execution, the runtime commits an immutable `CheckpointRecord` to `ICheckpointer`. This guarantees durable execution recovery and prevents duplicate model calls if workers restart.
3. **Resumption from Human-in-the-Loop (HITL)**:
   When an operator approves or rejects an action, `OrchestrAIRuntime.resume()` reloads state from the latest checkpoint. If approved, it resumes execution directly into `tool_executor`. If rejected, it injects an operator refusal message and loops back to `model`.
