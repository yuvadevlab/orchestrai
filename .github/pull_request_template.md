## Description

Provide a clear and concise summary of the changes introduced by this pull request.

---

## Type of Change

- [ ] `feat`: New feature or capability
- [ ] `fix`: Bug fix
- [ ] `refactor`: Code restructuring with no functional change
- [ ] `perf`: Performance improvement
- [ ] `docs`: Documentation updates
- [ ] `test`: Unit / integration test additions
- [ ] `chore`: Tooling, dependencies, or infrastructure updates

---

## Architectural & Quality Gates Checklist

- [ ] **Hard 250-Line Limit**: No modified or newly added file exceeds 250 lines.
- [ ] **Decomposition**: Files approaching 200 lines have been decomposed into focused submodules.
- [ ] **JSDoc**: All exported functions, types, schemas, and classes have complete JSDoc comments.
- [ ] **Explanatory Comments**: Conditionals, guards, and edge cases have explanatory inline comments.
- [ ] **Package Boundaries**: Contracts originate in `@orchestrai/core`; no duplicate types or circular dependencies.
- [ ] **Typecheck**: `pnpm typecheck` passed cleanly across the workspace.
- [ ] **Lint**: `pnpm lint` passed with 0 errors and 0 warnings.
- [ ] **Conventional Commits**: Commit messages conform to `commitlint.config.ts`.
