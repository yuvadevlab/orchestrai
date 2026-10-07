"use client";

/**
 * @file apps/console/src/features/knowledge/api/use-ingest-document.ts
 * @description Hook managing document ingestion and vector indexing mutation.
 * @module apps/console/features/knowledge/api
 */

import { useMutation, useQueryClient, type UseMutationResult } from "@tanstack/react-query";
import { getApiClient } from "@/lib/api-client";
import { KNOWLEDGE_DOCUMENTS_QUERY_KEY } from "./use-knowledge-documents";
import type { IngestDocumentPayload } from "../types";
import { API_ROUTES, HttpMethod } from "@/lib/query-keys";

/**
 * Hook to ingest and chunk a document into RAG vector storage.
 */
export function useIngestDocument(): UseMutationResult<unknown, Error, IngestDocumentPayload> {
  const queryClient = useQueryClient();
  const client = getApiClient();

  return useMutation({
    mutationFn: async (payload: IngestDocumentPayload): Promise<unknown> => {
      // Ingest document payload via Gateway API
      return client.http.request(API_ROUTES.RAG_DOCUMENTS, {
        method: HttpMethod.POST,
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      // Invalidate knowledge documents cache
      queryClient.invalidateQueries({ queryKey: KNOWLEDGE_DOCUMENTS_QUERY_KEY });
    },
  });
}
