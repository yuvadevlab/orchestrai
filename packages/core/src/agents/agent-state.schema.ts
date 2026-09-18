/**
 * @file packages/core/src/agents/agent-state.schema.ts
 * @description Dynamic runtime state schema for an active agent execution loop.
 */

import { z } from "zod";
import { AgentIdSchema, ExecutionIdSchema } from "@/identifiers";
import { AgentModeSchema } from "./agent-mode.schema";

/**
 * Mutable state container tracked by LangGraph or custom execution loops.
 */
export const AgentStateSchema = z
  .object({
    executionId: ExecutionIdSchema,
    agentId: AgentIdSchema,
    mode: AgentModeSchema,
    currentStepIndex: z
      .number()
      .int()
      .nonnegative()
      .default(0)
      .describe("Zero-based index of the currently executing loop step"),
    maxSteps: z
      .number()
      .int()
      .positive()
      .default(25)
      .describe("Maximum steps allowed for this execution run"),
    loopCount: z
      .number()
      .int()
      .nonnegative()
      .default(0)
      .describe("Consecutive identical action counter for infinite loop detection"),
    contextVariables: z
      .record(z.string(), z.unknown())
      .default({})
      .describe("Ephemeral key-value state variables passed between graph nodes"),
    pendingApprovalId: z
      .string()
      .uuid()
      .optional()
      .describe("UUID of active human-in-the-loop approval request blocking execution"),
    isTerminated: z
      .boolean()
      .default(false)
      .describe("Flag indicating whether the agent has reached a terminal graph node"),
  })
  .describe("Dynamic runtime state representation of an agent");

export type AgentState = z.infer<typeof AgentStateSchema>;
