/**
 * @file apps/gateway/src/controllers/platform-role.controller.ts
 * @description HTTP controller for platform agent roles.
 * @module apps/gateway/controllers
 */

import type { GatewayRequest, GatewayResponse } from "@/routes/http-types";
import { sendJson } from "@/routes/http-helpers";
import { PlatformRoleService, type UpsertRoleDto } from "@/services/platform-role.service";

/**
 * Controller handling agent roles from database.
 */
export class PlatformRoleController {
  public constructor(private readonly service: PlatformRoleService = new PlatformRoleService()) {}

  /**
   * GET /api/v1/roles
   */
  public async listRoles(_req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const result = await this.service.listRoles();
    sendJson(res, 200, result);
  }

  /**
   * POST /api/v1/roles
   */
  public async createRole(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const dto = req.body as UpsertRoleDto;
    const result = await this.service.createRole(dto);
    sendJson(res, 201, result);
  }

  /**
   * PUT /api/v1/roles/:id
   */
  public async updateRole(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const roleId = req.params.id ?? "";
    const dto = req.body as Partial<UpsertRoleDto>;
    const result = await this.service.updateRole(roleId, dto);
    sendJson(res, 200, result);
  }

  /**
   * DELETE /api/v1/roles/:id
   */
  public async deleteRole(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const roleId = req.params.id ?? "";
    await this.service.deleteRole(roleId);
    sendJson(res, 200, { success: true, roleId });
  }
}
