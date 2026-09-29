/**
 * @file packages/core/src/ports/session-repository.port.ts
 * @description Abstract storage port for conversation sessions, threads, and interleaved messages.
 * @module @orchestrai/core/ports
 */

import type { PaginatedResult } from "@orchestrai/shared-types";
import { MessageRole } from "@orchestrai/shared-types";

/**
 * Domain entity representing a conversation or cowork session.
 */
export interface SessionEntity {
  readonly id: string;
  readonly tenantId?: string;
  readonly userId?: string;
  readonly title: string;
  readonly specialistId?: string;
  readonly model?: string;
  readonly mode?: string;
  readonly metadata?: Record<string, unknown>;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/**
 * Domain entity representing an individual turn message in a conversation.
 */
export interface SessionMessageEntity {
  readonly id: string;
  readonly sessionId: string;
  readonly role: MessageRole;
  readonly content: string;
  readonly specialistName?: string;
  readonly model?: string;
  readonly metadata?: Record<string, unknown>;
  readonly createdAt: Date;
}

/**
 * Input DTO for creating a new conversation session.
 */
export interface CreateSessionEntityData {
  readonly id?: string;
  readonly tenantId?: string;
  readonly userId?: string;
  readonly title: string;
  readonly specialistId?: string;
  readonly model?: string;
  readonly mode?: string;
  readonly metadata?: Record<string, unknown>;
}

/**
 * Filter criteria for querying conversation sessions.
 */
export interface ListSessionsFilter {
  readonly tenantId?: string;
  readonly userId?: string;
  readonly page?: number;
  readonly limit?: number;
}

/**
 * Abstract repository port isolating conversation persistence from specific database drivers.
 */
export interface ISessionRepository {
  /**
   * Retrieves a conversation session by unique identifier.
   */
  findById(id: string, tenantId?: string): Promise<SessionEntity | null>;

  /**
   * Persists a new conversation session.
   */
  create(data: CreateSessionEntityData): Promise<SessionEntity>;

  /**
   * Updates session metadata, title, specialist persona, or active mode.
   */
  update(
    id: string,
    patch: Partial<Pick<SessionEntity, "title" | "specialistId" | "model" | "mode" | "metadata">>,
  ): Promise<SessionEntity>;

  /**
   * Deletes a conversation session and cascades deletion to associated messages.
   */
  delete(id: string): Promise<boolean>;

  /**
   * Queries paginated conversation sessions for a tenant or user.
   */
  list(filter: ListSessionsFilter): Promise<PaginatedResult<SessionEntity>>;

  /**
   * Appends a new turn message to the conversation history.
   */
  appendMessage(
    sessionId: string,
    message: Omit<SessionMessageEntity, "id" | "sessionId" | "createdAt">,
  ): Promise<SessionMessageEntity>;

  /**
   * Retrieves full chronological message history for a session.
   */
  listMessages(sessionId: string): Promise<SessionMessageEntity[]>;
}
