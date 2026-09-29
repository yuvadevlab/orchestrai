/**
 * @file apps/gateway/src/services/approval.service.ts
 * @description Domain service for managing human-in-the-loop approval tickets and resolution.
 */

import { ApprovalStatus, ApprovalDecisionVerdict, PermissionScope } from "@orchestrai/shared-types";
import type { ApprovalFilterDto, ResolveApprovalDto } from "@/validation";
import { permissionPolicyManager } from "@/modules/permission";

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
  decision: ApprovalDecisionVerdict;
  decidedBy: string;
  scope?: PermissionScope;
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
    const pending = permissionPolicyManager.getPendingApprovals();
    const items: ApprovalRecord[] = pending.map((req) => ({
      approvalId: req.id,
      executionId: req.executionId,
      stepId: "step-1",
      toolName: req.tool,
      toolArguments: { target: req.target },
      rationale: req.reason,
      status: ApprovalStatus.PENDING,
      requestedAt: req.createdAt,
      expiresAt: new Date(Date.now() + 300000).toISOString(),
    }));

    return {
      items,
      filter,
      total: items.length,
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
      dto.decision === ApprovalDecisionVerdict.REJECTED
        ? PermissionScope.DENY
        : dto.scope || PermissionScope.ONCE;
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
