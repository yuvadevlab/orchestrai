"use client";

/**
 * @file apps/console/src/lib/use-api-data.ts
 * @description Universal data fetching hook integrating TanStack Query caching, deduping, and error normalization.
 * @module apps/console/lib
 */

import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { getApiClient } from "./api-client";
import { formatApiError } from "./error-utils";

export interface UseApiDataOptions<T> {
  /** Async fetch callback taking initialized OrchestrAIClient */
  fetchFn: (client: ReturnType<typeof getApiClient>) => Promise<T>;
  /** Default fallback data when loading or when API returns empty */
  initialData: T;
  /** Optional explicit cache key */
  queryKey?: unknown[];
  /** Optional enabled flag to conditionally trigger data fetching */
  enabled?: boolean;
}

export interface UseApiDataResult<T> {
  /** Loaded dataset or fallback */
  data: T;
  /** Loading indicator boolean */
  isLoading: boolean;
  /** Optional error instance if fetch failed */
  error: Error | null;
  /** Manual trigger to re-fetch dataset */
  refetch: () => Promise<void>;
}

/**
 * React hook to fetch live gateway resource data powered by TanStack Query for caching and background synchronization.
 */
export function useApiData<T>({
  fetchFn,
  initialData,
  queryKey,
  enabled = true,
}: UseApiDataOptions<T>): UseApiDataResult<T> {
  const query = useQuery({
    queryKey: queryKey || ["gateway-data", fetchFn.toString()],
    queryFn: async (): Promise<T> => {
      const client = getApiClient();
      const result = await fetchFn(client);
      return result ?? initialData;
    },
    enabled,
  });

  const refetch = useCallback(async (): Promise<void> => {
    await query.refetch();
  }, [query]);

  // Format error into friendly message while preserving underlying error cause
  const normalizedError = query.error
    ? new Error(formatApiError(query.error, "Failed to load data from gateway"), {
        cause: query.error,
      })
    : null;

  return {
    data: query.data ?? initialData,
    isLoading: query.isLoading,
    error: normalizedError,
    refetch,
  };
}
