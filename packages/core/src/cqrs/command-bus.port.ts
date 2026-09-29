/**
 * @file packages/core/src/cqrs/command-bus.port.ts
 * @description Command bus interfaces and handler contracts for CQRS write pipelines.
 * @module @orchestrai/core/cqrs
 */

import type {
  ExecutionCommandType,
  ApprovalCommandType,
  SessionCommandType,
} from "@orchestrai/shared-types";

/**
 * Union of canonical domain command types and custom string keys.
 */
export type DomainCommandType =
  ExecutionCommandType | ApprovalCommandType | SessionCommandType | string;

/**
 * Base contract for all mutating domain commands.
 */
export interface ICommand<TType extends DomainCommandType = DomainCommandType> {
  readonly type: TType;
  readonly tenantId?: string;
  readonly correlationId?: string;
  readonly timestamp?: Date;
}

/**
 * Interface implemented by specific command handlers.
 */
export interface ICommandHandler<TCommand extends ICommand, TResult = void> {
  /**
   * Executes the command and returns the execution result.
   */
  handle(command: TCommand): Promise<TResult>;
}

/**
 * Central command dispatcher routing commands to their registered handlers.
 */
export interface ICommandBus {
  /**
   * Registers a command handler for a given command type.
   */
  register<TCommand extends ICommand, TResult>(
    commandType: DomainCommandType,
    handler: ICommandHandler<TCommand, TResult>,
  ): void;

  /**
   * Dispatches a command to its corresponding handler.
   */
  dispatch<TResult = void>(command: ICommand): Promise<TResult>;
}
