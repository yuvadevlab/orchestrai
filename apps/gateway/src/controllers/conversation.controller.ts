/**
 * @file apps/gateway/src/controllers/conversation.controller.ts
 * @description HTTP controller mediating conversation and message requests.
 */

import type { GatewayRequest, GatewayResponse } from "@/routes/http-types";
import { sendJson, parseQueryParams } from "@/routes/http-helpers";
import { CreateConversationSchema, AddMessageSchema, MessageQuerySchema } from "@/validation";
import { ConversationService } from "@/services";

/**
 * Controller managing conversation and messaging endpoints.
 */
export class ConversationController {
  constructor(private readonly service: ConversationService = new ConversationService()) {}

  /**
   * Creates a new conversation session.
   */
  public async createConversation(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const dto = CreateConversationSchema.parse(req.body);
    const result = await this.service.createConversation(dto, req.context.tenantId);
    sendJson(res, 201, result);
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
