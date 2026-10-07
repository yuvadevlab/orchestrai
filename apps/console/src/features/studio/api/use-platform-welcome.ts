/**
 * @file apps/console/src/features/studio/api/use-platform-welcome.ts
 * @description Hook querying dynamic welcome screen headline, subtitle, and suggestions.
 * Fully database-driven with zero hardcoded strings or fallback mock data.
 * @module apps/console/features/studio/api
 */

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { getApiClient } from "@/lib/api-client";
import { QUERY_KEYS, API_ROUTES } from "@/lib/query-keys";

export interface PlatformWelcomeData {
  headline: string;
  subtitle: string;
  suggestions: string[];
}

/**
 * Retrieves dynamic welcome hero metadata and suggestion chips from the Gateway API.
 */
export function usePlatformWelcome(): UseQueryResult<PlatformWelcomeData, Error> {
  return useQuery<PlatformWelcomeData>({
    queryKey: QUERY_KEYS.PLATFORM.WELCOME,
    queryFn: async (): Promise<PlatformWelcomeData> => {
      const client = getApiClient();
      // Fetch dynamic welcome screen configurations directly from Gateway API with zero hardcoded fallbacks
      return client.http.request<PlatformWelcomeData>(API_ROUTES.WELCOME);
    },
    staleTime: 60_000,
  });
}
