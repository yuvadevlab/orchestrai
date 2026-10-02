# Apps

Deployable runtimes, sidecars, and user-facing applications for OrchestrAI.

## Architecture & Port Directory

| App                            | Runtime      | Responsibility                                                                 | Port (Default) |
| ------------------------------ | ------------ | ------------------------------------------------------------------------------ | -------------- |
| [`gateway`](gateway)           | Node.js/TS   | Primary ingress API (REST, WebSocket, SSE), auth, routing, rate limiting       | `4001`         |
| [`console`](console)           | Next.js 15   | Operator studio & agent cockpit UI (React 19 App Router)                       | `3001`         |
| [`realtime`](realtime)         | Node.js/TS   | High-throughput streaming broker, WebSocket execution events, pub/sub bridge   | `4002`         |
| [`worker`](worker)             | Node.js/TS   | Background task execution engine (BullMQ/Redis), agent runs, step jobs         | `4003`         |
| [`orchestrator`](orchestrator) | Node.js/TS   | Dedicated gRPC execution coordinator & StateGraph DAG runtime engine           | `50051` (gRPC) |
| [`admin`](admin)               | Node.js/TS   | Tenant administration, API keys, platform telemetry, and backoffice management | `4004`         |
| [`intelligence`](intelligence) | Python 3.11+ | LangGraph StateGraph autonomous reasoning engine & Conversational RAG sidecar  | `8082`         |
| [`crawler`](crawler)           | Python 3.11+ | Playwright headless browser automation, web scraper, and RAG ingestion service | `8083`         |

> **Port Allocation Policy:** Ports `3000` (Web) and `4000` (API) are reserved for sibling workspace apps. OrchestrAI services use `3001` (Console), `4001` (Gateway), `4002` (Realtime), `4003` (Worker), `4004` (Admin), `50051` (Orchestrator gRPC), `8082` (Intelligence), and `8083` (Crawler) to guarantee zero port collisions.

All applications consume shared contracts and packages from `packages/*`.
