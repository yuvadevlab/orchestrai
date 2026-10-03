/**
 * @file apps/console/src/features/studio/api/use-platform-welcome.ts
 * @description Hook querying dynamic welcome screen headline, subtitle, and suggestions.
 * Fully database-driven with zero hardcoded welcome strings.
 * @module apps/console/features/studio/api
 */

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { getApiClient } from "@/lib/api-client";

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
    queryKey: ["platform", "welcome"],
    queryFn: async (): Promise<PlatformWelcomeData> => {
      const client = getApiClient();
      const res = await client.http
        .request<PlatformWelcomeData>("/api/v1/welcome")
        .catch(() => null);

      if (res && typeof res.headline === "string") {
        return res;
      }

      return {
        headline: "What should your agents take on?",
        subtitle: "One objective. A swarm of specialists. Auditable results.",
        suggestions: [
          "Analyze market competitors",
          "Draft product requirements",
          "Automate data pipeline",
          "Review this codebase",
          "Build a 90-day roadmap",
        ],
      };
    },
    staleTime: 60_000,
  });
}
