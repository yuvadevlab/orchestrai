/**
 * @file apps/admin/src/server.ts
 * @description Core HTTP server coordinator for the Operator Control Plane.
 * Integrates CORS, operator authentication, error handling, and route dispatching.
 * @module apps/admin/server
 */

import http from "node:http";
import { Logger, loggerWithConfig } from "@yuva-devlab/logger";
import type { AdminConfig } from "./config";
import { createAdminRequestContext } from "./context";
import { handleAdminCors, authenticateOperator, handleAdminError } from "./middleware";
import {
  AdminRouter,
  registerHealthRoutes,
  registerPlatformRoutes,
  type AdminRequest,
  type AdminResponse,
} from "./routes";

const logger = loggerWithConfig(new Logger("AdminServer"));

/**
 * Dedicated Operator Control Plane HTTP Server.
 */
export class AdminServer {
  private httpServer: http.Server | null = null;
  private readonly router: AdminRouter;
  private inFlightRequests = 0;

  constructor(public readonly config: AdminConfig) {
    this.router = new AdminRouter();
    registerHealthRoutes(this.router);
    registerPlatformRoutes(this.router);
  }

  /**
   * Starts listening for inbound operator and control plane HTTP requests.
   */
  public async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.httpServer = http.createServer(async (nodeReq, nodeRes) => {
        const req = nodeReq as AdminRequest;
        const res = nodeRes as AdminResponse;

        this.inFlightRequests += 1;
        const context = createAdminRequestContext(
          req,
          this.config.requestIdHeaderName,
          this.config.tenantHeaderName,
        );
        req.context = context;

        try {
          // 1. Cross-Origin Resource Sharing
          const handledCors = handleAdminCors(req, res, this.config.corsAllowedOrigins, [
            this.config.adminApiKeyHeaderName,
            this.config.apiKeyHeaderName,
            this.config.authHeaderName,
            this.config.tenantHeaderName,
            this.config.requestIdHeaderName,
          ]);
          if (handledCors) {
            return;
          }

          // 2. Strict Operator Authentication & Role Guard
          const isAuthenticated = await authenticateOperator(req, res, context, this.config);
          if (!isAuthenticated) {
            return;
          }

          // 3. Dispatch to route handler
          await this.router.handle(req, res);
        } catch (err) {
          logger.error("[AdminServer] Request failure", {
            error: String(err),
            url: req.url,
            requestId: context.requestId,
          });
          handleAdminError(err, res, context.requestId);
        } finally {
          this.inFlightRequests -= 1;
        }
      });

      this.httpServer.once("error", reject);
      this.httpServer.listen(this.config.port, this.config.host, () => {
        logger.info("Operator Control Plane online", {
          host: this.config.host,
          port: this.config.port,
          env: this.config.nodeEnv,
        });
        resolve();
      });
    });
  }

  /**
   * Gracefully shuts down the HTTP server after completing in-flight requests.
   */
  public async stop(): Promise<void> {
    if (!this.httpServer) {
      return;
    }

    logger.info("Shutting down Operator Control Plane...", {
      inFlightRequests: this.inFlightRequests,
    });

    return new Promise((resolve, reject) => {
      this.httpServer?.close((err) => {
        if (err) {
          reject(err);
          return;
        }
        logger.info("Operator Control Plane stopped cleanly");
        resolve();
      });
    });
  }
}
