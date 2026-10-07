/**
 * @file apps/gateway/src/modules/platform/controllers/platform-role.controller.ts
 * @description HTTP controller for platform agent roles.
 * @module apps/gateway/modules/platform/controllers
 */

import { Logger } from "@yuva-devlab/logger";
import { ROUTE_PARAMS } from "@orchestrai/shared-types";
import type { GatewayRequest, GatewayResponse } from "@/routes";
import { sendJson } from "@/routes";
import { PlatformRoleService, type UpsertRoleDto } from "../services/platform-role.service";

/**
 * Controller handling agent roles from database.
 */
export class PlatformRoleController {
  private readonly logger = new Logger("PlatformRoleController");

  public constructor(private readonly service: PlatformRoleService = new PlatformRoleService()) {}

  /**
   * GET /api/v1/roles
   * Retrieves all registered agent roles.
   *
   * @param _req - Gateway HTTP request
   * @param res - Gateway HTTP response
   */
  public async listRoles(_req: GatewayRequest, res: GatewayResponse): Promise<void> {
    this.logger.info("listRoles: querying agent roles");
    const result = await this.service.listRoles();
    sendJson(res, 200, result);
  }

  /**
   * POST /api/v1/roles
   * Registers a new agent role.
   *
   * @param req - Gateway HTTP request with UpsertRoleDto
   * @param res - Gateway HTTP response
   */
  public async createRole(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const dto = req.body as UpsertRoleDto;
    this.logger.info("createRole: creating agent role", { slug: dto.slug, name: dto.name });

    const result = await this.service.createRole(dto);
    sendJson(res, 201, result);
  }

  /**
   * PUT /api/v1/roles/:id
   * Updates an existing agent role.
   *
   * @param req - Gateway HTTP request with role ID param
   * @param res - Gateway HTTP response
   */
  public async updateRole(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const roleId = req.params[ROUTE_PARAMS.ID] ?? "";
    const dto = req.body as Partial<UpsertRoleDto>;
    this.logger.info("updateRole: updating agent role", { roleId });

    const result = await this.service.updateRole(roleId, dto);
    sendJson(res, 200, result);
  }

  /**
   * DELETE /api/v1/roles/:id
   * Deletes an agent role definition.
   *
   * @param req - Gateway HTTP request with role ID param
   * @param res - Gateway HTTP response
   */
  public async deleteRole(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const roleId = req.params[ROUTE_PARAMS.ID] ?? "";
    this.logger.info("deleteRole: deleting agent role", { roleId });

    await this.service.deleteRole(roleId);
    sendJson(res, 200, { success: true, roleId });
  }
}
