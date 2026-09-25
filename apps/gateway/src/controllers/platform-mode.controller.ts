/**
 * @file apps/gateway/src/controllers/platform-mode.controller.ts
 * @description HTTP controller for platform execution mode configuration.
 * @module apps/gateway/controllers
 */

import type { GatewayRequest, GatewayResponse } from "@/routes/http-types";
import { sendJson } from "@/routes/http-helpers";
import { PlatformModeService, type UpsertModeDto } from "@/services/platform-mode.service";

/**
 * Controller handling platform execution modes (Chat, Plan, Act, Auto).
 * Public reads for workspace users; modifications are protected by route-level admin middleware.
 */
export class PlatformModeController {
  public constructor(private readonly service: PlatformModeService = new PlatformModeService()) {}

  /**
   * GET /api/v1/modes
   * Returns all available execution modes with their approval policies.
   */
  public async listModes(_req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const result = await this.service.listModes();
    sendJson(res, 200, result);
  }

  /**
   * POST /api/v1/modes
   * Creates a custom execution mode definition.
   */
  public async createMode(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const dto = req.body as UpsertModeDto;
    const result = await this.service.createMode(dto);
    sendJson(res, 201, result);
  }

  /**
   * PUT /api/v1/modes/:id
   * Updates an execution mode's default flag, enablement state, or approval requirements.
   */
  public async updateMode(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const modeId = req.params.id ?? "";
    const dto = req.body as Partial<UpsertModeDto>;
    const result = await this.service.updateMode(modeId, dto);
    sendJson(res, 200, result);
  }

  /**
   * DELETE /api/v1/modes/:id
   * Deletes a custom mode definition.
   */
  public async deleteMode(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const modeId = req.params.id ?? "";
    await this.service.deleteMode(modeId);
    sendJson(res, 200, { success: true, modeId });
  }
}
