/**
 * @file apps/gateway/src/commands/session.handlers.ts
 * @description CQRS command handlers for conversation sessions and interleaved message turns.
 * @module apps/gateway/commands
 */

import type {
  ICommandHandler,
  CreateSessionCommand,
  AppendMessageCommand,
  DeleteSessionCommand,
  ISessionRepository,
  SessionEntity,
  SessionMessageEntity,
} from "@orchestrai/core";

/**
 * Command handler creating a new conversation session thread.
 */
export class CreateSessionCommandHandler implements ICommandHandler<
  CreateSessionCommand,
  SessionEntity
> {
  constructor(private readonly sessionRepo: ISessionRepository) {}

  public async handle(command: CreateSessionCommand): Promise<SessionEntity> {
    return this.sessionRepo.create({
      tenantId: command.tenantId,
      userId: command.userId,
      title: command.title,
      specialistId: command.specialistId,
      model: command.model,
      mode: command.mode,
      metadata: command.metadata,
    });
  }
}

/**
 * Command handler appending a message turn to a session.
 */
export class AppendMessageCommandHandler implements ICommandHandler<
  AppendMessageCommand,
  SessionMessageEntity
> {
  constructor(private readonly sessionRepo: ISessionRepository) {}

  public async handle(command: AppendMessageCommand): Promise<SessionMessageEntity> {
    return this.sessionRepo.appendMessage(command.sessionId, {
      role: command.role,
      content: command.content,
      specialistName: command.specialistName,
      model: command.model,
      metadata: command.metadata,
    });
  }
}

/**
 * Command handler permanently deleting a session.
 */
export class DeleteSessionCommandHandler implements ICommandHandler<DeleteSessionCommand, boolean> {
  constructor(private readonly sessionRepo: ISessionRepository) {}

  public async handle(command: DeleteSessionCommand): Promise<boolean> {
    return this.sessionRepo.delete(command.sessionId);
  }
}
