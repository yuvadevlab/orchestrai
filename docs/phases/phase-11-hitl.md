# Phase 11: `packages/runtime` — Human-in-the-Loop (HITL) Clearance Architecture

## Objectives

Establish the enterprise Human-in-the-Loop (HITL) safety, clearance, and operator intervention architecture (`@orchestrai/runtime`) for OrchestrAI, providing:

1. **HITL Domain Contracts (`src/hitl/contracts/`)**:
   - `approval-ticket.types.ts`: `RiskLevel` (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`), `ApprovalTicket` metadata, and `ApprovalResolutionInputSchema` (`decision: APPROVED | REJECTED | CANCELLED`, `operatorId`, `reason`, `modifiedArguments`).
   - `approval-storage.interface.ts`: `IApprovalStorage` interface defining `createTicket`, `getTicket`, `listPending`, `resolveTicket`, and `expireStaleTickets`.
2. **Durable & In-Memory Storage Adapters (`src/hitl/storage/`)**:
   - `memory-approval-storage.ts`: Thread-safe in-memory adapter with double-resolution guards and expiration sweeper for dev/testing.
   - `postgres-approval-storage.ts`: Production PostgreSQL adapter targeting the `approvals` relational table (`0002_messages_and_tools.sql`) with optimistic concurrency checks (`WHERE approval_id = $6 AND status = 'PENDING'`).
3. **Operational Risk Assessment & Policy Engine (`src/hitl/policy/`)**:
   - `approval-policy.types.ts`: `ApprovalPolicyConfigSchema` defining `defaultTimeoutMs`, `autoApproveClearance`, `alwaysRequireApprovalTools`, and `RiskAssessmentResult`.
   - `approval-policy-engine.ts`: Evaluates proposed tool calls against mandatory tool lists, destructive flags (`isDestructive`), tool permission levels (`ToolPermissionLevel.DANGEROUS`), and clearance hierarchy comparisons.
4. **Decision Engine & Background Expiration Watchdog (`src/hitl/decision/` & `src/hitl/watchdog/`)**:
   - `approval-decision-engine.ts`: Validates operator verdicts, ensures modified arguments are valid key-value structures, and persists decisions.
   - `approval-watchdog.ts`: Background periodic sweeper sweeping expired tickets past `expiresAt` into `TIMED_OUT` state with customizable check intervals.
5. **Runtime Engine Integration & Modular Decomposition (`src/engine/`)**:
   - `agent-graph-builder.ts`: Extracted DAG assembly logic to enforce Prime Invariant 1 (< 250 lines).
   - `runtime-approval-coordinator.ts`: Manages execution suspension at approval gates, resuming runs with original or operator-modified arguments, and cancelling runs cleanly.
   - `orchestrai-runtime.ts`: Modularized master runtime delegating approval workflows, rewind, and recovery to dedicated coordinators (193 lines).
   - `tool-evaluator-node.ts`: Integrated approval policy evaluation and automatic ticket persistence upon clearance triggers.
6. **Architectural Invariants**:
   - Strict 250-line rule per file (longest file is `postgres-approval-storage.ts` at 219 lines; all 48 files < 220 lines).
   - Zero test cases or Storybook stories implemented during phase execution per user policy.
   - Strict TypeScript with 100% type safety and comprehensive JSDoc.

---

## Directory Structure

```text
packages/runtime/src/
├── hitl/
│   ├── contracts/
│   │   ├── approval-ticket.types.ts       # ApprovalTicket, RiskLevel, ApprovalResolutionInput
│   │   ├── approval-storage.interface.ts  # IApprovalStorage contract
│   │   └── index.ts
│   ├── storage/
│   │   ├── memory-approval-storage.ts     # In-memory approval ticket storage
│   │   ├── postgres-approval-storage.ts   # Durable PostgreSQL adapter with optimistic locking
│   │   └── index.ts
│   ├── policy/
│   │   ├── approval-policy.types.ts       # ApprovalPolicyConfig, RiskAssessmentResult
│   │   ├── approval-policy-engine.ts      # Risk classifier & hierarchy evaluator
│   │   └── index.ts
│   ├── decision/
│   │   ├── approval-decision-engine.ts    # Operator resolution validator & executor
│   │   └── index.ts
│   ├── watchdog/
│   │   ├── approval-watchdog.ts           # Background timer sweeper for expired tickets
│   │   └── index.ts
│   └── index.ts                           # Master HITL module export
├── engine/
│   ├── agent-graph-builder.ts             # Modular DAG compilation
│   ├── runtime-approval-coordinator.ts    # Resume, cancel, and resolve approval executions
│   ├── orchestrai-runtime.ts              # Master runtime coordinator (< 200 lines)
│   ├── runtime-context.ts                 # Runtime context with approval storage & policy
│   └── index.ts
└── nodes/
    ├── tool-evaluator-node.ts             # Approval policy evaluation & ticket creation
    └── node.types.ts                      # Injected approval dependencies
```
