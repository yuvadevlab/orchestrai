"use client";

/**
 * @file apps/console/src/lib/hooks/use-modes.ts
 * @description TanStack Query hook fetching platform execution modes from the live database.
 * @module apps/console/lib/hooks
 */

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { getApiClient } from "@/lib/api-client";
import { useAuth } from "@/lib/auth";
import type { PlatformModeRecord } from "@orchestrai/shared-types";
import { QUERY_KEYS, API_ROUTES } from "@/lib/query-keys";

export type PlatformExecutionMode = PlatformModeRecord;

/**
 * Queries active execution modes from the Gateway API.
 * Returns live records with zero static fallback dummy items.
 *
 * @returns Query result containing platform execution modes
 */
export function usePlatformModes(): UseQueryResult<PlatformModeRecord[], Error> {
  const { isAuthenticated, isLoading } = useAuth();

  return useQuery<PlatformModeRecord[]>({
    queryKey: QUERY_KEYS.PLATFORM.MODES,
    enabled: isAuthenticated && !isLoading,
    queryFn: async (): Promise<PlatformModeRecord[]> => {
      const client = getApiClient();
      // Fetch dynamic modes catalog from gateway
      const response = await client.http
        .request<PlatformModeRecord[]>(API_ROUTES.MODES)
        .catch(() => []);

      // Verify array payload structure
      if (!Array.isArray(response)) {
        return [];
      }

      // Filter enabled modes and sort by sortOrder
      return response.filter((m) => m.isEnabled).sort((a, b) => a.sortOrder - b.sortOrder);
    },
    staleTime: 30_000,
  });
}
