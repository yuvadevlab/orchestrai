# Phase 21: `packages/tools` — Security Boundary & Agent Sandboxing

## Objectives

Establish a hardened, defense-in-depth security boundary for agent tool execution per Sections 80–85 of `ORCHESTRAI-IMPLEMENTATION.md`. Every tool call flows through a multi-layer enforcement stack before any side-effects are allowed to reach the host system or external services.

1. **Capability-Based Security Model (`src/capabilities/`)**:
   - `capability.types.ts`: `Capability` enum (`FILE_READ`, `FILE_WRITE`, `NETWORK_OUTBOUND`, `SHELL_EXEC`, `MEMORY_READ`, `MEMORY_WRITE`, `DATABASE_READ`, `DATABASE_WRITE`) and `CapabilitySet`.
   - `capability-grant.schema.ts`: Zod schema for capability grants with scope constraints (path prefix, domain allow-lists, query allow-lists).
   - `capability-evaluator.ts`: Evaluates whether a resolved capability grant permits a specific operation, enforcing scope constraints.

2. **RBAC / ABAC Policy Engine (`src/policy/`)**:
   - `policy.types.ts`: `PolicyRule`, `PolicyEffect` (`ALLOW` / `DENY`), `PolicyContext` (agent ID, tenant ID, tool ID, operation).
   - `policy-engine.ts`: Ordered rule evaluation with explicit DENY-first precedence — matching `DENY` rules immediately block, `ALLOW` rules permit, default deny if no rule matches.
   - `policy-store.interface.ts`: `IPolicyStore` abstraction for in-memory and persistent policy storage.
   - `memory-policy-store.ts`: Development in-memory policy store.

3. **Path Jail & Filesystem Sandbox (`src/sandbox/`)**:
   - `path-jail.ts`: Enforces that all file operations are constrained within a declared workspace root. Resolves symlinks and checks real path prefix, preventing directory traversal attacks (`../../../etc/passwd`).
   - `network-allowlist.ts`: Domain and protocol allowlist enforcing that all outbound HTTP calls target permitted destinations only.
   - `resource-quota.ts`: Per-agent resource quota tracker enforcing CPU time budgets, max output bytes, and max tool calls per execution window.

4. **Sandboxed Execution Wrapper (`src/executor/`)**:
   - `sandbox-context.ts`: Immutable per-execution sandbox context carrying agent ID, granted capabilities, path jail root, network allowlist, and resource quota snapshot.
   - `sandbox-executor.ts`: Wraps all tool invocations: resolves sandbox context → evaluates capability → evaluates RBAC policy → runs quota checks → invokes tool → records resource usage.

5. **Audit Trail (`src/audit/`)**:
   - `audit-event.schema.ts`: `SecurityAuditEvent` Zod schema capturing `agentId`, `toolId`, `operation`, `decision` (`ALLOW` / `DENY`), `reason`, `timestamp`, `traceId`.
   - `audit-logger.ts`: Structured security audit log emitter (console in dev, structured JSON in prod via `@orchestrai/logger`).
   - `audit-store.interface.ts`: `IAuditStore` contract for persistent audit trail storage.

---

## Directory Structure

```text
packages/tools/src/
├── capabilities/
│   ├── capability.types.ts
│   ├── capability-grant.schema.ts
│   ├── capability-evaluator.ts
│   └── index.ts
├── policy/
│   ├── policy.types.ts
│   ├── policy-engine.ts
│   ├── policy-store.interface.ts
│   ├── memory-policy-store.ts
│   └── index.ts
├── sandbox/
│   ├── path-jail.ts
│   ├── network-allowlist.ts
│   ├── resource-quota.ts
│   └── index.ts
├── executor/
│   ├── sandbox-context.ts
│   ├── sandbox-executor.ts
│   └── index.ts
├── audit/
│   ├── audit-event.schema.ts
│   ├── audit-logger.ts
│   ├── audit-store.interface.ts
│   └── index.ts
└── index.ts
```

---

## Security Execution Flow

```
Tool Call Requested
        │
        ▼
[ Capability Evaluation ]  ─── No capability granted? ──► DENY (403)
        │
        ▼
[ RBAC / ABAC Policy ]     ─── Matching DENY rule?   ──► DENY (403)
        │
        ▼
[ Path Jail / Network ]    ─── Path escape detected? ──► DENY (400)
        │
        ▼
[ Resource Quota ]         ─── Quota exceeded?        ──► DENY (429)
        │
        ▼
[ Tool Execution ]         ─── Runtime error?         ──► Contained Error
        │
        ▼
[ Audit Log Emitted ]      (ALLOW or DENY always logged)
        │
        ▼
       Result
```

---

## Usage Example

```typescript
import { SandboxExecutor, SandboxContext } from "@orchestrai/tools/executor";
import { Capability } from "@orchestrai/tools/capabilities";

const context = SandboxContext.create({
  agentId: "agent-abc",
  tenantId: "tenant-xyz",
  capabilities: [Capability.FILE_READ, Capability.NETWORK_OUTBOUND],
  pathJailRoot: "/workspace/projects/my-project",
  networkAllowlist: ["api.openai.com", "api.groq.com"],
  quotas: { maxToolCallsPerRun: 50, maxOutputBytes: 1_000_000 },
});

const executor = new SandboxExecutor(context, policyEngine, auditLogger);
const result = await executor.run(toolRegistry, "read_file", { path: "src/main.ts" });
```

---

## Verification & Quality Gates

- **`pnpm --filter @orchestrai/tools build`**: Dual ESM/CJS and DTS output compiled cleanly.
- **`pnpm typecheck`**: All workspace projects passing.
- **`pnpm lint`**: Clean pass (`--max-warnings=0`).
- **`pnpm build`**: Full monorepo build passing.
- **250-Line Rule**: All files strictly < 250 lines.
- **Security Review**: Path traversal, SSRF, and capability escalation vectors verified blocked.
