# System Design & Architecture Interview Guide

This guide helps prepare talking points, trade-off analyses, and architecture interview explanations based on OrchestrAI's design.

---

## 1. System Elevator Pitch

> "OrchestrAI is a local-first, modular AI agent orchestration platform designed for stateful, reliable execution. It combines state-machine agent runtimes with asynchronous background workers, event-driven streaming, tool sandboxing, and human-in-the-loop approvals.
> We built it as a modular monorepo with strict package boundaries so that core domain libraries (like models, tools, and runtime) can be cleanly published to npm or extracted into standalone microservices as scaling demands dictate."

---

## 2. Key Architecture Interview Themes

### Theme A: Monorepo vs Microservices

- **Question**: Why start with a monorepo instead of separate microservices?
- **Talking Points**:
  - Eliminates premature distribution overhead and operational latency during early development.
  - Enables atomic cross-package refactorings of shared domain contracts (`@orchestrai/core`).
  - Strict dependency boundaries (`workspace:*` and project references) prevent spaghetti dependencies, preserving clean boundaries for extraction into standalone services later.

### Theme B: Dual-Write Prevention & Event Delivery

- **Question**: How do you prevent inconsistencies between your database and event queues?
- **Talking Points**:
  - Implemented the **Transactional Outbox Pattern**: database updates and outbound domain events are committed within the same PostgreSQL ACID transaction.
  - An outbox poller/consumer reads committed events and publishes them to Redis/Kafka, guaranteeing at-least-once delivery without distributed two-phase commits.

### Theme C: Human-in-the-Loop & Execution Pausing

- **Question**: How does the system pause long-running agent workflows for human approval?
- **Talking Points**:
  - Agent state is managed as a LangGraph state machine with persistent checkpointing to PostgreSQL.
  - When an action requires operator approval, the runtime persists a checkpoint, sets status to `AWAITING_APPROVAL`, releases the worker thread, and emits an event to the operator console.
  - Upon operator approval or rejection, the execution is resumed from the exact checkpoint without re-running prior steps.

### Theme D: Local-First to Production Scale

- **Question**: How does this transition from local laptop to cloud scale?
- **Talking Points**:
  - Clean interface abstractions: PostgreSQL + pgvector scales to managed AWS RDS Aurora PostgreSQL; Redis/BullMQ scales to Redis Cluster or Kafka; Ollama local models swap to cloud Anthropic/Bedrock/Vertex endpoints via `@orchestrai/models`.
