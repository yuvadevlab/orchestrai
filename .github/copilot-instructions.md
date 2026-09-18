# GitHub Copilot Instructions for OrchestrAI

You are working on OrchestrAI, a local-first, modular AI agent platform.

## Architecture & Code Standards

1. **Monorepo Structure**:
   - `packages/core`: Pure types and schemas (Zod). Zero internal dependencies.
   - `packages/*`: Domain libraries (models, tools, agent, runtime, queue, events, memory, rag, observability, sdk).
   - `apps/*`: Applications (`gateway`, `worker`, `realtime`, `console`).
2. **TypeScript & Validation**:
   - Strict typing is mandatory. Do not use `any`.
   - Validate all external data with Zod schemas.
   - Use NodeNext module resolution and explicit imports.
3. **Session State**:
   - Always refer to `PROGRESS.md` for current phase tracking and tasks.
   - Follow instructions in `.agents/AGENTS.md` and `.agents/rules/`.
