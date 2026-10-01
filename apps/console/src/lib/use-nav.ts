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
 * Purely database-driven: returns exactly what is configured in the database with no hardcoded fallback defaults.
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

      if (!Array.isArray(response) || response.length === 0) {
        return [];
      }

      // Filter visible items, match user roles, and order by section ('main' before 'bottom') then sortOrder
      const filtered = response
        .filter((item) => item.isVisible && item.isEnabled)
        .filter((item) => {
          if (!item.roles || item.roles.length === 0) return true;
          return item.roles.some((role) => userRoles.includes(role));
        })
        .sort((a, b) => {
          if (a.section !== b.section) {
            return a.section === "main" ? -1 : 1;
          }
          return a.sortOrder - b.sortOrder;
        });

      return filtered;
    },
    staleTime: 30_000,
  });
}
