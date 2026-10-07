"use client";

/**
 * @file apps/console/src/lib/hooks/use-nav.ts
 * @description TanStack Query hook fetching dynamic navigation items from the live database.
 * @module apps/console/lib/hooks
 */

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { getApiClient } from "@/lib/api-client";
import { useAuth } from "@/lib/auth";
import { NavSection, type NavItemRecord } from "@orchestrai/shared-types";
import { QUERY_KEYS, API_ROUTES } from "@/lib/query-keys";

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
    queryKey: QUERY_KEYS.PLATFORM.NAV_ITEMS(user?.id, userRoles),
    enabled: isAuthenticated && !isLoading,
    queryFn: async (): Promise<NavItemRecord[]> => {
      const client = getApiClient();
      // Fetch dynamic navigation items catalog from gateway API
      const response = await client.http.request<NavItemRecord[]>(API_ROUTES.NAV).catch(() => []);

      // Ensure valid array payload from server
      if (!Array.isArray(response) || response.length === 0) {
        return [];
      }

      // Filter visible items, match user roles, and order by section (main before bottom) then sortOrder
      const filtered = response
        .filter((item) => item.isVisible && item.isEnabled)
        .filter((item) => {
          // If no roles specified on item, it is visible to all authenticated users
          if (!item.roles || item.roles.length === 0) return true;
          // Verify user possesses at least one authorized role
          return item.roles.some((role) => userRoles.includes(role));
        })
        .sort((a, b) => {
          // Prioritize MAIN navigation section over BOTTOM section
          if (a.section !== b.section) {
            return a.section === NavSection.MAIN ? -1 : 1;
          }
          return a.sortOrder - b.sortOrder;
        });

      return filtered;
    },
    staleTime: 30_000,
  });
}
