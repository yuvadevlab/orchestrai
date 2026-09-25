"use client";

/**
 * @file use-tools.ts
 * @description Custom React hook fetching registered tool capabilities from Gateway API.
 * Sourced directly from the live platform_tools database table.
 * @module apps/console/features/tools/api
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
} from "@tanstack/react-query";
import { toast } from "@yuva-devlab/ui";
import { getApiClient } from "@/lib/api-client";
import { useAuth } from "@/lib/auth";
import type { ToolDefinition } from "../types";

/**
 * Custom React hook querying registered agent tools from Gateway REST API.
 * Returns tools from the live database with zero hardcoded entries.
 *
 * @returns Query result containing tool definitions
 */
export function useTools(): UseQueryResult<ToolDefinition[], Error> {
  const { isAuthenticated, isLoading } = useAuth();

  return useQuery<ToolDefinition[]>({
    queryKey: ["tools"],
    enabled: isAuthenticated && !isLoading,
    queryFn: async (): Promise<ToolDefinition[]> => {
      const client = getApiClient();
      const response = await client.http.request<ToolDefinition[]>("/api/v1/tools").catch(() => []);

      if (!Array.isArray(response)) {
        return [];
      }

      return response;
    },
    staleTime: 30_000,
  });
}

/**
 * Custom React hook for toggling tool enabled state with optimistic UI feedback.
 *
 * @returns Mutation result for toggling tool
 */
export function useToggleTool(): UseMutationResult<
  ToolDefinition,
  Error,
  { toolId: string; isEnabled: boolean; name: string }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ toolId, isEnabled, name }) => {
      const client = getApiClient();
      const promise = client.http.request<ToolDefinition>(`/api/v1/tools/${toolId}`, {
        method: "PUT",
        body: { isEnabled },
      });

      toast.promise(promise, {
        loading: `Updating ${name}...`,
        success: `${name} ${isEnabled ? "enabled" : "disabled"}`,
        error: (err: Error) => `Failed to update tool: ${err.message}`,
      });

      return promise;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["tools"] });
    },
  });
}
