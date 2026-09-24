"use client";

/**
 * @file apps/console/src/features/models/api/use-model-mutations.ts
 * @description TanStack Query mutations for model registry provisioning and configuration.
 * @module apps/console/features/models/api
 */

import { useMutation, useQueryClient, type UseMutationResult } from "@tanstack/react-query";
import { getApiClient } from "@/lib/api-client";
import type { LlmModel } from "../types";

export interface RegisterModelInput {
  name: string;
  providerId: string;
  modelIdentifier: string;
  description?: string;
  contextWindow?: number;
  isDefault?: boolean;
}

/**
 * Custom TanStack Query mutation hook for registering a model.
 * Posts to /api/v1/models and invalidates the "models" query cache upon success.
 */
export function useRegisterModelMutation(): UseMutationResult<LlmModel, Error, RegisterModelInput> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: RegisterModelInput): Promise<LlmModel> => {
      const client = getApiClient();
      return client.http.request<LlmModel>("/api/v1/models", {
        method: "POST",
        body: {
          name: input.name,
          providerId: input.providerId,
          modelIdentifier: input.modelIdentifier || input.name.toLowerCase().replace(/\s+/g, "-"),
          description: input.description,
          contextWindow: input.contextWindow || 8192,
          isDefault: input.isDefault ?? false,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["models"] });
    },
  });
}
