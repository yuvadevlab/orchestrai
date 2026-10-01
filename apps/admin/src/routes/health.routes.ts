/**
 * @file apps/admin/src/routes/health.routes.ts
 * @description Health probe route handlers for the Operator Control Plane.
 * @module apps/admin/routes
 */

import type { AdminRouter } from "./router";

/**
 * Registers /health and /ready probe routes on the router.
 */
export function registerHealthRoutes(router: AdminRouter): void {
  router.get("/health", (_req, res) => {
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        status: "ok",
        service: "admin",
        uptimeSeconds: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
      }),
    );
  });

  router.get("/ready", (_req, res) => {
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        status: "ready",
        service: "admin",
        timestamp: new Date().toISOString(),
      }),
    );
  });
}
