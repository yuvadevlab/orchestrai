/**
 * @file packages/core/src/cqrs/execution.commands.ts
 * @description CQRS command definitions for creating, starting, and aborting agent execution runs.
 * @module @orchestrai/core/cqrs
 */

import { ExecutionCommandType } from "@orchestrai/shared-types";
import type { ICommand } from "./command-bus.port";

/**
 * Command to initialize and trigger a new agent execution run.
 */
export interface CreateExecutionCommand extends ICommand<ExecutionCommandType.CREATE> {
  readonly agentId: string;
  readonly input: string;
  readonly conversationId?: string;
  readonly variables?: Record<string, unknown>;
  readonly metadata?: Record<string, unknown>;
  readonly asyncDispatch?: boolean;
}

/**
 * Command to cancel or abort an in-flight execution run.
 */
export interface CancelExecutionCommand extends ICommand<ExecutionCommandType.CANCEL> {
  readonly executionId: string;
  readonly reason?: string;
}
