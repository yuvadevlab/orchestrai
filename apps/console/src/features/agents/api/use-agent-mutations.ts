"use client";

/**
 * @file apps/console/src/features/agents/api/use-agent-mutations.ts
 * @description TanStack Query mutations for cluster agent provisioning and lifecycle operations.
 * @module apps/console/features/agents/api
 */

import { useMutation, useQueryClient, type UseMutationResult } from "@tanstack/react-query";
import { getApiClient } from "@/lib/api-client";
import type { Agent } from "@orchestrai/sdk";

export interface CreateAgentInput {
  name: string;
  description?: string;
  role?: string;
  systemPrompt?: string;
  enabledTools?: string[];
  capabilities?: string[];
  /** Execution mode — must be one of CHAT | PLAN | ACT | AUTO (gateway enum). */
  mode?: string;
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

/** Gateway-accepted execution modes. */
const VALID_MODES = ["chat", "plan", "act", "auto"] as const;

/**
 * Normalizes a requested mode to the lowercase snake_case format.
 */
function normalizeMode(mode?: string): string {
  if (mode) {
    const lower = mode.toLowerCase();
    if ((VALID_MODES as readonly string[]).includes(lower)) return lower;
  }
  return "auto";
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
        maxSteps: input.maxSteps ?? 25,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
    },
  });
}
