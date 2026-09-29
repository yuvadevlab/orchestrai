/**
 * @file apps/gateway/src/repositories/session-message-store.ts
 * @description Dedicated message persistence helper for PostgresSessionRepository.
 * Manages message creation, foreign key execution stubs, and chronological ordering.
 * @module apps/gateway/repositories
 */

import type { PrismaClient, Prisma } from "@orchestrai/database";
import type { SessionMessageEntity } from "@orchestrai/core";
import { Logger, loggerWithConfig } from "@yuva-devlab/logger";
import { resolveDbTenantId, resolveOrCreateDefaultAgent } from "@/modules/tenant-resolver";
import { mapMessageToSessionMessageEntity } from "./session-entity.mapper";

const logger = loggerWithConfig(new Logger("SessionMessageStore"));

/**
 * Appends an individual turn message (user, assistant, tool) to a conversation thread.
 *
 * @param prisma - Prisma client instance
 * @param sessionId - Session identifier the message belongs to
 * @param message - Message payload to persist
 * @returns Persisted domain SessionMessageEntity
 */
export async function appendSessionMessage(
  prisma: PrismaClient,
  sessionId: string,
  message: Omit<SessionMessageEntity, "id" | "sessionId" | "createdAt">,
): Promise<SessionMessageEntity> {
  logger.info("appendSessionMessage: adding message turn to session", {
    sessionId,
    role: message.role,
  });

  const conv = await prisma.conversation.findUnique({
    where: { conversationId: sessionId },
  });

  if (!conv) {
    // Log a warning when appending to a session not yet known
    logger.warn(
      "appendSessionMessage: conversation not found, will derive tenant from DB default",
      {
        sessionId,
      },
    );
  }

  const existingExec = await prisma.execution.findFirst({
    where: { conversationId: sessionId },
  });

  let executionId: string;

  if (existingExec) {
    // Reuse existing execution ID to preserve relational integrity
    executionId = existingExec.executionId;
    logger.debug("appendSessionMessage: reusing existing execution", { executionId, sessionId });
  } else {
    // Create a stub execution record to satisfy non-nullable FK on messages.execution_id
    const tenantId = conv?.tenantId || (await resolveDbTenantId(undefined, prisma));
    const agentId = conv?.agentId || (await resolveOrCreateDefaultAgent(tenantId, prisma));

    logger.debug("appendSessionMessage: creating stub execution for FK integrity", {
      sessionId,
      tenantId,
      agentId,
    });

    const stubExec = await prisma.execution.create({
      data: {
        tenantId,
        agentId,
        conversationId: sessionId,
        traceId: `tr_${Date.now()}`,
        status: "completed" as never,
      },
    });
    executionId = stubExec.executionId;
  }

  try {
    const record = await prisma.message.create({
      data: {
        executionId,
        conversationId: sessionId,
        role: message.role.toLowerCase() as never,
        content: message.content as Prisma.InputJsonValue,
        metadata: {
          specialistName: message.specialistName,
          model: message.model,
          ...(message.metadata || {}),
        } as Prisma.InputJsonValue,
      },
    });

    logger.debug("appendSessionMessage: message persisted", {
      messageId: record.messageId,
      sessionId,
    });
    return mapMessageToSessionMessageEntity(record, sessionId);
  } catch (err: unknown) {
    logger.error("appendSessionMessage: failed to persist message", {
      sessionId,
      executionId,
      role: message.role,
      error: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
}

/**
 * Retrieves full chronological message history for a conversation thread.
 *
 * @param prisma - Prisma client instance
 * @param sessionId - Session identifier
 * @returns Ordered array of domain SessionMessageEntity records
 */
export async function listSessionMessages(
  prisma: PrismaClient,
  sessionId: string,
): Promise<SessionMessageEntity[]> {
  logger.debug("listSessionMessages: fetching message history", { sessionId });

  const records = await prisma.message.findMany({
    where: { conversationId: sessionId },
    orderBy: { createdAt: "asc" },
  });

  logger.debug("listSessionMessages: message history loaded", {
    sessionId,
    count: records.length,
  });
  return records.map((r) => mapMessageToSessionMessageEntity(r, sessionId));
}
