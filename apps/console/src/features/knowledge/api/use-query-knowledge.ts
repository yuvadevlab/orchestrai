"use client";

/**
 * @file apps/console/src/features/knowledge/api/use-query-knowledge.ts
 * @description Hook providing clean interface for testing hybrid vector queries against RAG storage.
 * @module apps/console/features/knowledge/api
 */

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { getApiClient } from "@/lib/api-client";
import type { KnowledgeQueryResult } from "../types";

export interface UseQueryKnowledgeResult {
  search: (query: string) => Promise<KnowledgeQueryResult>;
  results: KnowledgeQueryResult | null;
  isSearching: boolean;
  error: Error | null;
  reset: () => void;
}

const DEFAULT_QUERY_LIMIT = 5;
const DEFAULT_MIN_SCORE = 0.05;

/**
 * Hook to execute and manage hybrid vector retrieval testing against indexed knowledge.
 */
export function useQueryKnowledge(): UseQueryKnowledgeResult {
  const client = getApiClient();
  const [results, setResults] = useState<KnowledgeQueryResult | null>(null);

  const mutation = useMutation({
    mutationFn: async (queryText: string): Promise<KnowledgeQueryResult> => {
      return client.http.request<KnowledgeQueryResult>("/api/v1/rag/query", {
        method: "POST",
        body: JSON.stringify({
          query: queryText,
          limit: DEFAULT_QUERY_LIMIT,
          minScore: DEFAULT_MIN_SCORE,
        }),
      });
    },
    onSuccess: (data) => {
      setResults(data);
    },
  });

  const search = async (query: string): Promise<KnowledgeQueryResult> => {
    return mutation.mutateAsync(query);
  };

  const reset = (): void => {
    setResults(null);
    mutation.reset();
  };

  return {
    search,
    results,
    isSearching: mutation.isPending,
    error: mutation.error,
    reset,
  };
}
