/**
 * @file apps/gateway/src/routes/execution.route.ts
 * @description REST API routes for dispatching and managing agent executions.
 */

import type { RouteGroup } from "./router";
import { ExecutionController } from "@/controllers";

/**
 * Registers execution management routes onto the gateway router scoped under /executions.
 *
 * @param api - Scoped API v1 route group instance
 * @param controller - Execution controller instance
 */
export function registerExecutionRoutes(
  api: RouteGroup,
  controller: ExecutionController = new ExecutionController(),
): void {
  api.group("/executions", (group) => {
    group.post("/", (req, res) => controller.createExecution(req, res));
    group.get("/", (req, res) => controller.listExecutions(req, res));
    group.get("/:id", (req, res) => controller.getExecution(req, res));
    group.get("/:id/stream", (req, res) => controller.streamExecution(req, res));
    group.post("/:id/cancel", (req, res) => controller.cancelExecution(req, res));
    group.post("/:id/resume", (req, res) => controller.resumeExecution(req, res));
  });
  api.get("/stream", (req, res) => controller.streamExecution(req, res));
}
