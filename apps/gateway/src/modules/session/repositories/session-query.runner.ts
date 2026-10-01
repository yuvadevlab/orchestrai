/**
 * @file apps/gateway/src/repositories/session-query.runner.ts
 * @description Paginated query executor for conversation session records.
 * @module apps/gateway/repositories
 */

import type { PrismaClient } from "@orchestrai/database";
import type { SessionEntity, ListSessionsFilter } from "@orchestrai/core";
import type { PaginatedResult } from "@orchestrai/shared-types";
import { Logger, loggerWithConfig } from "@yuva-devlab/logger";
import { mapConversationToSessionEntity } from "./session-entity.mapper";

const logger = loggerWithConfig(new Logger("SessionQueryRunner"));

/**
 * Queries paginated conversation sessions filtered by tenant isolation rules.
 *
 * @param prisma - Prisma client instance
 * @param filter - Pagination and tenant search criteria
 * @returns Paginated result list of SessionEntity objects
 */
export async function queryConversationSessions(
  prisma: PrismaClient,
  filter: ListSessionsFilter,
): Promise<PaginatedResult<SessionEntity>> {
  const page = Math.max(1, filter.page ?? 1);
  const limit = Math.min(100, Math.max(1, filter.limit ?? 20));
  const skip = (page - 1) * limit;

  logger.debug("queryConversationSessions: querying sessions", {
    tenantId: filter.tenantId,
    page,
    limit,
  });

  const where = {
    // Scope query to tenantId when context is available for isolation
    ...(filter.tenantId ? { tenantId: filter.tenantId } : {}),
  };

  const [records, total] = await Promise.all([
    prisma.conversation.findMany({
      where,
      skip,
      take: limit,
      orderBy: { updatedAt: "desc" },
    }),
    prisma.conversation.count({ where }),
  ]);

  logger.debug("queryConversationSessions: query returned", { total, page, count: records.length });

  return {
    items: records.map(mapConversationToSessionEntity),
    total,
    page,
    limit,
    hasMore: skip + records.length < total,
  };
}
