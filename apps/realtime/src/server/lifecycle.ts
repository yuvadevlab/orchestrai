/**
 * @file apps/realtime/src/server/lifecycle.ts
 * @description Two-stage graceful shutdown coordinator for SIGTERM and SIGINT signals.
 */

import { defaultLogger } from "@orchestrai/logger";
import type { RealtimeServer } from "./realtime-server";

const DRAIN_TIMEOUT_MS = 10_000;

/**
 * Performs graceful shutdown of all realtime server components in ordered stages.
 *
 * @param server - The active RealtimeServer instance to shut down
 */
async function gracefulShutdown(server: RealtimeServer): Promise<void> {
  defaultLogger.info("Graceful shutdown initiated — draining connections...");

  const httpServer = server.getHttpServer();

  // Stage 1: Stop accepting new HTTP and WebSocket connections immediately
  await new Promise<void>((resolve, reject) => {
    if (!httpServer) {
      resolve();
      return;
    }
    httpServer.close((err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });

  // Stage 2: Force-terminate remaining client connections after drain timeout
  const drainTimeout = setTimeout(() => {
    defaultLogger.warn("Drain timeout exceeded — forcibly terminating remaining sessions");
    const sessions = server.registry.getAll();
    for (const session of sessions) {
      session.close(1001, "Server shutting down");
    }
  }, DRAIN_TIMEOUT_MS);

  // Wait for active connections to wind down naturally
  await new Promise<void>((resolve) => {
    const checkEmpty = setInterval(() => {
      if (server.registry.count === 0) {
        clearInterval(checkEmpty);
        clearTimeout(drainTimeout);
        resolve();
      }
    }, 500);
  });

  defaultLogger.info("Graceful shutdown complete");
}

/**
 * Registers process signal handlers (SIGTERM, SIGINT) for deployment lifecycle management.
 *
 * @param server - The active RealtimeServer instance
 */
export function registerProcessLifecycle(server: RealtimeServer): void {
  const shutdown = async (signal: string): Promise<void> => {
    defaultLogger.info(`Received ${signal} — beginning graceful shutdown`);
    try {
      await gracefulShutdown(server);
      process.exit(0);
    } catch (err) {
      defaultLogger.error("Shutdown failed", { error: String(err) });
      process.exit(1);
    }
  };

  // SIGTERM: Sent by Kubernetes, Docker, and process managers for clean termination
  process.on("SIGTERM", () => void shutdown("SIGTERM"));

  // SIGINT: Sent by Ctrl+C in development environments
  process.on("SIGINT", () => void shutdown("SIGINT"));

  process.on("uncaughtException", (err) => {
    defaultLogger.error("Uncaught exception — shutting down", { error: String(err) });
    void shutdown("uncaughtException");
  });

  process.on("unhandledRejection", (reason) => {
    defaultLogger.error("Unhandled promise rejection", { reason: String(reason) });
  });
}
