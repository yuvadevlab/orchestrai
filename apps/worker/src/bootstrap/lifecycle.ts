/**
 * @file apps/worker/src/bootstrap/lifecycle.ts
 * @description Orchestrates graceful shutdown, signal traps, and unhandled exception safety.
 */

import type { WorkerContainer } from "./container";
import { createLogger } from "@orchestrai/logger";

const logger = createLogger("Lifecycle");

/**
 * Registers OS signal listeners and global crash handlers to ensure zero job corruption on exit.
 *
 * @param container - Active worker service container.
 */
export function registerProcessLifecycle(container: WorkerContainer): void {
  let isShuttingDown = false;

  const initiateShutdown = async (signal: string): Promise<void> => {
    // Guard against multiple simultaneous signals triggering parallel shutdowns
    if (isShuttingDown) {
      logger.warn(`Shutdown already in progress. Ignoring signal: ${signal}`);
      return;
    }

    isShuttingDown = true;
    logger.info(`Received ${signal}. Initiating graceful worker shutdown...`);

    const timeout = setTimeout(() => {
      logger.error(
        `Graceful shutdown timed out after ${container.config.gracefulShutdownTimeoutMs}ms. Forcing exit.`,
      );
      process.exit(1);
    }, container.config.gracefulShutdownTimeoutMs);

    // Unref timeout so it does not hold the Node.js event loop open unnecessarily
    timeout.unref();

    try {
      // 1. Pause workers to prevent picking up new jobs from Redis
      logger.info("Pausing workers to halt new task consumption...");
      await container.workerManager.pauseAll();

      // 2. Await in-flight active jobs and close worker connections
      logger.info("Draining active jobs and stopping workers...");
      await container.shutdown();

      clearTimeout(timeout);
      logger.info("All workers drained and connections closed. Clean exit.");
      process.exit(0);
    } catch (error) {
      clearTimeout(timeout);
      logger.error("Error during graceful shutdown:", error);
      process.exit(1);
    }
  };

  // Traps for standard termination signals
  process.on("SIGTERM", () => void initiateShutdown("SIGTERM"));
  process.on("SIGINT", () => void initiateShutdown("SIGINT"));

  // Global trap for unexpected runtime crashes
  process.on("uncaughtException", (error) => {
    logger.error("FATAL: Uncaught exception in worker process:", error);
    void initiateShutdown("uncaughtException");
  });

  process.on("unhandledRejection", (reason) => {
    logger.error("FATAL: Unhandled promise rejection in worker process:", reason);
    void initiateShutdown("unhandledRejection");
  });
}
