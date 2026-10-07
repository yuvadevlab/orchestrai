"use client";

/**
 * @file apps/console/src/features/evaluations/api/use-run-benchmark.ts
 * @description Hook managing benchmark evaluation execution against cluster models.
 * @module apps/console/features/evaluations/api
 */

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { getApiClient } from "@/lib/api-client";
import type { BenchmarkResult, RunBenchmarkPayload } from "../types";
import { API_ROUTES, HttpMethod } from "@/lib/query-keys";

export interface UseRunBenchmarkResult {
  runBenchmark: (payload: RunBenchmarkPayload) => Promise<BenchmarkResult>;
  result: BenchmarkResult | null;
  isRunning: boolean;
  error: Error | null;
  reset: () => void;
}

/**
 * Hook to execute and track an evaluation benchmark suite against a model.
 */
export function useRunBenchmark(): UseRunBenchmarkResult {
  const client = getApiClient();
  const [result, setResult] = useState<BenchmarkResult | null>(null);

  const mutation = useMutation({
    mutationFn: async (payload: RunBenchmarkPayload): Promise<BenchmarkResult> => {
      // Execute benchmark suite against model via Gateway API
      return client.http.request<BenchmarkResult>(API_ROUTES.EVAL_RUN, {
        method: HttpMethod.POST,
        body: JSON.stringify(payload),
      });
    },
    onSuccess: (data) => {
      setResult(data);
    },
  });

  const runBenchmark = async (payload: RunBenchmarkPayload): Promise<BenchmarkResult> => {
    return mutation.mutateAsync(payload);
  };

  const reset = (): void => {
    setResult(null);
    mutation.reset();
  };

  return {
    runBenchmark,
    result,
    isRunning: mutation.isPending,
    error: mutation.error,
    reset,
  };
}
