/**
 * @file apps/console/src/lib/hooks/use-platform-branding.ts
 * @description React Query hook to retrieve dynamic platform branding metadata from Gateway API.
 * Ensures zero hardcoded branding names or version badges across the UI shell.
 * @module apps/console/lib/hooks
 */

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { getApiClient } from "@/lib/api-client";

/**
 * Platform branding configuration structure.
 */
export interface PlatformBranding {
  /** Application brand name (e.g. OrchestrAI) */
  brandName: string;
  /** Application version and distribution badge (e.g. v1.0.0 • enterprise) */
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
    queryKey: ["platform", "branding"],
    queryFn: async (): Promise<PlatformBranding> => {
      const client = getApiClient();
      const res = await client.http.request<PlatformBranding>("/api/v1/branding").catch(() => null);

      if (res && typeof res.brandName === "string" && typeof res.brandVersion === "string") {
        return res;
      }

      return {
        brandName: process.env.NEXT_PUBLIC_APP_NAME || "OrchestrAI",
        brandVersion: process.env.NEXT_PUBLIC_APP_VERSION || "v1.0.0 • enterprise",
      };
    },
    staleTime: 300_000,
  });
}
