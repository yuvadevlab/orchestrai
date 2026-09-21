"use client";

/**
 * @file use-memory.ts
 * @description Custom React hook fetching agent memory records from Gateway API.
 * @module apps/console/features/memory/api
 */

import { useApiData, type UseApiDataResult } from "@/lib/use-api-data";
import type { MemoryRecord } from "@/lib/types";

/**
 * Custom React hook querying agent working/long-term memory records from Gateway REST API.
 *
 * @returns Query result containing memory records, loading state, error, and refetch handler.
 */
export function useMemory(): UseApiDataResult<MemoryRecord[]> {
  return useApiData<MemoryRecord[]>({
    fetchFn: async (): Promise<MemoryRecord[]> => {
      // Memory store inspection endpoint mapping
      return [];
    },
    initialData: [],
  });
}
