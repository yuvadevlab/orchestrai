/**
 * @file apps/gateway/src/services/conversation-query.service.ts
 * @description Query service for retrieving conversations and message history from PostgreSQL.
 * @module apps/gateway/services
 */

import { getPrismaClient, type PrismaClient } from "@orchestrai/database";
import type { MessageQueryDto, ConversationQueryDto } from "@/validation";
import { resolveDbTenantId } from "./tenant-resolver";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface ConversationMessageRecord {
  messageId: string;
  conversationId: string;
  role: string;
  content: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface ConversationWithMessagesRecord {
  conversationId: string;
  title: string;
  tenantId: string;
  agentId: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  messages: ConversationMessageRecord[];
}

export interface ConversationListResult {
  items: ConversationWithMessagesRecord[];
  total: number;
  hasMore: boolean;
}

export interface MessageListResult {
  conversationId: string;
  messages: ConversationMessageRecord[];
  limit: number;
  total: number;
  hasMore: boolean;
}

function mapConversationRow(row: {
  conversationId: string;
  title: string;
  tenantId: string;
  agentId: string;
  metadata: unknown;
  createdAt: Date;
  updatedAt: Date;
  _count?: { messages: number };
  messages?: Array<{
    messageId: string;
    conversationId: string | null;
    role: string;
    content: unknown;
    metadata: unknown;
    createdAt: Date;
  }>;
}): ConversationWithMessagesRecord {
  return {
    conversationId: row.conversationId,
    title: row.title,
    tenantId: row.tenantId,
    agentId: row.agentId,
    metadata: (row.metadata as Record<string, unknown>) || {},
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    messageCount: row._count?.messages || 0,
    messages: (row.messages || []).map((m) => ({
      messageId: m.messageId,
      conversationId: m.conversationId || row.conversationId,
      role: m.role.toLowerCase(),
      content: typeof m.content === "string" ? m.content : JSON.stringify(m.content),
      metadata: (m.metadata as Record<string, unknown>) || {},
      createdAt: m.createdAt.toISOString(),
    })),
  };
}

/**
 * Service for read-only conversation queries against PostgreSQL.
 */
export class ConversationQueryService {
  private get db(): PrismaClient {
    return getPrismaClient();
  }

  /**
   * Lists active conversations for the tenant along with recent messages.
   */
  public async listConversations(
    query: ConversationQueryDto,
    tenantId: string,
  ): Promise<ConversationListResult> {
    const resolvedTenantId = await resolveDbTenantId(tenantId, this.db);
    const limit = query.limit || 50;

    const rows = await this.db.conversation.findMany({
      where: { tenantId: resolvedTenantId, deletedAt: null },
      orderBy: { updatedAt: "desc" },
      take: limit,
      include: {
        _count: { select: { messages: true } },
        messages: { orderBy: { createdAt: "asc" }, take: 100 },
      },
    });

    const total = await this.db.conversation.count({
      where: { tenantId: resolvedTenantId, deletedAt: null },
    });

    return {
      items: rows.map(mapConversationRow),
      total,
      hasMore: total > limit,
    };
  }

  /**
   * Retrieves a single conversation session by ID.
   */
  public async getConversationById(
    conversationId: string,
    tenantId: string,
  ): Promise<ConversationWithMessagesRecord | null> {
    if (!UUID_REGEX.test(conversationId)) return null;

    const resolvedTenantId = await resolveDbTenantId(tenantId, this.db);
    const row = await this.db.conversation.findFirst({
      where: { conversationId, tenantId: resolvedTenantId, deletedAt: null },
      include: {
        _count: { select: { messages: true } },
        messages: { orderBy: { createdAt: "asc" } },
      },
    });

    return row ? mapConversationRow(row) : null;
  }

  /**
   * Retrieves messages for a specified conversation from PostgreSQL.
   */
  public async getMessages(
    conversationId: string,
    query: MessageQueryDto,
    _tenantId: string,
  ): Promise<MessageListResult> {
    if (!UUID_REGEX.test(conversationId)) {
      return { conversationId, messages: [], limit: query.limit || 50, total: 0, hasMore: false };
    }

    const limit = query.limit || 50;
    const rows = await this.db.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
      take: limit,
    });

    const total = await this.db.message.count({ where: { conversationId } });

    const messages: ConversationMessageRecord[] = rows.map((m) => ({
      messageId: m.messageId,
      conversationId: m.conversationId || conversationId,
      role: m.role.toLowerCase(),
      content: typeof m.content === "string" ? m.content : JSON.stringify(m.content),
      metadata: (m.metadata as Record<string, unknown>) || {},
      createdAt: m.createdAt.toISOString(),
    }));

    return { conversationId, messages, limit, total, hasMore: total > limit };
  }
}
