/**
 * @file apps/gateway/src/repositories/postgres-session.repository.ts
 * @description PostgreSQL Prisma adapter implementing the core ISessionRepository port.
 * Manages conversational state, thread lifecycles, and chronological message audit logging.
 * @module apps/gateway/repositories
 */

import { getPrismaClient, type PrismaClient, type Prisma } from "@orchestrai/database";
import type {
  ISessionRepository,
  SessionEntity,
  SessionMessageEntity,
  CreateSessionEntityData,
  ListSessionsFilter,
} from "@orchestrai/core";
import type { PaginatedResult } from "@orchestrai/shared-types";
import { Logger, loggerWithConfig } from "@yuva-devlab/logger";
import { resolveDbTenantId, resolveOrCreateDefaultAgent } from "@/modules/tenant-resolver";
import { mapConversationToSessionEntity } from "./session-entity.mapper";
import { appendSessionMessage, listSessionMessages } from "./session-message-store";

const logger = loggerWithConfig(new Logger("PostgresSessionRepository"));

/**
 * PostgreSQL Prisma adapter implementing {@link ISessionRepository}.
 * Manages conversational state, thread lifecycles, and chronological message audit logging.
 */
export class PostgresSessionRepository implements ISessionRepository {
  /**
   * Initializes the repository with an injected or default database client.
   *
   * @param prisma - PrismaClient instance for database querying
   */
  constructor(private readonly prisma: PrismaClient = getPrismaClient()) {}

  /**
   * Retrieves a conversation session by its unique UUID identifier.
   *
   * @param id - Session UUID identifier
   * @param tenantId - Optional tenant ID to enforce tenant isolation
   * @returns SessionEntity if found, or null if deleted/non-existent
   */
  public async findById(id: string, tenantId?: string): Promise<SessionEntity | null> {
    logger.debug("findById: looking up conversation session", { sessionId: id, tenantId });

    const record = await this.prisma.conversation.findFirst({
      where: {
        conversationId: id,
        // Enforce multi-tenant isolation when tenant context is provided
        ...(tenantId ? { tenantId } : {}),
      },
    });

    if (!record) {
      // Session does not exist — caller decides if this is a 404 or an expected cache miss
      logger.debug("findById: session not found", { sessionId: id });
      return null;
    }

    logger.debug("findById: session found", { sessionId: id });
    return mapConversationToSessionEntity(record);
  }

  /**
   * Persists a new conversation session row in PostgreSQL.
   *
   * @param data - Creation attributes for the session
   * @returns Newly created and hydrated SessionEntity
   */
  public async create(data: CreateSessionEntityData): Promise<SessionEntity> {
    // Resolve tenant ID to ensure referential integrity with tenants table
    const tenantId = await resolveDbTenantId(data.tenantId, this.prisma);

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const agentId =
      data.specialistId && isUuid.test(data.specialistId)
        ? data.specialistId
        : await resolveOrCreateDefaultAgent(tenantId, this.prisma);

    logger.info("create: persisting new conversation session", {
      tenantId,
      agentId,
      title: data.title,
    });

    try {
      const record = await this.prisma.conversation.create({
        data: {
          ...(data.id ? { conversationId: data.id } : {}),
          tenantId,
          agentId,
          title: data.title,
          metadata: {
            specialistId: data.specialistId,
            model: data.model,
            mode: data.mode,
            ...(data.metadata || {}),
          } as Prisma.InputJsonValue,
        },
      });

      logger.info("create: conversation session created", { sessionId: record.conversationId });
      return mapConversationToSessionEntity(record);
    } catch (err: unknown) {
      logger.error("create: failed to persist conversation session", {
        tenantId,
        agentId,
        error: err instanceof Error ? err.message : String(err),
      });
      throw err;
    }
  }

  /**
   * Updates mutable session attributes including title, assigned specialist, and metadata.
   *
   * @param id - Session UUID identifier
   * @param patch - Partial fields to update
   * @returns Updated SessionEntity
   */
  public async update(
    id: string,
    patch: Partial<Pick<SessionEntity, "title" | "specialistId" | "model" | "mode" | "metadata">>,
  ): Promise<SessionEntity> {
    logger.info("update: patching conversation session", {
      sessionId: id,
      fields: Object.keys(patch),
    });

    const existing = await this.findById(id);
    const existingMeta = (existing?.metadata || {}) as Record<string, unknown>;

    try {
      const record = await this.prisma.conversation.update({
        where: { conversationId: id },
        data: {
          // Selectively update title only when explicitly supplied in patch
          ...(patch.title ? { title: patch.title } : {}),
          metadata: {
            ...existingMeta,
            ...(patch.specialistId ? { specialistId: patch.specialistId } : {}),
            ...(patch.model ? { model: patch.model } : {}),
            ...(patch.mode ? { mode: patch.mode } : {}),
            ...(patch.metadata || {}),
          } as Prisma.InputJsonValue,
        },
      });

      logger.debug("update: session metadata updated", { sessionId: id });
      return mapConversationToSessionEntity(record);
    } catch (err: unknown) {
      logger.error("update: failed to update session", {
        sessionId: id,
        error: err instanceof Error ? err.message : String(err),
      });
      throw err;
    }
  }

  /**
   * Permanently removes a conversation session and cascades deletion to linked messages.
   *
   * @param id - Session UUID identifier
   * @returns True if deletion succeeded, false if not found
   */
  public async delete(id: string): Promise<boolean> {
    logger.warn("delete: removing conversation session", { sessionId: id });

    try {
      await this.prisma.conversation.delete({ where: { conversationId: id } });
      logger.info("delete: session deleted", { sessionId: id });
      return true;
    } catch (err: unknown) {
      // Return false gracefully when record does not exist rather than propagating a hard error
      logger.warn("delete: session not found or deletion failed", {
        sessionId: id,
        error: err instanceof Error ? err.message : String(err),
      });
      return false;
    }
  }

  /**
   * Queries paginated conversation sessions filtered by tenant.
   *
   * @param filter - Pagination and tenant search criteria
   * @returns Paginated result list of SessionEntity objects
   */
  public async list(filter: ListSessionsFilter): Promise<PaginatedResult<SessionEntity>> {
    const page = Math.max(1, filter.page ?? 1);
    const limit = Math.min(100, Math.max(1, filter.limit ?? 20));
    const skip = (page - 1) * limit;

    logger.debug("list: querying conversation sessions", {
      tenantId: filter.tenantId,
      page,
      limit,
    });

    const where = {
      // Scope query to tenantId when context is available for isolation
      ...(filter.tenantId ? { tenantId: filter.tenantId } : {}),
    };

    const [records, total] = await Promise.all([
      this.prisma.conversation.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: "desc" },
      }),
      this.prisma.conversation.count({ where }),
    ]);

    logger.debug("list: sessions query returned", { total, page, count: records.length });

    return {
      items: records.map(mapConversationToSessionEntity),
      total,
      page,
      limit,
      hasMore: skip + records.length < total,
    };
  }

  /**
   * Appends an individual turn message (user, assistant, tool) to a conversation thread.
   *
   * @param sessionId - Session identifier the message belongs to
   * @param message - Message payload to persist
   * @returns Persisted domain SessionMessageEntity
   */
  public async appendMessage(
    sessionId: string,
    message: Omit<SessionMessageEntity, "id" | "sessionId" | "createdAt">,
  ): Promise<SessionMessageEntity> {
    return appendSessionMessage(this.prisma, sessionId, message);
  }

  /**
   * Retrieves full chronological message history for a conversation thread.
   *
   * @param sessionId - Session identifier
   * @returns Ordered array of domain SessionMessageEntity records
   */
  public async listMessages(sessionId: string): Promise<SessionMessageEntity[]> {
    return listSessionMessages(this.prisma, sessionId);
  }
}
