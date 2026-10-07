"use client";

/**
 * @file apps/console/src/features/knowledge/api/use-knowledge-documents.ts
 * @description Hook querying indexed knowledge documents from the Gateway API.
 * @module apps/console/features/knowledge/api
 */

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { getApiClient } from "@/lib/api-client";
import type { KnowledgeDocument } from "../types";
import { QUERY_KEYS, API_ROUTES } from "@/lib/query-keys";

export const KNOWLEDGE_DOCUMENTS_QUERY_KEY = QUERY_KEYS.KNOWLEDGE.DOCUMENTS;

/**
 * Hook to fetch all indexed knowledge documents.
 */
export function useKnowledgeDocuments(): UseQueryResult<KnowledgeDocument[], Error> {
  const client = getApiClient();

  return useQuery({
    queryKey: KNOWLEDGE_DOCUMENTS_QUERY_KEY,
    queryFn: async (): Promise<KnowledgeDocument[]> => {
      // Query indexed knowledge documents from Gateway API
      const res = await client.http.request<{ documents: KnowledgeDocument[]; total: number }>(
        API_ROUTES.RAG_DOCUMENTS,
      );
      return res.documents || [];
    },
    staleTime: 30_000,
  });
}
