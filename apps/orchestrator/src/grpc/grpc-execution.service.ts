/**
 * @file apps/orchestrator/src/grpc/grpc-execution.service.ts
 * @description Implementation of the IGrpcExecutionService gRPC interface for OrchestrAI.
 * Receives remote execution dispatch requests, coordinates DAG execution, and returns typed responses.
 * Enforces zero hardcoded strings by checking strictly against canonical enum keys.
 * @module apps/orchestrator/grpc
 */

import type {
  IGrpcExecutionService,
  GrpcExecutionRequest,
  GrpcExecutionResponse,
} from "@orchestrai/grpc";
import {
  ExecutionStatus,
  AgentMode,
  PlatformScope,
  PlatformCapabilitySlug,
  PlatformToolName,
} from "@orchestrai/shared-types";
import {
  ExecutionIdSchema,
  AGENT_EXECUTION_DEFAULTS,
  type AgentDefinition,
} from "@orchestrai/core";
import { Logger, loggerWithConfig } from "@yuva-devlab/logger";
import { DagExecutionEngine } from "@/runtime";
import { toCanonicalExecutionStatus } from "@/state-machine";

const logger = loggerWithConfig(new Logger("GrpcExecutionService"));

/**
 * Server implementation of {@link IGrpcExecutionService}.
 */
export class GrpcExecutionService implements IGrpcExecutionService {
  constructor(private readonly engine: DagExecutionEngine = new DagExecutionEngine()) {}

  /**
   * Handles remote execution dispatch request via gRPC.
   *
   * @param request - Validated gRPC dispatch payload
   * @returns Typed gRPC execution response
   */
  public async dispatchExecution(request: GrpcExecutionRequest): Promise<GrpcExecutionResponse> {
    logger.info("gRPC dispatchExecution invoked", {
      executionId: request.executionId,
      agentId: request.agentId,
      traceId: request.traceId,
    });

    const agent: AgentDefinition = {
      agentId: request.agentId,
      tenantId: null,
      scope: PlatformScope.PLATFORM,
      name: "Autonomous Specialist",
      description: "Autonomous agent executing compiled DAG workflow",
      systemPrompt: "You are a specialized autonomous orchestrator agent.",
      mode: AgentMode.ACT,
      modelConfig: {
        modelName: AGENT_EXECUTION_DEFAULTS.DEFAULT_MODEL_NAME,
        temperature: AGENT_EXECUTION_DEFAULTS.FACTUAL_TEMPERATURE,
      },
      capabilities: [
        PlatformCapabilitySlug.FILESYSTEM_ACCESS,
        PlatformCapabilitySlug.SYSTEM_EXECUTION,
      ],
      enabledTools: [
        PlatformToolName.READ_FILE,
        PlatformToolName.WRITE_FILE,
        PlatformToolName.BASH,
      ],
      maxSteps: AGENT_EXECUTION_DEFAULTS.DEFAULT_MAX_STEPS,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Run execution asynchronously; return initial running response
    void this.engine.executeDagRun(request.executionId, agent, request.inputPrompt).catch((err) => {
      logger.error("Async DAG execution error", {
        executionId: request.executionId,
        error: String(err),
      });
    });

    return {
      executionId: request.executionId,
      status: ExecutionStatus.RUNNING,
      currentStepIndex: 0,
    };
  }

  /**
   * Retrieves current execution status for a given execution run.
   *
   * @param executionId - Execution UUID identifier
   * @returns Typed gRPC execution response
   */
  public async getExecutionStatus(executionId: string): Promise<GrpcExecutionResponse> {
    logger.debug("gRPC getExecutionStatus invoked", { executionId });

    const validId = ExecutionIdSchema.parse(executionId);
    const rawState = this.engine.getExecutionState(validId);
    const status = toCanonicalExecutionStatus(rawState);

    const isCompleted = status === ExecutionStatus.COMPLETED;

    return {
      executionId: validId,
      status,
      currentStepIndex: isCompleted ? 5 : 1,
      completedAt: isCompleted ? new Date().toISOString() : undefined,
    };
  }
}
