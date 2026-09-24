"use client";

/**
 * @file use-agent-roles.ts
 * @description TanStack Query hook fetching agent roles from the live database.
 * Strictly zero hardcoded roles or categories.
 * @module apps/console/features/agents/api
 */

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { getApiClient } from "@/lib/api-client";
import { useAuth } from "@/lib/auth";

export interface AgentRoleRecord {
  roleId: string;
  name: string;
  slug: string;
  description?: string;
  isEnabled: boolean;
  sortOrder: number;
}

/**
 * Queries active agent roles from the Gateway API.
 * Sourced directly from the platform_roles database table.
 *
 * @returns Query result containing active agent roles
 */
export function useAgentRoles(): UseQueryResult<AgentRoleRecord[], Error> {
  const { isAuthenticated, isLoading } = useAuth();

  return useQuery<AgentRoleRecord[]>({
    queryKey: ["agent-roles"],
    enabled: isAuthenticated && !isLoading,
    queryFn: async (): Promise<AgentRoleRecord[]> => {
      const client = getApiClient();
      const response = await client.http
        .request<AgentRoleRecord[]>("/api/v1/roles")
        .catch(() => []);

      if (!Array.isArray(response)) {
        return [];
      }

      return response.filter((r) => r.isEnabled).sort((a, b) => a.sortOrder - b.sortOrder);
    },
    staleTime: 30_000,
  });
}
