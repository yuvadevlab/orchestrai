/**
 * @file apps/gateway/src/routes/nav-item.route.ts
 * @description REST API routes for dynamic platform navigation and menu items.
 * @module apps/gateway/routes
 */

import type { RouteGroup } from "./router";
import { NavItemController } from "@/controllers/nav-item.controller";
import { withAdmin } from "@/middleware/admin.middleware";

/**
 * Registers navigation item routes on the /nav path prefix.
 *
 * @param api - Scoped API route group
 * @param controller - Navigation item controller instance
 */
export function registerNavItemRoutes(
  api: RouteGroup,
  controller: NavItemController = new NavItemController(),
): void {
  api.group("/nav", (group) => {
    group.get("/", (req, res) => controller.listNavItems(req, res));
    group.post(
      "/",
      withAdmin((req, res) => controller.createNavItem(req, res)),
    );
    group.put(
      "/:id",
      withAdmin((req, res) => controller.updateNavItem(req, res)),
    );
    group.delete(
      "/:id",
      withAdmin((req, res) => controller.deleteNavItem(req, res)),
    );
  });
}
