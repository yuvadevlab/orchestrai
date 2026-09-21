/**
 * @file apps/gateway/src/routes/execution.route.ts
 * @description REST API routes for dispatching and managing agent executions.
 */

import type { Router } from "./router";
import { ExecutionController } from "@/controllers";

/**
 * Registers execution management routes onto the gateway router.
 *
 * @param router - Gateway router instance
 * @param controller - Execution controller instance
 */
export function registerExecutionRoutes(
  router: Router,
  controller: ExecutionController = new ExecutionController(),
): void {
  router.post("/api/v1/executions", (req, res) => controller.createExecution(req, res));
  router.get("/api/v1/executions", (req, res) => controller.listExecutions(req, res));
  router.get("/api/v1/executions/:id", (req, res) => controller.getExecution(req, res));
  router.post("/api/v1/executions/:id/cancel", (req, res) => controller.cancelExecution(req, res));
  router.post("/api/v1/executions/:id/resume", (req, res) => controller.resumeExecution(req, res));
}
