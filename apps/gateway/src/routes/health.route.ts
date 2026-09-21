/**
 * @file apps/gateway/src/routes/health.route.ts
 * @description Liveness and readiness probe routes delegating to HealthController.
 */

import type { Router } from "./router";
import { HealthController } from "@/controllers";

/**
 * Registers health check endpoints onto the router.
 *
 * @param router - Gateway router instance
 * @param controller - Health controller instance
 */
export function registerHealthRoutes(
  router: Router,
  controller: HealthController = new HealthController(),
): void {
  router.get("/health", (req, res) => controller.getHealth(req, res));
  router.get("/ready", (req, res) => controller.getReady(req, res));
}
