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
import { ConversationService } from "../services/session.service";
import { ErrorCode, HttpStatus, ROUTE_PARAMS } from "@orchestrai/shared-types";
import { Logger, loggerWithConfig } from "@yuva-devlab/logger";

const logger = loggerWithConfig(new Logger("ConversationController"));

/**
 * Controller managing conversation and messaging endpoints with strict tenancy isolation.
 */
export class ConversationController {
  constructor(private readonly service: ConversationService = new ConversationService()) {}

  /**
   * Lists conversations for the current authenticated tenant.
   *
   * @param req - Inbound gateway HTTP request containing tenant context and query parameters.
   * @param res - Outbound gateway HTTP response sending conversation list array.
   * @returns Promise resolving when HTTP response has been sent.
   */
  public async listConversations(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    // Parse and validate query pagination and filtering parameters
    const query = ConversationQuerySchema.parse(parseQueryParams(req.url));
    logger.info("listConversations: listing sessions", {
      tenantId: req.context.tenantId,
      limit: query.limit,
    });

    // Delegate session query to domain service
    const result = await this.service.listConversations(query, req.context.tenantId);
    sendJson(res, HttpStatus.OK, result);
  }

  /**
   * Retrieves a single conversation session by ID.
   *
   * @param req - Inbound gateway HTTP request containing conversationId param and tenant context.
   * @param res - Outbound gateway HTTP response sending conversation entity or 404 error.
   * @returns Promise resolving when HTTP response has been sent.
   */
  public async getConversation(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const conversationId = req.params[ROUTE_PARAMS.ID] || "";
    logger.info("getConversation: fetching session", {
      conversationId,
      tenantId: req.context.tenantId,
    });

    // Fetch conversation record scoped strictly by tenant identifier
    const result = await this.service.getConversation(conversationId, req.context.tenantId);

    // Guard: Return 404 if conversation does not exist or belongs to another tenant
    if (!result) {
      logger.warn("getConversation: session not found", {
        conversationId,
        tenantId: req.context.tenantId,
      });
      sendJson(res, HttpStatus.NOT_FOUND, {
        error: { code: ErrorCode.NOT_FOUND, message: `Conversation ${conversationId} not found` },
      });
      return;
    }

    sendJson(res, HttpStatus.OK, result);
  }

  /**
   * Creates a new conversation session for the authenticated tenant.
   *
   * @param req - Inbound gateway HTTP request with JSON payload conforming to CreateConversationSchema.
   * @param res - Outbound gateway HTTP response sending created conversation entity (201 Created).
   * @returns Promise resolving when HTTP response has been sent.
   */
  public async createConversation(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    // Validate request body against conversation creation schema
    const dto = CreateConversationSchema.parse(req.body);
    logger.info("createConversation: initiating new session", {
      tenantId: req.context.tenantId,
      title: dto.title,
    });

    // Persist new conversation record
    const result = await this.service.createConversation(dto, req.context.tenantId);
    sendJson(res, HttpStatus.CREATED, result);
  }

  /**
   * Updates an existing conversation session's metadata or title.
   *
   * @param req - Inbound gateway HTTP request containing conversation ID and update patch body.
   * @param res - Outbound gateway HTTP response sending updated conversation entity.
   * @returns Promise resolving when HTTP response has been sent.
   */
  public async updateConversation(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const conversationId = req.params[ROUTE_PARAMS.ID] || "";
    // Validate incoming update payload
    const dto = UpdateConversationSchema.parse(req.body);
    logger.info("updateConversation: updating session", {
      conversationId,
      tenantId: req.context.tenantId,
    });

    // Execute update through domain service
    const result = await this.service.updateConversation(conversationId, dto, req.context.tenantId);
    sendJson(res, HttpStatus.OK, result);
  }

  /**
   * Soft-deletes a conversation session for the authenticated tenant.
   *
   * @param req - Inbound gateway HTTP request containing conversation ID.
   * @param res - Outbound gateway HTTP response confirming deletion.
   * @returns Promise resolving when HTTP response has been sent.
   */
  public async deleteConversation(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const conversationId = req.params[ROUTE_PARAMS.ID] || "";
    logger.info("deleteConversation: deleting session", {
      conversationId,
      tenantId: req.context.tenantId,
    });

    // Perform deletion scoped to tenant
    const result = await this.service.deleteConversation(conversationId, req.context.tenantId);
    sendJson(res, HttpStatus.OK, result);
  }

  /**
   * Retrieves paginated messages for a specific conversation session.
   *
   * @param req - Inbound gateway HTTP request containing conversation ID and pagination query.
   * @param res - Outbound gateway HTTP response sending message list.
   * @returns Promise resolving when HTTP response has been sent.
   */
  public async getMessages(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const conversationId = req.params[ROUTE_PARAMS.ID] || "";
    // Parse query params for limit and cursor pagination
    const query = MessageQuerySchema.parse(parseQueryParams(req.url));
    logger.info("getMessages: loading messages", {
      conversationId,
      tenantId: req.context.tenantId,
      limit: query.limit,
    });

    // Fetch conversation message turns
    const result = await this.service.getMessages(conversationId, query, req.context.tenantId);
    sendJson(res, HttpStatus.OK, result);
  }

  /**
   * Appends an inbound message turn to an existing conversation session.
   *
   * @param req - Inbound gateway HTTP request containing conversation ID and message payload.
   * @param res - Outbound gateway HTTP response sending persisted message entity (201 Created).
   * @returns Promise resolving when HTTP response has been sent.
   */
  public async addMessage(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const conversationId = req.params[ROUTE_PARAMS.ID] || "";
    // Validate incoming message structure (role, content, metadata)
    const dto = AddMessageSchema.parse(req.body);
    logger.info("addMessage: appending message turn", {
      conversationId,
      tenantId: req.context.tenantId,
      role: dto.role,
    });

    // Persist message turn and broadcast events
    const result = await this.service.addMessage(conversationId, dto, req.context.tenantId);
    sendJson(res, HttpStatus.CREATED, result);
  }
}
