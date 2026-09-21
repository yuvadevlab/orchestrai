/**
 * @file packages/sdk/src/resources/approvals.ts
 * @description Approvals resource for querying and resolving human-in-the-loop operator tickets.
 */

import type { ApprovalRequest, ApprovalDecisionResult, PaginatedList } from "@/types";
import { ResourceBase } from "./resource-base";

export interface ApprovalFilter {
  executionId?: string;
  status?: string;
  limit?: number;
  cursor?: string;
}

export interface ResolveApprovalParams {
  decision: "APPROVED" | "REJECTED" | "CANCELLED";
  reason?: string;
  modifiedArguments?: Record<string, unknown>;
}

/**
 * Resource client for human-in-the-loop approval workflows.
 */
export class ApprovalsResource extends ResourceBase {
  /**
   * Lists approval tickets pending or historic.
   */
  public async list(filter?: ApprovalFilter): Promise<PaginatedList<ApprovalRequest>> {
    return this.http.request<PaginatedList<ApprovalRequest>>("/api/v1/approvals", {
      params: filter as Record<string, string | number | boolean | undefined>,
    });
  }

  /**
   * Resolves a pending approval ticket with an operator verdict.
   */
  public async resolve(
    approvalId: string,
    params: ResolveApprovalParams,
  ): Promise<ApprovalDecisionResult> {
    return this.http.request<ApprovalDecisionResult>(
      `/api/v1/approvals/${encodeURIComponent(approvalId)}/resolve`,
      {
        method: "POST",
        body: params,
      },
    );
  }
}
