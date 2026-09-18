/**
 * @file packages/tools/src/security/permission-evaluator.ts
 * @description Permission tier evaluation and Human-in-the-Loop (HITL) gatekeeper.
 *
 * ─── Why Permission Tiers? (Learning note) ──────────────────────────
 * An autonomous agent should not have blanket admin access.
 * We classify tools into 4 hierarchical permission levels:
 * 1. READ_ONLY   — Safe, passive queries (e.g. read_file, list_dir).
 * 2. WRITE_SAFE  — Local modifications within the workspace (e.g. write_file).
 * 3. SENSITIVE   — Network calls, external APIs (e.g. fetch).
 * 4. DANGEROUS   — Destructive commands (e.g. bash). ALWAYS requires HITL approval.
 * ───────────────────────────────────────────────────────────────────
 */

import { ToolPermissionLevel } from "@orchestrai/shared-types";
import { OrchestrAIError, requiresHumanApproval } from "@orchestrai/core";

/**
 * Numeric hierarchy values for comparing permission clearance levels.
 * Higher number means higher privilege requirement.
 */
const PERMISSION_WEIGHTS: Readonly<Record<ToolPermissionLevel, number>> = {
  [ToolPermissionLevel.READ_ONLY]: 1,
  [ToolPermissionLevel.WRITE_SAFE]: 2,
  [ToolPermissionLevel.SENSITIVE]: 3,
  [ToolPermissionLevel.DANGEROUS]: 4,
};

/**
 * Result of evaluating an agent's permission against a tool requirement.
 */
export interface PermissionEvaluationResult {
  /** Whether the agent's clearance meets the tool's required level */
  readonly isAllowed: boolean;

  /**
   * Whether the tool invocation mandates human operator sign-off (HITL)
   * before execution can proceed.
   */
  readonly requiresApproval: boolean;

  /** Diagnostic reason if permission was denied */
  readonly denialReason?: string;
}

/**
 * Evaluates whether an agent with a given clearance level is permitted to invoke a tool.
 *
 * @param toolLevel - The permission level declared by the tool.
 * @param agentClearance - The maximum permission level granted to the executing agent.
 * @returns Evaluation result with allowance boolean, approval requirement, and denial reason.
 */
export function evaluateToolPermission(
  toolLevel: ToolPermissionLevel,
  agentClearance: ToolPermissionLevel,
): PermissionEvaluationResult {
  const toolWeight = PERMISSION_WEIGHTS[toolLevel];
  const agentWeight = PERMISSION_WEIGHTS[agentClearance];

  const requiresApproval = requiresHumanApproval(toolLevel);

  // If the agent's clearance weight is strictly lower than the tool's required weight, deny
  if (agentWeight < toolWeight) {
    return {
      isAllowed: false,
      requiresApproval,
      denialReason: `Agent clearance level "${agentClearance}" is insufficient for tool requiring "${toolLevel}"`,
    };
  }

  return {
    isAllowed: true,
    requiresApproval,
  };
}

/**
 * Asserts that an agent has sufficient clearance for a tool, throwing a POLICY_VIOLATION if not.
 *
 * @param toolName - Name of the target tool (for diagnostic error reporting).
 * @param toolLevel - The permission level declared by the tool.
 * @param agentClearance - The agent's granted clearance level.
 * @throws {OrchestrAIError} with code POLICY_VIOLATION if clearance is insufficient.
 */
export function assertToolPermission(
  toolName: string,
  toolLevel: ToolPermissionLevel,
  agentClearance: ToolPermissionLevel,
): void {
  const result = evaluateToolPermission(toolLevel, agentClearance);

  if (!result.isAllowed) {
    throw new OrchestrAIError(
      `Permission denied for tool "${toolName}": ${result.denialReason}`,
      "POLICY_VIOLATION",
      403,
      { toolName, toolLevel, agentClearance },
    );
  }
}
