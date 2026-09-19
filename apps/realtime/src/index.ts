/**
 * @file apps/realtime/src/index.ts
 * @description Application entrypoint for the OrchestrAI Realtime Streaming Broker.
 * Bootstraps configuration, starts all server components, and registers process lifecycle hooks.
 */

import "dotenv/config";
import { defaultLogger } from "@orchestrai/logger";
import { loadRealtimeConfig } from "./config/realtime-config";
import { RealtimeServer } from "./server/realtime-server";
import { registerProcessLifecycle } from "./server/lifecycle";

/**
 * Bootstrap function: initializes and starts the complete realtime streaming service.
 */
async function bootstrap(): Promise<void> {
  // 1. Load and validate configuration from environment
  const config = loadRealtimeConfig(process.env as Record<string, string | undefined>);

  defaultLogger.info("Starting OrchestrAI Realtime Streaming Broker", {
    port: config.port,
    host: config.host,
    env: config.nodeEnv,
    redisUrl: config.redisUrl,
  });

  // 2. Instantiate the master realtime server coordinator
  const server = new RealtimeServer(config);

  // 3. Register process lifecycle signal handlers before starting
  registerProcessLifecycle(server);

  // 4. Start all services: Redis broker, HTTP server, WebSocket gateway
  await server.start();

  defaultLogger.info("Realtime Streaming Broker ready", {
    healthEndpoint: `http://${config.host}:${config.port}/health`,
    metricsEndpoint: `http://${config.host}:${config.port}/metrics`,
    sseEndpoint: `http://${config.host}:${config.port}/api/v1/executions/:id/stream`,
    wsEndpoint: `ws://${config.host}:${config.port}/ws`,
  });
}

// Execute and handle top-level boot failures with descriptive process exit
bootstrap().catch((err: unknown) => {
  defaultLogger.error("Fatal startup error — process exiting", {
    error: err instanceof Error ? err.message : String(err),
  });
  process.exit(1);
});
