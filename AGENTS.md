# OrchestrAI Agent Guidelines

The master instructions for all AI agents (Antigravity, Claude Code, GitHub Copilot, Cursor) are located in:
[`.agents/AGENTS.md`](.agents/AGENTS.md)

All agents must adhere to:

0. **Zero Commits Without Explicit Confirmation (CRITICAL)**:
   - NEVER execute `git commit`, `git push`, or open pull requests in ANY repository unless the user explicitly commands it in the current turn (e.g. "commit these changes", "commit and push").
   - Directives like "start", "proceed", "fix this", "implement", "build", or "test" authorize implementation, building, and running tests ONLY.
   - Always leave changes staged or in the working tree, present verification results, and wait for confirmation.
1. **Organization Standards & `.github` Inheritance**:
   - Standardize all author and committer attribution to `yuva.devlab@gmail.com`.
   - Branch naming must strictly follow: `^(feat|fix|refactor|perf|chore|docs|test|ci|hotfix)/[a-z0-9-]+$`.
   - PR descriptions must adhere to the 5-section high-signal standard defined in `yuvadevlab/.github` (Summary, Changes, How to Test, Proof of Verification, Risks).
   - Commits must conform to Conventional Commits: `<type>(<optional-scope>): <imperative summary>`.
2. **Pure Platform CSS & Design Tokens**:
   - Utility-first CSS frameworks are prohibited. All styling is implemented using pure platform CSS, W3C Cascade Layers (`@layer dl-*`), and design tokens from `@yuva-devlab/tokens`.
3. [`.agents/rules/00-core-invariants.md`](.agents/rules/00-core-invariants.md) — 250-line rule, code splitting, detailed JSDoc, explanatory comments.
4. [`.agents/rules/architecture.md`](.agents/rules/architecture.md) — Monorepo boundaries and inward dependency flows.
5. [`.agents/rules/coding-standards.md`](.agents/rules/coding-standards.md) — Strict TypeScript and Zod validation.
6. [`.agents/rules/session-continuity.md`](.agents/rules/session-continuity.md) — Session handoff protocol and progress tracking.
7. [`PROGRESS.md`](PROGRESS.md) — Live phase tracking checklist.
8. **Testing Policy** — While implementing phases, DO NOT implement test cases (unit, e2e, integration) or Storybook stories until explicitly requested by the user.
9. **Zero Hardcoded Strings, Models & Strict Enum Usage** — NO raw hardcoded string literals for domain entities, statuses, roles, event types, modes, scopes, or state transitions (always use shared `Enum.KEY`); zero hardcoded fallback model constants (`DEFAULT_FALLBACK_CANDIDATE`, `"gemma4:31b-cloud"`, `"qwen2.5:7b"`); zero synthetic fallback agents or auto-seeding.
10. **Dynamic Server-Driven Configuration (Big 3 Standard) & Centralized Regex** — NO client or worker application may hardcode operational parameters (slash commands, system prompts, max execution steps, sampling temperatures, compaction thresholds, cache similarity/TTL, RAG chunking parameters, retention policies, or starter suggestions). All operational behaviors must be dynamic, database- or control-plane-driven, served via Gateway APIs (`/api/v1/platform/...`), and cached with stale-while-revalidate IndexedDB persistence. All regexes must originate from `@orchestrai/regex`.

11. **Next.js Page & Layout Invariant (Pure SSR Wrappers)** — All `page.tsx` and `layout.tsx` files across Next.js apps MUST remain Server Components (`SSR`). NEVER mark `page.tsx` or `layout.tsx` with `"use client"`. They act strictly as server wrappers (handling metadata, SSR prefetching, server data fetching, and rendering client view components). All interactive client logic, state, and browser APIs must reside in dedicated client components under `features/<feature>/components/` or `components/`. All authentication routes must be grouped under `app/(auth)/...`.

12. **Feature-Scoped TanStack Query Hook Encapsulation (Universal Web Standard)**:
    - Direct inline calls to `useQuery`, `useMutation`, or raw `apiClient`/`fetch` calls inside UI components are strictly forbidden.
    - All server state queries, mutations, query keys, and SSR prefetch helpers must be encapsulated in dedicated files under `features/<feature>/api/` (e.g., `use-agents.ts`, `use-agent-mutations.ts`).
    - Components must exclusively consume these exported custom hooks.

13. **Strict `UI_COPY` Centralization Invariant (Zero Exceptions)**:
    - ALL user-facing text (labels, headers, button text, placeholders, empty states, error messages, toast copy, and dialog descriptions) MUST be centralized in `@/lib/ui-copy/` dictionaries.
    - Direct raw hardcoded strings in JSX/TSX components are strictly prohibited.
