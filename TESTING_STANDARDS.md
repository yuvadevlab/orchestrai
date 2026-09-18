# OrchestrAI Testing Standards

## Principles

1. **Zero Side-Effects in Unit Tests**: Unit tests must never make live network calls, write to production databases, or rely on active external services.
2. **Deterministic & Fast**: Tests must run quickly in parallel using Vitest.
3. **Contract-First Testing**: `@orchestrai/core` tests must rigorously assert that invalid payloads fail Zod parsing with precise validation errors.

## Commands

- Run all tests across workspace: `pnpm test`
- Run typechecks across workspace: `pnpm typecheck`
- Run linting across workspace: `pnpm lint`
- Full pre-push check suite: `pnpm check`
