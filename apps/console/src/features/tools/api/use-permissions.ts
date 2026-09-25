"use client";

/**
 * @file use-permissions.ts
 * @description TanStack Query hook fetching tool permission levels from the live database.
 * Strictly zero hardcoded permissions or approval policies.
 * @module apps/console/features/tools/api
 */

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { getApiClient } from "@/lib/api-client";
import { useAuth } from "@/lib/auth";

export interface ToolPermissionRecord {
  permissionId: string;
  name: string;
  level: string;
  description?: string;
  requiresApproval: boolean;
  sortOrder: number;
}

/**
 * Queries active permission tiers from the Gateway API.
 * Sourced directly from the platform_permissions database table.
 *
 * @returns Query result containing permission tiers
 */
export function usePermissions(): UseQueryResult<ToolPermissionRecord[], Error> {
  const { isAuthenticated, isLoading } = useAuth();

  return useQuery<ToolPermissionRecord[]>({
    queryKey: ["tool-permissions"],
    enabled: isAuthenticated && !isLoading,
    queryFn: async (): Promise<ToolPermissionRecord[]> => {
      const client = getApiClient();
      const response = await client.http
        .request<ToolPermissionRecord[]>("/api/v1/permissions")
        .catch(() => []);

      if (!Array.isArray(response)) {
        return [];
      }

      return response.sort((a, b) => a.sortOrder - b.sortOrder);
    },
    staleTime: 30_000,
  });
}
