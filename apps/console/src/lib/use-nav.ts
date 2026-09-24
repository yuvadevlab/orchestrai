"use client";

/**
 * @file apps/console/src/lib/use-nav.ts
 * @description TanStack Query hook fetching dynamic navigation items from the live database.
 * @module apps/console/lib
 */

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { getApiClient } from "@/lib/api-client";
import { useAuth } from "@/lib/auth";
import type { NavItemRecord } from "@orchestrai/shared-types";

export type DynamicNavItem = NavItemRecord;

/**
 * Custom hook querying dynamic navigation items from the Gateway API.
 * Filters by isVisible and role permissions with zero hardcoded dummy data.
 *
 * @returns Query result containing active dynamic navigation items
 */
export function useNavItems(): UseQueryResult<NavItemRecord[], Error> {
  const { user, isAuthenticated, isLoading } = useAuth();
  const userRoles = user?.roles ?? [];

  return useQuery<NavItemRecord[]>({
    queryKey: ["nav-items", user?.id, userRoles],
    enabled: isAuthenticated && !isLoading,
    queryFn: async (): Promise<NavItemRecord[]> => {
      const client = getApiClient();
      const response = await client.http.request<NavItemRecord[]>("/api/v1/nav").catch(() => []);

      if (!Array.isArray(response)) {
        return [];
      }

      // Filter visible items and match user roles
      return response
        .filter((item) => item.isVisible && item.isEnabled)
        .filter((item) => {
          if (!item.roles || item.roles.length === 0) return true;
          return item.roles.some((role) => userRoles.includes(role));
        })
        .sort((a, b) => a.sortOrder - b.sortOrder);
    },
    staleTime: 30_000,
  });
}
