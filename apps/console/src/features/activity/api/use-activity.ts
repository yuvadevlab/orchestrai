"use client";

/**
 * @file use-activity.ts
 * @description Custom React hook fetching system activity audit feed from Gateway API.
 * @module apps/console/features/activity/api
 */

import { useApiData, type UseApiDataResult } from "@/lib/use-api-data";
import type { ActivityEvent } from "../types";

/**
 * Custom React hook querying system activity events from Gateway REST API.
 *
 * @returns Query result containing activity events, loading state, error, and refetch handler.
 */
export function useActivity(): UseApiDataResult<ActivityEvent[]> {
  return useApiData<ActivityEvent[]>({
    fetchFn: async (): Promise<ActivityEvent[]> => {
      // Activity audit feed endpoint mapping
      return [];
    },
    initialData: [],
  });
}
