/**
 * @file packages/core/src/agents/agent-definition.schema.ts
 * @description Invariant definition schemas for agent configurations.
 */

import { z } from "zod";
import { AgentMode, ModelProvider } from "@orchestrai/shared-types";
import { AgentIdSchema, TenantIdSchema } from "@/identifiers";
import { AGENT_EXECUTION_DEFAULTS } from "@/constants";
import { AgentModeSchema } from "./agent-mode.schema";

/**
 * Model selection and hyperparameter configuration for an agent.
 */
export const AgentModelConfigSchema = z
  .object({
    provider: z.enum(ModelProvider).optional().describe("Target LLM provider engine"),
    modelName: z
      .string()
      .min(1)
      .optional()
      .describe("User-configured model identifier, or dynamically resolved from DB default"),
    temperature: z
      .number()
      .min(0)
      .max(2)
      .default(AGENT_EXECUTION_DEFAULTS.DEFAULT_TEMPERATURE)
      .describe("Sampling temperature"),
    maxTokens: z
      .number()
      .int()
      .positive()
      .optional()
      .describe("Maximum completion token allowance"),
    topP: z.number().min(0).max(1).optional().describe("Nucleus sampling probability"),
  })
  .describe("Model invocation hyperparameters and engine selection");

export type AgentModelConfig = z.infer<typeof AgentModelConfigSchema>;

/**
 * Comprehensive Agent Definition schema.
 */
export const AgentDefinitionSchema = z
  .object({
    agentId: AgentIdSchema,
    tenantId: TenantIdSchema,
    name: z.string().min(1).max(100).describe("Human-readable display name for the agent"),
    description: z
      .string()
      .max(500)
      .optional()
      .describe("Brief functional description of the agent's role"),
    mode: AgentModeSchema.default(AgentMode.AUTO),
    systemPrompt: z.string().min(1).describe("Foundational persona and system prompt instructions"),
    modelConfig: AgentModelConfigSchema,
    enabledTools: z
      .array(z.string())
      .default([])
      .describe("List of authorized tool names for this agent"),
    maxSteps: z
      .number()
      .int()
      .positive()
      .default(AGENT_EXECUTION_DEFAULTS.DEFAULT_MAX_STEPS)
      .describe("Maximum allowed loop steps before forced termination"),
    createdAt: z.date().default(() => new Date()),
    updatedAt: z.date().default(() => new Date()),
  })
  .describe("Full configuration definition for an OrchestrAI agent");

export type AgentDefinition = z.infer<typeof AgentDefinitionSchema>;
