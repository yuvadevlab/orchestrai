/**
 * @file packages/runtime/src/hitl/policy/approval-policy.types.ts
 * @description Invariant policy schemas and risk assessment types for HITL clearance.
 */

import { z } from "zod";
import { ToolPermissionLevel } from "@orchestrai/shared-types";
import type { RiskLevel } from "../contracts";

/**
 * Configuration schema defining human approval triggers, timeouts, and risk thresholds.
 */
export const ApprovalPolicyConfigSchema = z.object({
  /** Window in milliseconds before pending approvals automatically expire (default: 15 mins) */
  defaultTimeoutMs: z.number().int().positive().default(900_000),
  /** Action taken when an approval ticket reaches expiration deadline without response */
  defaultTimeoutAction: z
    .enum(["REJECT_AND_NOTIFY", "ABORT_EXECUTION"])
    .default("REJECT_AND_NOTIFY"),
  /** Highest clearance level that can bypass human approval automatically */
  autoApproveClearance: z.nativeEnum(ToolPermissionLevel).default(ToolPermissionLevel.READ_ONLY),
  /** Tool identifier names that unconditionally require human approval regardless of clearance */
  alwaysRequireApprovalTools: z
    .array(z.string())
    .default(["bash", "delete_file", "write_file", "execute_sql"]),
});

export type ApprovalPolicyConfig = z.infer<typeof ApprovalPolicyConfigSchema>;

/**
 * Outcome of evaluating a tool invocation against the active approval policy.
 */
export interface RiskAssessmentResult {
  /** Whether execution must halt at an approval gate */
  readonly requiresApproval: boolean;
  /** Assessed operational risk severity */
  readonly riskLevel: RiskLevel;
  /** Expiration window in milliseconds assigned to the ticket */
  readonly timeoutMs: number;
  /** Contextual explanation for the risk assessment */
  readonly rationale: string;
}
