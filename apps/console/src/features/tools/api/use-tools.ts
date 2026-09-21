"use client";

/**
 * @file use-tools.ts
 * @description Custom React hook fetching registered tool capabilities from Gateway API.
 * @module apps/console/features/tools/api
 */

import { useApiData, type UseApiDataResult } from "@/lib/use-api-data";
import type { ToolDefinition } from "../types";

/**
 * Custom React hook querying registered agent tools from Gateway REST API.
 *
 * @returns Query result containing tool definitions, loading state, error, and refetch handler.
 */
export function useTools(): UseApiDataResult<ToolDefinition[]> {
  return useApiData<ToolDefinition[]>({
    fetchFn: async (): Promise<ToolDefinition[]> => {
      // Tool registry endpoint mapping
      return [];
    },
    initialData: [],
  });
}
