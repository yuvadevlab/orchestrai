/**
 * @file apps/gateway/src/commands/cancel-execution.handler.ts
 * @description CQRS command handler for cancelling in-flight agent execution runs.
 * @module apps/gateway/commands
 */

import type {
  ICommandHandler,
  CancelExecutionCommand,
  ExecutionEntity,
  IExecutionRepository,
  IEventPublisher,
} from "@orchestrai/core";
import { SseStreamEvent } from "@orchestrai/shared-types";
import { Logger, loggerWithConfig } from "@yuva-devlab/logger";

const logger = loggerWithConfig(new Logger("CancelExecutionCommandHandler"));

/**
 * Command handler processing CancelExecutionCommand requests.
 */
export class CancelExecutionCommandHandler implements ICommandHandler<
  CancelExecutionCommand,
  ExecutionEntity
> {
  constructor(
    private readonly executionRepo: IExecutionRepository,
    private readonly eventPublisher: IEventPublisher,
  ) {}

  /**
   * Cancels the execution and broadcasts a termination event to connected clients.
   */
  public async handle(command: CancelExecutionCommand): Promise<ExecutionEntity> {
    const updated = await this.executionRepo.cancel(
      command.executionId,
      command.reason || "Cancelled by operator",
    );

    logger.info("Cancelled execution run via IExecutionRepository port", {
      executionId: command.executionId,
      reason: command.reason,
    });

    // Notify connected SSE streaming listeners of cancellation
    await this.eventPublisher.publishStreamEvent(command.executionId, {
      event: SseStreamEvent.DONE,
      data: {
        executionId: command.executionId,
        status: "cancelled" as never,
        completedAt: new Date().toISOString(),
      },
    });

    return updated;
  }
}
