/**
 * @file packages/shared-types/src/harness.ts
 * @description Type definitions and contracts for Agent Harness Engineering, workspace markdown
 * discovery (AGENTS.md, rules, skills), code verification gates, and diagnostics reporting.
 * @module @orchestrai/shared-types
 */

/**
 * Diagnostic error severity classification.
 */
export enum DiagnosticSeverity {
  ERROR = "error",
  WARNING = "warning",
  INFO = "info",
}

/**
 * Supported compiler and linter tools for code standards verification.
 */
export enum DiagnosticToolType {
  TSC = "tsc",
  ESLINT = "eslint",
  RUFF = "ruff",
  PRETTIER = "prettier",
  SYNTAX = "syntax",
  WORKSPACE_RULE = "workspace_rule",
}

/**
 * Discovered workspace instruction source category.
 */
export enum WorkspaceInstructionType {
  AGENTS_MD = "agents_md",
  RULE = "rule",
  SKILL = "skill",
  COPILOT = "copilot",
  CLAUDE = "claude",
  CURSOR = "cursor",
}

/**
 * Single diagnostic error or warning item produced by a compiler or linter.
 */
export interface HarnessDiagnosticItem {
  /** Relative or absolute file path */
  readonly file: string;
  /** Line number (1-indexed) if applicable */
  readonly line?: number;
  /** Column number (1-indexed) if applicable */
  readonly column?: number;
  /** Diagnostic code (e.g. "TS2304", "@typescript-eslint/no-unused-vars", "F401") */
  readonly code?: string;
  /** Human-readable explanation of the issue */
  readonly message: string;
  /** Severity level */
  readonly severity: DiagnosticSeverity;
  /** Originating tool */
  readonly tool: DiagnosticToolType;
}

/**
 * Complete verification report returned by the workspace diagnostic gate.
 */
export interface HarnessDiagnosticReport {
  /** True if zero errors were detected */
  readonly passed: boolean;
  /** List of extracted diagnostic items */
  readonly diagnostics: readonly HarnessDiagnosticItem[];
  /** High-level summary string suitable for direct injection into agent context */
  readonly summary: string;
  /** Raw compiler/linter stdout or stderr output */
  readonly rawOutput?: string;
  /** Duration of diagnostic run in milliseconds */
  readonly durationMs: number;
}

/**
 * Metadata representation of a workspace skill discovered from SKILL.md.
 */
export interface WorkspaceSkillMetadata {
  /** Canonical name of the skill */
  readonly name: string;
  /** Purpose and usage description extracted from frontmatter */
  readonly description: string;
  /** File system path to the SKILL.md document */
  readonly path: string;
  /** Optional trigger phrases or keywords */
  readonly triggers?: readonly string[];
  /** Markdown instruction content body */
  readonly instructions?: string;
}

/**
 * Metadata representation of a modular workspace rule discovered from .agents/rules/*.md.
 */
export interface WorkspaceRuleMetadata {
  /** Rule name or file basename */
  readonly name: string;
  /** File system path to the rule markdown file */
  readonly path: string;
  /** Markdown text content of the rule */
  readonly content: string;
}

/**
 * Aggregated workspace harness context discovered dynamically on execution startup.
 */
export interface WorkspaceHarnessContext {
  /** Discovered root instruction files (AGENTS.md, CLAUDE.md, etc.) */
  readonly rootInstructions: readonly { readonly name: string; readonly content: string }[];
  /** Discovered modular rule files (.agents/rules/*.md, etc.) */
  readonly rules: readonly WorkspaceRuleMetadata[];
  /** Discovered on-demand skills (.agents/skills subdirectories, etc.) */
  readonly skills: readonly WorkspaceSkillMetadata[];
  /** Monorepo root directory */
  readonly workspaceRoot: string;
}
