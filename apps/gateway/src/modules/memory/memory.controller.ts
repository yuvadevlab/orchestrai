/**
 * @file apps/gateway/src/controllers/memory.controller.ts
 * @description HTTP controller mediating episodic and semantic memory management endpoints.
 * @module apps/gateway/controllers
 */

import { sendJson, type GatewayRequest, type GatewayResponse } from "@/routes";
import { memoryService } from "./memory.service";
import { ErrorCode, HttpStatus, ROUTE_PARAMS } from "@orchestrai/shared-types";
import { Logger, loggerWithConfig } from "@yuva-devlab/logger";

const logger = loggerWithConfig(new Logger("MemoryController"));

/**
 * Controller managing memory endpoints for episodic and semantic storage.
 */
export class MemoryController {
  /**
   * Lists stored memory records for the authenticated tenant.
   *
   * @param req - Inbound gateway HTTP request with tenant context.
   * @param res - Outbound gateway HTTP response sending memory list.
   * @returns Promise resolving when HTTP response has been sent.
   */
  public async list(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    logger.info("list: listing tenant memories", {
      tenantId: req.context.tenantId,
    });

    // Retrieve active memory records for tenant
    const memories = await memoryService.listMemories(req.context.tenantId);
    sendJson(res, HttpStatus.OK, { items: memories, total: (memories as unknown[]).length });
  }

  /**
   * Searches memories using semantic and relevance scoring.
   *
   * @param req - Inbound gateway HTTP request containing query string.
   * @param res - Outbound gateway HTTP response sending matched memory results.
   * @returns Promise resolving when HTTP response has been sent.
   */
  public async search(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const body = (req.body || {}) as { query?: string };
    const query = String(body.query || "");

    logger.info("search: searching semantic memories", {
      query,
      tenantId: req.context.tenantId,
    });

    // Execute semantic vector and keyword search
    const results = await memoryService.searchMemories(query, req.context.tenantId);
    sendJson(res, HttpStatus.OK, { items: results, total: (results as unknown[]).length });
  }

  /**
   * Commits an explicit fact or semantic memory directly into storage.
   *
   * @param req - Inbound gateway HTTP request with memory payload.
   * @param res - Outbound gateway HTTP response confirming creation (201 Created).
   * @returns Promise resolving when HTTP response has been sent.
   */
  public async create(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const body = (req.body || {}) as {
      content?: string;
      importanceScore?: number;
      agentId?: string;
    };

    // Guard: Verify content payload is present
    if (!body.content) {
      logger.warn("create: memory content is required");
      sendJson(res, HttpStatus.BAD_REQUEST, {
        error: { code: ErrorCode.VALIDATION_ERROR, message: "Content is required" },
      });
      return;
    }

    logger.info("create: committing fact memory", {
      tenantId: req.context.tenantId,
      agentId: body.agentId,
      importanceScore: body.importanceScore,
    });

    // Store distilled fact in memory tier
    await memoryService.storeFact(
      req.context.tenantId,
      body.agentId || "global",
      body.content,
      body.importanceScore ?? 0.7,
    );
    sendJson(res, HttpStatus.CREATED, { success: true });
  }

  /**
   * Deletes a specific memory record by its identifier.
   *
   * @param req - Inbound gateway HTTP request containing memory ID param.
   * @param res - Outbound gateway HTTP response confirming deletion.
   * @returns Promise resolving when HTTP response has been sent.
   */
  public async delete(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const memoryId = req.params?.[ROUTE_PARAMS.ID];

    // Guard: Validate memory ID parameter
    if (!memoryId) {
      logger.warn("delete: memory ID parameter is required");
      sendJson(res, HttpStatus.BAD_REQUEST, {
        error: { code: ErrorCode.BAD_REQUEST, message: "Memory ID required" },
      });
      return;
    }

    logger.info("delete: removing memory record", { memoryId });

    // Execute memory record deletion
    const success = await memoryService.deleteMemory(memoryId);
    sendJson(res, HttpStatus.OK, { success, memoryId });
  }
}
