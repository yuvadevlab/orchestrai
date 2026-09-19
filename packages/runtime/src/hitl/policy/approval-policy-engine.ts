/**
 * @file packages/runtime/src/hitl/policy/approval-policy-engine.ts
 * @description Policy engine evaluating tool invocations to classify operational risk and determine approval triggers.
 */

import { ToolPermissionLevel } from "@orchestrai/shared-types";
import {
  type ApprovalPolicyConfig,
  type RiskAssessmentResult,
  ApprovalPolicyConfigSchema,
} from "./approval-policy.types";

/**
 * Evaluates pending tool invocations against runtime safety rules to enforce HITL checkpoints.
 */
export class ApprovalPolicyEngine {
  private readonly config: ApprovalPolicyConfig;
  private readonly mandatoryToolsSet: ReadonlySet<string>;

  public constructor(config: Partial<ApprovalPolicyConfig> = {}) {
    this.config = ApprovalPolicyConfigSchema.parse(config);
    this.mandatoryToolsSet = new Set(this.config.alwaysRequireApprovalTools);
  }

  /**
   * Evaluates a proposed tool call to determine whether execution must pause for human approval.
   *
   * @param toolName - Identifier of the requested tool.
   * @param permissionLevel - Minimum permission tier declared by the tool.
   * @param isDestructive - Whether the tool performs irreversible mutations.
   * @param userClearance - Current operator or session clearance level.
   * @returns RiskAssessmentResult indicating whether approval is required.
   */
  public evaluateToolCall(
    toolName: string,
    permissionLevel: ToolPermissionLevel,
    isDestructive = false,
    userClearance: ToolPermissionLevel = ToolPermissionLevel.READ_ONLY,
  ): RiskAssessmentResult {
    // 1. Mandatory Tools Rule: Tools explicitly declared on the blacklist always require approval
    if (this.mandatoryToolsSet.has(toolName)) {
      return {
        requiresApproval: true,
        riskLevel: isDestructive ? "CRITICAL" : "HIGH",
        timeoutMs: this.config.defaultTimeoutMs,
        rationale: `Tool "${toolName}" is on the mandatory human clearance list`,
      };
    }

    // 2. Destructive Operations Rule: Irreversible actions (file deletion, drop table) require clearance
    if (isDestructive) {
      return {
        requiresApproval: true,
        riskLevel: "CRITICAL",
        timeoutMs: this.config.defaultTimeoutMs,
        rationale: `Tool "${toolName}" performs irreversible destructive mutations`,
      };
    }

    // 3. DANGEROUS Permission Level Rule: Tools categorized as DANGEROUS require operator clearance
    if (permissionLevel === ToolPermissionLevel.DANGEROUS) {
      return {
        requiresApproval: true,
        riskLevel: "HIGH",
        timeoutMs: this.config.defaultTimeoutMs,
        rationale: `Tool "${toolName}" requires DANGEROUS permission level`,
      };
    }

    // 4. Clearance Hierarchy Rule: Check if tool requirement exceeds current clearance tier
    const clearanceRank = this.getClearanceRank(userClearance);
    const requiredRank = this.getClearanceRank(permissionLevel);

    if (requiredRank > clearanceRank) {
      return {
        requiresApproval: true,
        riskLevel: "MEDIUM",
        timeoutMs: this.config.defaultTimeoutMs,
        rationale: `Tool "${toolName}" requires "${permissionLevel}" which exceeds granted clearance "${userClearance}"`,
      };
    }

    // 5. Default Pass: Action is within clearance limits
    return {
      requiresApproval: false,
      riskLevel: "LOW",
      timeoutMs: this.config.defaultTimeoutMs,
      rationale: `Tool "${toolName}" is within granted clearance limits`,
    };
  }

  /**
   * Maps permission tiers to numeric ordinal ranks for hierarchy comparison.
   */
  private getClearanceRank(level: ToolPermissionLevel): number {
    switch (level) {
      case ToolPermissionLevel.READ_ONLY:
        return 1;
      case ToolPermissionLevel.WRITE_SAFE:
        return 2;
      case ToolPermissionLevel.SENSITIVE:
        return 3;
      case ToolPermissionLevel.DANGEROUS:
        return 4;
      default:
        return 0;
    }
  }

  /**
   * Returns the active policy configuration.
   */
  public getConfig(): Readonly<ApprovalPolicyConfig> {
    return this.config;
  }
}
