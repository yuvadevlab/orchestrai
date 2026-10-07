"use client";

/**
 * @file apps/console/src/features/studio/api/use-workspace-files.ts
 * @description TanStack Query hook fetching and caching workspace files for @ file mentions and autocomplete.
 * @module apps/console/features/studio/api
 */

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { getApiClient } from "@/lib/api-client";

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
    queryKey: ["workspace-files", workspacePath || "root", searchQuery || ""],
    queryFn: async (): Promise<WorkspaceFileItem[]> => {
      const params = new URLSearchParams();
      if (workspacePath) params.set("path", workspacePath);
      if (searchQuery) params.set("query", searchQuery);
      params.set("limit", "100");

      const res = await client.http.request<WorkspaceFilesResponse>(
        `/api/v1/workspace/files?${params.toString()}`,
        { method: "GET" },
      );

      return res?.data ?? [];
    },
    enabled: enabled && typeof window !== "undefined",
    staleTime: 10_000, // 10 seconds cache
    placeholderData: (prev) => prev,
  });
}
