/**
 * @file apps/console/src/features/executions/api/use-execution-trace.ts
 * @description React Query hook fetching OpenTelemetry execution traces and span waterfalls.
 * @module apps/console/features/executions/api
 */

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { getApiClient } from "@/lib/api-client";
import { TraceSpanStatus } from "@orchestrai/shared-types";
import { QUERY_KEYS, API_ROUTES } from "@/lib/query-keys";

export interface SpanRecord {
  spanId: string;
  parentSpanId?: string;
  name: string;
  startTime: string;
  endTime?: string;
  durationMs: number;
  status: TraceSpanStatus | string;
  attributes: Record<string, unknown>;
}

export interface ExecutionTraceResponse {
  traceId: string;
  executionId: string;
  spans: SpanRecord[];
}

/**
 * Hook to fetch OpenTelemetry spans associated with a specific execution ID.
 */
export function useExecutionTrace(
  executionId: string,
): UseQueryResult<ExecutionTraceResponse, Error> {
  const client = getApiClient();

  return useQuery({
    queryKey: QUERY_KEYS.EXECUTIONS.TRACE(executionId),
    queryFn: async (): Promise<ExecutionTraceResponse> => {
      try {
        return await client.http.request<ExecutionTraceResponse>(
          `${API_ROUTES.TRACES}/${encodeURIComponent(executionId)}`,
        );
      } catch {
        return {
          traceId: executionId,
          executionId,
          spans: [],
        };
      }
    },
    enabled: Boolean(executionId),
    refetchInterval: 3000,
  });
}
