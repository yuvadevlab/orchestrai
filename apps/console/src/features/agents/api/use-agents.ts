"use client";

/**
 * @file use-agents.ts
 * @description Custom React hook fetching registered cluster agents from Gateway API.
 * @module apps/console/features/agents/api
 */

import { useApiData, type UseApiDataResult } from "@/lib/use-api-data";
import { useAuth } from "@/lib/auth";
import type { AgentDefinition } from "../types";
import type { Agent } from "@orchestrai/sdk";

/**
 * Custom React hook querying registered agents from Gateway REST API.
 *
 * @returns Query result containing agents list, loading state, error, and refetch handler.
 */
export function useAgents(): UseApiDataResult<AgentDefinition[]> {
  const { tenantId, isLoading: isAuthLoading } = useAuth();

  return useApiData<AgentDefinition[]>({
    fetchFn: async (client): Promise<AgentDefinition[]> => {
      if (!tenantId) {
        return [];
      }
      const response = await client.agents.list();
      const items: Agent[] = response?.items ?? [];

      return items.map((a: Agent): AgentDefinition => {
        const config = (a.modelConfig || {}) as Record<string, unknown>;
        const rawAgent = a as unknown as Record<string, unknown>;
        const metadata = (rawAgent.metadata || {}) as Record<string, unknown>;
        const modelName =
          typeof config.modelName === "string"
            ? config.modelName
            : typeof config.model === "string"
              ? config.model
              : typeof config.provider === "string"
                ? config.provider
                : "Unassigned";

        const role =
          typeof metadata.role === "string"
            ? metadata.role
            : typeof a.mode === "string"
              ? a.mode
              : "Specialist";

        return {
          id: a.agentId,
          name: a.name || "Agent Entity",
          role,
          model: modelName,
          status: "IDLE",
          tools: a.enabledTools || [],
          description: a.description || a.systemPrompt || "Registered cluster agent",
          totalExecutions: 0,
          successRate: 100,
          averageLatencyMs: 0,
        };
      });
    },
    initialData: [],
    queryKey: ["agents", tenantId],
    enabled: !isAuthLoading && Boolean(tenantId),
  });
}
