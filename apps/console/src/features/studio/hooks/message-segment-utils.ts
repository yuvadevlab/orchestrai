/**
 * @file message-segment-utils.ts
 * @description Immutable utility functions for managing chronologically ordered message segments.
 * @module apps/console/features/studio/hooks
 */

import { PermissionScope, MessageSegmentType } from "@orchestrai/shared-types";
import type { CoworkArtifact, MessageSegment, StudioApprovalRequest } from "../types";

/**
 * Creates the initial segment list for a new streaming agent turn, containing the initial thinking step.
 */
export function createInitialAgentSegments(
  id: string,
  thinkingText: string,
  durationSeconds = 1.2,
): MessageSegment[] {
  return [
    {
      id: `${id}_thinking`,
      type: MessageSegmentType.THINKING,
      text: thinkingText,
      durationSeconds,
      collapsed: false,
    },
  ];
}

/**
 * Appends a new artifact segment to the chronological list.
 */
export function appendArtifactSegment(
  segments: MessageSegment[] | undefined,
  artifact: CoworkArtifact,
): MessageSegment[] {
  const list = segments ? [...segments] : [];
  list.push({
    id: `art_${artifact.id || Date.now()}`,
    type: MessageSegmentType.ARTIFACT,
    artifact,
  });
  return list;
}

/**
 * Appends or updates an approval request segment.
 * If an unresolved approval segment for the same ID already exists, it is refreshed.
 */
export function appendApprovalSegment(
  segments: MessageSegment[] | undefined,
  request: StudioApprovalRequest,
): MessageSegment[] {
  const list = segments ? [...segments] : [];
  const existingIdx = list.findIndex(
    (s) => s.type === MessageSegmentType.APPROVAL && s.request.id === request.id,
  );

  // If the approval ticket already exists in the timeline, refresh it in-place
  if (existingIdx !== -1) {
    list[existingIdx] = {
      id: `app_${request.id}`,
      type: MessageSegmentType.APPROVAL,
      request,
    };
    return list;
  }

  // Otherwise append it chronologically right where the request occurred
  list.push({
    id: `app_${request.id}`,
    type: MessageSegmentType.APPROVAL,
    request,
  });
  return list;
}

/**
 * Appends streaming text tokens to the chronological segment list.
 * If the most recent segment is already a text block, the new tokens are appended to it.
 * Otherwise, a new text block segment is appended to preserve chronology after artifacts.
 */
export function appendTextSegment(
  segments: MessageSegment[] | undefined,
  chunk: string,
): MessageSegment[] {
  const list = segments ? [...segments] : [];
  const lastSegment = list[list.length - 1];

  // If the previous entry is already a text segment, append tokens to it
  if (lastSegment && lastSegment.type === MessageSegmentType.TEXT) {
    list[list.length - 1] = {
      ...lastSegment,
      content: lastSegment.content + chunk,
    };
    return list;
  }

  // Otherwise, create a new discrete text segment following the preceding artifact or clearance
  list.push({
    id: `text_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    type: MessageSegmentType.TEXT,
    content: chunk,
  });
  return list;
}

/**
 * Resolves an approval request within the segments list, stamping the operator's decision.
 */
export function resolveApprovalInSegments(
  segments: MessageSegment[] | undefined,
  approvalId: string,
  scope: PermissionScope,
  resolvedAt: string,
): MessageSegment[] {
  if (!segments || segments.length === 0) return [];
  return segments.map((seg) => {
    if (seg.type === MessageSegmentType.APPROVAL && seg.request.id === approvalId) {
      return {
        ...seg,
        request: {
          ...seg.request,
          resolvedScope: scope,
          resolvedAt,
        },
      };
    }
    return seg;
  });
}
