/**
 * @file apps/gateway/src/validation/agent.schema.ts
 * @description Inbound request validation schemas for agent registration and management.
 */

import { z } from "zod";
import { AgentMode, ModelProvider } from "@orchestrai/shared-types";

/**
 * Model selection and hyperparameters payload.
 */
export const ModelConfigPayloadSchema = z.object({
  provider: z.enum(ModelProvider).default(ModelProvider.OLLAMA).describe("LLM provider engine"),
  modelName: z.string().min(1).default("qwen2.5:7b").describe("Model name or checkpoint"),
  temperature: z.number().min(0).max(2).optional().default(0.7).describe("Sampling temperature"),
  maxTokens: z.number().int().positive().optional().describe("Max token budget"),
  topP: z.number().min(0).max(1).optional().describe("Top-p nucleus sampling"),
});

/**
 * Validates payload for creating a new agent definition.
 */
export const CreateAgentSchema = z.object({
  name: z.string().min(1).max(100).describe("Human-readable agent name"),
  description: z.string().max(500).optional().describe("Brief role description"),
  mode: z.enum(AgentMode).optional().default(AgentMode.AUTO).describe("Autonomy mode"),
  systemPrompt: z.string().min(1).describe("Core system instructions and persona"),
  modelConfig: ModelConfigPayloadSchema.optional().default({
    provider: ModelProvider.OLLAMA,
    modelName: "qwen2.5:7b",
    temperature: 0.7,
  }),
  enabledTools: z.array(z.string()).optional().default([]).describe("Authorized tool names"),
  maxSteps: z
    .number()
    .int()
    .positive()
    .optional()
    .default(25)
    .describe("Maximum allowed loop steps"),
});

export type CreateAgentDto = z.infer<typeof CreateAgentSchema>;

/**
 * Validates payload for updating an existing agent definition.
 */
export const UpdateAgentSchema = CreateAgentSchema.partial();

export type UpdateAgentDto = z.infer<typeof UpdateAgentSchema>;

/**
 * Query schema for agent listings.
 */
export const AgentFilterSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  cursor: z.string().optional(),
});

export type AgentFilterDto = z.infer<typeof AgentFilterSchema>;
