# Phase 0: Workspace & Engineering Foundation

## Objectives

1. Establish root monorepo tooling with pnpm workspaces and Turborepo.
2. Configure strict TypeScript options and project references.
3. Configure commitlint, husky git hooks, and lint-staged for automated quality gates.
4. Establish directory skeleton (`apps/`, `packages/`, `infrastructure/`, `docs/`, `scripts/`).
5. Set up AI agent workflows and rules (250-line rule, JSDoc standards, explanatory comments).
6. Establish live progress tracking (`PROGRESS.md`, `IMPLEMENTATION-LOG.md`).

## Deliverables

- [x] `package.json` (root workspace scripts, commitlint, husky, lint-staged)
- [x] `pnpm-workspace.yaml` (apps and packages)
- [x] `turbo.json` (pipelines for build, dev, test, lint, typecheck)
- [x] `tsconfig.base.json` & `tsconfig.json`
- [x] `.prettierrc` & `eslint.config.js` with TypeScript & Prettier integration
- [x] `commitlint.config.ts` (conventional commit scopes for monorepo apps and packages)
- [x] `.husky/commit-msg` and `.husky/pre-commit` hooks
- [x] Code standard invariants in `.agents/rules/00-core-invariants.md` (250-line maximum, detailed JSDoc, inline comments)
- [x] AI agent configuration (`AGENTS.md`, `.agents/AGENTS.md`, `CLAUDE.md`, `.github/copilot-instructions.md`)
- [x] Initial `@orchestrai/core` package descriptor, tsconfig, and entrypoint
- [x] Base documentation & Architecture Decision Records (ADR-001)

## Quality Standards Enforced

- **Hard 250-line maximum per file** (proactive split at 200 lines).
- **Comprehensive JSDoc comments** for all exported symbols.
- **Explanatory inline comments** on all conditions, guards, and transitions.
- **Strict Conventional Commits** validated via commitlint.
- **Zero ESLint warnings** enforced before commit via lint-staged.
