/**
 * @file packages/tools/src/security/path-sanitizer.ts
 * @description Path jail and directory traversal protection for filesystem tools.
 *
 * ─── Path Traversal in AI Agents (Learning note) ────────────────────
 * When an LLM generates a file path argument (e.g. `read_file({ path: "../../../etc/passwd" })`),
 * naive string concatenation with the project root allows the model to escape the
 * project directory and read/modify system files.
 *
 * This security utility resolves the target path against the allowed root,
 * normalizes separators, and verifies that the resolved path starts with the root.
 * If it escapes, it throws a POLICY_VIOLATION error immediately.
 * ───────────────────────────────────────────────────────────────────
 */

import path from "node:path";
import { OrchestrAIError } from "@orchestrai/core";

/**
 * Validates and resolves a candidate path against a permitted root directory.
 * Guarantees that the resulting canonical path cannot escape the sandbox.
 *
 * @param candidatePath - The user- or model-provided relative or absolute path.
 * @param allowedRoot - The absolute boundary directory (e.g. workspaceRoot).
 * @returns The resolved, normalized, safe absolute path.
 * @throws {OrchestrAIError} with code POLICY_VIOLATION if the path escapes allowedRoot.
 */
export function sanitizePath(candidatePath: string, allowedRoot: string): string {
  if (!candidatePath || candidatePath.trim().length === 0) {
    throw new OrchestrAIError("Target path must not be empty", "VALIDATION_ERROR", 400, {
      candidatePath,
    });
  }

  // Canonical absolute representation of the sandbox boundary
  const resolvedRoot = path.resolve(allowedRoot);

  // If candidate is absolute, resolve directly; if relative, resolve from allowedRoot
  const resolvedTarget = path.isAbsolute(candidatePath)
    ? path.resolve(candidatePath)
    : path.resolve(resolvedRoot, candidatePath);

  // Check if resolved target begins with the allowed root path + separator
  // (or is exactly equal to the allowed root, or root is root directory '/')
  const isContained =
    resolvedTarget === resolvedRoot ||
    resolvedRoot === path.sep ||
    resolvedTarget.startsWith(`${resolvedRoot}${path.sep}`);

  if (!isContained) {
    throw new OrchestrAIError(
      `Access denied: path "${candidatePath}" resolves to "${resolvedTarget}", which is outside the sandbox directory "${resolvedRoot}"`,
      "POLICY_VIOLATION",
      403,
      { candidatePath, resolvedTarget, allowedRoot: resolvedRoot },
    );
  }

  return resolvedTarget;
}
