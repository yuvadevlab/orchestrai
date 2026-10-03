/**
 * @file packages/regex/src/harness.regex.ts
 * @description Centralized regular expressions for Agent Harness engineering, YAML frontmatter,
 * and compiler/linter diagnostic output parsing (TSC, ESLint, Ruff).
 * @module @orchestrai/regex
 */

/**
 * Matches markdown YAML frontmatter blocks delimited by triple-dashed lines (`---`).
 * Group 1 captures the inner YAML text content.
 */
export const YAML_FRONTMATTER_REGEX: RegExp = /^---\r?\n([\s\S]*?)\r?\n---/;

/**
 * Matches standard key-value assignments in YAML frontmatter (e.g. `name: "My Skill"` or `description: Foo`).
 * Group 1 captures the key name; Group 2 captures the raw value string.
 */
export const YAML_KEY_VALUE_REGEX: RegExp = /^([a-zA-Z0-9_-]+)\s*:\s*(.*)$/;

/**
 * Matches TypeScript compiler CLI error diagnostics formatted as:
 * `path/to/file.ts(line,col): error TS1234: Message content`
 * Group 1: File path, Group 2: Line, Group 3: Column, Group 4: Code, Group 5: Message.
 */
export const TSC_DIAGNOSTIC_REGEX: RegExp = /^(.+?)\((\d+),(\d+)\):\s+error\s+(TS\d+):\s+(.+)$/;

/**
 * Matches ESLint default text reporter output lines formatted as:
 * `  12:5  error  'foo' is defined but never used  @typescript-eslint/no-unused-vars`
 * Group 1: Line, Group 2: Column, Group 3: Severity, Group 4: Message, Group 5: Rule ID.
 */
export const ESLINT_DIAGNOSTIC_REGEX: RegExp =
  /^\s*(\d+):(\d+)\s+(error|warning)\s+(.+?)\s+([a-zA-Z0-9/@_-]+)$/;

/**
 * Matches ESLint compact text output lines formatted as:
 * `/path/to/file.ts: line 12, col 5, Error - 'foo' is defined but never used. (rule-name)`
 * Group 1: File, Group 2: Line, Group 3: Column, Group 4: Severity, Group 5: Message, Group 6: Rule ID.
 */
export const ESLINT_COMPACT_DIAGNOSTIC_REGEX: RegExp =
  /^(.+?):\s*line\s*(\d+),\s*col\s*(\d+),\s*(Error|Warning)\s*-\s*(.+?)(?:\s*\((.+)\))?$/;

/**
 * Matches Python Ruff linter error lines formatted as:
 * `path/to/file.py:12:5: F401 `os` imported but unused`
 * Group 1: File path, Group 2: Line, Group 3: Column, Group 4: Rule code, Group 5: Message.
 */
export const RUFF_DIAGNOSTIC_REGEX: RegExp = /^(.+?):(\d+):(\d+):\s+([A-Z0-9]+)\s+(.+)$/;

/**
 * Matches fenced JSON or tool_call code blocks in raw model streaming outputs.
 * Group 1 captures the inner serialized JSON payload.
 */
export const TOOL_CALL_BLOCK_REGEX: RegExp = /```(?:tool_call|json)\s*\n?([\s\S]*?)\n?```/;

/**
 * Matches Markdown code block CSS class name to extract the programming language identifier.
 * Group 1: Language identifier (e.g., 'typescript', 'json').
 */
export const LANGUAGE_CLASS_REGEX: RegExp = /language-(\w+)/;

/**
 * Matches raw tool_call and JSON fenced code blocks to strip them from user-facing Markdown renderings.
 */
export const STRIP_TOOL_CALLS_REGEX: RegExp =
  /```(?:tool_call|json)\s*\n?\{[\s\S]*?"tool"[\s\S]*?\}\s*\n?```/g;
