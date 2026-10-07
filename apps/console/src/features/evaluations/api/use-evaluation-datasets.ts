"use client";

/**
 * @file apps/console/src/features/evaluations/api/use-evaluation-datasets.ts
 * @description Hook querying available benchmark evaluation datasets from Gateway API.
 * @module apps/console/features/evaluations/api
 */

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { getApiClient } from "@/lib/api-client";
import type { EvaluationDataset } from "../types";
import { QUERY_KEYS, API_ROUTES } from "@/lib/query-keys";

export const EVALUATION_DATASETS_QUERY_KEY = QUERY_KEYS.EVALUATIONS.DATASETS;

/**
 * Hook to retrieve available benchmark evaluation datasets.
 */
export function useEvaluationDatasets(): UseQueryResult<EvaluationDataset[], Error> {
  const client = getApiClient();

  return useQuery({
    queryKey: EVALUATION_DATASETS_QUERY_KEY,
    queryFn: async (): Promise<EvaluationDataset[]> => {
      // Query evaluation benchmark datasets from Gateway API
      const res = await client.http.request<{ datasets: EvaluationDataset[] }>(
        API_ROUTES.EVAL_DATASETS,
      );
      return res.datasets || [];
    },
    staleTime: 60_000,
  });
}
