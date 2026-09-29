"use client";

/**
 * @file apps/console/src/features/knowledge/api/use-delete-document.ts
 * @description Hook managing document deletion from RAG storage.
 * @module apps/console/features/knowledge/api
 */

import { useMutation, useQueryClient, type UseMutationResult } from "@tanstack/react-query";
import { getApiClient } from "@/lib/api-client";
import { KNOWLEDGE_DOCUMENTS_QUERY_KEY } from "./use-knowledge-documents";

/**
 * Hook to delete an ingested document and its vector chunks.
 */
export function useDeleteDocument(): UseMutationResult<unknown, Error, string> {
  const queryClient = useQueryClient();
  const client = getApiClient();

  return useMutation({
    mutationFn: async (documentId: string): Promise<unknown> => {
      return client.http.request(`/api/v1/rag/documents/${documentId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KNOWLEDGE_DOCUMENTS_QUERY_KEY });
    },
  });
}
