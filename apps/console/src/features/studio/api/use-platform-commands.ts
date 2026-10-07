"use client";

/**
 * @file apps/console/src/features/studio/api/use-platform-commands.ts
 * @description Hook fetching platform slash commands.
 * @module apps/console/features/studio/api
 */

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { getApiClient } from "@/lib/api-client";
import { useAuth } from "@/lib/auth";
import type { PlatformCommandRecord } from "@orchestrai/shared-types";

/**
 * Queries active platform slash commands from the Gateway API.
 *
 * @returns Query result containing list of active platform commands
 */
export function usePlatformCommands(): UseQueryResult<PlatformCommandRecord[], Error> {
  const { isAuthenticated, isLoading } = useAuth();

  return useQuery<PlatformCommandRecord[]>({
    queryKey: ["platform-commands"],
    enabled: isAuthenticated && !isLoading,
    queryFn: async (): Promise<PlatformCommandRecord[]> => {
      const client = getApiClient();
      const response = await client.http
        .request<PlatformCommandRecord[]>("/api/v1/commands")
        .catch(() => []);

      // Ensure response is an array before filtering
      if (!Array.isArray(response)) {
        return [];
      }

      // Filter enabled commands and maintain sorted presentation order
      return response.filter((c) => c.isEnabled).sort((a, b) => a.sortOrder - b.sortOrder);
    },
    staleTime: 30_000,
  });
}
