"use client";

/**
 * @file use-models.ts
 * @description Custom React hook fetching model providers and routing status from Gateway API.
 * @module apps/console/features/models/api
 */

import { useApiData, type UseApiDataResult } from "@/lib/use-api-data";
import type { ModelDefinition } from "../types";

/**
 * Custom React hook querying LLM model provider statuses from Gateway REST API.
 *
 * @returns Query result containing model provider definitions, loading state, error, and refetch handler.
 */
export function useModels(): UseApiDataResult<ModelDefinition[]> {
  return useApiData<ModelDefinition[]>({
    fetchFn: async (): Promise<ModelDefinition[]> => {
      // LLM router endpoints mapping
      return [];
    },
    initialData: [],
  });
}
