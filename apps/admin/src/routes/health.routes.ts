/**
 * @file apps/admin/src/routes/health.routes.ts
 * @description Health probe route handlers for the Operator Control Plane.
 * @module apps/admin/routes
 */

import { Logger } from "@yuva-devlab/logger";
import { ADMIN_ROUTES, HealthStatus } from "@orchestrai/shared-types";
import type { AdminRouter } from "./router";

const logger = new Logger("HealthRoutes");

/**
 * Registers /health and /ready probe routes on the router.
 *
 * @param router - Admin router instance
 */
export function registerHealthRoutes(router: AdminRouter): void {
  router.get(ADMIN_ROUTES.HEALTH, (_req, res) => {
    logger.debug("health: liveness probe checked");
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        status: HealthStatus.OK,
        service: "admin",
        uptimeSeconds: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
      }),
    );
  });

  router.get(ADMIN_ROUTES.READY, (_req, res) => {
    logger.debug("ready: readiness probe checked");
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        status: HealthStatus.READY,
        service: "admin",
        timestamp: new Date().toISOString(),
      }),
    );
  });
}
