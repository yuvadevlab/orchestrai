/**
 * @file apps/gateway/src/services/conversation-message.service.ts
 * @description Handles appending messages to conversation threads in PostgreSQL.
 * @module apps/gateway/services
 */

import {
  getPrismaClient,
  type PrismaClient,
  type MessageRole,
  type Prisma,
} from "@orchestrai/database";
import type { AddMessageDto } from "@/validation";
import { resolveDbTenantId, resolveOrCreateDefaultAgent } from "./tenant-resolver";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface AppendedMessageRecord {
  messageId: string;
  conversationId: string;
  role: string;
  content: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

/**
 * Service managing insertion of messages into active conversation threads.
 */
export class ConversationMessageService {
  private get db(): PrismaClient {
    return getPrismaClient();
  }

  /**
   * Appends an inbound message to the conversation in PostgreSQL.
   */
  public async addMessage(
    conversationId: string,
    dto: AddMessageDto,
    tenantId: string,
  ): Promise<AppendedMessageRecord> {
    const resolvedTenantId = await resolveDbTenantId(tenantId, this.db);

    let conv = UUID_REGEX.test(conversationId)
      ? await this.db.conversation.findUnique({
          where: { conversationId },
        })
      : null;

    if (!conv) {
      const agentId = await resolveOrCreateDefaultAgent(resolvedTenantId, this.db);
      conv = await this.db.conversation.create({
        data: {
          ...(UUID_REGEX.test(conversationId) ? { conversationId } : {}),
          tenantId: resolvedTenantId,
          agentId,
          title: "Active Session",
        },
      });
    }

    let exec = await this.db.execution.findFirst({
      where: { conversationId: conv.conversationId },
    });

    if (!exec) {
      exec = await this.db.execution.create({
        data: {
          tenantId: resolvedTenantId,
          agentId: conv.agentId,
          conversationId: conv.conversationId,
          traceId: `tr_${Date.now()}`,
          status: "completed",
        },
      });
    }

    const row = await this.db.message.create({
      data: {
        executionId: exec.executionId,
        conversationId: conv.conversationId,
        role: dto.role.toLowerCase() as MessageRole,
        content: dto.content,
        metadata: (dto.metadata as Prisma.InputJsonValue) || {},
      },
    });

    await this.db.conversation.update({
      where: { conversationId: conv.conversationId },
      data: { updatedAt: new Date() },
    });

    return {
      messageId: row.messageId,
      conversationId: conv.conversationId,
      role: row.role.toLowerCase(),
      content: typeof row.content === "string" ? row.content : JSON.stringify(row.content),
      metadata: (row.metadata as Record<string, unknown>) || {},
      createdAt: row.createdAt.toISOString(),
    };
  }
}
