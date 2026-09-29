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

const DEFAULT_NAV_ITEMS: NavItemRecord[] = [
  {
    navItemId: "studio",
    href: "/",
    label: "Swarm Studio",
    icon: "Network",
    section: "core",
    sortOrder: 1,
    isVisible: true,
    isEnabled: true,
    roles: [],
  },
  {
    navItemId: "agents",
    href: "/agents",
    label: "Agents",
    icon: "Bot",
    section: "core",
    sortOrder: 2,
    isVisible: true,
    isEnabled: true,
    roles: [],
  },
  {
    navItemId: "context",
    href: "/context",
    label: "Context Hub",
    icon: "Layers",
    section: "core",
    sortOrder: 3,
    isVisible: true,
    isEnabled: true,
    roles: [],
  },
  {
    navItemId: "tools",
    href: "/tools",
    label: "Tools",
    icon: "Wrench",
    section: "core",
    sortOrder: 4,
    isVisible: true,
    isEnabled: true,
    roles: [],
  },
  {
    navItemId: "executions",
    href: "/executions",
    label: "Executions",
    icon: "Activity",
    section: "core",
    sortOrder: 5,
    isVisible: true,
    isEnabled: true,
    roles: [],
  },
  {
    navItemId: "models",
    href: "/models",
    label: "Models & Routing",
    icon: "Cpu",
    section: "core",
    sortOrder: 6,
    isVisible: true,
    isEnabled: true,
    roles: [],
  },
  {
    navItemId: "evaluations",
    href: "/evaluations",
    label: "Evaluations",
    icon: "BarChart2",
    section: "core",
    sortOrder: 7,
    isVisible: true,
    isEnabled: true,
    roles: [],
  },
];

/**
 * Custom hook querying dynamic navigation items from the Gateway API.
 * Filters by isVisible and role permissions with fallback to standard hubs.
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
        return DEFAULT_NAV_ITEMS;
      }

      // Filter visible items and match user roles
      const filtered = response
        .filter((item) => item.isVisible && item.isEnabled)
        .filter((item) => {
          if (!item.roles || item.roles.length === 0) return true;
          return item.roles.some((role) => userRoles.includes(role));
        })
        .sort((a, b) => a.sortOrder - b.sortOrder);

      return filtered.length > 0 ? filtered : DEFAULT_NAV_ITEMS;
    },
    staleTime: 30_000,
  });
}
