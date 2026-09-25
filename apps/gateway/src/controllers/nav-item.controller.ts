/**
 * @file apps/gateway/src/controllers/nav-item.controller.ts
 * @description HTTP controller for dynamic platform navigation and menu items.
 * @module apps/gateway/controllers
 */

import type { GatewayRequest, GatewayResponse } from "@/routes/http-types";
import { sendJson } from "@/routes/http-helpers";
import { NavItemService, type UpsertNavItemDto } from "@/services/nav-item.service";

/**
 * Controller handling platform navigation menu items.
 * Public reads for authenticated navigation shells; modifications are protected by route-level admin middleware.
 */
export class NavItemController {
  public constructor(private readonly service: NavItemService = new NavItemService()) {}

  /**
   * GET /api/v1/nav
   * Returns all dynamic navigation items ordered by section and sort order.
   */
  public async listNavItems(_req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const result = await this.service.listNavItems();
    sendJson(res, 200, result);
  }

  /**
   * POST /api/v1/nav
   * Registers a new platform navigation item.
   */
  public async createNavItem(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const dto = req.body as UpsertNavItemDto;
    const result = await this.service.createNavItem(dto);
    sendJson(res, 201, result);
  }

  /**
   * PUT /api/v1/nav/:id
   * Updates an existing navigation item (visibility, order, permissions).
   */
  public async updateNavItem(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const navItemId = req.params.id ?? "";
    const dto = req.body as Partial<UpsertNavItemDto>;
    const result = await this.service.updateNavItem(navItemId, dto);
    sendJson(res, 200, result);
  }

  /**
   * DELETE /api/v1/nav/:id
   * Removes a navigation item.
   */
  public async deleteNavItem(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const navItemId = req.params.id ?? "";
    await this.service.deleteNavItem(navItemId);
    sendJson(res, 200, { success: true, navItemId });
  }
}
