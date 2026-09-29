"use client";

/**
 * @file apps/console/src/features/knowledge/api/use-knowledge-documents.ts
 * @description Hook querying indexed knowledge documents from the Gateway API.
 * @module apps/console/features/knowledge/api
 */

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { getApiClient } from "@/lib/api-client";
import type { KnowledgeDocument } from "../types";

export const KNOWLEDGE_DOCUMENTS_QUERY_KEY = ["knowledge", "documents"] as const;

/**
 * Hook to fetch all indexed knowledge documents.
 */
export function useKnowledgeDocuments(): UseQueryResult<KnowledgeDocument[], Error> {
  const client = getApiClient();

  return useQuery({
    queryKey: KNOWLEDGE_DOCUMENTS_QUERY_KEY,
    queryFn: async (): Promise<KnowledgeDocument[]> => {
      const res = await client.http.request<{ documents: KnowledgeDocument[]; total: number }>(
        "/api/v1/rag/documents",
      );
      return res.documents || [];
    },
    staleTime: 30_000,
  });
}
