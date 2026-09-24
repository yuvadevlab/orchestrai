/**
 * @file apps/gateway/src/routes/llm-model.route.ts
 * @description REST API routes for LLM model catalog operations.
 * @module apps/gateway/routes
 */

import type { RouteGroup } from "./router";
import { LlmModelController } from "@/controllers/llm-model.controller";
import { withAdmin } from "@/middleware/admin.middleware";

/**
 * Registers LLM model routes on the /models path prefix.
 *
 * @param api - Scoped API route group
 * @param controller - LLM model controller instance
 */
export function registerLlmModelRoutes(
  api: RouteGroup,
  controller: LlmModelController = new LlmModelController(),
): void {
  api.group("/models", (group) => {
    group.get("/", (req, res) => controller.listModels(req, res));
    group.post(
      "/",
      withAdmin((req, res) => controller.createModel(req, res)),
    );
    group.put(
      "/:id",
      withAdmin((req, res) => controller.updateModel(req, res)),
    );
    group.delete(
      "/:id",
      withAdmin((req, res) => controller.deleteModel(req, res)),
    );
  });
}
