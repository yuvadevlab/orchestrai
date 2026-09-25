/**
 * @file apps/gateway/src/routes/platform-permission.route.ts
 * @description REST API routes for tool permission tiers.
 * @module apps/gateway/routes
 */

import type { RouteGroup } from "./router";
import { PlatformPermissionController } from "@/controllers/platform-permission.controller";
import { withAdmin } from "@/middleware/admin.middleware";

/**
 * Registers platform permission routes on /permissions path.
 */
export function registerPlatformPermissionRoutes(
  api: RouteGroup,
  controller: PlatformPermissionController = new PlatformPermissionController(),
): void {
  api.group("/permissions", (group) => {
    group.get("/", (req, res) => controller.listPermissions(req, res));
    group.post(
      "/",
      withAdmin((req, res) => controller.createPermission(req, res)),
    );
    group.put(
      "/:id",
      withAdmin((req, res) => controller.updatePermission(req, res)),
    );
    group.delete(
      "/:id",
      withAdmin((req, res) => controller.deletePermission(req, res)),
    );
  });
}
