"use client";

/**
 * @file use-agent-runner.ts
 * @description Real Gateway execution dispatch and SSE streaming hook for Cowork Studio.
 * @module apps/console/features/studio/hooks
 */

import { useCallback, useState } from "react";
import { PermissionScope, CoworkMessageRole } from "@orchestrai/shared-types";
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
  const resolveMutation = useResolveApproval();

  const resolveApproval = useCallback(
    async (approvalId: string, scope: PermissionScope): Promise<void> => {
      await resolveMutation.mutateAsync({ approvalId, scope });
    },
    [resolveMutation],
  );

  const triggerRun = useCallback(
    async (promptText: string): Promise<void> => {
      const text = promptText.trim();
      if (!text) return;
      if (!activeSpecialist) {
        throw new Error("No active specialist agent available in database.");
      }

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

        try {
          const streamIterator = await handle.stream();
          await consumeExecutionStream({
            streamIterator,
            agentMsgId,
            executionId: handle.id,
            onUpdateMessages,
          });
        } catch {
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
      } finally {
        setIsRunning(false);
      }
    },
    [activeSpecialist, selectedModel, existingMessages, onUpdateMessages, activeSessionId],
  );

  return {
    isRunning,
    events,
    activeExecutionId,
    triggerRun,
    resolveApproval,
    stopExecution: () => setIsRunning(false),
    clearEvents: () => setEvents([]),
  };
}
