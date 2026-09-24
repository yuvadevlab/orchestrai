/**
 * @file apps/gateway/src/routes/platform-role.route.ts
 * @description REST API routes for platform agent roles.
 * @module apps/gateway/routes
 */

import type { RouteGroup } from "./router";
import { PlatformRoleController } from "@/controllers/platform-role.controller";
import { withAdmin } from "@/middleware/admin.middleware";

/**
 * Registers platform agent role routes on /roles path.
 */
export function registerPlatformRoleRoutes(
  api: RouteGroup,
  controller: PlatformRoleController = new PlatformRoleController(),
): void {
  api.group("/roles", (group) => {
    group.get("/", (req, res) => controller.listRoles(req, res));
    group.post(
      "/",
      withAdmin((req, res) => controller.createRole(req, res)),
    );
    group.put(
      "/:id",
      withAdmin((req, res) => controller.updateRole(req, res)),
    );
    group.delete(
      "/:id",
      withAdmin((req, res) => controller.deleteRole(req, res)),
    );
  });
}
