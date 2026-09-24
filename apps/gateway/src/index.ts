/**
 * @file apps/gateway/src/index.ts
 * @description Application bootstrap entry point for the OrchestrAI Public API Gateway.
 */

import { Logger, loggerWithConfig } from "@yuva-devlab/logger";
import { loadGatewayConfig } from "@/config";

const logger = loggerWithConfig(new Logger("Gateway"));
import {
  Router,
  registerHealthRoutes,
  registerExecutionRoutes,
  registerConversationRoutes,
  registerAgentRoutes,
  registerRagRoutes,
  registerApprovalRoutes,
  registerAuthRoutes,
  registerLlmProviderRoutes,
  registerLlmModelRoutes,
  registerPlatformModeRoutes,
  registerNavItemRoutes,
  registerPlatformRoleRoutes,
  registerPlatformPermissionRoutes,
  registerPlatformToolRoutes,
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
  logger.info("Bootstrapping OrchestrAI Gateway service...", {
    host: config.gatewayHost,
    port: config.gatewayPort,
  });

  const router = new Router();

  // Register root health probes
  registerHealthRoutes(router);

  // Group all v1 API feature routes under /api/v1 prefix
  router.group("/api/v1", (api) => {
    registerAuthRoutes(api);
    registerExecutionRoutes(api);
    registerConversationRoutes(api);
    registerAgentRoutes(api);
    registerRagRoutes(api);
    registerApprovalRoutes(api);
    // Individual service routes for providers, models, modes, nav items, roles, permissions, tools
    registerLlmProviderRoutes(api);
    registerLlmModelRoutes(api);
    registerPlatformModeRoutes(api);
    registerNavItemRoutes(api);
    registerPlatformRoleRoutes(api);
    registerPlatformPermissionRoutes(api);
    registerPlatformToolRoutes(api);
  });

  const server = new GatewayServer(config, router);

  // Register OS termination signal handlers
  registerProcessLifecycle(server, config.shutdownTimeoutMs);

  await server.start();
  return server;
}

// Auto-start when invoked directly in non-test environments
if (process.env.NODE_ENV !== "test") {
  bootstrap().catch((err) => {
    logger.error("Failed to start gateway server", { error: String(err) });
    process.exit(1);
  });
}
