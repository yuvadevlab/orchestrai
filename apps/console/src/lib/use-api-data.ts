"use client";

/**
 * @file use-api-data.ts
 * @description Flexible data fetching hook connecting Console components to Gateway APIs safely without infinite re-render loops.
 * @module apps/console/lib
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { getApiClient } from "./api-client";

export interface UseApiDataOptions<T> {
  /** Async fetch callback taking initialized OrchestrAIClient */
  fetchFn: (client: ReturnType<typeof getApiClient>) => Promise<T>;
  /** Default fallback data when loading or when API returns empty */
  initialData: T;
}

export interface UseApiDataResult<T> {
  /** Loaded dataset or fallback */
  data: T;
  /** Loading indicator boolean */
  isLoading: boolean;
  /** Optional error instance if fetch failed */
  error: Error | null;
  /** Manual trigger to re-fetch dataset */
  refetch: () => Promise<void>;
}

/**
 * React hook to fetch live gateway resource data safely without breaking UI layouts or looping on failure.
 */
export function useApiData<T>({ fetchFn, initialData }: UseApiDataOptions<T>): UseApiDataResult<T> {
  const [data, setData] = useState<T>(initialData);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Preserve callback & data refs to prevent inline closures from triggering infinite re-render loops
  const fetchFnRef = useRef(fetchFn);
  fetchFnRef.current = fetchFn;

  const initialDataRef = useRef(initialData);
  initialDataRef.current = initialData;

  const loadData = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const client = getApiClient();
      const result = await fetchFnRef.current(client);
      setData(result ?? initialDataRef.current);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setData(initialDataRef.current);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { data, isLoading, error, refetch: loadData };
}
