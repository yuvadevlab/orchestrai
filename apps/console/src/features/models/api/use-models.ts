"use client";

/**
 * @file use-models.ts
 * @description React Query hooks querying live LLM models and providers from the Gateway REST API.
 * @module apps/console/features/models/api
 */

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { getApiClient } from "@/lib/api-client";
import { useAuth } from "@/lib/auth";
import type { LlmModel, LlmProvider, ModelDefinition } from "../types";

/**
 * Custom React hook querying live LLM models from the Gateway API.
 *
 * @param providerId - Optional provider UUID filter
 * @returns Query result containing model records
 */
export function useModels(providerId?: string): UseQueryResult<LlmModel[], Error> {
  const { isAuthenticated, isLoading } = useAuth();

  return useQuery<LlmModel[]>({
    queryKey: ["models", providerId],
    enabled: isAuthenticated && !isLoading,
    queryFn: async (): Promise<LlmModel[]> => {
      const client = getApiClient();
      const url = providerId ? `/api/v1/models?providerId=${providerId}` : "/api/v1/models";
      const response = await client.http.request<LlmModel[]>(url).catch(() => []);
      return Array.isArray(response) ? response : [];
    },
    staleTime: 30_000,
  });
}

/**
 * Custom React hook querying live LLM providers from the Gateway API.
 *
 * @returns Query result containing provider records
 */
export function useProviders(): UseQueryResult<LlmProvider[], Error> {
  const { isAuthenticated, isLoading } = useAuth();

  return useQuery<LlmProvider[]>({
    queryKey: ["providers"],
    enabled: isAuthenticated && !isLoading,
    queryFn: async (): Promise<LlmProvider[]> => {
      const client = getApiClient();
      const response = await client.http
        .request<LlmProvider[]>("/api/v1/providers")
        .catch(() => []);
      return Array.isArray(response) ? response : [];
    },
    staleTime: 30_000,
  });
}

/**
 * Legacy hook adapter mapping live models into ModelDefinition list.
 */
export function useLegacyModels(): {
  data: ModelDefinition[];
  isLoading: boolean;
  refetch: () => void;
} {
  const { data: models = [], isLoading, refetch } = useModels();
  const { data: providers = [] } = useProviders();

  const providerMap = new Map<string, string>();
  for (const p of providers) {
    providerMap.set(p.providerId, p.name);
  }

  const legacyList: ModelDefinition[] = models.map((m) => ({
    id: m.name || m.modelIdentifier,
    provider: providerMap.get(m.providerId) || "Configured Provider",
    status: m.isEnabled ? "ONLINE" : "OFFLINE",
    cost: "Dynamic",
    latency: m.contextWindow ? `${Math.round(m.contextWindow / 1000)}k ctx` : "8k ctx",
    isDefault: m.isDefault,
  }));

  return {
    data: legacyList,
    isLoading,
    refetch,
  };
}
