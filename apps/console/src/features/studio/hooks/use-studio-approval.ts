/**
 * @file use-studio-approval.ts
 * @description Hook managing pending clearance state derivation and resolution stamping for the Cowork Studio.
 * @module apps/console/features/studio/hooks
 */

import { useCallback, useMemo } from "react";
import { PermissionScope, MessageSegmentType } from "@orchestrai/shared-types";
import type { CoworkMessage, StudioApprovalRequest } from "../types";
import { resolveApprovalInSegments } from "./message-segment-utils";

export interface UseStudioApprovalOptions {
  /** Whether an agent execution is currently active */
  isRunning: boolean;
  /** Current thread messages */
  messages: readonly CoworkMessage[];
  /** Dispatcher to update active session messages */
  updateActiveMessages: (updater: (prev: CoworkMessage[]) => CoworkMessage[]) => void;
}

export interface UseStudioApprovalReturn {
  /** Pending clearance ticket for the prompt bar takeover card */
  pendingApproval: StudioApprovalRequest | null;
  /** Stamps resolvedScope and resolvedAt onto the message and segment timeline */
  handleApprovalResolved: (approvalId: string, scope: PermissionScope, resolvedAt: string) => void;
}

/**
 * Derives pending clearance requests from active streaming messages and updates
 * messages upon operator approval/denial decisions so the permanent inline audit chip
 * renders in the response stream.
 */
export function useStudioApproval({
  isRunning,
  messages,
  updateActiveMessages,
}: UseStudioApprovalOptions): UseStudioApprovalReturn {
  // Derive the active pending approval request from the currently streaming agent message
  const pendingApproval = useMemo<StudioApprovalRequest | null>(() => {
    // Only derive pending tickets while execution is actively running
    if (!isRunning) return null;

    for (const m of [...messages].reverse()) {
      if (!m.isStreaming) continue;
      if (m.approvalRequest && !m.approvalRequest.resolvedScope) {
        return m.approvalRequest;
      }
      const segApproval = m.segments?.find(
        (s) => s.type === MessageSegmentType.APPROVAL && !s.request.resolvedScope,
      );
      if (segApproval && segApproval.type === MessageSegmentType.APPROVAL) {
        return segApproval.request;
      }
    }
    return null;
  }, [messages, isRunning]);

  // Stamps resolvedScope + resolvedAt onto the matching approvalRequest in the message
  // so the permanent inline audit chip (ApprovalDecisionChip) is rendered in the stream
  const handleApprovalResolved = useCallback(
    (approvalId: string, scope: PermissionScope, resolvedAt: string): void => {
      updateActiveMessages((prev) =>
        prev.map((m) => {
          const hasInSegments = m.segments?.some(
            (s) => s.type === MessageSegmentType.APPROVAL && s.request.id === approvalId,
          );
          if (m.approvalRequest?.id === approvalId || hasInSegments) {
            return {
              ...m,
              approvalRequest:
                m.approvalRequest?.id === approvalId
                  ? { ...m.approvalRequest, resolvedScope: scope, resolvedAt }
                  : m.approvalRequest,
              segments: resolveApprovalInSegments(m.segments, approvalId, scope, resolvedAt),
            };
          }
          return m;
        }),
      );
    },
    [updateActiveMessages],
  );

  return {
    pendingApproval,
    handleApprovalResolved,
  };
}
