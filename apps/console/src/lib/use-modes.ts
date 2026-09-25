"use client";

/**
 * @file apps/console/src/lib/use-modes.ts
 * @description TanStack Query hook fetching platform execution modes from the live database.
 * @module apps/console/lib
 */

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { getApiClient } from "@/lib/api-client";
import { useAuth } from "@/lib/auth";
import type { PlatformModeRecord } from "@orchestrai/shared-types";

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
    queryKey: ["platform-modes"],
    enabled: isAuthenticated && !isLoading,
    queryFn: async (): Promise<PlatformModeRecord[]> => {
      const client = getApiClient();
      const response = await client.http
        .request<PlatformModeRecord[]>("/api/v1/modes")
        .catch(() => []);

      if (!Array.isArray(response)) {
        return [];
      }

      return response.filter((m) => m.isEnabled).sort((a, b) => a.sortOrder - b.sortOrder);
    },
    staleTime: 30_000,
  });
}
