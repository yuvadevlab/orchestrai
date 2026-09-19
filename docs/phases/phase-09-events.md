# Phase 9: `packages/events` — Event Architecture & Outbox Pattern

## Objectives

Establish the enterprise event fabric and Outbox infrastructure (`@orchestrai/events`) for OrchestrAI, delivering:

1. **Decoupled Event Transport**: Unifies in-process and distributed asynchronous pub/sub messaging across services.
2. **Strict Event Contracts (`src/contracts/`)**:
   - `event-payloads.ts`: Zod validation schemas for all `DomainEventType` variants (`ExecutionCreated`, `ExecutionStarted`, `ExecutionCompleted`, `ExecutionFailed`, `ExecutionCancelled`, `StepStarted`, `StepCompleted`, `ToolCalled`, `ToolCompleted`, `ApprovalRequested`, `ApprovalResolved`).
   - `event-factory.ts`: `createDomainEvent()` helper wrapping payloads into standard `DomainEventEnvelope` with UUIDv4 IDs and ISO timestamps.
   - `event-bus.interface.ts`: Standard decoupling interfaces `IEventPublisher`, `IEventSubscriber`, and `IEventBus`.
3. **In-Memory Event Bus (`src/bus/`)**:
   - `memory-event-bus.ts`: Asynchronous pub/sub bus supporting exact-match subscriptions, wildcard (`*`) catch-all topics, sequential batch publishing, and isolated subscriber error containment.
4. **Redis Streams Engine (`src/redis/`)**:
   - `redis-stream-config.ts`: Zod-validated configuration for publishers and consumer groups.
   - `redis-stream-serializer.ts`: Efficient serialization and deserialization between `DomainEventEnvelope` and Redis Streams hash fields with metadata headers (`eventType`, `eventId`, `executionId`).
   - `redis-stream-publisher.ts`: High-performance `XADD` event publisher with approximate trimming (`MAXLEN ~`) to control stream growth in O(1) time.
   - `redis-stream-consumer.ts`: Resilient consumer group worker using `MKSTREAM`, `XREADGROUP`, manual `XACK` acknowledgment, and graceful loop management for at-least-once message delivery.
5. **Transactional Outbox Engine (`src/outbox/`)**:
   - Solves the dual-write problem by persisting domain events alongside state changes.
   - `outbox-storage.interface.ts`: Contract for outbox persistence with `OutboxStatus` state machine (`PENDING` -> `PROCESSING` -> `PUBLISHED` / `FAILED`).
   - `memory-outbox-storage.ts`: High-concurrency in-memory storage adapter with atomic batch claiming and retry backoff.
   - `outbox-poller.ts`: Periodic interval sweeper claiming pending records, publishing to `IEventPublisher`, and advancing lifecycle status.
6. **Architectural Invariants**:
   - Strict adherence to the 250-line rule per file (all files < 160 lines).
   - Zero internal dependencies on outer layers; depends only on `@orchestrai/core`, `@orchestrai/shared-types`, and `@orchestrai/logger`.
   - Comprehensive JSDoc annotations and explicit inline comments on all guard clauses and state transitions.

---

## Package Location

`packages/events/`

---

## Directory Structure

```text
packages/events/
├── package.json
├── tsconfig.json
├── tsconfig.build.json
├── tsup.config.ts
├── src/
│   ├── contracts/
│   │   ├── event-payloads.ts            # Zod schemas for all domain events
│   │   ├── event-factory.ts             # createDomainEvent helper
│   │   ├── event-bus.interface.ts       # IEventPublisher, IEventSubscriber, IEventBus
│   │   └── index.ts                     # Contracts barrel
│   ├── bus/
│   │   ├── memory-event-bus.ts          # Async in-memory pub/sub with wildcard support
│   │   └── index.ts                     # Bus barrel
│   ├── redis/
│   │   ├── redis-stream-config.ts       # Config schemas for streams & consumer groups
│   │   ├── redis-stream-serializer.ts   # Envelope <-> Redis Stream field serializer
│   │   ├── redis-stream-publisher.ts    # XADD publisher with approximate trimming
│   │   ├── redis-stream-consumer.ts     # Consumer group worker with XACK
│   │   └── index.ts                     # Redis barrel
│   ├── outbox/
│   │   ├── outbox-storage.interface.ts  # IOutboxStorage & OutboxRecord contracts
│   │   ├── memory-outbox-storage.ts     # In-memory storage adapter for dev & tests
│   │   ├── outbox-poller.ts             # Periodic sweeper & publisher
│   │   └── index.ts                     # Outbox barrel
│   └── index.ts                         # Package root entrypoint
```

---

## Verification & Quality Gates

- `pnpm --filter @orchestrai/events build`: Verified clean ESM, CJS, and DTS bundles.
- `pnpm typecheck`: Verified clean across all 19 monorepo packages and apps.
- Line-count verification: All files within strict 250-line invariant limit.
