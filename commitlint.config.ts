import type { UserConfig } from "@commitlint/types";

/**
 * Commitlint Configuration — OrchestrAI
 *
 * Enforces the Conventional Commits specification:
 * https://www.conventionalcommits.org
 *
 * Format:
 *
 *   <type>(<scope>): <subject>
 *
 * Examples:
 *
 *   feat(core): define execution context and agent state schemas
 *   feat(models): add ollama streaming adapter with fallback
 *   fix(gateway): resolve sse connection leak on client abort
 *   refactor(runtime): split langgraph state transitions into sub-nodes
 *   perf(rag): add hnsw indexing for embedding vector queries
 *   docs(phases): complete phase-01 core contracts guide
 *   chore(deps): upgrade turborepo to latest version
 *
 * Breaking changes:
 *
 *   feat(core)!: restructure agent execution lifecycle event schema
 *
 *   BREAKING CHANGE: Event envelope format now requires tenantId.
 */

const config: UserConfig = {
  extends: ["@commitlint/config-conventional"],

  rules: {
    // ─── Type ────────────────────────────────────────────────────────────────
    "type-enum": [
      2,
      "always",
      [
        "feat",
        "fix",
        "perf",
        "refactor",
        "style",
        "test",
        "docs",
        "build",
        "ci",
        "chore",
        "revert",
      ],
    ],

    "type-case": [2, "always", "lower-case"],
    "type-empty": [2, "never"],

    // ─── Scope ────────────────────────────────────────────────────────────────
    // Scope is mandatory in this monorepo.
    // Prefer package/app/service names.
    "scope-empty": [2, "never"],

    "scope-case": [2, "always", "kebab-case"],

    "scope-enum": [
      1,
      "always",
      [
        // Applications
        "gateway",
        "worker",
        "realtime",
        "console",

        // Packages
        "core",
        "models",
        "tools",
        "agent",
        "runtime",
        "queue",
        "events",
        "memory",
        "rag",
        "observability",
        "sdk",
        "eval",

        // Phases
        "phase-0",
        "phase-1",
        "phase-2",
        "phase-3",
        "phase-4",
        "phase-5",

        // Tooling
        "eslint",
        "prettier",
        "husky",
        "commitlint",
        "turbo",
        "tsconfig",

        // General
        "workspace",
        "deps",
        "docs",

        // Infrastructure
        "infra",
        "docker",
        "postgres",
        "redis",
        "ollama",
        "nginx",
        "monitoring",
      ],
    ],

    // ─── Subject ────────────────────────────────────────────────────────────────
    "subject-empty": [2, "never"],
    "subject-full-stop": [2, "never", "."],
    "subject-min-length": [2, "always", 8],
    "subject-max-length": [2, "always", 100],

    // ─── Header ────────────────────────────────────────────────────────────────
    "header-max-length": [2, "always", 100],

    // ─── Body ────────────────────────────────────────────────────────────────
    "body-leading-blank": [2, "always"],
    "body-max-line-length": [2, "always", 100],

    // ─── Footer ────────────────────────────────────────────────────────────────
    "footer-leading-blank": [2, "always"],
    "footer-max-line-length": [2, "always", 100],
  },
};

export default config;
