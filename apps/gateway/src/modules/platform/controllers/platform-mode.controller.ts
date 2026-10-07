/**
 * @file apps/gateway/src/modules/platform/controllers/platform-mode.controller.ts
 * @description HTTP controller for platform execution mode configuration.
 * @module apps/gateway/modules/platform/controllers
 */

import { Logger } from "@yuva-devlab/logger";
import { ROUTE_PARAMS } from "@orchestrai/shared-types";
import type { GatewayRequest, GatewayResponse } from "@/routes";
import { sendJson } from "@/routes";
import { PlatformModeService, type UpsertModeDto } from "../services/platform-mode.service";

/**
 * Controller handling platform execution modes (Chat, Plan, Act, Auto).
 * Public reads for workspace users; modifications are protected by route-level admin middleware.
 */
export class PlatformModeController {
  private readonly logger = new Logger("PlatformModeController");

  public constructor(private readonly service: PlatformModeService = new PlatformModeService()) {}

  /**
   * GET /api/v1/modes
   * Returns all available execution modes with their approval policies.
   *
   * @param _req - Gateway HTTP request
   * @param res - Gateway HTTP response
   */
  public async listModes(_req: GatewayRequest, res: GatewayResponse): Promise<void> {
    this.logger.info("listModes: querying platform execution modes");
    const result = await this.service.listModes();
    sendJson(res, 200, result);
  }

  /**
   * POST /api/v1/modes
   * Creates a custom execution mode definition.
   *
   * @param req - Gateway HTTP request
   * @param res - Gateway HTTP response
   */
  public async createMode(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const dto = req.body as UpsertModeDto;
    this.logger.info("createMode: creating execution mode", { slug: dto.slug, name: dto.name });

    const result = await this.service.createMode(dto);
    sendJson(res, 201, result);
  }

  /**
   * PUT /api/v1/modes/:id
   * Updates an execution mode's default flag, enablement state, or approval requirements.
   *
   * @param req - Gateway HTTP request
   * @param res - Gateway HTTP response
   */
  public async updateMode(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const modeId = req.params[ROUTE_PARAMS.ID] ?? "";
    const dto = req.body as Partial<UpsertModeDto>;
    this.logger.info("updateMode: updating execution mode", { modeId });

    const result = await this.service.updateMode(modeId, dto);
    sendJson(res, 200, result);
  }

  /**
   * DELETE /api/v1/modes/:id
   * Deletes a custom mode definition.
   *
   * @param req - Gateway HTTP request
   * @param res - Gateway HTTP response
   */
  public async deleteMode(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const modeId = req.params[ROUTE_PARAMS.ID] ?? "";
    this.logger.info("deleteMode: deleting execution mode", { modeId });

    await this.service.deleteMode(modeId);
    sendJson(res, 200, { success: true, modeId });
  }
}
