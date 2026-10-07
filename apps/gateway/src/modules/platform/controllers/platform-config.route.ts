/**
 * @file apps/gateway/src/modules/platform/controllers/platform-config.route.ts
 * @description Route registration for dynamic platform configuration, branding, and suggestions.
 * @module apps/gateway/modules/platform/controllers
 */

import type { RouteGroup } from "@/routes/router";
import { PlatformConfigController } from "./platform-config.controller";
import { withAdmin } from "@/middleware/admin.middleware";

/**
 * Registers configuration and suggestions routes.
 *
 * @param api - Scoped API route group
 * @param controller - Controller instance
 */
export function registerPlatformConfigRoutes(
  api: RouteGroup,
  controller: PlatformConfigController = new PlatformConfigController(),
): void {
  // Public suggestions and welcome endpoints for console
  api.get("/suggestions", (req, res) => controller.getSuggestions(req, res));
  api.get("/welcome", (req, res) => controller.getWelcome(req, res));
  api.get("/branding", (req, res) => controller.getBranding(req, res));
  api.get("/tools/categories", (req, res) => controller.getToolCategories(req, res));

  // Configuration namespace routes
  api.group("/config", (group) => {
    group.get("/:namespace/:key", (req, res) => controller.getConfig(req, res));
    group.put(
      "/:namespace/:key",
      withAdmin((req, res) => controller.setConfig(req, res)),
    );
  });
}
