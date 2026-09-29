"use client";

/**
 * @file apps/console/src/features/memory/api/use-search-memories.ts
 * @description Hook providing clean interface for testing semantic memory recall.
 * @module apps/console/features/memory/api
 */

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { getApiClient } from "@/lib/api-client";
import type { ScoredMemoryResult } from "../types";

export interface UseSearchMemoriesResult {
  recall: (query: string) => Promise<ScoredMemoryResult[]>;
  results: ScoredMemoryResult[] | null;
  isRecalling: boolean;
  error: Error | null;
  reset: () => void;
}

/**
 * Hook to execute semantic memory recall search against persistent agent memory.
 */
export function useSearchMemories(): UseSearchMemoriesResult {
  const client = getApiClient();
  const [results, setResults] = useState<ScoredMemoryResult[] | null>(null);

  const mutation = useMutation({
    mutationFn: async (queryText: string): Promise<ScoredMemoryResult[]> => {
      const res = await client.http.request<{ items: ScoredMemoryResult[] }>(
        "/api/v1/memory/search",
        {
          method: "POST",
          body: JSON.stringify({ query: queryText }),
        },
      );
      return res.items || [];
    },
    onSuccess: (data) => {
      setResults(data);
    },
  });

  const recall = async (query: string): Promise<ScoredMemoryResult[]> => {
    return mutation.mutateAsync(query);
  };

  const reset = (): void => {
    setResults(null);
    mutation.reset();
  };

  return {
    recall,
    results,
    isRecalling: mutation.isPending,
    error: mutation.error,
    reset,
  };
}
