/**
 * @file apps/gateway/src/controllers/health.controller.ts
 * @description HTTP controller handling liveness and readiness probe requests.
 */

import type { GatewayRequest, GatewayResponse } from "@/routes/http-types";
import { sendJson } from "@/routes/http-helpers";

/**
 * Controller managing health probes.
 */
export class HealthController {
  /**
   * Liveness probe handler.
   */
  public getHealth(_req: GatewayRequest, res: GatewayResponse): void {
    sendJson(res, 200, {
      status: "ok",
      service: "@orchestrai/gateway",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  }

  /**
   * Readiness probe handler.
   */
  public getReady(_req: GatewayRequest, res: GatewayResponse): void {
    sendJson(res, 200, {
      status: "ready",
      service: "@orchestrai/gateway",
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    });
  }
}
