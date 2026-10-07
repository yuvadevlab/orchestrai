/**
 * @file apps/gateway/src/controllers/health.controller.ts
 * @description HTTP controller handling liveness and readiness probe requests.
 */

import type { GatewayRequest, GatewayResponse } from "@/routes/http-types";
import { sendJson } from "@/routes/http-helpers";
import { Logger, loggerWithConfig } from "@yuva-devlab/logger";
import { HealthStatus } from "@orchestrai/shared-types";

const logger = loggerWithConfig(new Logger("HealthController"));

/**
 * Controller managing service health, readiness, and liveness probe requests.
 */
export class HealthController {
  /**
   * Liveness probe handler verifying process responsiveness.
   *
   * @param _req - Inbound gateway HTTP request.
   * @param res - Outbound gateway HTTP response sending 200 OK health status.
   */
  public getHealth(_req: GatewayRequest, res: GatewayResponse): void {
    logger.debug("getHealth: processing liveness probe");
    sendJson(res, 200, {
      status: HealthStatus.OK,
      service: "@orchestrai/gateway",
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Readiness probe handler verifying dependencies and operational state.
   *
   * @param _req - Inbound gateway HTTP request.
   * @param res - Outbound gateway HTTP response sending readiness uptime payload.
   */
  public getReady(_req: GatewayRequest, res: GatewayResponse): void {
    logger.debug("getReady: processing readiness probe");
    // Calculate process uptime in seconds
    const uptimeSeconds = Math.floor(process.uptime());
    sendJson(res, 200, {
      status: HealthStatus.READY,
      service: "@orchestrai/gateway",
      uptimeSeconds,
      timestamp: new Date().toISOString(),
    });
  }
}
