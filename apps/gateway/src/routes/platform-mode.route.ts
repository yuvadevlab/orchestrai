/**
 * @file apps/gateway/src/routes/platform-mode.route.ts
 * @description REST API routes for platform execution mode configuration.
 * @module apps/gateway/routes
 */

import type { RouteGroup } from "./router";
import { PlatformModeController } from "@/controllers/platform-mode.controller";
import { withAdmin } from "@/middleware/admin.middleware";

/**
 * Registers platform execution mode routes on the /modes path prefix.
 *
 * @param api - Scoped API route group
 * @param controller - Platform mode controller instance
 */
export function registerPlatformModeRoutes(
  api: RouteGroup,
  controller: PlatformModeController = new PlatformModeController(),
): void {
  api.group("/modes", (group) => {
    group.get("/", (req, res) => controller.listModes(req, res));
    group.post(
      "/",
      withAdmin((req, res) => controller.createMode(req, res)),
    );
    group.put(
      "/:id",
      withAdmin((req, res) => controller.updateMode(req, res)),
    );
    group.delete(
      "/:id",
      withAdmin((req, res) => controller.deleteMode(req, res)),
    );
  });
}
