/**
 * @file packages/events/src/contracts/event-payloads.ts
 * @description Strongly-typed payload schemas for all OrchestrAI domain lifecycle events.
 */

import { z } from "zod";
import { AgentIdSchema, ExecutionIdSchema, UuidSchema } from "@orchestrai/core";
import {
  ApprovalStatus,
  DomainEventType,
  StepType,
  ToolResultStatus,
} from "@orchestrai/shared-types";

/** Schema for sequential execution step indices */
export const StepIndexSchema = z
  .number()
  .int()
  .nonnegative()
  .describe("Zero-based sequence index within the run");

/** Schema for valid tool identifier names */
export const ToolNameSchema = z.string().min(1).max(64).describe("Unique tool identifier string");

// ─── Execution Lifecycle Payloads ──────────────────────────────────────────────

export const ExecutionCreatedPayloadSchema = z.object({
  executionId: ExecutionIdSchema,
  agentId: AgentIdSchema,
  task: z.string().min(1),
  mode: z.string().default("AUTO"),
});

export const ExecutionStartedPayloadSchema = z.object({
  executionId: ExecutionIdSchema,
  agentId: AgentIdSchema,
  startedAt: z.coerce.date(),
});

export const ExecutionCompletedPayloadSchema = z.object({
  executionId: ExecutionIdSchema,
  totalSteps: z.number().int().nonnegative(),
  totalTokens: z.number().int().nonnegative(),
  durationMs: z.number().int().nonnegative(),
  output: z.string(),
});

export const ExecutionFailedPayloadSchema = z.object({
  executionId: ExecutionIdSchema,
  error: z.string(),
  failedAtStep: z.number().int().nonnegative().optional(),
});

export const ExecutionCancelledPayloadSchema = z.object({
  executionId: ExecutionIdSchema,
  reason: z.string().default("User requested cancellation"),
});

// ─── Step Lifecycle Payloads ───────────────────────────────────────────────────

export const StepStartedPayloadSchema = z.object({
  executionId: ExecutionIdSchema,
  stepIndex: StepIndexSchema,
  stepType: z.nativeEnum(StepType),
  nodeName: z.string().min(1),
});

export const StepCompletedPayloadSchema = z.object({
  executionId: ExecutionIdSchema,
  stepIndex: StepIndexSchema,
  nodeName: z.string().min(1),
  durationMs: z.number().int().nonnegative(),
});

// ─── Tool Execution Payloads ───────────────────────────────────────────────────

export const ToolCalledPayloadSchema = z.object({
  executionId: ExecutionIdSchema,
  callId: UuidSchema,
  toolName: ToolNameSchema,
  input: z.record(z.string(), z.unknown()),
});

export const ToolCompletedPayloadSchema = z.object({
  executionId: ExecutionIdSchema,
  callId: UuidSchema,
  toolName: ToolNameSchema,
  status: z.nativeEnum(ToolResultStatus),
  durationMs: z.number().int().nonnegative(),
  output: z.unknown().optional(),
  error: z.string().optional(),
});

// ─── Approval / HITL Payloads ──────────────────────────────────────────────────

export const ApprovalRequestedPayloadSchema = z.object({
  executionId: ExecutionIdSchema,
  approvalId: UuidSchema,
  toolName: ToolNameSchema,
  riskLevel: z.string(),
  reason: z.string(),
});

export const ApprovalResolvedPayloadSchema = z.object({
  executionId: ExecutionIdSchema,
  approvalId: UuidSchema,
  status: z.enum(ApprovalStatus),
  decidedBy: z.string().optional(),
  comment: z.string().optional(),
});

// ─── Payload Registry Mapping ──────────────────────────────────────────────────

export const EventPayloadMap = {
  [DomainEventType.EXECUTION_CREATED]: ExecutionCreatedPayloadSchema,
  [DomainEventType.EXECUTION_QUEUED]: ExecutionCreatedPayloadSchema,
  [DomainEventType.EXECUTION_STARTED]: ExecutionStartedPayloadSchema,
  [DomainEventType.STEP_STARTED]: StepStartedPayloadSchema,
  [DomainEventType.STEP_COMPLETED]: StepCompletedPayloadSchema,
  [DomainEventType.TOOL_CALLED]: ToolCalledPayloadSchema,
  [DomainEventType.TOOL_COMPLETED]: ToolCompletedPayloadSchema,
  [DomainEventType.APPROVAL_REQUESTED]: ApprovalRequestedPayloadSchema,
  [DomainEventType.APPROVAL_RESOLVED]: ApprovalResolvedPayloadSchema,
  [DomainEventType.EXECUTION_COMPLETED]: ExecutionCompletedPayloadSchema,
  [DomainEventType.EXECUTION_FAILED]: ExecutionFailedPayloadSchema,
  [DomainEventType.EXECUTION_CANCELLED]: ExecutionCancelledPayloadSchema,
} as const;

export type EventPayloadTypeMap = {
  [K in keyof typeof EventPayloadMap]: z.infer<(typeof EventPayloadMap)[K]>;
};
