/**
 * @file apps/gateway/src/services/approval.service.ts
 * @description Domain service for managing human-in-the-loop approval tickets and resolution.
 */

import { ApprovalStatus } from "@orchestrai/shared-types";
import type { ApprovalFilterDto, ResolveApprovalDto } from "@/validation";
import { permissionPolicyManager, type PermissionScope } from "./permission-policy.manager";

export interface ApprovalRecord {
  approvalId: string;
  executionId: string;
  stepId: string;
  toolName: string;
  toolArguments: Record<string, unknown>;
  rationale: string;
  status: ApprovalStatus;
  requestedAt: string;
  expiresAt: string;
}

export interface ApprovalListResult {
  items: ApprovalRecord[];
  filter: ApprovalFilterDto;
  total: number;
  hasMore: boolean;
}

export interface ResolvedApprovalResult {
  approvalId: string;
  decision: string;
  decidedBy: string;
  scope?: string;
  reason?: string;
  modifiedArguments?: Record<string, unknown>;
  decidedAt: string;
}

/**
 * Service orchestrating human-in-the-loop approvals.
 */
export class ApprovalService {
  /**
   * Lists approval requests matching filters.
   */
  public async listApprovals(
    filter: ApprovalFilterDto,
    _tenantId: string,
  ): Promise<ApprovalListResult> {
    return {
      items: [],
      filter,
      total: 0,
      hasMore: false,
    };
  }

  /**
   * Resolves an approval request with an operator decision.
   */
  public async resolveApproval(
    approvalId: string,
    dto: ResolveApprovalDto,
    decidedBy: string,
  ): Promise<ResolvedApprovalResult> {
    const scope: PermissionScope =
      dto.decision === "REJECTED" ? "deny" : (dto.scope as PermissionScope) || "once";
    permissionPolicyManager.resolveApproval(approvalId, scope, "default", decidedBy);

    return {
      approvalId,
      decision: dto.decision,
      decidedBy,
      scope: dto.scope,
      reason: dto.reason,
      modifiedArguments: dto.modifiedArguments,
      decidedAt: new Date().toISOString(),
    };
  }
}
