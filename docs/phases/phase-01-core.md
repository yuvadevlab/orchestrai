# Phase 1: `packages/core` — Common Contracts & Schemas

## Objectives

Create the foundational domain contracts, Zod schemas, and TypeScript interfaces that all other packages and applications will depend upon.

## Package Location

`packages/core/`

## Invariant Rule

`@orchestrai/core` has **zero internal workspace dependencies**. It must not import from any other package in `packages/*` or `apps/*`.

## Domain Modules to Implement

```text
packages/core/src/
├── agents/         # Agent definition, modes (CHAT, PLAN, ACT, AUTO), status enums
├── executions/     # ExecutionContext, ExecutionRun, StepResult, ExecutionStatus
├── messages/       # Message roles (system, user, assistant, tool), Content blocks
├── models/         # Model identifiers, capability flags, usage statistics
├── tools/          # Tool definition schemas, parameters (JSON Schema / Zod), permissions
├── events/         # Domain event types, lifecycle payloads (started, step, completed)
├── streaming/      # SSE chunk formats, WebSocket envelope protocols
├── errors/         # OrchestrAIError hierarchy and domain-specific codes
└── index.ts        # Clean barrel exports
```

## Key Deliverables

1. `package.json` for `@orchestrai/core`:
   - Name: `@orchestrai/core`
   - Dependencies: `zod`
2. `tsconfig.json` extending root `tsconfig.base.json`
3. Comprehensive test suite with Vitest validating schema parsing and serialization.
