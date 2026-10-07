"use client";

/**
 * @file apps/console/src/features/studio/api/use-platform-suggestions.ts
 * @description Hook fetching dynamic welcome starter suggestion chips.
 * @module apps/console/features/studio/api
 */

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { getApiClient } from "@/lib/api-client";
import { useAuth } from "@/lib/auth";

/**
 * Queries dynamic welcome starter suggestions from the Gateway API.
 *
 * @returns Query result containing array of suggestion prompt strings
 */
export function usePlatformSuggestions(): UseQueryResult<string[], Error> {
  const { isAuthenticated, isLoading } = useAuth();

  return useQuery<string[]>({
    queryKey: ["platform-suggestions"],
    enabled: isAuthenticated && !isLoading,
    queryFn: async (): Promise<string[]> => {
      const client = getApiClient();
      const response = await client.http.request<string[]>("/api/v1/suggestions").catch(() => []);

      return Array.isArray(response) ? response : [];
    },
    staleTime: 60_000,
  });
}
