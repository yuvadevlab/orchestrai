/**
 * @file packages/core/src/executions/execution-context.schema.ts
 * @description Immutable context metadata passed across all execution sub-nodes and workers.
 */

import { z } from "zod";
import { AgentIdSchema, ExecutionIdSchema, TenantIdSchema, TraceIdSchema } from "@/identifiers";

/**
 * Global execution context containing identity, multi-tenancy, and distributed trace references.
 */
export const ExecutionContextSchema = z
  .object({
    executionId: ExecutionIdSchema,
    agentId: AgentIdSchema,
    tenantId: TenantIdSchema,
    traceId: TraceIdSchema,
    userId: z.string().min(1).optional().describe("Identifier of the user requesting execution"),
    idempotencyKey: z
      .string()
      .min(1)
      .optional()
      .describe("Client-provided key preventing duplicate job creation on retries"),
    timeoutMs: z
      .number()
      .int()
      .positive()
      .default(300_000)
      .describe("Execution deadline in milliseconds (default 5 minutes)"),
    startedAt: z.date().default(() => new Date()),
    metadata: z
      .record(z.string(), z.unknown())
      .default({})
      .describe("Arbitrary external metadata (tags, client versions)"),
  })
  .describe("Immutable execution context passed across runtime and worker boundaries");

export type ExecutionContext = z.infer<typeof ExecutionContextSchema>;
