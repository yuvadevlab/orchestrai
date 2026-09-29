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

/**
 * Hook to ingest and chunk a document into RAG vector storage.
 */
export function useIngestDocument(): UseMutationResult<unknown, Error, IngestDocumentPayload> {
  const queryClient = useQueryClient();
  const client = getApiClient();

  return useMutation({
    mutationFn: async (payload: IngestDocumentPayload): Promise<unknown> => {
      return client.http.request("/api/v1/rag/documents", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KNOWLEDGE_DOCUMENTS_QUERY_KEY });
    },
  });
}
