"use client";

/**
 * @file apps/console/src/features/studio/api/use-resolve-approval.ts
 * @description Mutation hook for resolving human-in-the-loop operator approval requests.
 * @module apps/console/features/studio/api
 */

import { useMutation, useQueryClient, type UseMutationResult } from "@tanstack/react-query";
import { ApprovalDecisionVerdict, PermissionScope } from "@orchestrai/shared-types";
import { getApiClient } from "@/lib/api-client";
import { QUERY_KEYS } from "@/lib/query-keys";
import type { ApprovalDecisionResult } from "@orchestrai/sdk";

export type ApprovalDecisionScope = PermissionScope;

export interface ResolveApprovalParams {
  approvalId: string;
  scope: PermissionScope;
  reason?: string;
}

/**
 * Custom hook to resolve pending human-in-the-loop approval tickets.
 */
export function useResolveApproval(): UseMutationResult<
  ApprovalDecisionResult,
  Error,
  ResolveApprovalParams
> {
  const queryClient = useQueryClient();
  const client = getApiClient();

  return useMutation({
    mutationFn: async ({
      approvalId,
      scope,
      reason,
    }: ResolveApprovalParams): Promise<ApprovalDecisionResult> => {
      // Evaluate clearance verdict based on operator decision scope
      const decision =
        scope === PermissionScope.DENY
          ? ApprovalDecisionVerdict.REJECTED
          : ApprovalDecisionVerdict.APPROVED;

      return client.approvals.resolve(approvalId, {
        decision,
        scope,
        reason: reason || `Operator verdict: ${scope}`,
      });
    },
    onSuccess: () => {
      // Invalidate active approvals cache to refresh badge counts and feed
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.APPROVALS.ALL });
    },
  });
}
