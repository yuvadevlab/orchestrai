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

  // Strict Tenancy Invariant: Require a resolved tenant ID; never fallback to a hardcoded string
  if (!isAuthLoading && !tenantId) {
    throw new Error(
      "Active workspace or tenant ID is missing. Please sign in to access your mapped agents.",
    );
  }

  return useApiData<AgentDefinition[]>({
    fetchFn: async (client): Promise<AgentDefinition[]> => {
      // Invariant: Tenancy isolation strictly requires a valid tenant ID
      if (!tenantId) {
        throw new Error(
          "Active workspace or tenant ID is missing. Please sign in to access your mapped agents.",
        );
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
