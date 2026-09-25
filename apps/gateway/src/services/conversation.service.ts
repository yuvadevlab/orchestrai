/**
 * @file apps/gateway/src/services/conversation.service.ts
 * @description Domain service for managing multi-turn conversation sessions and message history in PostgreSQL.
 * @module apps/gateway/services
 */

import { getPrismaClient, type PrismaClient, type Prisma } from "@orchestrai/database";
import type {
  CreateConversationDto,
  AddMessageDto,
  MessageQueryDto,
  ConversationQueryDto,
  UpdateConversationDto,
} from "@/validation";
import { resolveDbTenantId, resolveOrCreateDefaultAgent } from "./tenant-resolver";
import {
  ConversationQueryService,
  type ConversationListResult,
  type ConversationWithMessagesRecord,
  type MessageListResult,
} from "./conversation-query.service";
import {
  ConversationMessageService,
  type AppendedMessageRecord,
} from "./conversation-message.service";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface ConversationRecord {
  conversationId: string;
  title: string;
  tenantId: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export type MessageRecord = AppendedMessageRecord;

/**
 * Service orchestrating conversation sessions and message persistence in PostgreSQL.
 */
export class ConversationService {
  private readonly queryService: ConversationQueryService;
  private readonly messageService: ConversationMessageService;

  constructor(
    queryService?: ConversationQueryService,
    messageService?: ConversationMessageService,
  ) {
    this.queryService = queryService || new ConversationQueryService();
    this.messageService = messageService || new ConversationMessageService();
  }

  private get db(): PrismaClient {
    return getPrismaClient();
  }

  /**
   * Lists conversations for the tenant.
   */
  public async listConversations(
    query: ConversationQueryDto,
    tenantId: string,
  ): Promise<ConversationListResult> {
    return this.queryService.listConversations(query, tenantId);
  }

  /**
   * Retrieves a single conversation session by ID.
   */
  public async getConversation(
    conversationId: string,
    tenantId: string,
  ): Promise<ConversationWithMessagesRecord | null> {
    return this.queryService.getConversationById(conversationId, tenantId);
  }

  /**
   * Retrieves messages for a specified conversation from PostgreSQL.
   */
  public async getMessages(
    conversationId: string,
    query: MessageQueryDto,
    tenantId: string,
  ): Promise<MessageListResult> {
    return this.queryService.getMessages(conversationId, query, tenantId);
  }

  /**
   * Creates a new conversation session for the tenant in PostgreSQL.
   */
  public async createConversation(
    dto: CreateConversationDto,
    tenantId: string,
  ): Promise<ConversationRecord> {
    const resolvedTenantId = await resolveDbTenantId(tenantId, this.db);
    const agentId = await resolveOrCreateDefaultAgent(resolvedTenantId, this.db);

    const row = await this.db.conversation.create({
      data: {
        tenantId: resolvedTenantId,
        agentId,
        title: dto.title || "New Conversation",
        metadata: (dto.metadata as Prisma.InputJsonValue) || {},
      },
    });

    return {
      conversationId: row.conversationId,
      title: row.title,
      tenantId: row.tenantId,
      metadata: (row.metadata as Record<string, unknown>) || {},
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  /**
   * Updates conversation metadata or title.
   */
  public async updateConversation(
    conversationId: string,
    dto: UpdateConversationDto,
    tenantId: string,
  ): Promise<ConversationRecord> {
    if (!UUID_REGEX.test(conversationId)) {
      throw new Error(`Invalid conversation UUID: ${conversationId}`);
    }

    const resolvedTenantId = await resolveDbTenantId(tenantId, this.db);
    const row = await this.db.conversation.update({
      where: {
        conversationId,
        tenantId: resolvedTenantId,
      },
      data: {
        ...(dto.title ? { title: dto.title } : {}),
        ...(dto.metadata ? { metadata: dto.metadata as Prisma.InputJsonValue } : {}),
        updatedAt: new Date(),
      },
    });

    return {
      conversationId: row.conversationId,
      title: row.title,
      tenantId: row.tenantId,
      metadata: (row.metadata as Record<string, unknown>) || {},
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  /**
   * Soft-deletes a conversation session.
   */
  public async deleteConversation(
    conversationId: string,
    tenantId: string,
  ): Promise<{ success: boolean; conversationId: string }> {
    if (!UUID_REGEX.test(conversationId)) {
      throw new Error(`Invalid conversation UUID: ${conversationId}`);
    }

    const resolvedTenantId = await resolveDbTenantId(tenantId, this.db);
    await this.db.conversation.update({
      where: {
        conversationId,
        tenantId: resolvedTenantId,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    return {
      success: true,
      conversationId,
    };
  }

  /**
   * Appends an inbound message to the conversation in PostgreSQL.
   */
  public async addMessage(
    conversationId: string,
    dto: AddMessageDto,
    tenantId: string,
  ): Promise<MessageRecord> {
    return this.messageService.addMessage(conversationId, dto, tenantId);
  }
}
