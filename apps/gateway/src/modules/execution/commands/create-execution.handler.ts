/**
 * @file apps/gateway/src/commands/create-execution.handler.ts
 * @description CQRS command handler for creating and dispatching agent execution runs.
 * @module apps/gateway/commands
 */

import type {
  ICommandHandler,
  CreateExecutionCommand,
  ExecutionEntity,
  IExecutionRepository,
  IQueueProducer,
  IEventPublisher,
} from "@orchestrai/core";
import { ExecutionStatus, SseStreamEvent, QUEUE_NAMES } from "@orchestrai/shared-types";
import { Logger, loggerWithConfig } from "@yuva-devlab/logger";

const logger = loggerWithConfig(new Logger("CreateExecutionCommandHandler"));

/**
 * Command handler processing CreateExecutionCommand requests.
 */
export class CreateExecutionCommandHandler implements ICommandHandler<
  CreateExecutionCommand,
  ExecutionEntity
> {
  constructor(
    private readonly executionRepo: IExecutionRepository,
    private readonly queueProducer: IQueueProducer,
    private readonly eventPublisher: IEventPublisher,
  ) {}

  /**
   * Executes the creation and asynchronous or queued dispatch of an agent run.
   */
  public async handle(command: CreateExecutionCommand): Promise<ExecutionEntity> {
    const tenantId = command.tenantId || "00000000-0000-0000-0000-000000000000";

    // 1. Persist initial execution record in repository
    const execution = await this.executionRepo.create({
      agentId: command.agentId,
      tenantId,
      conversationId: command.conversationId,
      input: command.input,
      status: ExecutionStatus.QUEUED,
      metadata: {
        ...(command.variables || {}),
        ...(command.metadata || {}),
      },
    });

    logger.info("Persisted execution run via IExecutionRepository port", {
      executionId: execution.id,
      agentId: execution.agentId,
      tenantId,
    });

    // 2. Publish initial QUEUED stream event via event publisher
    await this.eventPublisher.publishStreamEvent(execution.id, {
      event: SseStreamEvent.MESSAGE,
      data: {
        executionId: execution.id,
        messageId: `msg_${execution.id}`,
        role: "assistant" as never,
        content: "",
        timestamp: new Date().toISOString(),
      },
    });

    // 3. Dispatch to BullMQ worker queue if asynchronous dispatch requested
    if (command.asyncDispatch) {
      await this.queueProducer.enqueue(QUEUE_NAMES.AGENT_EXECUTION, "process-agent-execution", {
        executionId: execution.id,
        agentId: execution.agentId,
        tenantId,
        input: execution.input,
      });
    }

    return execution;
  }
}
