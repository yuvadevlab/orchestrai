/**
 * @file packages/sdk/src/resources/conversations.ts
 * @description Conversation resource managing multi-turn sessions and message histories.
 */

import type { Conversation, Message, PaginatedList } from "@/types";
import { ResourceBase } from "./resource-base";
import { MessageRole } from "@orchestrai/shared-types";

export interface CreateConversationParams {
  title?: string;
  metadata?: Record<string, unknown>;
}

export interface SendMessageParams {
  role?: MessageRole | string;
  content: string;
  metadata?: Record<string, unknown>;
}

/**
 * Resource client for managing conversation sessions and threads.
 */
export class ConversationsResource extends ResourceBase {
  /**
   * Lists active conversation sessions.
   */
  public async list(filter?: {
    limit?: number;
    cursor?: string;
  }): Promise<PaginatedList<Conversation>> {
    return this.http.request<PaginatedList<Conversation>>("/api/v1/conversations", {
      params: filter,
    });
  }

  /**
   * Creates a new conversation session.
   */
  public async create(params: CreateConversationParams = {}): Promise<Conversation> {
    return this.http.request<Conversation>("/api/v1/conversations", {
      method: "POST",
      body: params,
    });
  }

  /**
   * Retrieves messages for an existing conversation.
   */
  public async getMessages(
    conversationId: string,
    query?: { limit?: number; cursor?: string },
  ): Promise<{ conversationId: string; messages: Message[] }> {
    return this.http.request<{ conversationId: string; messages: Message[] }>(
      `/api/v1/conversations/${encodeURIComponent(conversationId)}/messages`,
      { params: query },
    );
  }

  /**
   * Appends a message to an active conversation thread.
   */
  public async sendMessage(conversationId: string, params: SendMessageParams): Promise<Message> {
    return this.http.request<Message>(
      `/api/v1/conversations/${encodeURIComponent(conversationId)}/messages`,
      {
        method: "POST",
        body: {
          role: params.role || MessageRole.USER,
          content: params.content,
          metadata: params.metadata,
        },
      },
    );
  }
}
