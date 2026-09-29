/**
 * @file apps/orchestrator/src/index.ts
 * @description Bootstrap entry point for the OrchestrAI Execution Orchestrator microservice.
 * @module apps/orchestrator
 */

import { Logger, loggerWithConfig } from "@yuva-devlab/logger";
import { loadOrchestratorConfig } from "./config";
import { OrchestratorServer, registerProcessLifecycle } from "./server";

const logger = loggerWithConfig(new Logger("OrchestratorBootstrap"));

export * from "./config";
export * from "./server";
export * from "./grpc";
export * from "./runtime";
export * from "./state-machine";
export * from "./checkpointer";
export * from "./publisher";

/**
 * Boots the OrchestrAI Execution Orchestrator process.
 */
export async function bootstrap(): Promise<OrchestratorServer> {
  const config = loadOrchestratorConfig();
  logger.info("Bootstrapping OrchestrAI Execution Orchestrator...", {
    grpcPort: config.grpcPort,
    httpPort: config.httpPort,
  });

  const server = new OrchestratorServer(config);
  registerProcessLifecycle(server, config.shutdownTimeoutMs);
  await server.start();
  return server;
}

if (process.env.NODE_ENV !== "test") {
  bootstrap().catch((err) => {
    logger.error("Failed to start orchestrator process", { error: String(err) });
    process.exit(1);
  });
}
