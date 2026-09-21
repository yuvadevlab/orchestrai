# Phase 18: `packages/sdk` — Client SDK with AI Cost Protection & HMAC Signing

## Objectives

Establish the official TypeScript client SDK (`@orchestrai/sdk`) for the OrchestrAI platform, providing:

1. **Enterprise Security & AI Cost Protection**:
   - **Dual Credential Architecture**: Supports paired `clientId` (public identity) and `clientSecret` (private key) in addition to static API keys and Bearer tokens.
   - **HMAC-SHA256 Request Signing**: The `clientSecret` is never sent over the wire. Every HTTP request is signed using standard Web Crypto HMAC-SHA256 across `METHOD`, `PATH`, `TIMESTAMP`, `NONCE`, and `CONTENT_HASH`.
   - **Anti-Replay & Denial-of-Wallet (DoW) Defense**: Cryptographic nonces and timestamps protect against packet capture and malicious re-invocation of expensive agent loops.
   - **Automatic Idempotency**: Every stateful mutation (`agents.run`, `executions.create`, `rag.ingest`) includes an auto-generated `Idempotency-Key` preventing duplicate billing during network retries.
   - **Cost & Token Budget Guards**: Configurable `maxBudgetUsd`, `maxTokenBudget`, and `maxSteps` enforce financial boundaries at the client level.
   - **Credential Masking**: Automatic redaction of secrets in debug strings, headers, and error objects.

2. **Universal Standard Compatibility**:
   - Zero external runtime framework dependencies.
   - Built on standard Web `fetch`, Web `ReadableStream`, and Web Crypto (`crypto.subtle`), ensuring 100% compatibility across Node.js 18+, modern browsers, Cloudflare Workers, Deno, and Bun.

3. **Ergonomic Streaming & Fluent Resources**:
   - Zero-dependency Server-Sent Events (SSE) stream parser yielding a strongly typed `AsyncIterableIterator<StreamEvent>`.
   - Native `for await (const event of execution.stream())` consumption.
   - Fluent resource namespaces:
     - `client.agents`: `list()`, `get()`, `create()`, `update()`, `run()` (returns `ExecutionHandle`)
     - `client.executions`: `get()`, `list()`, `cancel()`, `resume()`, `stream()`
     - `client.conversations`: `create()`, `getMessages()`, `sendMessage()`
     - `client.rag`: `ingest()`, `query()`
     - `client.approvals`: `list()`, `resolve()`

---

## Directory Structure

```text
packages/sdk/
├── package.json
├── tsconfig.json
├── tsconfig.build.json
├── tsup.config.ts
└── src/
    ├── types/
    │   ├── client-options.ts       # OrchestrAIClientOptions & budget definitions
    │   ├── api-responses.ts        # Typed resource models and paginated lists
    │   ├── security.types.ts       # HMAC credentials, headers, and budget interfaces
    │   └── index.ts
    ├── security/
    │   ├── nonce-generator.ts      # Cryptographically secure UUIDv4 nonces
    │   ├── hmac-signer.ts          # Web Crypto HMAC-SHA256 request signing
    │   ├── credential-sanitizer.ts # Masking of tokens, secrets, and auth headers
    │   └── index.ts
    ├── errors/
    │   ├── sdk-error.ts            # Base OrchestrAISDKError with correlation tracking
    │   ├── http-errors.ts          # AuthenticationError, RateLimitError, BudgetExceededError, etc.
    │   └── index.ts
    ├── transport/
    │   ├── retry-policy.ts         # Exponential backoff with full jitter
    │   ├── idempotency.ts          # Automatic idempotency key manager
    │   ├── error-mapper.ts         # HTTP status to typed error mapper
    │   ├── http-client.ts          # Resilient Web fetch with HMAC signing and streaming
    │   └── index.ts
    ├── streaming/
    │   ├── sse-parser.ts           # Zero-dependency SSE line parser
    │   ├── stream-iterator.ts      # AsyncIterable wrapper for for-await loops
    │   └── index.ts
    ├── resources/
    │   ├── resource-base.ts        # Base class holding transport
    │   ├── execution-handle.ts     # Fluent handle (.stream(), .wait(), .cancel())
    │   ├── agents.ts               # client.agents
    │   ├── executions.ts           # client.executions
    │   ├── conversations.ts        # client.conversations
    │   ├── rag.ts                  # client.rag
    │   ├── approvals.ts            # client.approvals
    │   └── index.ts
    ├── client.ts                   # OrchestrAIClient master class
    └── index.ts                    # Public API exports & createOrchestrAIClient factory
```

---

## Usage Example

```typescript
import { createOrchestrAIClient } from "@orchestrai/sdk";

// Initialize with HMAC signing and cost budget protection
const client = createOrchestrAIClient({
  baseUrl: "http://localhost:8000",
  realtimeUrl: "http://localhost:8001",
  tenantId: "finance-corp",
  clientId: "client_live_94819",
  clientSecret: "sec_live_9204857193",
  defaultBudget: {
    maxBudgetUsd: 2.5,
    maxTokenBudget: 50_000,
    maxSteps: 15,
  },
});

// Launch an agent run with budget guards
const execution = await client.agents.run({
  agent: "financial-analyst",
  mode: "auto",
  input: "Analyze Q3 revenue variance report",
});

// Stream tokens and events in real time
for await (const event of await execution.stream()) {
  console.log(`[${event.event}]`, event.data);
}

// Await final completed record
const result = await execution.wait();
console.log("Execution finished:", result.status);
```

---

## Verification & Quality Gates

- `pnpm --filter @orchestrai/sdk build`: Passed (`ESM: 60ms`, `CJS: 60ms`, `DTS: 344ms`).
- `pnpm typecheck`: 25 tasks passed across all 17 workspace projects.
- `pnpm lint`: Zero warnings (`--max-warnings=0`).
- `pnpm build`: 16 tasks passed cleanly across all monorepo packages.
- Line limit invariant: All 29 files in `packages/sdk/src/` are strictly < 175 lines (limit: 250).
