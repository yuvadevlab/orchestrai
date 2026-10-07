# OrchestrAI Agent Guidelines

The master instructions for all AI agents (Antigravity, Claude Code, GitHub Copilot, Cursor) are located in:
[`.agents/AGENTS.md`](.agents/AGENTS.md)

All agents must read and adhere to:

1. [`.agents/rules/00-core-invariants.md`](.agents/rules/00-core-invariants.md) — 250-line rule, code splitting, detailed JSDoc, explanatory comments.
2. [`.agents/rules/architecture.md`](.agents/rules/architecture.md) — Monorepo boundaries and inward dependency flows.
3. [`.agents/rules/coding-standards.md`](.agents/rules/coding-standards.md) — Strict TypeScript, barrel imports, Zod validation, and logger formatting.
4. [`.agents/rules/session-continuity.md`](.agents/rules/session-continuity.md) — Session handoff protocol and progress tracking.
5. [`PROGRESS.md`](PROGRESS.md) — Live phase tracking checklist.
6. **Testing Policy** — While implementing phases, DO NOT implement test cases (unit, e2e, integration) or Storybook stories until explicitly requested by the user.
7. **Zero Hardcoded Strings, Constants, Models & Strict Enum Usage**:
   - NO raw hardcoded string literals or magic numbers for domain entities, query/route parameters (e.g. `QUERY_PARAMS.PROVIDER_ID`, `ROUTE_PARAMS.AGENT_ID`), statuses, roles, event types, modes, scopes, HTTP methods (`HttpMethod`), or state transitions. Always use shared `Enum.KEY` and centralized constants.
   - Zero hardcoded fallback model constants (`DEFAULT_FALLBACK_CANDIDATE`, `"gemma4:31b-cloud"`, `"qwen2.5:7b"`); zero synthetic fallback agents or auto-seeding.
   - Zero hardcoded fallback mock responses in API hooks (e.g. dynamic platform data instead of static arrays/chips).
8. **Barrel Imports & Modular Structure**:
   - Always import from module or package barrels (e.g. `import { ... } from "@orchestrai/shared-types"` or `@/features/tools/api`) instead of deep nested paths like `../folder/**` or `@/folder/sub/sub/file.ts`.
   - Never create duplicate/competing barrels (e.g. no `constants.ts` alongside a `constants/index.ts` directory).
9. **Standardized Logger Formatting (`@yuva-devlab/logger`)**:
   - Instantiate as `new Logger("ClassName")`.
   - Log messages MUST strictly follow `"methodName: description of the action"` with JSON metadata as the second parameter (e.g. `this.logger.info("listProviders: fetching providers", { tenantId })`).
   - Do NOT duplicate the class name in the message string (avoid `"[ClassName] description"`).
10. **Dynamic Server-Driven Configuration (Big 3 Standard) & Centralized Regex**:
    - All operational parameters, slash commands, system prompts, max execution steps, and suggestions must be dynamic and control-plane-driven.
    - All regexes must originate from `@orchestrai/regex`. Zero inline regexes.
