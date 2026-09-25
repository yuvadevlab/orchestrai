"use client";

/**
 * @file use-executions.ts
 * @description Custom React hook fetching execution DAG traces enriched with human-readable metadata.
 * @module apps/console/features/executions/api
 */

import { useApiData, type UseApiDataResult } from "@/lib/use-api-data";
import { useAuth } from "@/lib/auth";
import type { ExecutionRun, ExecutionStatus, ExecutionStepTrace } from "../types";
import type { Agent, Execution } from "@orchestrai/sdk";

/**
 * Converts an ISO date string into a friendly relative human duration (e.g. '2m ago').
 */
function formatRelativeTime(isoString: string): string {
  try {
    const timestamp = new Date(isoString).getTime();
    if (Number.isNaN(timestamp)) return "recently";
    const diffSec = Math.floor((Date.now() - timestamp) / 1000);

    if (diffSec < 45) return "just now";
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    if (diffSec < 172800) return "yesterday";
    return `${Math.floor(diffSec / 86400)}d ago`;
  } catch {
    return "recently";
  }
}

/**
 * Formats milliseconds into human-readable duration strings (e.g. '1.4s', '350ms').
 */
function formatDuration(ms: number): string {
  if (ms <= 0) return "0ms";
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  const mins = Math.floor(ms / 60000);
  const secs = Math.floor((ms % 60000) / 1000);
  return `${mins}m ${secs}s`;
}

/**
 * Custom React hook querying execution runs from Gateway REST API with enriched agent and timing context.
 */
export function useExecutions(): UseApiDataResult<ExecutionRun[]> {
  const { tenantId, isLoading: isAuthLoading } = useAuth();

  return useApiData<ExecutionRun[]>({
    fetchFn: async (client): Promise<ExecutionRun[]> => {
      if (!tenantId) {
        return [];
      }

      // Fetch executions and agents concurrently for name and persona resolution
      const [execResponse, agentResponse] = await Promise.all([
        client.executions.list(),
        client.agents.list().catch(() => ({ items: [] as Agent[] })),
      ]);

      const items: Execution[] = execResponse?.items ?? [];
      const agentList: Agent[] = agentResponse?.items ?? [];

      // Create quick lookup map for agent metadata
      const agentMap = new Map<string, { name: string; role: string; model: string }>();
      for (const a of agentList) {
        const raw = a as unknown as Record<string, unknown>;
        const metadata = (raw.metadata || {}) as Record<string, unknown>;
        const config = (a.modelConfig || {}) as Record<string, unknown>;

        const model =
          typeof config.modelName === "string"
            ? config.modelName
            : typeof config.model === "string"
              ? config.model
              : "Default Model";

        const role =
          typeof metadata.role === "string"
            ? metadata.role
            : typeof a.mode === "string"
              ? a.mode
              : "Specialist";

        const agentKey = a.agentId || ((a as unknown as { id?: string }).id ?? "");
        if (agentKey) {
          agentMap.set(agentKey, { name: a.name, role, model });
        }
      }

      return items.map((ex: Execution): ExecutionRun => {
        const rawStatus = String(ex.status || "COMPLETED").toUpperCase();
        const status: ExecutionStatus =
          rawStatus === "COMPLETED" ||
          rawStatus === "RUNNING" ||
          rawStatus === "FAILED" ||
          rawStatus === "PAUSED" ||
          rawStatus === "CANCELLED" ||
          rawStatus === "QUEUED"
            ? (rawStatus as ExecutionStatus)
            : "COMPLETED";

        const raw = ex as unknown as Record<string, unknown>;
        const agentMeta = ex.agentId ? agentMap.get(ex.agentId) : undefined;
        const agentName =
          agentMeta?.name ||
          (typeof raw.agentName === "string" ? raw.agentName : undefined) ||
          "Orchestrator Agent";
        const agentRole = agentMeta?.role || "Specialist";
        const agentModel = agentMeta?.model || "Cloud Engine";

        // Calculate latency / elapsed time
        const createdMs = ex.createdAt ? new Date(ex.createdAt).getTime() : Date.now();
        const updatedMs = ex.updatedAt ? new Date(ex.updatedAt).getTime() : createdMs;
        const calculatedLatency = Math.max(0, updatedMs - createdMs);
        const latencyMs = typeof raw.durationMs === "number" ? raw.durationMs : calculatedLatency;

        // Steps and errors
        const rawSteps = Array.isArray(raw.steps) ? (raw.steps as ExecutionStepTrace[]) : [];
        const rawResult = (raw.result || {}) as Record<string, unknown>;
        const errorMessage =
          typeof raw.error === "string"
            ? raw.error
            : typeof rawResult.error === "string"
              ? rawResult.error
              : undefined;

        const mode = typeof ex.mode === "string" ? ex.mode : "auto";
        const conversationTitle =
          typeof raw.conversationTitle === "string" ? raw.conversationTitle : undefined;

        return {
          id: ex.executionId,
          traceId: typeof raw.traceId === "string" ? raw.traceId : undefined,
          intent: conversationTitle || `Task Execution (${mode.toUpperCase()})`,
          status,
          agentId: ex.agentId,
          agentName,
          primaryAgent: agentName,
          agentRole,
          agentModel,
          mode,
          conversationId: ex.conversationId,
          conversationTitle,
          stepsCompleted: rawSteps.filter((s) => s.status === "completed").length || 1,
          totalSteps: rawSteps.length || 1,
          currentNode: rawSteps.length > 0 ? rawSteps[rawSteps.length - 1]?.nodeName : undefined,
          errorMessage,
          latencyMs,
          durationFormatted: formatDuration(latencyMs),
          tokensUsed: typeof raw.tokensUsed === "number" ? raw.tokensUsed : 0,
          createdAt: ex.createdAt || new Date().toISOString(),
          timeAgo: formatRelativeTime(ex.createdAt || new Date().toISOString()),
          steps: rawSteps,
          rawRecord: raw,
        };
      });
    },
    initialData: [],
    queryKey: ["executions", tenantId],
    enabled: !isAuthLoading && Boolean(tenantId),
  });
}
