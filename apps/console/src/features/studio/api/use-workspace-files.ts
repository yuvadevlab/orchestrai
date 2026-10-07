"use client";

/**
 * @file apps/console/src/features/studio/api/use-workspace-files.ts
 * @description TanStack Query hook fetching and caching workspace files for @ file mentions and autocomplete.
 * @module apps/console/features/studio/api
 */

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { getApiClient } from "@/lib/api-client";
import { QUERY_KEYS, QUERY_PARAMS, API_ROUTES, HttpMethod } from "@/lib/query-keys";

/** File entry returned by the gateway workspace exploration endpoint. */
export interface WorkspaceFileItem {
  readonly path: string;
  readonly name: string;
  readonly type: "file" | "directory";
  readonly extension: string;
}

interface WorkspaceFilesResponse {
  readonly data: WorkspaceFileItem[];
  readonly total: number;
}

/**
 * Custom hook querying workspace files filtered by directory path and search substring.
 *
 * @param workspacePath - Target root folder path
 * @param searchQuery - Optional filter string for fuzzy matching
 * @param enabled - Whether query should execute automatically
 */
export function useWorkspaceFiles(
  workspacePath?: string,
  searchQuery?: string,
  enabled: boolean = true,
): UseQueryResult<WorkspaceFileItem[], Error> {
  const client = getApiClient();

  return useQuery({
    queryKey: QUERY_KEYS.WORKSPACE.FILES(workspacePath, searchQuery),
    queryFn: async (): Promise<WorkspaceFileItem[]> => {
      const params = new URLSearchParams();
      // Apply path filter if provided
      if (workspacePath) {
        params.set(QUERY_PARAMS.PATH, workspacePath);
      }
      // Apply fuzzy query search term if provided
      if (searchQuery) {
        params.set(QUERY_PARAMS.QUERY, searchQuery);
      }
      params.set(QUERY_PARAMS.LIMIT, "100");

      const res = await client.http.request<WorkspaceFilesResponse>(
        `${API_ROUTES.WORKSPACE_FILES}?${params.toString()}`,
        { method: HttpMethod.GET },
      );

      return res?.data ?? [];
    },
    enabled: enabled && typeof window !== "undefined",
    staleTime: 10_000,
    placeholderData: (prev) => prev,
  });
}
