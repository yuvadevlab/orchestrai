/**
 * @file apps/gateway/src/routes/platform-tool.route.ts
 * @description REST API routes for execution tools.
 * @module apps/gateway/routes
 */

import type { RouteGroup } from "./router";
import { PlatformToolController } from "@/controllers/platform-tool.controller";
import { withAdmin } from "@/middleware/admin.middleware";

/**
 * Registers platform execution tool routes on /tools path.
 */
export function registerPlatformToolRoutes(
  api: RouteGroup,
  controller: PlatformToolController = new PlatformToolController(),
): void {
  api.group("/tools", (group) => {
    group.get("/", (req, res) => controller.listTools(req, res));
    group.post(
      "/",
      withAdmin((req, res) => controller.createTool(req, res)),
    );
    group.put(
      "/:id",
      withAdmin((req, res) => controller.updateTool(req, res)),
    );
    group.delete(
      "/:id",
      withAdmin((req, res) => controller.deleteTool(req, res)),
    );
  });
}
