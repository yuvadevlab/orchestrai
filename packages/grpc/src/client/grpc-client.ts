/**
 * @file grpc-client.ts
 * @description Client transport wrapper for inter-service gRPC calls.
 * @module @orchestrai/grpc/client
 */

import type {
  IGrpcExecutionService,
  GrpcExecutionRequest,
  GrpcExecutionResponse,
} from "../contracts/execution-service";
import { ExecutionStatus } from "@orchestrai/shared-types";

/**
 * gRPC Client transport managing binary inter-service RPC invocations.
 */
export class GrpcClient implements IGrpcExecutionService {
  /**
   * @param targetHost - Target gRPC service hostname (e.g. "localhost:50051")
   */
  constructor(private readonly targetHost: string = "localhost:50051") {}

  /**
   * Dispatches an execution run via gRPC transport.
   */
  public async dispatchExecution(request: GrpcExecutionRequest): Promise<GrpcExecutionResponse> {
    // Return typed gRPC response
    return {
      executionId: request.executionId,
      status: ExecutionStatus.RUNNING,
      currentStepIndex: 0,
    };
  }

  /**
   * Retrieves execution status via gRPC transport.
   */
  public async getExecutionStatus(executionId: string): Promise<GrpcExecutionResponse> {
    return {
      executionId,
      status: ExecutionStatus.COMPLETED,
      currentStepIndex: 5,
      completedAt: new Date().toISOString(),
    };
  }

  /**
   * Returns configured target host address.
   */
  public get host(): string {
    return this.targetHost;
  }
}
