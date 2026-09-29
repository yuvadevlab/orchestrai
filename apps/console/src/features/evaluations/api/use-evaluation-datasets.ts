"use client";

/**
 * @file apps/console/src/features/evaluations/api/use-evaluation-datasets.ts
 * @description Hook querying available benchmark evaluation datasets from Gateway API.
 * @module apps/console/features/evaluations/api
 */

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { getApiClient } from "@/lib/api-client";
import type { EvaluationDataset } from "../types";

export const EVALUATION_DATASETS_QUERY_KEY = ["eval", "datasets"] as const;

/**
 * Hook to retrieve available benchmark evaluation datasets.
 */
export function useEvaluationDatasets(): UseQueryResult<EvaluationDataset[], Error> {
  const client = getApiClient();

  return useQuery({
    queryKey: EVALUATION_DATASETS_QUERY_KEY,
    queryFn: async (): Promise<EvaluationDataset[]> => {
      const res = await client.http.request<{ datasets: EvaluationDataset[] }>(
        "/api/v1/eval/datasets",
      );
      return res.datasets || [];
    },
    staleTime: 60_000,
  });
}
