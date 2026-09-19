# Phase 10: `packages/runtime` — Persistence, Rewind & Recovery

## Objectives

Establish the enterprise state persistence, time-travel debugging, and crash recovery architecture (`@orchestrai/runtime`) for OrchestrAI, providing:

1. **Durable PostgreSQL Checkpointer (`src/checkpoint/postgres-checkpointer.ts`)**:
   - Implements `IPersistentCheckpointer<TState>` backed by the `checkpoints` relational table (`0003_checkpoints_and_outbox.sql`).
   - Idempotent `INSERT INTO checkpoints ... ON CONFLICT (execution_id, step_index) DO UPDATE` atomic UPSERTs.
   - Decoupled from specific database drivers via `IDatabaseQueryRunner` (`database-adapter.interface.ts`).
   - Supports `loadLatest`, `load`, `list`, `deleteAfter`, and `prune`.
2. **Type-Preserving Serialization & Checksum Hashing (`src/checkpoint/serializer/`)**:
   - `state-serializer.ts`: Full fidelity serialization and hydration preserving `Date`, `Set`, `Map`, `RegExp`, and `Error` / `OrchestrAIError` instances with typed JSON descriptors.
   - `state-hasher.ts`: Canonical key-sorted SHA-256 state checksum hashing (`calculateStateHash`, `verifyStateHash`) protecting against checkpoint tampering and bit-rot.
3. **State Rewind & Time-Travel Debugging (`src/checkpoint/rewind/`)**:
   - `rewind-policy.ts`: Zod configuration schemas for rewind operations.
   - `state-diff.ts`: Deep object delta comparison calculating `added`, `modified`, and `deleted` fields between any two sequential or arbitrary checkpoints.
   - `state-rewind-engine.ts`: Manages execution rollback:
     - `PRUNE_SUBSEQUENT`: Deletes downstream checkpoints (`checkpointer.deleteAfter`) and resumes in-place.
     - `BRANCH_FORK`: Creates an immutable execution fork (`forkExecutionId`), deep-copies history up to target step, and returns a detached run.
4. **Checkpoint Retention & Pruning Sweeper (`src/checkpoint/retention/`)**:
   - `retention-policy.ts`: Soft ceiling configuration (`maxCheckpointsPerRun: 50`) with critical milestone protection.
   - `checkpoint-pruner.ts`: Intelligent compaction algorithm retaining the initial snapshot, terminal snapshot, and milestone nodes (`model`, `tool_evaluator`, `tool_executor`, `approval_gate`), discarding high-frequency intermediate reasoning steps.
5. **Execution Crash Recovery Coordinator (`src/recovery/`)**:
   - `recovery-types.ts`: Diagnostic inspection contracts (`InterruptedExecutionInfo`, `RecoveryPlan`, `RecoveryStrategy`).
   - `execution-recovery-manager.ts`: Detects interrupted/stalled runs, validates state checksums, inspects the last node, and formulates automated resumption plans (`RESUME_IN_PLACE` vs `FAIL_UNRECOVERABLE`).
6. **Master Runtime Integration (`src/engine/orchestrai-runtime.ts`)**:
   - Extends `OrchestrAIRuntime` with `rewind(executionId, options)` and `recover(executionId, deps)`.
7. **Architectural Invariants**:
   - Strict 250-line rule per file (all 33 files < 217 lines).
   - Zero test cases or Storybook stories implemented during phase execution per user policy.
   - Strict TypeScript with zero `any` types and comprehensive JSDoc.

---

## Directory Structure

```text
packages/runtime/src/
├── checkpoint/
│   ├── checkpoint.types.ts              # CheckpointRecord, stateHash, metadata
│   ├── checkpointer.interface.ts        # ICheckpointer<TState>
│   ├── database-adapter.interface.ts    # IDatabaseQueryRunner & IPersistentCheckpointer
│   ├── memory-checkpointer.ts           # In-memory checkpointer with rewind & prune
│   ├── postgres-checkpointer.ts         # Durable PostgreSQL adapter with atomic UPSERT
│   ├── serializer/
│   │   ├── state-serializer.ts          # Type-preserving JSON serializer & reviver
│   │   ├── state-hasher.ts              # Canonical SHA-256 state hashing
│   │   └── index.ts
│   ├── rewind/
│   │   ├── rewind-policy.ts             # PRUNE_SUBSEQUENT | BRANCH_FORK policies
│   │   ├── state-diff.ts                # Deep object delta calculator for time-travel
│   │   ├── state-rewind-engine.ts       # State rollback and fork manager
│   │   └── index.ts
│   ├── retention/
│   │   ├── retention-policy.ts          # Retention limits & milestone selectors
│   │   ├── checkpoint-pruner.ts         # Timeline compaction sweeper
│   │   └── index.ts
│   └── index.ts
├── recovery/
│   ├── recovery-types.ts                # InterruptedExecutionInfo & RecoveryPlan
│   ├── execution-recovery-manager.ts    # Crash recovery planner & resumed state builder
│   └── index.ts
├── engine/
│   ├── orchestrai-runtime.ts            # start, resume, rewind, recover
│   ├── runtime-context.ts               # RuntimeEngineConfig
│   └── index.ts
└── index.ts                             # Package root entrypoint
```
