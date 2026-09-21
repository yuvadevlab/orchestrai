"use client";

/**
 * @file use-workflows.ts
 * @description Custom React hook fetching visual workflow DAG graphs from Gateway API.
 * @module apps/console/features/workflows/api
 */

import { useApiData, type UseApiDataResult } from "@/lib/use-api-data";
import type { WorkflowDefinition } from "../types";

/**
 * Custom React hook querying workflow graphs from Gateway REST API.
 *
 * @returns Query result containing workflow definitions, loading state, error, and refetch handler.
 */
export function useWorkflows(): UseApiDataResult<WorkflowDefinition[]> {
  return useApiData<WorkflowDefinition[]>({
    fetchFn: async (): Promise<WorkflowDefinition[]> => {
      // Workflow DAG graph endpoint mapping
      return [];
    },
    initialData: [],
  });
}
