/**
 * @file packages/core/src/cqrs/session.commands.ts
 * @description CQRS command definitions for conversation session lifecycle and turn updates.
 * @module @orchestrai/core/cqrs
 */

import { SessionCommandType, MessageRole } from "@orchestrai/shared-types";
import type { ICommand } from "./command-bus.port";

/**
 * Command to create a new cowork or chat session thread.
 */
export interface CreateSessionCommand extends ICommand<SessionCommandType.CREATE> {
  readonly title: string;
  readonly specialistId?: string;
  readonly model?: string;
  readonly mode?: string;
  readonly userId?: string;
  readonly metadata?: Record<string, unknown>;
}

/**
 * Command to append an interleaved turn message to a session thread.
 */
export interface AppendMessageCommand extends ICommand<SessionCommandType.APPEND_MESSAGE> {
  readonly sessionId: string;
  readonly role: MessageRole;
  readonly content: string;
  readonly specialistName?: string;
  readonly model?: string;
  readonly metadata?: Record<string, unknown>;
}

/**
 * Command to permanently delete a session thread and its history.
 */
export interface DeleteSessionCommand extends ICommand<SessionCommandType.DELETE> {
  readonly sessionId: string;
}
