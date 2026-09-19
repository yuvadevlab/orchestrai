# Apps

Deployable runtimes and user-facing applications for OrchestrAI.

## Architecture

| App                         | Responsibility                                                                  | Port (Default) |
| --------------------------- | ------------------------------------------------------------------------------- | -------------- |
| [`gateway`](apps/gateway)   | Primary ingress API (REST, WebSocket, SSE), auth, routing, rate limiting        | `4001`         |
| [`worker`](apps/worker)     | Background task execution engine (BullMQ/Redis), agent runs, long-running steps | `4003`         |
| [`realtime`](apps/realtime) | High-throughput streaming broker, WebSocket execution events, pub/sub bridge    | `4002`         |
| [`console`](apps/console)   | Operator dashboard & agent console UI (Next.js App Router)                      | `3001`         |

> **Port Allocation Policy:** Ports `3000` (Web) and `4000` (API) are dedicated to the sibling **FinAI** application. OrchestrAI services use `3001` (Console), `4001` (Gateway), `4002` (Realtime Broker), and `4003` (Worker diagnostics) to avoid port clashes.

All applications consume shared libraries from `packages/*`.
