"use client";

/**
 * @file use-agent-runner.ts
 * @description Real Gateway execution dispatch and SSE streaming hook for Cowork Studio.
 * Includes real stop execution (cancel API call + cancelledRef signal) and
 * Inspector Rail event forwarding via onAddEvent callback.
 * @module apps/console/features/studio/hooks
 */

import { useCallback, useRef, useState } from "react";
import { PermissionScope, CoworkMessageRole, StudioEventType } from "@orchestrai/shared-types";
import { getApiClient } from "@/lib/api-client";
import { formatApiError } from "@/lib/error-utils";
import { useResolveApproval } from "../api";
import type { CoworkMessage, SpecialistPersona, StudioEvent } from "../types";
import { createInitialAgentSegments, appendTextSegment } from "./message-segment-utils";
import { consumeExecutionStream } from "./execution-stream-consumer";

export interface UseAgentRunnerOptions {
  activeSpecialist?: SpecialistPersona;
  selectedModel: string;
  activeSessionId?: string;
  existingMessages?: CoworkMessage[];
  onUpdateMessages: (updater: (prev: CoworkMessage[]) => CoworkMessage[]) => void;
}

export interface UseAgentRunnerResult {
  isRunning: boolean;
  events: StudioEvent[];
  activeExecutionId: string;
  triggerRun: (promptText: string) => Promise<void>;
  resolveApproval: (approvalId: string, scope: PermissionScope) => Promise<void>;
  stopExecution: () => void;
  clearEvents: () => void;
}

/**
 * Executes agent tasks or interactive chats via Gateway SDK with live streaming feedback.
 * stopExecution() calls `DELETE /executions/:id/cancel` on the Gateway AND signals the
 * local stream iterator to exit early via `cancelledRef` — both must be done for clean stop.
 */
export function useAgentRunner({
  activeSpecialist,
  selectedModel,
  activeSessionId,
  existingMessages = [],
  onUpdateMessages,
}: UseAgentRunnerOptions): UseAgentRunnerResult {
  const [isRunning, setIsRunning] = useState(false);
  const [events, setEvents] = useState<StudioEvent[]>([]);
  const [activeExecutionId, setActiveExecutionId] = useState("");

  /**
   * Mutable ref shared between triggerRun and stopExecution.
   * When true, the SSE iterator loop in consumeExecutionStream exits on next tick.
   */
  const cancelledRef = useRef(false);

  /** Ref storing the latest execution ID so stopExecution always has the current one. */
  const executionIdRef = useRef("");

  const resolveMutation = useResolveApproval();

  const resolveApproval = useCallback(
    async (approvalId: string, scope: PermissionScope): Promise<void> => {
      await resolveMutation.mutateAsync({ approvalId, scope });
    },
    [resolveMutation],
  );

  /**
   * Appends a StudioEvent to the local events array for the Inspector Rail.
   * Kept as a stable callback so it can be passed to consumeExecutionStream.
   */
  const addEvent = useCallback((event: StudioEvent): void => {
    setEvents((prev) => [...prev, event]);
  }, []);

  /**
   * Stops the current execution:
   *  1. Sets cancelledRef so the SSE loop exits on next iteration
   *  2. Calls the Gateway cancel API to terminate the server-side loop
   *  3. Resets local running state
   */
  const stopExecution = useCallback((): void => {
    cancelledRef.current = true;
    setIsRunning(false);
    const idToCancel = executionIdRef.current;
    if (idToCancel) {
      // Fire-and-forget — we don't block the UI on the API call completing
      getApiClient()
        .executions.cancel(idToCancel)
        .catch(() => {
          // Gateway may already have terminated; ignore cancellation errors
        });
    }
  }, []);

  const triggerRun = useCallback(
    async (promptText: string): Promise<void> => {
      const text = promptText.trim();
      if (!text) return;
      if (!activeSpecialist) {
        throw new Error("No active specialist agent available in database.");
      }

      // Reset cancellation signal for this new run
      cancelledRef.current = false;
      setIsRunning(true);

      const now = (): string => new Date().toLocaleTimeString();
      const userMsgId = `user_${Date.now()}`;
      const agentMsgId = `agent_${Date.now()}`;

      // Build previous turn history for continuous multi-turn LLM context
      const history = (existingMessages || [])
        .filter((m) => m.content && !m.isStreaming)
        .map((m) => ({
          role: m.role === CoworkMessageRole.AGENT ? "assistant" : m.role,
          content: m.content,
        }));

      const thinkingText = `Analyzing: "${text.slice(0, 60)}${text.length > 60 ? "..." : ""}"\nSynthesizing response and executing capabilities...`;

      onUpdateMessages((prev) => [
        ...prev,
        { id: userMsgId, role: CoworkMessageRole.USER, content: text, timestamp: now() },
        {
          id: agentMsgId,
          role: CoworkMessageRole.AGENT,
          content: "",
          timestamp: now(),
          specialistName: activeSpecialist.name,
          model: selectedModel,
          isStreaming: true,
          artifacts: [],
          thinking: {
            text: thinkingText,
            durationSeconds: 1.2,
            collapsed: false,
          },
          segments: createInitialAgentSegments(agentMsgId, thinkingText, 1.2),
        },
      ]);

      try {
        const client = getApiClient();
        const agentList = await client.agents.list().catch(() => ({ items: [] }));
        const target =
          agentList?.items?.find((a) => a.agentId === activeSpecialist.id) ||
          agentList?.items?.find(
            (a) => a.name.toLowerCase() === activeSpecialist.name.toLowerCase(),
          ) ||
          agentList?.items?.[0];

        if (!target?.agentId) {
          throw new Error("No agent available in database to execute task");
        }

        const handle = await client.agents.run({
          agent: target.agentId,
          input: text,
          conversationId: activeSessionId,
          history,
          variables: { model: selectedModel, systemPrompt: activeSpecialist.description },
        });

        setActiveExecutionId(handle.id);
        executionIdRef.current = handle.id;

        try {
          const streamIterator = await handle.stream();
          await consumeExecutionStream({
            streamIterator,
            agentMsgId,
            executionId: handle.id,
            specialistName: activeSpecialist.name,
            onUpdateMessages,
            cancelledRef,
            onAddEvent: addEvent,
          });
        } catch {
          // Stream failed — fall back to polling the execution result
          const finalRecord = await handle.wait(1500, 30000);
          const fallbackOutput = (finalRecord as { result?: { output?: string } })?.result?.output;
          const fallbackText =
            fallbackOutput || `Task completed under run ${finalRecord.executionId}.`;
          onUpdateMessages((prev) =>
            prev.map((m) =>
              m.id === agentMsgId
                ? {
                    ...m,
                    isStreaming: false,
                    executionId: finalRecord.executionId,
                    content: m.content || fallbackText,
                    segments: m.content ? m.segments : appendTextSegment(m.segments, fallbackText),
                  }
                : m,
            ),
          );
        }
      } catch (err: unknown) {
        const errMsg = formatApiError(err, "Gateway runtime is currently initializing.");
        onUpdateMessages((prev) =>
          prev.map((m) =>
            m.id === agentMsgId
              ? {
                  ...m,
                  isStreaming: false,
                  content: m.content || `*${errMsg}*`,
                  segments: m.content ? m.segments : appendTextSegment(m.segments, `*${errMsg}*`),
                }
              : m,
          ),
        );
        addEvent({
          id: `err_${Date.now()}`,
          agent: activeSpecialist.name,
          title: `Runtime error: ${errMsg.slice(0, 50)}`,
          detail: errMsg,
          meta: new Date().toLocaleTimeString(),
          type: StudioEventType.MODEL,
        });
      } finally {
        setIsRunning(false);
        executionIdRef.current = "";
      }
    },
    [
      activeSpecialist,
      selectedModel,
      existingMessages,
      onUpdateMessages,
      activeSessionId,
      addEvent,
    ],
  );

  return {
    isRunning,
    events,
    activeExecutionId,
    triggerRun,
    resolveApproval,
    stopExecution,
    clearEvents: () => setEvents([]),
  };
}
