"use client";

/**
 * @file apps/console/src/features/memory/api/use-delete-memory.ts
 * @description Hook managing memory item deletion mutation.
 * @module apps/console/features/memory/api
 */

import { useMutation, useQueryClient, type UseMutationResult } from "@tanstack/react-query";
import { getApiClient } from "@/lib/api-client";
import { MEMORY_QUERY_KEY } from "./use-memories";

/**
 * Hook to delete a memory item by ID.
 */
export function useDeleteMemory(): UseMutationResult<unknown, Error, string> {
  const queryClient = useQueryClient();
  const client = getApiClient();

  return useMutation({
    mutationFn: async (memoryId: string): Promise<unknown> => {
      return client.http.request(`/api/v1/memory/${memoryId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MEMORY_QUERY_KEY });
    },
  });
}
