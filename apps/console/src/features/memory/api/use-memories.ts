"use client";

/**
 * @file apps/console/src/features/memory/api/use-memories.ts
 * @description Hook querying persistent agent memories and episodic reflections from Gateway API.
 * @module apps/console/features/memory/api
 */

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { getApiClient } from "@/lib/api-client";
import type { MemoryItem } from "../types";

export const MEMORY_QUERY_KEY = ["memory", "list"] as const;

/**
 * Hook to retrieve all agent memories and learned facts.
 */
export function useMemories(): UseQueryResult<MemoryItem[], Error> {
  const client = getApiClient();

  return useQuery({
    queryKey: MEMORY_QUERY_KEY,
    queryFn: async (): Promise<MemoryItem[]> => {
      const res = await client.http.request<{ items: MemoryItem[]; total: number }>(
        "/api/v1/memory",
      );
      return res.items || [];
    },
    staleTime: 15_000,
  });
}
