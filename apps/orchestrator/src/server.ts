/**
 * @file apps/orchestrator/src/server.ts
 * @description Core daemon server for the OrchestrAI Execution Orchestrator.
 * Manages gRPC service lifecycle, HTTP health probes, and graceful termination.
 * @module apps/orchestrator/server
 */

import http from "node:http";
import { Logger, loggerWithConfig } from "@yuva-devlab/logger";
import { ADMIN_ROUTES } from "@orchestrai/shared-types";
import type { OrchestratorConfig } from "./config";
import { GrpcExecutionService } from "./grpc";
import { orchestratorRedisPublisher } from "./publisher";

const logger = loggerWithConfig(new Logger("OrchestratorServer"));

/**
 * Orchestrator server coordinator managing gRPC execution endpoints and HTTP probes.
 */
export class OrchestratorServer {
  private httpServer: http.Server | null = null;
  public readonly grpcService: GrpcExecutionService;
  private isShuttingDown = false;

  constructor(public readonly config: OrchestratorConfig) {
    this.grpcService = new GrpcExecutionService();
  }

  /**
   * Starts the HTTP health server and gRPC execution transport.
   */
  public async start(): Promise<void> {
    return new Promise((resolve) => {
      this.httpServer = http.createServer((req, res) => {
        // Handle standard health and readiness probes
        if (req.url === ADMIN_ROUTES.HEALTH || req.url === ADMIN_ROUTES.READY) {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              status: "ok",
              service: "orchestrator",
              grpcPort: this.config.grpcPort,
              timestamp: new Date().toISOString(),
            }),
          );
          return;
        }

        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Not Found" }));
      });

      this.httpServer.listen(this.config.httpPort, this.config.host, () => {
        logger.info("start: orchestrator daemon online", {
          httpPort: this.config.httpPort,
          grpcPort: this.config.grpcPort,
          host: this.config.host,
        });
        resolve();
      });
    });
  }

  /**
   * Gracefully shuts down HTTP, gRPC, and Redis transport connections.
   */
  public async stop(): Promise<void> {
    if (this.isShuttingDown) return;
    this.isShuttingDown = true;

    logger.info("stop: stopping orchestrator server...");

    await orchestratorRedisPublisher.close();

    if (this.httpServer) {
      await new Promise<void>((resolve) => {
        this.httpServer?.close(() => resolve());
      });
    }

    logger.info("stop: orchestrator server stopped cleanly");
  }
}

/**
 * Registers process lifecycle termination signals for graceful shutdown.
 */
export function registerProcessLifecycle(server: OrchestratorServer, timeoutMs: number): void {
  const shutdown = async (signal: string): Promise<void> => {
    logger.info("registerProcessLifecycle: initiating graceful shutdown", { signal });
    const timer = setTimeout(() => {
      logger.error("registerProcessLifecycle: graceful shutdown timed out, forcing exit");
      process.exit(1);
    }, timeoutMs);

    try {
      await server.stop();
      clearTimeout(timer);
      process.exit(0);
    } catch (err) {
      logger.error("registerProcessLifecycle: error during shutdown", { error: String(err) });
      clearTimeout(timer);
      process.exit(1);
    }
  };

  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("SIGINT", () => void shutdown("SIGINT"));
}
