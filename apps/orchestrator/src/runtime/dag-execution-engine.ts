/**
 * @file apps/orchestrator/src/runtime/dag-execution-engine.ts
 * @description Master DAG execution runner coordinating OrchestrAIRuntime, state machine transitions, and Redis publishing.
 * Enforces zero hardcoded strings by checking strictly against canonical enum keys.
 * @module apps/orchestrator/runtime
 */

import { OrchestrAIRuntime, type RuntimeGraphState } from "@orchestrai/runtime";
import { ToolRegistry } from "@orchestrai/tools";
import { OllamaAdapter } from "@orchestrai/models";
import {
  ToolPermissionLevel,
  MessageRole,
  OrchestratorState,
  OrchestratorEventType,
  OrchestratorPubSubEventName,
  PlatformCapabilitySlug,
} from "@orchestrai/shared-types";
import { AIMessageSchema, AGENT_EXECUTION_DEFAULTS, type AgentDefinition } from "@orchestrai/core";
import { Logger, loggerWithConfig } from "@yuva-devlab/logger";
import { createPostgresCheckpointer } from "@/checkpointer";
import { ExecutionStateMachine } from "@/state-machine";
import { orchestratorRedisPublisher } from "@/publisher";

const logger = loggerWithConfig(new Logger("DagExecutionEngine"));

/**
 * Result returned upon completing or suspending a DAG run.
 */
export interface DagExecutionRunResult {
  readonly executionId: string;
  readonly status: OrchestratorState;
  readonly currentStepIndex: number;
  readonly completedAt?: string;
  readonly output?: string;
}

/**
 * Orchestrator DAG execution engine coordinating compiled runtime graph nodes and checkpoints.
 */
export class DagExecutionEngine {
  private readonly runtime: OrchestrAIRuntime;
  private readonly activeMachines = new Map<string, ExecutionStateMachine>();

  constructor() {
    const checkpointer = createPostgresCheckpointer<RuntimeGraphState>();
    this.runtime = new OrchestrAIRuntime({
      checkpointer,
      defaultClearance: ToolPermissionLevel.WRITE_SAFE,
    });
  }

  /**
   * Dispatches and orchestrates an execution run through the compiled DAG graph.
   *
   * @param executionId - Execution UUID identifier
   * @param agent - Agent persona definition
   * @param inputPrompt - User prompt input
   * @returns DagExecutionRunResult
   */
  public async executeDagRun(
    executionId: string,
    agent: AgentDefinition,
    inputPrompt: string,
  ): Promise<DagExecutionRunResult> {
    logger.info("Executing DAG run", { executionId, agentName: agent.name });

    const sm = new ExecutionStateMachine(executionId);
    this.activeMachines.set(executionId, sm);

    // Forward state transitions to Redis Pub/Sub channel
    sm.onTransition((from, to, event) => {
      orchestratorRedisPublisher.publish(executionId, OrchestratorPubSubEventName.STATE_CHANGE, {
        from,
        to,
        event: event.type,
      });
    });

    await sm.transition({ type: OrchestratorEventType.START });
    orchestratorRedisPublisher.publish(executionId, OrchestratorPubSubEventName.RUN_START, {
      executionId,
      agentId: agent.agentId,
      inputPrompt,
    });

    try {
      const toolRegistry = new ToolRegistry();
      const adapter = await OllamaAdapter.create({
        host: process.env.OLLAMA_HOST || "http://localhost:11434",
        timeoutMs: AGENT_EXECUTION_DEFAULTS.DEFAULT_TIMEOUT_MS,
        defaultModel:
          agent.modelConfig.modelName || AGENT_EXECUTION_DEFAULTS.DEFAULT_LOCAL_MODEL_NAME,
      });

      const initialMessage = AIMessageSchema.parse({
        role: MessageRole.USER,
        content: inputPrompt,
      });

      const state = await this.runtime.start(
        agent,
        [initialMessage],
        {
          adapter,
          tools: toolRegistry,
        },
        executionId,
      );

      const isAwaitingApproval = !!state.pendingApprovalId;

      if (isAwaitingApproval) {
        await sm.transition({
          type: OrchestratorEventType.REQUEST_APPROVAL,
          payload: {
            clearanceId: state.pendingApprovalId ?? executionId,
            resource: PlatformCapabilitySlug.SYSTEM_EXECUTION,
          },
        });

        return {
          executionId,
          status: sm.state,
          currentStepIndex: (state.history?.length ?? 1) - 1,
        };
      }

      await sm.transition({
        type: OrchestratorEventType.COMPLETE,
        payload: { stepsCount: state.history?.length ?? 0 },
      });

      orchestratorRedisPublisher.publish(executionId, OrchestratorPubSubEventName.RUN_COMPLETE, {
        executionId,
        stepsCount: state.history?.length ?? 0,
      });

      return {
        executionId,
        status: sm.state,
        currentStepIndex: state.history?.length ?? 0,
        completedAt: new Date().toISOString(),
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      logger.error("DAG run failed", { executionId, error: errorMsg });

      if (!sm.isTerminal) {
        await sm.transition({ type: OrchestratorEventType.FAIL, payload: { error: errorMsg } });
      }

      orchestratorRedisPublisher.publish(executionId, OrchestratorPubSubEventName.RUN_FAILED, {
        executionId,
        error: errorMsg,
      });

      throw err;
    } finally {
      if (sm.isTerminal) {
        this.activeMachines.delete(executionId);
      }
    }
  }

  /**
   * Retrieves the current state of an active execution run.
   */
  public getExecutionState(executionId: string): OrchestratorState {
    const sm = this.activeMachines.get(executionId);
    return sm ? sm.state : OrchestratorState.COMPLETED;
  }

  /**
   * Cancels an in-flight execution run.
   */
  public async cancelDagRun(executionId: string, reason?: string): Promise<void> {
    const sm = this.activeMachines.get(executionId);
    if (sm && !sm.isTerminal) {
      await sm.transition({ type: OrchestratorEventType.CANCEL, payload: { reason } });
      orchestratorRedisPublisher.publish(executionId, OrchestratorPubSubEventName.RUN_CANCELLED, {
        executionId,
        reason,
      });
    }
  }
}
