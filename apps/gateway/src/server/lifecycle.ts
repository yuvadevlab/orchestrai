/**
 * @file apps/gateway/src/server/lifecycle.ts
 * @description Graceful shutdown coordinator for gateway HTTP service and OS signals.
 */

import { defaultLogger } from "@orchestrai/logger";
import type { GatewayServer } from "./gateway-server";

/**
 * Executes ordered graceful shutdown of gateway server.
 *
 * @param server - The GatewayServer instance to terminate
 * @param timeoutMs - Max duration to wait for in-flight requests to drain
 */
export async function gracefulShutdown(
  server: GatewayServer,
  timeoutMs: number = 10_000,
): Promise<void> {
  defaultLogger.info("Graceful shutdown initiated — draining gateway requests...");

  // 1. Stop accepting new connections
  await server.close();

  // 2. Poll until in-flight requests drain or timeout expires
  const startTime = Date.now();
  await new Promise<void>((resolve) => {
    const interval = setInterval(() => {
      const active = server.getActiveRequests();
      if (active === 0 || Date.now() - startTime >= timeoutMs) {
        clearInterval(interval);
        if (active > 0) {
          defaultLogger.warn("Drain timeout elapsed with remaining active requests", { active });
        }
        resolve();
      }
    }, 100);
  });

  defaultLogger.info("Gateway server shutdown completed cleanly");
}

/**
 * Attaches OS signal listeners for process lifecycle termination.
 *
 * @param server - Running GatewayServer instance
 * @param timeoutMs - Drain timeout in milliseconds
 */
export function registerProcessLifecycle(server: GatewayServer, timeoutMs: number = 10_000): void {
  const shutdown = async (signal: string): Promise<void> => {
    defaultLogger.info(`Gateway received ${signal} — beginning termination`);
    try {
      await gracefulShutdown(server, timeoutMs);
      process.exit(0);
    } catch (err) {
      defaultLogger.error("Error during graceful shutdown", { error: String(err) });
      process.exit(1);
    }
  };

  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("SIGINT", () => void shutdown("SIGINT"));

  process.on("uncaughtException", (err) => {
    defaultLogger.error("Uncaught exception in gateway", { error: String(err) });
    void shutdown("uncaughtException");
  });

  process.on("unhandledRejection", (reason) => {
    defaultLogger.error("Unhandled promise rejection in gateway", { reason: String(reason) });
  });
}
