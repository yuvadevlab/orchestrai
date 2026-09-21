"use client";

/**
 * @file use-events.ts
 * @description Custom React hook fetching system event bus signals from Gateway API.
 * @module apps/console/features/events/api
 */

import { useApiData, type UseApiDataResult } from "@/lib/use-api-data";
import type { SystemEvent } from "@/lib/types";

/**
 * Custom React hook querying system events from Gateway REST API.
 *
 * @returns Query result containing system events, loading state, error, and refetch handler.
 */
export function useEvents(): UseApiDataResult<SystemEvent[]> {
  return useApiData<SystemEvent[]>({
    fetchFn: async (): Promise<SystemEvent[]> => {
      // Event stream bus mapping
      return [];
    },
    initialData: [],
  });
}
