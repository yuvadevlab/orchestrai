"use client";

/**
 * @file apps/console/src/features/memory/api/use-memories.ts
 * @description Hook querying persistent agent memories and episodic reflections from Gateway API.
 * @module apps/console/features/memory/api
 */

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { getApiClient } from "@/lib/api-client";
import type { MemoryItem } from "../types";
import { QUERY_KEYS, API_ROUTES } from "@/lib/query-keys";

export const MEMORY_QUERY_KEY = QUERY_KEYS.MEMORY.ALL;

/**
 * Hook to retrieve all agent memories and learned facts.
 */
export function useMemories(): UseQueryResult<MemoryItem[], Error> {
  const client = getApiClient();

  return useQuery({
    queryKey: MEMORY_QUERY_KEY,
    queryFn: async (): Promise<MemoryItem[]> => {
      // Query memories catalog from Gateway API
      const res = await client.http.request<{ items: MemoryItem[]; total: number }>(
        API_ROUTES.MEMORY,
      );
      return res.items || [];
    },
    staleTime: 15_000,
  });
}
