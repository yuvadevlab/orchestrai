/**
 * @file apps/gateway/src/modules/platform/controllers/platform-tool.controller.ts
 * @description HTTP controller for platform execution tools.
 * @module apps/gateway/modules/platform/controllers
 */

import { Logger } from "@yuva-devlab/logger";
import { ROUTE_PARAMS } from "@orchestrai/shared-types";
import type { GatewayRequest, GatewayResponse } from "@/routes";
import { sendJson } from "@/routes";
import { PlatformToolService, type UpsertToolDto } from "../services/platform-tool.service";

/**
 * Controller handling execution tools from database.
 */
export class PlatformToolController {
  private readonly logger = new Logger("PlatformToolController");

  public constructor(private readonly service: PlatformToolService = new PlatformToolService()) {}

  /**
   * GET /api/v1/tools
   * Retrieves all registered platform tools.
   *
   * @param _req - Gateway HTTP request
   * @param res - Gateway HTTP response
   */
  public async listTools(_req: GatewayRequest, res: GatewayResponse): Promise<void> {
    this.logger.info("listTools: querying platform tools");
    const result = await this.service.listTools();
    sendJson(res, 200, result);
  }

  /**
   * POST /api/v1/tools
   * Registers a new platform execution tool.
   *
   * @param req - Gateway HTTP request with UpsertToolDto
   * @param res - Gateway HTTP response
   */
  public async createTool(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const dto = req.body as UpsertToolDto;
    this.logger.info("createTool: registering platform tool", { name: dto.name });

    const result = await this.service.createTool(dto);
    sendJson(res, 201, result);
  }

  /**
   * PUT /api/v1/tools/:id
   * Updates an existing platform tool.
   *
   * @param req - Gateway HTTP request with tool ID param
   * @param res - Gateway HTTP response
   */
  public async updateTool(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const toolId = req.params[ROUTE_PARAMS.ID] ?? "";
    const dto = req.body as Partial<UpsertToolDto>;
    this.logger.info("updateTool: updating platform tool", { toolId });

    const result = await this.service.updateTool(toolId, dto);
    sendJson(res, 200, result);
  }

  /**
   * DELETE /api/v1/tools/:id
   * Deletes a tool definition from registry.
   *
   * @param req - Gateway HTTP request with tool ID param
   * @param res - Gateway HTTP response
   */
  public async deleteTool(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const toolId = req.params[ROUTE_PARAMS.ID] ?? "";
    this.logger.info("deleteTool: deleting platform tool", { toolId });

    await this.service.deleteTool(toolId);
    sendJson(res, 200, { success: true, toolId });
  }
}
