/**
 * @file apps/gateway/src/services/permission-evaluator.ts
 * @description Pure evaluation engine verifying tool actions against path, bash, and sensitive access boundaries.
 * @module apps/gateway/services
 */

import fs from "node:fs";
import path from "node:path";
import { classifyPathSensitivity, expandUserHome } from "@orchestrai/tools";
import { ApprovalRiskLevel } from "@orchestrai/shared-types";
import { findNearestProjectRoot } from "@/modules/permission/permission-storage";
import type { PermissionCheckResult } from "@/modules/permission/permission-types";

/**
 * Parameters supplied to the pure permission evaluation function.
 */
export interface EvaluatePermissionParams {
  toolName: string;
  args: Record<string, unknown>;
  workspaceRoot: string;
  onceGrants: Set<string>;
  sessionSet?: Set<string>;
  permanentGrants: Set<string>;
}

/**
 * Pure evaluator checking tool operation safety against trust roots and sensitivity classifications.
 *
 * @param params - Evaluation context and active permission sets
 * @returns PermissionCheckResult indicating whether access is allowed or why clearance is required
 */
export function evaluateToolPermission(params: EvaluatePermissionParams): PermissionCheckResult {
  const { toolName, args, workspaceRoot, onceGrants, sessionSet, permanentGrants } = params;

  // Compute effective roots including primary workspace and active grants
  const effectiveRoots: string[] = [
    workspaceRoot,
    ...Array.from(permanentGrants),
    ...(sessionSet ? Array.from(sessionSet) : []),
  ];

  // 1. Evaluate shell command execution boundaries
  if (toolName === "bash") {
    const commandStr = String(args.command || "command");
    const isAllowed =
      onceGrants.has("tool:bash") ||
      onceGrants.has(commandStr) ||
      Boolean(sessionSet?.has("tool:bash")) ||
      Boolean(sessionSet?.has(commandStr)) ||
      permanentGrants.has("tool:bash") ||
      permanentGrants.has(commandStr);

    // Consume single-turn clearance token
    if (onceGrants.has("tool:bash")) onceGrants.delete("tool:bash");
    if (onceGrants.has(commandStr)) onceGrants.delete(commandStr);

    let effectiveRoot = workspaceRoot;
    for (const perm of permanentGrants) {
      if (commandStr.includes(perm)) {
        effectiveRoot = perm;
        break;
      }
    }

    if (!isAllowed) {
      return {
        allowed: false,
        target: commandStr,
        reason: "Shell command execution requires operator clearance.",
        suggestedPrefix: effectiveRoot,
        effectiveRoot,
        effectiveRoots,
        riskLevel: ApprovalRiskLevel.CAUTION,
      };
    }
    return { allowed: true, effectiveRoot, effectiveRoots };
  }

  // 2. Evaluate filesystem path access boundaries
  const targetPath = String(args.path || "");
  if (!targetPath) return { allowed: true, effectiveRoot: workspaceRoot, effectiveRoots };

  const expanded = expandUserHome(targetPath);
  let resolved = path.isAbsolute(expanded)
    ? path.resolve(expanded)
    : path.resolve(workspaceRoot, expanded);

  // If relative path does not exist in workspaceRoot, check if it targets a sibling project
  if (!path.isAbsolute(expanded) && !fs.existsSync(resolved)) {
    const siblingCandidate = path.resolve(path.dirname(workspaceRoot), expanded);
    if (fs.existsSync(siblingCandidate)) {
      resolved = siblingCandidate;
    }
  }

  // 3. Check for sensitive files (e.g., .env, ~/.ssh, credentials)
  const sensitivity = classifyPathSensitivity(resolved);
  if (sensitivity.isSensitive && !onceGrants.has(resolved)) {
    return {
      allowed: false,
      target: resolved,
      isSensitive: true,
      riskLevel: sensitivity.riskLevel as ApprovalRiskLevel,
      reason:
        sensitivity.warning ||
        "Accessing sensitive credential or secret file requires operator clearance.",
      suggestedPrefix: path.dirname(resolved),
      effectiveRoot: workspaceRoot,
      effectiveRoots,
    };
  }

  // 4. Single-turn temporary clearance
  if (
    onceGrants.has(resolved) ||
    onceGrants.has(targetPath) ||
    onceGrants.has(expanded) ||
    onceGrants.has(path.dirname(resolved))
  ) {
    onceGrants.delete(resolved);
    onceGrants.delete(targetPath);
    onceGrants.delete(expanded);
    onceGrants.delete(path.dirname(resolved));
    const clearedProjectRoot = findNearestProjectRoot(resolved);
    return {
      allowed: true,
      effectiveRoot: clearedProjectRoot,
      effectiveRoots: Array.from(
        new Set([...effectiveRoots, clearedProjectRoot, path.dirname(resolved), resolved]),
      ),
    };
  }

  // 5. Primary workspace containment
  if (resolved.startsWith(workspaceRoot)) {
    return { allowed: true, effectiveRoot: workspaceRoot, effectiveRoots };
  }

  // 6. Permanent trusted workspace roots
  for (const perm of permanentGrants) {
    if (resolved.startsWith(perm)) {
      return { allowed: true, effectiveRoot: perm, effectiveRoots };
    }
  }

  // 7. Session trusted workspace roots
  if (sessionSet) {
    for (const sess of sessionSet) {
      if (resolved.startsWith(sess)) {
        return { allowed: true, effectiveRoot: sess, effectiveRoots };
      }
    }
  }

  const suggestedPrefix = findNearestProjectRoot(resolved);
  return {
    allowed: false,
    target: resolved,
    suggestedPrefix,
    reason: `Target path is outside trusted workspaces. Nearest project: ${path.basename(suggestedPrefix)}`,
    riskLevel: ApprovalRiskLevel.CAUTION,
    effectiveRoot: suggestedPrefix,
    effectiveRoots,
  };
}
