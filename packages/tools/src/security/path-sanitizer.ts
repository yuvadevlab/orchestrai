/**
 * @file packages/tools/src/security/path-sanitizer.ts
 * @description Path jail and directory traversal protection for filesystem tools with multi-root support.
 * @module @orchestrai/tools/security
 */

import fs from "node:fs";
import path from "node:path";
import { OrchestrAIError } from "@orchestrai/core";
import { expandUserHome } from "./sensitive-path.detector";

/**
 * Checks whether a canonical resolved target path is safely contained within an allowed boundary root.
 *
 * @param resolvedTarget - Canonical absolute target path
 * @param allowedRoot - Canonical absolute allowed directory path
 * @returns True if target is within allowedRoot or equals allowedRoot
 */
export function isPathContained(resolvedTarget: string, allowedRoot: string): boolean {
  const resolvedRoot = path.resolve(expandUserHome(allowedRoot));
  return (
    resolvedTarget === resolvedRoot ||
    resolvedRoot === path.sep ||
    resolvedTarget.startsWith(`${resolvedRoot}${path.sep}`)
  );
}

/**
 * Validates and resolves a candidate path against one or more permitted root directories.
 * Guarantees that the resulting canonical path cannot escape authorized boundaries.
 *
 * @param candidatePath - The user- or model-provided relative or absolute path.
 * @param allowedRoots - Single root or list of approved roots (workspace + cleared directories).
 * @returns The resolved, normalized, safe absolute path.
 * @throws {OrchestrAIError} with code POLICY_VIOLATION if path escapes all permitted roots.
 */
export function sanitizePath(
  candidatePath: string,
  allowedRoots: string | readonly string[],
): string {
  if (!candidatePath || candidatePath.trim().length === 0) {
    throw new OrchestrAIError("Target path must not be empty", "VALIDATION_ERROR", 400, {
      candidatePath,
    });
  }

  // Normalize candidate path and expand leading tildes
  const expandedCandidate = expandUserHome(candidatePath.trim());
  const rootsList = (Array.isArray(allowedRoots) ? allowedRoots : [allowedRoots]).filter(
    (r): r is string => typeof r === "string" && r.length > 0,
  );

  const fallbackRoot = rootsList[0] ? path.resolve(expandUserHome(rootsList[0])) : process.cwd();

  // If candidate is absolute, resolve directly; if relative, resolve from primary root
  let resolvedTarget = path.isAbsolute(expandedCandidate)
    ? path.resolve(expandedCandidate)
    : path.resolve(fallbackRoot, expandedCandidate);

  // If candidate is a relative path targeting a sibling project in parent folder
  if (!path.isAbsolute(expandedCandidate) && !fs.existsSync(resolvedTarget)) {
    const parentDir = path.dirname(fallbackRoot);
    const siblingCandidate = path.resolve(parentDir, expandedCandidate);
    if (fs.existsSync(siblingCandidate)) {
      resolvedTarget = siblingCandidate;
    }
  }

  // Verify containment against any authorized root
  const isContained = rootsList.some((root) => isPathContained(resolvedTarget, root));

  if (!isContained) {
    throw new OrchestrAIError(
      `Access denied: path "${candidatePath}" resolves to "${resolvedTarget}", which is outside all authorized directories: [${rootsList.join(", ")}]`,
      "POLICY_VIOLATION",
      403,
      { candidatePath, resolvedTarget, allowedRoots: rootsList },
    );
  }

  return resolvedTarget;
}
