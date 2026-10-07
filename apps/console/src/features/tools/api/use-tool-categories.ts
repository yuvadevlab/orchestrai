/**
 * @file apps/console/src/features/tools/api/use-tool-categories.ts
 * @description React Query hook to retrieve dynamic tool category descriptive blurbs from the platform API.
 * @module apps/console/features/tools/api
 */

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { getApiClient } from "@/lib/api-client";

/**
 * Type representing map of tool category names to descriptive blurb strings.
 */
export type ToolCategoryBlurbs = Record<string, string>;

/**
 * Retrieves dynamic descriptive blurbs for platform tool categories from the Gateway API.
 * Uses stale-while-revalidate pattern to avoid UI layout shift while staying database-driven.
 *
 * @returns Query result containing the category blurbs dictionary
 */
export function useToolCategories(): UseQueryResult<ToolCategoryBlurbs, Error> {
  return useQuery<ToolCategoryBlurbs>({
    queryKey: ["tools", "categories"],
    queryFn: async (): Promise<ToolCategoryBlurbs> => {
      const client = getApiClient();
      const res = await client.http
        .request<ToolCategoryBlurbs>("/api/v1/tools/categories")
        .catch(() => null);

      // Return server-provided blurbs when available and valid object
      if (res && typeof res === "object" && !Array.isArray(res)) {
        return res;
      }

      return {};
    },
    staleTime: 300_000,
  });
}
