/**
 * @file execution-service.ts
 * @description Protobuf RPC contract definitions for gRPC execution service endpoints.
 * @module @orchestrai/grpc/contracts
 */

import { z } from "zod";
import { ExecutionStatus } from "@orchestrai/shared-types";

/** gRPC Execution Request payload schema */
export const GrpcExecutionRequestSchema = z.object({
  executionId: z.string().uuid(),
  agentId: z.string().uuid(),
  inputPrompt: z.string().min(1),
  traceId: z.string(),
});
export type GrpcExecutionRequest = z.infer<typeof GrpcExecutionRequestSchema>;

/** gRPC Execution Response payload schema */
export const GrpcExecutionResponseSchema = z.object({
  executionId: z.string().uuid(),
  status: z.nativeEnum(ExecutionStatus),
  currentStepIndex: z.number().int().nonnegative(),
  completedAt: z.string().optional(),
});
export type GrpcExecutionResponse = z.infer<typeof GrpcExecutionResponseSchema>;

/** gRPC Execution Service RPC interface definition */
export interface IGrpcExecutionService {
  dispatchExecution(request: GrpcExecutionRequest): Promise<GrpcExecutionResponse>;
  getExecutionStatus(executionId: string): Promise<GrpcExecutionResponse>;
}
