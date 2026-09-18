# Apps

Deployable runtimes and user-facing applications for OrchestrAI.

## Architecture

| App                                                                                        | Responsibility                                                                  | Port (Default) |
| ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------- | -------------- |
| [`gateway`](file:///Users/yuvarajpattabi/Yuva/yuva-devlab/Repos/orchestrai/apps/gateway)   | Primary ingress API (REST, WebSocket, SSE), auth, routing, rate limiting        | `4000`         |
| [`worker`](file:///Users/yuvarajpattabi/Yuva/yuva-devlab/Repos/orchestrai/apps/worker)     | Background task execution engine (BullMQ/Redis), agent runs, long-running steps | -              |
| [`realtime`](file:///Users/yuvarajpattabi/Yuva/yuva-devlab/Repos/orchestrai/apps/realtime) | High-throughput streaming broker, WebSocket execution events, pub/sub bridge    | `4001`         |
| [`console`](file:///Users/yuvarajpattabi/Yuva/yuva-devlab/Repos/orchestrai/apps/console)   | Operator dashboard & agent console UI (Next.js / Vite React)                    | `3000`         |

All applications consume shared libraries from `packages/*`.
