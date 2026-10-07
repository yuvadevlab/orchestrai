"use client";

/**
 * @file apps/console/src/features/agents/api/use-agent-mutations.ts
 * @description TanStack Query mutations for cluster agent provisioning and lifecycle operations.
 * @module apps/console/features/agents/api
 */

import { useMutation, useQueryClient, type UseMutationResult } from "@tanstack/react-query";
import { getApiClient } from "@/lib/api-client";
import { AgentMode, EXECUTION_LIMITS } from "@orchestrai/shared-types";
import type { Agent } from "@orchestrai/sdk";
import { QUERY_KEYS } from "@/lib/query-keys";

export interface CreateAgentInput {
  name: string;
  description?: string;
  role?: string;
  systemPrompt?: string;
  enabledTools?: string[];
  capabilities?: string[];
  /** Execution mode — must be one of AgentMode (chat | plan | act | auto). */
  mode?: AgentMode | string;
  /** Primary model identifier configured by user or catalog default. */
  model?: string;
  modelConfig?: {
    provider: string;
    modelName: string;
    temperature?: number;
    maxTokens?: number;
    topP?: number;
  };
  maxSteps?: number;
}

const VALID_MODES: readonly string[] = Object.values(AgentMode);

/**
 * Normalizes a requested mode to standard canonical AgentMode format.
 */
function normalizeMode(mode?: string): string {
  if (mode) {
    const lower = mode.toLowerCase();
    if (VALID_MODES.includes(lower)) return lower;
  }
  return AgentMode.AUTO;
}

/**
 * Custom TanStack Query mutation hook for provisioning a new cluster agent.
 * Automatically invalidates the "agents" query cache upon successful creation.
 */
export function useCreateAgentMutation(): UseMutationResult<Agent, Error, CreateAgentInput> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateAgentInput): Promise<Agent> => {
      const client = getApiClient();
      const resolvedModel = input.model || input.modelConfig?.modelName;

      return client.agents.create({
        name: input.name,
        description: input.description,
        systemPrompt: input.systemPrompt || "Agent instructions",
        enabledTools: input.enabledTools,
        mode: normalizeMode(input.mode),
        modelConfig: input.modelConfig
          ? input.modelConfig
          : resolvedModel
            ? {
                provider: "",
                modelName: resolvedModel,
              }
            : undefined,
        maxSteps: input.maxSteps ?? EXECUTION_LIMITS.DEFAULT_MAX_STEPS,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AGENTS.ALL });
    },
  });
}
