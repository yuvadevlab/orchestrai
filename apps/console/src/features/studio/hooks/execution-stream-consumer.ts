/**
 * @file execution-stream-consumer.ts
 * @description Iterates Gateway SSE stream events and incrementally updates message state and chronological segments.
 * @module apps/console/features/studio/hooks
 */

import { SseStreamEvent } from "@orchestrai/shared-types";
import type { CoworkArtifact, CoworkMessage, StudioApprovalRequest } from "../types";
import {
  appendArtifactSegment,
  appendApprovalSegment,
  appendTextSegment,
} from "./message-segment-utils";

export interface ConsumeExecutionStreamOptions {
  /** Asynchronous iterator over parsed Server-Sent Event payloads */
  streamIterator: AsyncIterable<{ event: string; data: unknown }>;
  /** The target agent message ID being populated */
  agentMsgId: string;
  /** Gateway execution run identifier */
  executionId: string;
  /** React state updater to mutate the conversation thread */
  onUpdateMessages: (updater: (prev: CoworkMessage[]) => CoworkMessage[]) => void;
}

/**
 * Consumes an SSE stream from the Gateway and applies token chunks, artifacts,
 * and clearance requests in chronological order to both the message properties
 * and its interleaved segment timeline.
 */
export async function consumeExecutionStream({
  streamIterator,
  agentMsgId,
  executionId,
  onUpdateMessages,
}: ConsumeExecutionStreamOptions): Promise<void> {
  for await (const sse of streamIterator) {
    if (sse.event === SseStreamEvent.ARTIFACT) {
      try {
        const art: CoworkArtifact = typeof sse.data === "string" ? JSON.parse(sse.data) : sse.data;
        onUpdateMessages((prev) =>
          prev.map((m) =>
            m.id === agentMsgId
              ? {
                  ...m,
                  artifacts: [...(m.artifacts || []), art],
                  segments: appendArtifactSegment(m.segments, art),
                }
              : m,
          ),
        );
      } catch {
        /* Ignore malformed artifact JSON */
      }
      continue;
    }

    if (sse.event === SseStreamEvent.APPROVAL_REQUEST) {
      try {
        const req: StudioApprovalRequest =
          typeof sse.data === "string" ? JSON.parse(sse.data) : sse.data;
        onUpdateMessages((prev) =>
          prev.map((m) =>
            m.id === agentMsgId
              ? {
                  ...m,
                  approvalRequest: req,
                  segments: appendApprovalSegment(m.segments, req),
                }
              : m,
          ),
        );
      } catch {
        /* Ignore malformed clearance ticket JSON */
      }
      continue;
    }

    // Stop consuming if the backend explicitly emits a completion signal
    if (sse.event === SseStreamEvent.DONE || sse.data === "[DONE]") {
      break;
    }

    // Stream regular text tokens directly into content and the chronological segment list
    if (typeof sse.data === "string") {
      const chunk = sse.data;
      onUpdateMessages((prev) =>
        prev.map((m) =>
          m.id === agentMsgId
            ? {
                ...m,
                content: m.content + chunk,
                segments: appendTextSegment(m.segments, chunk),
              }
            : m,
        ),
      );
    }
  }

  // Mark the message as finished streaming once iteration concludes normally
  onUpdateMessages((prev) =>
    prev.map((m) => (m.id === agentMsgId ? { ...m, isStreaming: false, executionId } : m)),
  );
}
