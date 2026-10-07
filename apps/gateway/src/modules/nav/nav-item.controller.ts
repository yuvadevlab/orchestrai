/**
 * @file apps/gateway/src/controllers/nav-item.controller.ts
 * @description HTTP controller for dynamic platform navigation and menu items.
 * @module apps/gateway/controllers
 */

import type { GatewayRequest, GatewayResponse } from "@/routes/http-types";
import { sendJson } from "@/routes/http-helpers";
import { NavItemService, type UpsertNavItemDto } from "@/modules/nav/nav-item.service";
import { ROUTE_PARAMS } from "@orchestrai/shared-types";
import { Logger, loggerWithConfig } from "@yuva-devlab/logger";

const logger = loggerWithConfig(new Logger("NavItemController"));

/**
 * Controller handling platform navigation menu items.
 * Public reads for authenticated navigation shells; modifications are protected by route-level admin middleware.
 */
export class NavItemController {
  public constructor(private readonly service: NavItemService = new NavItemService()) {}

  /**
   * Returns all dynamic navigation items ordered by section and sort order.
   *
   * @param _req - Inbound gateway HTTP request.
   * @param res - Outbound gateway HTTP response sending navigation items array.
   * @returns Promise resolving when HTTP response has been sent.
   */
  public async listNavItems(_req: GatewayRequest, res: GatewayResponse): Promise<void> {
    logger.info("listNavItems: retrieving navigation items");
    // Fetch all active navigation links from database catalog
    const result = await this.service.listNavItems();
    sendJson(res, 200, result);
  }

  /**
   * Registers a new platform navigation item.
   *
   * @param req - Inbound gateway HTTP request containing UpsertNavItemDto payload.
   * @param res - Outbound gateway HTTP response delivering created item (201 Created).
   * @returns Promise resolving when HTTP response has been sent.
   */
  public async createNavItem(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const dto = req.body as UpsertNavItemDto;
    logger.info("createNavItem: registering new navigation item", {
      label: dto.label,
      href: dto.href,
      section: dto.section,
    });

    // Delegate persistence to NavItemService
    const result = await this.service.createNavItem(dto);
    sendJson(res, 201, result);
  }

  /**
   * Updates an existing navigation item (visibility, order, permissions).
   *
   * @param req - Inbound gateway HTTP request containing navItemId param and patch body.
   * @param res - Outbound gateway HTTP response sending updated item.
   * @returns Promise resolving when HTTP response has been sent.
   */
  public async updateNavItem(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const navItemId = req.params[ROUTE_PARAMS.ID] ?? "";
    const dto = req.body as Partial<UpsertNavItemDto>;
    logger.info("updateNavItem: updating navigation item", { navItemId });

    // Apply patch mutations to navigation record
    const result = await this.service.updateNavItem(navItemId, dto);
    sendJson(res, 200, result);
  }

  /**
   * Removes a navigation item from the platform catalog.
   *
   * @param req - Inbound gateway HTTP request containing navItemId param.
   * @param res - Outbound gateway HTTP response confirming deletion.
   * @returns Promise resolving when HTTP response has been sent.
   */
  public async deleteNavItem(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const navItemId = req.params[ROUTE_PARAMS.ID] ?? "";
    logger.info("deleteNavItem: removing navigation item", { navItemId });

    // Remove navigation item from database
    await this.service.deleteNavItem(navItemId);
    sendJson(res, 200, { success: true, navItemId });
  }
}
