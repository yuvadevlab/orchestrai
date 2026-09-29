"use client";

/**
 * @file apps/console/src/features/memory/api/use-create-memory.ts
 * @description Hook managing mutation for committing new semantic facts to persistent memory.
 * @module apps/console/features/memory/api
 */

import { useMutation, useQueryClient, type UseMutationResult } from "@tanstack/react-query";
import { getApiClient } from "@/lib/api-client";
import { MEMORY_QUERY_KEY } from "./use-memories";
import type { CreateMemoryPayload } from "../types";

/**
 * Hook to store a new semantic memory or fact.
 */
export function useCreateMemory(): UseMutationResult<unknown, Error, CreateMemoryPayload> {
  const queryClient = useQueryClient();
  const client = getApiClient();

  return useMutation({
    mutationFn: async (payload: CreateMemoryPayload): Promise<unknown> => {
      return client.http.request("/api/v1/memory", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MEMORY_QUERY_KEY });
    },
  });
}
