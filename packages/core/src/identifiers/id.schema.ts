/**
 * @file packages/core/src/identifiers/id.schema.ts
 * @description Strongly-typed branded identifiers and UUID validation schemas.
 * Prevents accidental assignment of dissimilar entity identifiers.
 */

import { z } from "zod";

/**
 * Standard UUID string format schema used for primary entity identifiers.
 */
export const UuidSchema = z
  .string()
  .uuid({ message: "Identifier must be a valid UUIDv4" })
  .describe("Standard RFC 4122 UUIDv4 identifier");

/**
 * Branded Agent identifier schema.
 */
export const AgentIdSchema = UuidSchema.brand<"AgentId">().describe(
  "Unique identifier for an agent instance or configuration",
);

/**
 * Inferred TypeScript type for AgentId.
 */
export type AgentId = z.infer<typeof AgentIdSchema>;

/**
 * Branded Execution identifier schema.
 */
export const ExecutionIdSchema = UuidSchema.brand<"ExecutionId">().describe(
  "Unique identifier for an execution run",
);

/**
 * Inferred TypeScript type for ExecutionId.
 */
export type ExecutionId = z.infer<typeof ExecutionIdSchema>;

/**
 * Branded Step identifier schema.
 */
export const StepIdSchema = UuidSchema.brand<"StepId">().describe(
  "Unique identifier for an individual execution step",
);

/**
 * Inferred TypeScript type for StepId.
 */
export type StepId = z.infer<typeof StepIdSchema>;

/**
 * Branded Tool Call identifier schema.
 */
export const ToolCallIdSchema = z
  .string()
  .min(1, { message: "Tool call identifier cannot be empty" })
  .brand<"ToolCallId">()
  .describe("Identifier for a specific tool call invocation");

/**
 * Inferred TypeScript type for ToolCallId.
 */
export type ToolCallId = z.infer<typeof ToolCallIdSchema>;

/**
 * Distributed tracing correlation identifier (W3C TraceContext compatible).
 */
export const TraceIdSchema = z
  .string()
  .min(8, { message: "Trace identifier must be at least 8 characters" })
  .describe("Distributed tracing correlation ID (OpenTelemetry traceId)");

/**
 * Inferred TypeScript type for TraceId.
 */
export type TraceId = z.infer<typeof TraceIdSchema>;

/**
 * Tenant or organization scope identifier for multi-tenant isolation.
 */
export const TenantIdSchema = z
  .string()
  .min(1, { message: "Tenant identifier cannot be empty" })
  .default("default")
  .describe("Tenant or workspace partition identifier");

/**
 * Inferred TypeScript type for TenantId.
 */
export type TenantId = z.infer<typeof TenantIdSchema>;
