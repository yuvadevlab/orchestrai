"use client";

/**
 * @file apps/console/src/features/tools/api/use-tool-mutations.ts
 * @description TanStack Query mutations for tool capability registration and lifecycle management.
 * @module apps/console/features/tools/api
 */

import { useMutation, useQueryClient, type UseMutationResult } from "@tanstack/react-query";
import { getApiClient } from "@/lib/api-client";
import type { ToolDefinition } from "../types";

export interface RegisterToolInput {
  name: string;
  category: string;
  description: string;
  permissions?: string;
  sandbox?: string;
}

/**
 * Custom TanStack Query mutation hook for registering a tool capability into live database.
 * Automatically invalidates the "tools" query cache upon success.
 */
export function useRegisterToolMutation(): UseMutationResult<
  ToolDefinition,
  Error,
  RegisterToolInput
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: RegisterToolInput): Promise<ToolDefinition> => {
      const client = getApiClient();
      const slug = input.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "_");
      return client.http.request<ToolDefinition>("/api/v1/tools", {
        method: "POST",
        body: {
          name: input.name,
          slug,
          category: input.category || "General",
          description: input.description,
          permissionLevel: input.permissions || "read_only",
          sandbox: input.sandbox || "read_only",
          isEnabled: true,
        },
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["tools"] });
    },
  });
}
