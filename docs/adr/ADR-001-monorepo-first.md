# ADR-001: Modular Monorepo with Evolutionary Package Extraction

## Status

**Accepted**

## Context

OrchestrAI consists of multiple interrelated components:

- Several operational applications (`gateway`, `worker`, `realtime`, `console`)
- Reusable domain libraries (`core`, `models`, `tools`, `agent`, `runtime`, `queue`, `events`, `memory`, `rag`, `observability`, `sdk`)

We must decide between:

1. Multi-repo architecture (separate Git repository for each package and app)
2. Single poly-repo without strict boundaries
3. Modular monorepo with strict package boundaries and evolutionary extraction paths

## Decision

We adopt a **modular monorepo structure** managed by **pnpm workspaces** and **Turborepo**:

- All code resides in a single Git repository during initial development.
- Packages are organized under `packages/*` with strict isolation: `@orchestrai/core` has zero internal workspace dependencies.
- Packages use explicit dependency graphs (`workspace:*`) and TypeScript project references.
- Each package maintains clean boundaries (own `package.json`, isolated tests, typed entry points) enabling seamless extraction into external npm packages or independent microservices when scale or organizational boundaries dictate.

## Alternatives Considered

### 1. Multi-repo from day one

- _Pros_: Complete isolation, independent CI/CD pipelines per repo.
- _Cons_: Massive overhead during active prototyping; cross-cutting refactors (e.g. core schema updates) require cascading PRs, git submodules or npm publishing roundtrips.

### 2. Single monolithic application

- _Pros_: Minimal initial setup overhead.
- _Cons_: Severe coupling; impossible to reuse `@orchestrai/models` or `@orchestrai/tools` across worker and gateway without circular dependencies; impossible to distribute SDK to external clients cleanly.

## Consequences

### Positive

- Single unified commit history and simplified cross-package atomic refactoring.
- Fast local development with Turborepo caching.
- Enforced architectural discipline: packages cannot form circular dependencies.
- Zero-cost future extraction: when `@orchestrai/sdk` or `@orchestrai/tools` need to be published to npm or moved to a standalone repository, no code restructuring is required.

### Negative / Trade-offs

- Monorepo tooling (Turborepo, pnpm workspaces) requires careful TypeScript project reference configuration.
- CI pipelines must leverage Turborepo caching to avoid re-testing unaffected packages.
