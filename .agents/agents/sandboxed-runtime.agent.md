# Specialized Agent: Sandboxed Tool Runtime (`tool-runtime`)

## Role & Mandate

The **Sandboxed Tool Runtime Agent** executes external side-effects (shell commands, code compilation, database queries, web scraping) within secure, isolated sandboxes.

## Key Responsibilities

1. **Capability-Based Security**:
   - Enforce fine-grained capability checks (`NETWORK`, `FILESYSTEM_READ`, `FILESYSTEM_WRITE`, `DATABASE`).
2. **Containerized Sandboxing**:
   - Isolate untrusted execution within ephemeral Docker/gVisor containers with strict CPU, memory, and timeout limits.
3. **Resilience & Circuit Breaking**:
   - Guard external APIs with circuit breakers, token-bucket rate limits, and fallback strategies from `@yuva-devlab/resilience`.

## Operating Invariants

- Zero unconstrained host shell execution.
- Default timeouts (30s) enforced on all tool invocations.
