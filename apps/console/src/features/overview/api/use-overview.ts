"use client";

/**
 * @file use-overview.ts
 * @description Custom React hook fetching command center metrics from Gateway API.
 * @module apps/console/features/overview/api
 */

import { useApiData, type UseApiDataResult } from "@/lib/use-api-data";
import { ExecutionStatus } from "@orchestrai/shared-types";

export interface OverviewMetrics {
  runningCount: number;
}

/**
 * Custom React hook querying live platform overview metrics from Gateway REST API.
 *
 * @returns Query result containing live running count and telemetry metrics.
 */
export function useOverview(): UseApiDataResult<OverviewMetrics> {
  return useApiData<OverviewMetrics>({
    fetchFn: async (client): Promise<OverviewMetrics> => {
      const res = await client.executions.list({ status: ExecutionStatus.RUNNING });
      return {
        runningCount: res?.items?.length ?? 0,
      };
    },
    initialData: { runningCount: 0 },
  });
}
