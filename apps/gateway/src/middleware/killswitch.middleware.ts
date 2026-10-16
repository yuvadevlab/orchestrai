/**
 * @file apps/gateway/src/middleware/killswitch.middleware.ts
 * @description Distributed kill-switch rail synchronizing with DevLab Portal over Redis Pub/Sub.
 * Intercepts requests when OrchestrAI is deactivated from the central control plane.
 * @module apps/gateway/middleware/killswitch
 */

import { Redis } from "ioredis";
import { Logger, loggerWithConfig } from "@yuva-devlab/logger";
import type { GatewayRequest, GatewayResponse } from "@/routes";

const logger = loggerWithConfig(new Logger("KillSwitchMiddleware"));

interface AppStatePayload {
  appId: string;
  name: string;
  isActive: boolean;
  maintenanceNote?: string | null;
}

let isAppActive = true;
let maintenanceNote: string | null = null;
let subscriber: Redis | null = null;

/**
 * Initializes Redis Pub/Sub listener for control plane kill-switch events.
 *
 * @param redisUrl Redis connection URI
 */
export async function initKillSwitchSubscriber(redisUrl?: string): Promise<void> {
  const url = redisUrl || process.env.REDIS_URL;
  if (!url) {
    logger.debug("No REDIS_URL configured; kill-switch rail running in local standalone mode");
    return;
  }

  try {
    subscriber = new Redis(url, { lazyConnect: true, maxRetriesPerRequest: 3 });
    await subscriber.connect();

    await subscriber.subscribe("app.state.changed");
    subscriber.on("message", (channel: string, message: string) => {
      if (channel !== "app.state.changed") return;

      try {
        const payload = JSON.parse(message) as AppStatePayload;
        // Check if event targets orchestrai or global kill-switch
        if (payload.appId === "orchestrai" || payload.appId === "*") {
          isAppActive = payload.isActive;
          maintenanceNote = payload.maintenanceNote || null;

          logger.warn("Kill-switch state updated via DevLab Portal", {
            isActive: isAppActive,
            maintenanceNote,
          });
        }
      } catch (err) {
        logger.error("Failed to parse kill-switch payload", err);
      }
    });

    logger.info("Subscribed to Redis kill-switch rail on channel 'app.state.changed'");
  } catch (err) {
    logger.warn("Could not connect Redis kill-switch subscriber; continuing in active state", {
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

/**
 * Evaluates whether inbound request should be blocked due to an active kill-switch.
 *
 * @param req Inbound gateway request
 * @param res Outbound gateway response
 * @returns boolean True if request was blocked and handled with 503, false to proceed
 */
export function handleKillSwitch(req: GatewayRequest, res: GatewayResponse): boolean {
  // Allow health check and probe endpoints even when under maintenance
  const url = req.url || "";
  if (url.startsWith("/health") || url.startsWith("/api/v1/health")) {
    return false;
  }

  if (!isAppActive) {
    logger.warn("Request blocked by active kill-switch", { url: req.url });
    res.writeHead(503, {
      "Content-Type": "application/json",
      "Retry-After": "30",
    });
    res.end(
      JSON.stringify({
        error: "Service Unavailable",
        code: "APP_MAINTENANCE",
        message: maintenanceNote || "OrchestrAI is temporarily offline for maintenance.",
        status: 503,
      }),
    );
    return true;
  }

  return false;
}

/**
 * Manually updates local kill-switch state (used by internal tests and admin triggers).
 */
export function setLocalKillSwitch(active: boolean, note?: string): void {
  isAppActive = active;
  maintenanceNote = note || null;
}
