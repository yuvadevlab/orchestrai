/**
 * @file apps/gateway/src/index.ts
 * @description Application bootstrap entry point for the OrchestrAI Public API Gateway.
 */

import { defaultLogger } from "@orchestrai/logger";
import { loadGatewayConfig } from "@/config";
import {
  Router,
  registerHealthRoutes,
  registerExecutionRoutes,
  registerConversationRoutes,
  registerAgentRoutes,
  registerRagRoutes,
  registerApprovalRoutes,
} from "@/routes";
import { GatewayServer, registerProcessLifecycle } from "@/server";

// Re-export all internal modules for test harnesses and downstream programmatic consumption
export * from "./config";
export * from "./context";
export * from "./middleware";
export * from "./validation";
export * from "./services";
export * from "./controllers";
export * from "./routes";
export * from "./server";

/**
 * Bootstraps and launches the OrchestrAI API Gateway process.
 */
export async function bootstrap(): Promise<GatewayServer> {
  const config = loadGatewayConfig();
  defaultLogger.info("Bootstrapping OrchestrAI Gateway service...", {
    host: config.gatewayHost,
    port: config.gatewayPort,
  });

  const router = new Router();

  // Register all subsystem REST route handlers
  registerHealthRoutes(router);
  registerExecutionRoutes(router);
  registerConversationRoutes(router);
  registerAgentRoutes(router);
  registerRagRoutes(router);
  registerApprovalRoutes(router);

  const server = new GatewayServer(config, router);

  // Register OS termination signal handlers
  registerProcessLifecycle(server, config.shutdownTimeoutMs);

  await server.start();
  return server;
}

// Auto-start when invoked directly via Node process
if (require.main === module || process.env.NODE_ENV !== "test") {
  bootstrap().catch((err) => {
    defaultLogger.error("Failed to start gateway server", { error: String(err) });
    process.exit(1);
  });
}
