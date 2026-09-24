/**
 * @file apps/gateway/src/services/conversation.service.ts
 * @description Domain service for managing multi-turn conversation sessions and message history in PostgreSQL.
 * @module apps/gateway/services
 */

import {
  getPrismaClient,
  type PrismaClient,
  type MessageRole,
  type Prisma,
} from "@orchestrai/database";
import type { CreateConversationDto, AddMessageDto, MessageQueryDto } from "@/validation";
import { resolveDbTenantId } from "./tenant-resolver";

export interface ConversationRecord {
  conversationId: string;
  title: string;
  tenantId: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface MessageRecord {
  messageId: string;
  conversationId: string;
  role: string;
  content: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface MessageListResult {
  conversationId: string;
  messages: MessageRecord[];
  limit: number;
  total: number;
  hasMore: boolean;
}

/**
 * Service orchestrating conversation sessions and message appending in PostgreSQL.
 */
export class ConversationService {
  private get db(): PrismaClient {
    return getPrismaClient();
  }

  /**
   * Creates a new conversation session for the tenant in PostgreSQL.
   */
  public async createConversation(
    dto: CreateConversationDto,
    tenantId: string,
  ): Promise<ConversationRecord> {
    const resolvedTenantId = await resolveDbTenantId(tenantId, this.db);

    // Look for existing active agent or first tenant agent
    let agent = await this.db.agent.findFirst({
      where: { tenantId: resolvedTenantId, deletedAt: null },
    });

    if (!agent) {
      agent = await this.db.agent.create({
        data: {
          tenantId: resolvedTenantId,
          name: "Supervisor Orchestrator",
          systemPrompt: "You are the OrchestrAI Supervisor.",
          modelConfig: { model: "gemma4:31b-cloud" },
        },
      });
    }

    const row = await this.db.conversation.create({
      data: {
        tenantId: resolvedTenantId,
        agentId: agent.agentId,
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
   * Retrieves messages for a specified conversation from PostgreSQL.
   */
  public async getMessages(
    conversationId: string,
    query: MessageQueryDto,
    _tenantId: string,
  ): Promise<MessageListResult> {
    const limit = query.limit || 50;
    const rows = await this.db.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
      take: limit,
    });

    const total = await this.db.message.count({
      where: { conversationId },
    });

    const messages: MessageRecord[] = rows.map((m) => ({
      messageId: m.messageId,
      conversationId: m.conversationId || conversationId,
      role: m.role.toLowerCase(),
      content: typeof m.content === "string" ? m.content : JSON.stringify(m.content),
      metadata: (m.metadata as Record<string, unknown>) || {},
      createdAt: m.createdAt.toISOString(),
    }));

    return {
      conversationId,
      messages,
      limit,
      total,
      hasMore: total > limit,
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
    const resolvedTenantId = await resolveDbTenantId(tenantId, this.db);

    // Ensure conversation exists or create draft conversation
    let conv = await this.db.conversation.findUnique({
      where: { conversationId },
    });

    if (!conv) {
      let agent = await this.db.agent.findFirst({
        where: { tenantId: resolvedTenantId, deletedAt: null },
      });
      if (!agent) {
        agent = await this.db.agent.create({
          data: {
            tenantId: resolvedTenantId,
            name: "Lead Orchestrator",
            systemPrompt: "You are the Lead Orchestrator.",
            modelConfig: { model: "gemma4:31b-cloud" },
          },
        });
      }

      conv = await this.db.conversation.create({
        data: {
          conversationId,
          tenantId: resolvedTenantId,
          agentId: agent.agentId,
          title: "Active Session",
        },
      });
    }

    // Ensure dummy execution exists to satisfy foreign key constraint on messages
    let exec = await this.db.execution.findFirst({
      where: { conversationId },
    });

    if (!exec) {
      exec = await this.db.execution.create({
        data: {
          tenantId: resolvedTenantId,
          agentId: conv.agentId,
          conversationId,
          traceId: `tr_${Date.now()}`,
          status: "completed",
        },
      });
    }

    const row = await this.db.message.create({
      data: {
        executionId: exec.executionId,
        conversationId,
        role: dto.role.toLowerCase() as MessageRole,
        content: dto.content,
        metadata: (dto.metadata as Prisma.InputJsonValue) || {},
      },
    });

    return {
      messageId: row.messageId,
      conversationId,
      role: row.role.toLowerCase(),
      content: typeof row.content === "string" ? row.content : JSON.stringify(row.content),
      metadata: (row.metadata as Record<string, unknown>) || {},
      createdAt: row.createdAt.toISOString(),
    };
  }
}
