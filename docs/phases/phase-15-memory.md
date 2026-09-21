# Phase 15: `packages/memory` — Memory Systems (Conversation, Working, Episodic, Semantic)

## Objectives

Establish the controlled agent memory subsystem (`@orchestrai/memory`) for OrchestrAI, providing:

1. **Controlled Memory Principles (Section 59-60)**:
   - Keep memory inside the monorepo first (evolutionary architecture before Python extraction).
   - "Do not automatically store everything. Memory requires: Relevance, Privacy, Retention, Lifecycle, Retrieval."
   - Explicit memory classifications: `CONVERSATION`, `WORKING`, `USER_PREFERENCE`, `FACT`, `EPISODIC`, `TASK`, `SYSTEM`.

2. **Domain Contracts & Schemas (`src/contracts/`)**:
   - `memory-type.schema.ts`: Zod schema for `MemoryType`.
   - `memory-item.schema.ts`: `MemoryItem` Zod schema and `ScoredMemoryItem` interface.
   - `memory-query.schema.ts`: `MemoryFilter` and `MemorySearchQuery` schemas.
   - `memory-storage.interface.ts`: `IMemoryStorage` contract defining `save`, `saveBatch`, `getById`, `search`, `list`, `delete`, `deleteByFilter`, and `pruneExpired`.

3. **Storage Backends (`src/storage/`)**:
   - `vector-math.ts`: Pure vector cosine similarity calculations (`calculateCosineSimilarity`).
   - `memory-storage.ts`: Thread-safe, in-memory storage adapter with cosine vector search and TTL pruning.
   - `database-runner.interface.ts`: Decoupled `IDatabaseQueryRunner` contract.
   - `postgres-memory-storage.ts`: Production PostgreSQL storage adapter targeting `memory_items` table with pgvector `<=>` cosine distance queries.

4. **Memory Subsystems**:
   - `src/conversation/conversation-window.ts`: Sliding-window and token-budgeted conversation memory buffer.
   - `src/working/working-memory.ts`: Execution-scoped scratchpad for intermediate variables and plan tasks.
   - `src/episodic/`:
     - `episode.types.ts`: `EpisodeRecord` schema.
     - `episodic-recorder.ts`: Encodes and records execution runs into episodic narrative memories.
   - `src/semantic/semantic-search.ts`: Multi-factor hybrid relevance re-ranking combining vector similarity, inherent importance score, and half-life recency decay.

5. **Lifecycle, Privacy & Relevance (`src/lifecycle/`)**:
   - `relevance-filter.ts`: Rejects low-entropy pleasantries ("ok", "thanks") from polluting long-term memory.
   - `privacy-sanitizer.ts`: Redacts secrets, tokens, API keys, and sensitive credentials prior to persistence.
   - `retention-manager.ts`: Manages TTL per MemoryType and schedules automated sweeps.

6. **Unified Facade (`src/manager/`)**:
   - `memory-manager.ts`: High-level entrypoint orchestrating `remember`, `recall`, `list`, `createWorkingMemory`, `createConversationWindow`, `recordEpisode`, and `pruneExpired`.

---

## Directory Structure

```text
packages/memory/
├── package.json
├── tsconfig.json
├── tsconfig.build.json
├── tsup.config.ts
└── src/
    ├── contracts/
    │   ├── memory-type.schema.ts
    │   ├── memory-item.schema.ts
    │   ├── memory-query.schema.ts
    │   ├── memory-storage.interface.ts
    │   └── index.ts
    ├── conversation/
    │   ├── conversation-window.ts
    │   └── index.ts
    ├── episodic/
    │   ├── episode.types.ts
    │   ├── episodic-recorder.ts
    │   └── index.ts
    ├── lifecycle/
    │   ├── relevance-filter.ts
    │   ├── privacy-sanitizer.ts
    │   ├── retention-manager.ts
    │   └── index.ts
    ├── manager/
    │   ├── memory-manager.ts
    │   └── index.ts
    ├── semantic/
    │   ├── semantic-search.ts
    │   └── index.ts
    ├── storage/
    │   ├── database-runner.interface.ts
    │   ├── memory-storage.ts
    │   ├── postgres-memory-storage.ts
    │   ├── vector-math.ts
    │   └── index.ts
    └── index.ts
```

---

## Verification & Invariants

- **Prime Invariant 1 (250-Line Rule)**: All 26 files in `packages/memory/src/` are strictly < 195 lines (longest file is `postgres-memory-storage.ts` at 194 lines).
- **Prime Invariant 2 (JSDoc & Rationale)**: Comprehensive JSDoc on all exported symbols; inline rationale comments on all conditionals and state transitions.
- **Prime Invariant 3 (Package Boundaries)**: Clean dependencies on `@orchestrai/shared-types`, `@orchestrai/core`, and `@orchestrai/logger`.
- **Testing Policy**: 0 test cases added per user directive.
- **Quality Gates**: `pnpm --filter @orchestrai/memory build` (ESM, CJS, DTS clean), repo-wide `pnpm typecheck` (22 of 22 projects passing), `pnpm lint` (0 warnings), and monorepo `pnpm build` (13 of 13 packages passing).
