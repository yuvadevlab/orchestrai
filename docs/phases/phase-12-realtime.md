# Phase 12: `apps/realtime` — Real-Time Streaming & WebSocket Server

## Objectives

Establish the standalone, high-performance real-time streaming broker application (`@orchestrai/realtime`) for OrchestrAI, providing:

1. **Configuration & Validation (`src/config/`)**:
   - `realtime-config.ts`: Zod schema validating `PORT`, `HOST`, `REDIS_URL`, `JWT_SECRET`, `CORS_ORIGIN`, `HEARTBEAT_INTERVAL_MS`, and `MAX_CONNECTIONS`.
2. **Channel & Wire Protocol Contracts (`src/contracts/`)**:
   - `channel-topics.ts`: Standard channel formatters and parsers (`executions:{id}`, `agents:{id}`, `presence:{id}`, `system:alerts`).
   - `ws-protocol.types.ts`: Bidirectional message schemas for SUBSCRIBE, UNSUBSCRIBE, PING, PONG, AUTH, ACTION, EVENT, and PRESENCE.
3. **Connection & Session Registry (`src/connection/`)**:
   - `client-session.ts`: Unified abstraction across WebSocket and SSE connections with heartbeat tracking.
   - `connection-registry.ts`: Concurrent session registry supporting lookups by session ID, user ID, channel topic, and backpressure guards.
4. **Redis Pub/Sub Broker (`src/broker/`)**:
   - `redis-pubsub-broker.interface.ts`: `IRedisPubSubBroker` contract for publish/subscribe fan-out.
   - `redis-pubsub-broker.ts`: Dual-client Redis Pub/Sub adapter with automatic in-process fallback for isolated dev environments.
5. **Subscription Engine (`src/subscriptions/`)**:
   - `subscription-manager.ts`: Manages channel bindings across sessions with wildcards, deduplication, and dynamic unsubscription on disconnect.
6. **Presence System (`src/presence/`)**:
   - `presence-manager.ts`: Tracks active viewers and operators per execution room with JOIN/LEAVE broadcasts.
7. **Server-Sent Events (SSE) Subsystem (`src/sse/`)**:
   - `sse-channel.ts`: Line-protocol formatting, keepalive comments (`: keepalive`), and multi-line data framing.
   - `sse-handler.ts`: HTTP request handlers for single-execution streams (`/api/v1/stream/executions/:id`) and global event streams (`/api/v1/stream/events`).
8. **WebSocket Gateway Subsystem (`src/websocket/`)**:
   - `ws-authenticator.ts`: Bearer token extraction and authentication verification.
   - `ws-message-handler.ts`: Validates client payloads and dispatches commands.
   - `ws-gateway.ts`: Manages the `WebSocketServer`, connection upgrades on `/ws`, and periodic heartbeat sweeps.
9. **Server Coordinator & Lifecycle (`src/server/`)**:
   - `http-router.ts`: Lightweight zero-dependency HTTP router handling `/health`, `/metrics`, and SSE streaming routes with CORS headers.
   - `realtime-server.ts`: Coordinates the HTTP server, WebSocket gateway, Redis Pub/Sub broker, and cross-protocol fan-out.
   - `lifecycle.ts`: Two-stage graceful shutdown coordinator trapping `SIGTERM` and `SIGINT` with connection draining.
10. **Application Entrypoint (`src/index.ts`)**:
    - Environment bootstrapping, server initialization, and lifecycle registration.

---

## Directory Structure

```text
apps/realtime/
├── .env.example
├── package.json
├── tsconfig.json
├── tsup.config.ts
└── src/
    ├── broker/
    │   ├── redis-pubsub-broker.interface.ts
    │   ├── redis-pubsub-broker.ts
    │   └── index.ts
    ├── config/
    │   ├── realtime-config.ts
    │   └── index.ts
    ├── connection/
    │   ├── client-session.ts
    │   ├── connection-registry.ts
    │   └── index.ts
    ├── contracts/
    │   ├── channel-topics.ts
    │   ├── ws-protocol.types.ts
    │   └── index.ts
    ├── presence/
    │   ├── presence-manager.ts
    │   └── index.ts
    ├── server/
    │   ├── http-router.ts
    │   ├── lifecycle.ts
    │   ├── realtime-server.ts
    │   └── index.ts
    ├── sse/
    │   ├── sse-channel.ts
    │   ├── sse-handler.ts
    │   └── index.ts
    ├── subscriptions/
    │   ├── subscription-manager.ts
    │   └── index.ts
    ├── websocket/
    │   ├── ws-authenticator.ts
    │   ├── ws-gateway.ts
    │   ├── ws-message-handler.ts
    │   └── index.ts
    └── index.ts
```

---

## Verification & Invariants

- **Prime Invariant 1 (250-Line Rule)**: All 27 files in `apps/realtime/src/` are strictly < 180 lines.
- **Prime Invariant 2 (JSDoc & Rationale)**: Every exported symbol includes comprehensive JSDoc and every control flow statement has rationale comments.
- **Prime Invariant 3 (Package Boundaries)**: Relies on `@orchestrai/core`, `@orchestrai/shared-types`, and `@orchestrai/logger`.
- **Testing Policy**: 0 test cases added per user mandate.
- **Quality Gates**: `pnpm --filter @orchestrai/realtime build`, repo-wide `pnpm typecheck` (21 of 21 projects passing), `pnpm lint` (0 warnings), and monorepo `pnpm build` (12 of 12 packages passing).
