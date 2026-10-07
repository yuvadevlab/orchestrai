/**
 * @file apps/gateway/src/modules/platform/controllers/platform-permission.controller.ts
 * @description HTTP controller for platform permission tiers.
 * @module apps/gateway/modules/platform/controllers
 */

import { Logger } from "@yuva-devlab/logger";
import { ROUTE_PARAMS } from "@orchestrai/shared-types";
import type { GatewayRequest, GatewayResponse } from "@/routes";
import { sendJson } from "@/routes";
import {
  PlatformPermissionService,
  type UpsertPermissionDto,
} from "../services/platform-permission.service";

/**
 * Controller handling tool permission tiers from database.
 */
export class PlatformPermissionController {
  private readonly logger = new Logger("PlatformPermissionController");

  public constructor(
    private readonly service: PlatformPermissionService = new PlatformPermissionService(),
  ) {}

  /**
   * GET /api/v1/permissions
   * Retrieves all registered tool permission tiers.
   *
   * @param _req - Gateway HTTP request
   * @param res - Gateway HTTP response
   */
  public async listPermissions(_req: GatewayRequest, res: GatewayResponse): Promise<void> {
    this.logger.info("listPermissions: querying tool permission tiers");
    const result = await this.service.listPermissions();
    sendJson(res, 200, result);
  }

  /**
   * POST /api/v1/permissions
   * Registers a new platform permission tier.
   *
   * @param req - Gateway HTTP request with UpsertPermissionDto
   * @param res - Gateway HTTP response
   */
  public async createPermission(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const dto = req.body as UpsertPermissionDto;
    this.logger.info("createPermission: creating permission tier", { level: dto.level });

    const result = await this.service.createPermission(dto);
    sendJson(res, 201, result);
  }

  /**
   * PUT /api/v1/permissions/:id
   * Updates an existing platform permission tier.
   *
   * @param req - Gateway HTTP request with permission ID param
   * @param res - Gateway HTTP response
   */
  public async updatePermission(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const permissionId = req.params[ROUTE_PARAMS.ID] ?? "";
    const dto = req.body as Partial<UpsertPermissionDto>;
    this.logger.info("updatePermission: updating permission tier", { permissionId });

    const result = await this.service.updatePermission(permissionId, dto);
    sendJson(res, 200, result);
  }

  /**
   * DELETE /api/v1/permissions/:id
   * Deletes a custom permission tier definition.
   *
   * @param req - Gateway HTTP request with permission ID param
   * @param res - Gateway HTTP response
   */
  public async deletePermission(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const permissionId = req.params[ROUTE_PARAMS.ID] ?? "";
    this.logger.info("deletePermission: deleting permission tier", { permissionId });

    await this.service.deletePermission(permissionId);
    sendJson(res, 200, { success: true, permissionId });
  }
}
