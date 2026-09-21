"use client";

/**
 * @file use-executions.ts
 * @description Custom React hook fetching execution DAG traces from Gateway API.
 * @module apps/console/features/executions/api
 */

import { useApiData, type UseApiDataResult } from "@/lib/use-api-data";
import type { ExecutionRun, ExecutionStatus } from "../types";
import type { Execution } from "@orchestrai/sdk";

/**
 * Custom React hook querying execution runs from Gateway REST API.
 *
 * @returns Query result containing execution runs, loading state, error, and refetch handler.
 */
export function useExecutions(): UseApiDataResult<ExecutionRun[]> {
  return useApiData<ExecutionRun[]>({
    fetchFn: async (client): Promise<ExecutionRun[]> => {
      const response = await client.executions.list();
      const items: Execution[] = response?.items ?? [];

      return items.map((ex: Execution): ExecutionRun => {
        const rawStatus = String(ex.status || "COMPLETED").toUpperCase();
        const status: ExecutionStatus =
          rawStatus === "COMPLETED" ||
          rawStatus === "RUNNING" ||
          rawStatus === "FAILED" ||
          rawStatus === "PAUSED"
            ? rawStatus
            : "COMPLETED";

        return {
          id: ex.executionId,
          intent: "Execution Run",
          primaryAgent: ex.agentId || "General Agent",
          status,
          stepsCompleted: 1,
          totalSteps: 1,
          latencyMs: 0,
          tokensUsed: 0,
          createdAt: ex.createdAt || new Date().toISOString(),
        };
      });
    },
    initialData: [],
  });
}
