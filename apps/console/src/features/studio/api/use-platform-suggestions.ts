"use client";

/**
 * @file apps/console/src/features/studio/api/use-platform-suggestions.ts
 * @description Hook fetching dynamic welcome starter suggestion chips.
 * @module apps/console/features/studio/api
 */

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { getApiClient } from "@/lib/api-client";
import { useAuth } from "@/lib/auth";
import { QUERY_KEYS, API_ROUTES } from "@/lib/query-keys";

/**
 * Queries dynamic welcome starter suggestions from the Gateway API.
 *
 * @returns Query result containing array of suggestion prompt strings
 */
export function usePlatformSuggestions(): UseQueryResult<string[], Error> {
  const { isAuthenticated, isLoading } = useAuth();

  return useQuery<string[]>({
    queryKey: QUERY_KEYS.PLATFORM.SUGGESTIONS,
    enabled: isAuthenticated && !isLoading,
    queryFn: async (): Promise<string[]> => {
      const client = getApiClient();
      const response = await client.http.request<string[]>(API_ROUTES.SUGGESTIONS).catch(() => []);

      return Array.isArray(response) ? response : [];
    },
    staleTime: 60_000,
  });
}
