/**
 * @file apps/gateway/src/controllers/platform-tool.controller.ts
 * @description HTTP controller for platform execution tools.
 * @module apps/gateway/controllers
 */

import type { GatewayRequest, GatewayResponse } from "@/routes/http-types";
import { sendJson } from "@/routes/http-helpers";
import { PlatformToolService, type UpsertToolDto } from "@/services/platform-tool.service";

/**
 * Controller handling execution tools from database.
 */
export class PlatformToolController {
  public constructor(private readonly service: PlatformToolService = new PlatformToolService()) {}

  /**
   * GET /api/v1/tools
   */
  public async listTools(_req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const result = await this.service.listTools();
    sendJson(res, 200, result);
  }

  /**
   * POST /api/v1/tools
   */
  public async createTool(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const dto = req.body as UpsertToolDto;
    const result = await this.service.createTool(dto);
    sendJson(res, 201, result);
  }

  /**
   * PUT /api/v1/tools/:id
   */
  public async updateTool(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const toolId = req.params.id ?? "";
    const dto = req.body as Partial<UpsertToolDto>;
    const result = await this.service.updateTool(toolId, dto);
    sendJson(res, 200, result);
  }

  /**
   * DELETE /api/v1/tools/:id
   */
  public async deleteTool(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const toolId = req.params.id ?? "";
    await this.service.deleteTool(toolId);
    sendJson(res, 200, { success: true, toolId });
  }
}
