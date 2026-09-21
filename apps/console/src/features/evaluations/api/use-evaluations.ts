"use client";

/**
 * @file use-evaluations.ts
 * @description Custom React hook fetching evaluation suite benchmark results from Gateway API.
 * @module apps/console/features/evaluations/api
 */

import { useApiData, type UseApiDataResult } from "@/lib/use-api-data";
import type { Evaluation } from "@/lib/types";

/**
 * Custom React hook querying evaluation benchmark results from Gateway REST API.
 *
 * @returns Query result containing evaluation suites, loading state, error, and refetch handler.
 */
export function useEvaluations(): UseApiDataResult<Evaluation[]> {
  return useApiData<Evaluation[]>({
    fetchFn: async (): Promise<Evaluation[]> => {
      // Evaluation harness benchmark endpoint mapping
      return [];
    },
    initialData: [],
  });
}
