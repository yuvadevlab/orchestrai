/**
 * @file packages/queue/src/types/job.types.ts
 * @description Zod validation schemas and TypeScript definitions for BullMQ job payloads.
 */

import { z } from "zod";
import {
  ExecutionIdSchema,
  AgentIdSchema,
  TenantIdSchema,
  TraceIdSchema,
  StepIdSchema,
} from "@orchestrai/core";

/**
 * Priority levels for BullMQ jobs.
 * Lower numerical values represent higher scheduling priority in BullMQ.
 */
export enum JobPriority {
  CRITICAL = 1,
  HIGH = 2,
  NORMAL = 3,
  LOW = 4,
}

/**
 * Payload required to initiate or resume an asynchronous agent execution run.
 */
export const AgentExecutionJobPayloadSchema = z
  .object({
    executionId: ExecutionIdSchema,
    agentId: AgentIdSchema,
    tenantId: TenantIdSchema,
    traceId: TraceIdSchema,
    idempotencyKey: z.string().min(1).optional().describe("Client-supplied deduplication token"),
    inputPrompt: z
      .string()
      .min(1)
      .describe("Initial conversational prompt or user task instruction"),
    variables: z
      .record(z.string(), z.unknown())
      .default({})
      .describe("Dynamic workflow variables passed to the execution graph"),
    priority: z
      .nativeEnum(JobPriority)
      .default(JobPriority.NORMAL)
      .describe("Job scheduling priority in BullMQ"),
    enqueuedAt: z
      .string()
      .datetime()
      .default(() => new Date().toISOString())
      .describe("ISO timestamp when job was scheduled"),
  })
  .describe("Payload contract for agent execution worker jobs");

export type AgentExecutionJobPayload = z.infer<typeof AgentExecutionJobPayloadSchema>;

/**
 * Payload for offloading long-running, CPU-intensive, or external tools to background workers.
 */
export const ToolExecutionJobPayloadSchema = z
  .object({
    executionId: ExecutionIdSchema,
    stepId: StepIdSchema,
    tenantId: TenantIdSchema,
    toolName: z.string().min(1).describe("Target tool identifier"),
    toolArguments: z
      .record(z.string(), z.unknown())
      .describe("Validated input arguments for the tool"),
    timeoutMs: z
      .number()
      .int()
      .positive()
      .default(60_000)
      .describe("Per-tool execution deadline in milliseconds"),
    enqueuedAt: z
      .string()
      .datetime()
      .default(() => new Date().toISOString()),
  })
  .describe("Payload contract for deferred background tool execution jobs");

export type ToolExecutionJobPayload = z.infer<typeof ToolExecutionJobPayloadSchema>;

/**
 * Payload routed to the Dead Letter Queue (DLQ) upon exhausted retry attempts.
 */
export const DeadLetterJobPayloadSchema = z
  .object({
    originalQueue: z.string().min(1).describe("Name of the queue where failure occurred"),
    originalJobId: z.string().min(1).describe("BullMQ identifier of the failed job"),
    originalPayload: z.unknown().describe("Original payload of the failed job"),
    failedReason: z.string().describe("Root cause error message or exception stack"),
    attemptsMade: z.number().int().nonnegative().describe("Total retry attempts exhausted"),
    failedAt: z
      .string()
      .datetime()
      .default(() => new Date().toISOString()),
  })
  .describe("Forensic payload stored in the dead-letter queue for operator inspection");

export type DeadLetterJobPayload = z.infer<typeof DeadLetterJobPayloadSchema>;
