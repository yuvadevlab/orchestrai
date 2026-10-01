/**
 * @file execution-stream-consumer.ts
 * @description Iterates Gateway SSE stream events and incrementally updates message state,
 * chronological segments, AND the Inspector Rail ExecutionSlice store.
 * @module apps/console/features/studio/hooks
 */

import {
  SseStreamEvent,
  ArtifactType,
  ExecutionStatus,
  StudioEventType,
} from "@orchestrai/shared-types";
import { useConsoleStore } from "@/lib/stores";
import type { CoworkArtifact, CoworkMessage, StudioApprovalRequest, StudioEvent } from "../types";
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
  /** Active specialist name for Inspector Rail display */
  specialistName?: string;
  /** React state updater to mutate the conversation thread */
  onUpdateMessages: (updater: (prev: CoworkMessage[]) => CoworkMessage[]) => void;
  /** Mutable signal checked each iteration — when true the loop exits early */
  cancelledRef?: { current: boolean };
  /** Appends a StudioEvent to the Inspector Rail */
  onAddEvent: (event: StudioEvent) => void;
}

/**
 * Builds a StudioEvent for the Inspector Rail from a raw SSE payload.
 *
 * @param type - Event category
 * @param title - Human-readable summary line
 * @param detail - Optional supplemental content (truncated to 120 chars)
 * @param agent - Specialist name to display in the rail
 * @returns Fully-formed StudioEvent
 */
function makeEvent(
  type: StudioEventType,
  title: string,
  detail: string,
  agent: string,
): StudioEvent {
  return {
    id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    agent,
    title,
    detail: detail.slice(0, 120),
    meta: new Date().toLocaleTimeString(),
    type,
  };
}

/**
 * Consumes an SSE stream from the Gateway and:
 *  1. Applies token chunks, artifacts, and clearance requests chronologically to the message
 *  2. Writes tool call, artifact, error, and done events to the Inspector Rail ExecutionSlice
 *  3. Respects the cancelledRef signal — exits the loop early when the user stops the run
 */
export async function consumeExecutionStream({
  streamIterator,
  agentMsgId,
  executionId,
  specialistName = "Agent",
  onUpdateMessages,
  cancelledRef,
  onAddEvent,
}: ConsumeExecutionStreamOptions): Promise<void> {
  const store = useConsoleStore.getState();
  store.setActiveExecutionId(executionId);
  store.setExecutionStatus(ExecutionStatus.RUNNING);

  for await (const sse of streamIterator) {
    // Respect external cancellation signal from stopExecution()
    if (cancelledRef?.current) break;

    if (sse.event === SseStreamEvent.TOOL_CALL) {
      try {
        const tc = typeof sse.data === "string" ? JSON.parse(sse.data) : sse.data;
        const toolName = String(tc?.tool ?? "unknown");
        const toolArgs = tc?.args ? JSON.stringify(tc.args).slice(0, 80) : "";
        onAddEvent(makeEvent(StudioEventType.TOOL, `Tool: ${toolName}`, toolArgs, specialistName));
        useConsoleStore.getState().appendExecutionStep({
          id: `step_${Date.now()}`,
          name: toolName,
          stepType: "tool_call",
          status: "running",
        });
      } catch {
        /* Ignore malformed tool call JSON */
      }
      continue;
    }

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
        // Automatically open the Canvas pane for the incoming artifact
        useConsoleStore.getState().setActiveArtifact({
          id: art.id,
          title: art.title,
          language: art.language ?? "typescript",
          code: art.content,
        });
        if (art.type === ArtifactType.TERMINAL) {
          useConsoleStore.getState().setCanvasMode("terminal");
        } else if (art.language === "html" || art.filePath?.endsWith(".html")) {
          useConsoleStore.getState().setCanvasMode("preview");
        } else {
          useConsoleStore.getState().setCanvasMode("code");
        }
        // Update the last execution step to success
        onAddEvent(
          makeEvent(StudioEventType.CODE, `Artifact: ${art.title}`, art.type, specialistName),
        );
        useConsoleStore
          .getState()
          .updateExecutionStep(useConsoleStore.getState().executionSteps.at(-1)?.id ?? "", {
            status: "success",
          });
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
        onAddEvent(
          makeEvent(
            StudioEventType.APPROVAL,
            `Clearance required: ${String(req.target ?? "resource")}`,
            req.reason ?? "",
            specialistName,
          ),
        );
      } catch {
        /* Ignore malformed clearance ticket JSON */
      }
      continue;
    }

    if (sse.event === SseStreamEvent.ERROR) {
      const errMsg = typeof sse.data === "string" ? sse.data : JSON.stringify(sse.data);
      onAddEvent(
        makeEvent(StudioEventType.MODEL, `Error: ${errMsg.slice(0, 60)}`, errMsg, specialistName),
      );
      useConsoleStore.getState().setExecutionStatus(ExecutionStatus.FAILED);
      break;
    }

    // Stop consuming when the backend signals completion
    if (sse.event === SseStreamEvent.DONE || sse.data === "[DONE]") {
      onAddEvent(
        makeEvent(StudioEventType.PLAN, "Execution complete", executionId, specialistName),
      );
      useConsoleStore.getState().setExecutionStatus(ExecutionStatus.COMPLETED);
      break;
    }

    // Regular text token — append to content and chronological segment list
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

  // Mark message as finished streaming once iteration concludes (normally or cancelled)
  onUpdateMessages((prev) =>
    prev.map((m) => (m.id === agentMsgId ? { ...m, isStreaming: false, executionId } : m)),
  );

  // If stopped early via cancellation, reflect CANCELLED status
  if (cancelledRef?.current) {
    useConsoleStore.getState().setExecutionStatus(ExecutionStatus.CANCELLED);
  }
}
