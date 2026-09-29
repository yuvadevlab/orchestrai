/**
 * @file apps/gateway/src/controllers/conversation.controller.ts
 * @description HTTP controller mediating conversation and message requests.
 * @module apps/gateway/controllers
 */

import type { GatewayRequest, GatewayResponse } from "@/routes/http-types";
import { sendJson, parseQueryParams } from "@/routes/http-helpers";
import {
  CreateConversationSchema,
  AddMessageSchema,
  MessageQuerySchema,
  ConversationQuerySchema,
  UpdateConversationSchema,
} from "@/validation";
import { ConversationService } from "@/services";

/**
 * Controller managing conversation and messaging endpoints.
 */
export class ConversationController {
  constructor(private readonly service: ConversationService = new ConversationService()) {}

  /**
   * Lists conversations for the current tenant.
   */
  public async listConversations(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const query = ConversationQuerySchema.parse(parseQueryParams(req.url));
    const result = await this.service.listConversations(query, req.context.tenantId);
    sendJson(res, 200, result);
  }

  /**
   * Retrieves a single conversation by ID.
   */
  public async getConversation(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const conversationId = req.params.id || "";
    const result = await this.service.getConversation(conversationId, req.context.tenantId);
    if (!result) {
      sendJson(res, 404, {
        error: { code: "NOT_FOUND", message: `Conversation ${conversationId} not found` },
      });
      return;
    }
    sendJson(res, 200, result);
  }

  /**
   * Creates a new conversation session.
   */
  public async createConversation(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const dto = CreateConversationSchema.parse(req.body);
    const result = await this.service.createConversation(dto, req.context.tenantId);
    sendJson(res, 201, result);
  }

  /**
   * Updates an existing conversation.
   */
  public async updateConversation(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const conversationId = req.params.id || "";
    const dto = UpdateConversationSchema.parse(req.body);
    const result = await this.service.updateConversation(conversationId, dto, req.context.tenantId);
    sendJson(res, 200, result);
  }

  /**
   * Soft-deletes a conversation.
   */
  public async deleteConversation(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const conversationId = req.params.id || "";
    const result = await this.service.deleteConversation(conversationId, req.context.tenantId);
    sendJson(res, 200, result);
  }

  /**
   * Retrieves messages for a conversation.
   */
  public async getMessages(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const conversationId = req.params.id || "";
    const query = MessageQuerySchema.parse(parseQueryParams(req.url));
    const result = await this.service.getMessages(conversationId, query, req.context.tenantId);
    sendJson(res, 200, result);
  }

  /**
   * Appends a message to a conversation.
   */
  public async addMessage(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const conversationId = req.params.id || "";
    const dto = AddMessageSchema.parse(req.body);
    const result = await this.service.addMessage(conversationId, dto, req.context.tenantId);
    sendJson(res, 201, result);
  }
}
