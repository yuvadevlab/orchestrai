/**
 * @file apps/gateway/src/controllers/platform-permission.controller.ts
 * @description HTTP controller for platform permission tiers.
 * @module apps/gateway/controllers
 */

import type { GatewayRequest, GatewayResponse } from "@/routes/http-types";
import { sendJson } from "@/routes/http-helpers";
import {
  PlatformPermissionService,
  type UpsertPermissionDto,
} from "@/services/platform-permission.service";

/**
 * Controller handling tool permission tiers from database.
 */
export class PlatformPermissionController {
  public constructor(
    private readonly service: PlatformPermissionService = new PlatformPermissionService(),
  ) {}

  /**
   * GET /api/v1/permissions
   */
  public async listPermissions(_req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const result = await this.service.listPermissions();
    sendJson(res, 200, result);
  }

  /**
   * POST /api/v1/permissions
   */
  public async createPermission(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const dto = req.body as UpsertPermissionDto;
    const result = await this.service.createPermission(dto);
    sendJson(res, 201, result);
  }

  /**
   * PUT /api/v1/permissions/:id
   */
  public async updatePermission(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const permissionId = req.params.id ?? "";
    const dto = req.body as Partial<UpsertPermissionDto>;
    const result = await this.service.updatePermission(permissionId, dto);
    sendJson(res, 200, result);
  }

  /**
   * DELETE /api/v1/permissions/:id
   */
  public async deletePermission(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const permissionId = req.params.id ?? "";
    await this.service.deletePermission(permissionId);
    sendJson(res, 200, { success: true, permissionId });
  }
}
