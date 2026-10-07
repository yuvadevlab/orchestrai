/**
 * @file apps/console/src/lib/hooks/use-platform-branding.ts
 * @description React Query hook to retrieve dynamic platform branding metadata from Gateway API.
 * Ensures zero hardcoded branding names or version badges across the UI shell.
 * @module apps/console/lib/hooks
 */

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { getApiClient } from "@/lib/api-client";
import { QUERY_KEYS, API_ROUTES } from "@/lib/query-keys";

/**
 * Platform branding configuration structure.
 */
export interface PlatformBranding {
  /** Application brand name */
  brandName: string;
  /** Application version and distribution badge */
  brandVersion: string;
}

/**
 * Retrieves dynamic application branding from the platform API.
 * Uses stale-while-revalidate pattern to avoid UI layout shift while remaining dynamic.
 *
 * @returns Query result containing the branding metadata
 */
export function usePlatformBranding(): UseQueryResult<PlatformBranding, Error> {
  return useQuery<PlatformBranding>({
    queryKey: QUERY_KEYS.PLATFORM.BRANDING,
    queryFn: async (): Promise<PlatformBranding> => {
      const client = getApiClient();
      // Fetch dynamic application branding metadata from Gateway API
      const res = await client.http.request<PlatformBranding>(API_ROUTES.BRANDING);

      if (res && typeof res.brandName === "string") {
        return res;
      }

      return {
        brandName: process.env.NEXT_PUBLIC_APP_NAME || "",
        brandVersion: process.env.NEXT_PUBLIC_APP_VERSION || "",
      };
    },
    staleTime: 300_000,
  });
}
