"use client";

/**
 * @file apps/console/src/features/studio/api/use-workspace-harness.ts
 * @description TanStack Query hook fetching discovered Big 3 agent harness rules, instructions, and skills.
 * @module apps/console/features/studio/api
 */

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { getApiClient } from "@/lib/api-client";
import { QUERY_KEYS, QUERY_PARAMS, API_ROUTES, HttpMethod } from "@/lib/query-keys";

/** Discovered workspace harness metadata summary. */
export interface WorkspaceHarnessData {
  readonly workspaceRoot: string;
  readonly rootInstructionsCount: number;
  readonly rulesCount: number;
  readonly skillsCount: number;
  readonly rootInstructions: ReadonlyArray<{
    readonly path: string;
    readonly title: string;
    readonly type: string;
  }>;
  readonly rules: ReadonlyArray<{
    readonly name: string;
    readonly description: string;
    readonly path: string;
  }>;
  readonly skills: ReadonlyArray<{
    readonly name: string;
    readonly description: string;
    readonly path: string;
  }>;
}

/**
 * Queries discovered workspace harness context (instructions, modular rules, skills).
 *
 * @param workspacePath - Target root folder path
 * @param enabled - Whether the query is active
 * @returns TanStack Query result containing harness metadata
 */
export function useWorkspaceHarness(
  workspacePath?: string,
  enabled: boolean = true,
): UseQueryResult<WorkspaceHarnessData, Error> {
  const client = getApiClient();

  return useQuery({
    queryKey: QUERY_KEYS.WORKSPACE.HARNESS(workspacePath),
    queryFn: async (): Promise<WorkspaceHarnessData> => {
      const params = new URLSearchParams();
      // Apply path filter if provided
      if (workspacePath) {
        params.set(QUERY_PARAMS.PATH, workspacePath);
      }

      return client.http.request<WorkspaceHarnessData>(
        `${API_ROUTES.WORKSPACE_HARNESS}?${params.toString()}`,
        { method: HttpMethod.GET },
      );
    },
    enabled: enabled && typeof window !== "undefined",
    staleTime: 30_000,
  });
}
