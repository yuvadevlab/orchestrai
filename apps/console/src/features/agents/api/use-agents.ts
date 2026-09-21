"use client";

/**
 * @file use-agents.ts
 * @description Custom React hook fetching registered cluster agents from Gateway API.
 * @module apps/console/features/agents/api
 */

import { useApiData, type UseApiDataResult } from "@/lib/use-api-data";
import type { AgentDefinition } from "../types";
import type { Agent } from "@orchestrai/sdk";

/**
 * Custom React hook querying registered agents from Gateway REST API.
 *
 * @returns Query result containing agents list, loading state, error, and refetch handler.
 */
export function useAgents(): UseApiDataResult<AgentDefinition[]> {
  return useApiData<AgentDefinition[]>({
    fetchFn: async (client): Promise<AgentDefinition[]> => {
      const response = await client.agents.list();
      const items: Agent[] = response?.items ?? [];

      return items.map((a: Agent): AgentDefinition => ({
        id: a.agentId,
        name: a.name || "Agent Entity",
        role: String(a.mode || "Specialist"),
        model: "Qwen 8B",
        status: "IDLE",
        tools: a.enabledTools || [],
        description: a.description || a.systemPrompt || "Registered cluster agent",
        totalExecutions: 0,
        successRate: 100,
        averageLatencyMs: 0,
      }));
    },
    initialData: [],
  });
}
