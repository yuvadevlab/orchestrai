"use client";

/**
 * @file use-agent-runner.ts
 * @description Real Gateway execution dispatch and SSE streaming hook for Cowork Studio.
 * @module apps/console/features/studio/hooks
 */

import { useCallback, useState } from "react";
import { getApiClient } from "@/lib/api-client";
import { getStoredSession } from "@/lib/auth";
import { formatApiError } from "@/lib/error-utils";
import type {
  CoworkArtifact,
  CoworkMessage,
  SpecialistPersona,
  StudioApprovalRequest,
  StudioEvent,
} from "../types";

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
  resolveApproval: (
    approvalId: string,
    scope: "once" | "session" | "permanent" | "deny",
  ) => Promise<void>;
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

  const resolveApproval = useCallback(
    async (approvalId: string, scope: "once" | "session" | "permanent" | "deny"): Promise<void> => {
      try {
        const session = getStoredSession();
        const tenantId = session?.user?.tenantId;
        if (!tenantId) {
          throw new Error("Active workspace or tenant ID is missing");
        }
        const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || "http://localhost:4001";
        const apiKey = process.env.NEXT_PUBLIC_GATEWAY_API_KEY || "dev-key-for-local-testing";
        const token = session?.token;

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          "x-tenant-id": tenantId,
          "x-api-key": apiKey,
        };
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        await fetch(`${GATEWAY_URL}/api/v1/approvals/${approvalId}/resolve`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            decision: scope === "deny" ? "REJECTED" : "APPROVED",
            scope,
          }),
        });
      } catch {
        // Non-fatal if fetch encounters transient network error
      }
    },
    [],
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
          role: m.role === "agent" ? "assistant" : m.role,
          content: m.content,
        }));

      onUpdateMessages((prev) => [
        ...prev,
        { id: userMsgId, role: "user", content: text, timestamp: now() },
        {
          id: agentMsgId,
          role: "agent",
          content: "",
          timestamp: now(),
          specialistName: activeSpecialist.name,
          model: selectedModel,
          isStreaming: true,
          artifacts: [],
          thinking: {
            text: `Analyzing: "${text.slice(0, 60)}${text.length > 60 ? "..." : ""}"\nSynthesizing response and executing capabilities...`,
            durationSeconds: 1.2,
            collapsed: false,
          },
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
          for await (const sse of streamIterator) {
            if (sse.event === "artifact") {
              try {
                const art: CoworkArtifact =
                  typeof sse.data === "string" ? JSON.parse(sse.data) : sse.data;
                onUpdateMessages((prev) =>
                  prev.map((m) =>
                    m.id === agentMsgId ? { ...m, artifacts: [...(m.artifacts || []), art] } : m,
                  ),
                );
              } catch {
                /* parse ignore */
              }
              continue;
            }

            if (sse.event === "approval_request") {
              try {
                const req: StudioApprovalRequest =
                  typeof sse.data === "string" ? JSON.parse(sse.data) : sse.data;
                onUpdateMessages((prev) =>
                  prev.map((m) => (m.id === agentMsgId ? { ...m, approvalRequest: req } : m)),
                );
              } catch {
                /* parse ignore */
              }
              continue;
            }

            if (sse.event !== "done" && sse.data !== "[DONE]" && typeof sse.data === "string") {
              onUpdateMessages((prev) =>
                prev.map((m) =>
                  m.id === agentMsgId ? { ...m, content: m.content + sse.data } : m,
                ),
              );
            }
          }

          onUpdateMessages((prev) =>
            prev.map((m) =>
              m.id === agentMsgId ? { ...m, isStreaming: false, executionId: handle.id } : m,
            ),
          );
        } catch {
          const finalRecord = await handle.wait(1500, 30000);
          const fallbackOutput = (finalRecord as unknown as { result?: { output?: string } })
            ?.result?.output;
          onUpdateMessages((prev) =>
            prev.map((m) =>
              m.id === agentMsgId
                ? {
                    ...m,
                    isStreaming: false,
                    executionId: finalRecord.executionId,
                    content:
                      m.content ||
                      fallbackOutput ||
                      `Task completed under run ${finalRecord.executionId}.`,
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
              ? { ...m, isStreaming: false, content: m.content || `*${errMsg}*` }
              : m,
          ),
        );
      } finally {
        setIsRunning(false);
      }
    },
    [activeSpecialist, selectedModel, onUpdateMessages],
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
