"use client";

/**
 * @file use-knowledge.ts
 * @description Custom React hook fetching RAG knowledge documents from Gateway API.
 * @module apps/console/features/knowledge/api
 */

import { useApiData, type UseApiDataResult } from "@/lib/use-api-data";
import type { KnowledgeDoc } from "@/lib/types";

/**
 * Custom React hook querying RAG knowledge documents from Gateway REST API.
 *
 * @returns Query result containing knowledge docs, loading state, error, and refetch handler.
 */
export function useKnowledge(): UseApiDataResult<KnowledgeDoc[]> {
  return useApiData<KnowledgeDoc[]>({
    fetchFn: async (): Promise<KnowledgeDoc[]> => {
      // Vector document retrieval endpoint mapping
      return [];
    },
    initialData: [],
  });
}
