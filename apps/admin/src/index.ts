/**
 * @file apps/admin/src/index.ts
 * @description Application bootstrap entry point for the Operator Control Plane service.
 * @module apps/admin
 */

import { Logger, loggerWithConfig } from "@yuva-devlab/logger";
import { loadAdminConfig } from "./config";
import { AdminServer } from "./server";

const logger = loggerWithConfig(new Logger("AdminBootstrap"));

export * from "./config";
export * from "./context";
export * from "./middleware";
export * from "./services";
export * from "./routes";
export * from "./server";

/**
 * Boots the Operator Control Plane HTTP service.
 */
export async function bootstrap(): Promise<AdminServer> {
  const config = loadAdminConfig();
  const server = new AdminServer(config);

  const shutdown = async (signal: string): Promise<void> => {
    logger.info(`Received ${signal}. Shutting down Admin service gracefully...`);
    const timer = setTimeout(() => {
      logger.error("Admin shutdown timeout exceeded. Terminating forcefully.");
      process.exit(1);
    }, config.shutdownTimeoutMs);

    try {
      await server.stop();
      clearTimeout(timer);
      process.exit(0);
    } catch (err) {
      clearTimeout(timer);
      logger.error("Error during Admin service shutdown", { error: String(err) });
      process.exit(1);
    }
  };

  process.once("SIGTERM", () => void shutdown("SIGTERM"));
  process.once("SIGINT", () => void shutdown("SIGINT"));

  await server.start();
  return server;
}

// Auto-start in non-test runtime environments
if (process.env.NODE_ENV !== "test") {
  bootstrap().catch((err) => {
    logger.error("Failed to start Operator Control Plane", { error: String(err) });
    process.exit(1);
  });
}
