/**
 * @file apps/gateway/src/modules/platform/controllers/platform-command.route.ts
 * @description REST API routes for platform slash commands.
 * @module apps/gateway/modules/platform/controllers
 */

import type { RouteGroup } from "@/routes/router";
import { PlatformCommandController } from "./platform-command.controller";
import { withAdmin } from "@/middleware/admin.middleware";

/**
 * Registers platform slash command routes on the /commands path prefix.
 *
 * @param api - Scoped API route group
 * @param controller - Platform command controller instance
 */
export function registerPlatformCommandRoutes(
  api: RouteGroup,
  controller: PlatformCommandController = new PlatformCommandController(),
): void {
  api.group("/commands", (group) => {
    // Read available commands
    group.get("/", (req, res) => controller.listCommands(req, res));

    // Admin protected routes for modifying commands
    group.post(
      "/",
      withAdmin((req, res) => controller.createCommand(req, res)),
    );
    group.put(
      "/:id",
      withAdmin((req, res) => controller.updateCommand(req, res)),
    );
    group.delete(
      "/:id",
      withAdmin((req, res) => controller.deleteCommand(req, res)),
    );
  });
}
