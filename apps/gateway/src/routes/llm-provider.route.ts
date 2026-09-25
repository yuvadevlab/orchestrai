/**
 * @file apps/gateway/src/routes/llm-provider.route.ts
 * @description REST API routes for LLM provider registry operations.
 * @module apps/gateway/routes
 */

import type { RouteGroup } from "./router";
import { LlmProviderController } from "@/controllers/llm-provider.controller";
import { withAdmin } from "@/middleware/admin.middleware";

/**
 * Registers LLM provider routes on the /providers path prefix.
 *
 * @param api - Scoped API route group
 * @param controller - LLM provider controller instance
 */
export function registerLlmProviderRoutes(
  api: RouteGroup,
  controller: LlmProviderController = new LlmProviderController(),
): void {
  api.group("/providers", (group) => {
    group.get("/", (req, res) => controller.listProviders(req, res));
    group.post(
      "/",
      withAdmin((req, res) => controller.createProvider(req, res)),
    );
    group.put(
      "/:id",
      withAdmin((req, res) => controller.updateProvider(req, res)),
    );
    group.delete(
      "/:id",
      withAdmin((req, res) => controller.deleteProvider(req, res)),
    );
  });
}
