/**
 * @file apps/gateway/src/server/gateway-server.ts
 * @description HTTP server orchestrator integrating middleware pipeline, auth, rate limiting, and routing.
 */

import { createServer, type Server } from "node:http";
import { defaultLogger } from "@orchestrai/logger";
import type { GatewayConfig } from "@/config";
import { createRequestContext } from "@/context";
import { handleCors, authenticateRequest, RateLimiter, handleError } from "@/middleware";
import type { Router, GatewayRequest, GatewayResponse } from "@/routes";

/**
 * Public Gateway Server coordinating inbound HTTP requests, policy middleware, and route dispatch.
 */
export class GatewayServer {
  private readonly httpServer: Server;
  private readonly rateLimiter: RateLimiter;
  private inFlightRequests: number = 0;

  constructor(
    private readonly config: GatewayConfig,
    private readonly router: Router,
  ) {
    this.rateLimiter = new RateLimiter(config.rateLimitMaxRequests, config.rateLimitWindowMs);

    this.httpServer = createServer(async (nodeReq, nodeRes) => {
      const req = nodeReq as GatewayRequest;
      const res = nodeRes as GatewayResponse;

      this.inFlightRequests += 1;

      try {
        // 1. Cross-Origin Resource Sharing handling (preflight response)
        const handled = handleCors(req, res, this.config.corsAllowedOrigins);
        if (handled) {
          return;
        }

        // 2. Attach request context (requestId, tenantId, timestamp)
        req.context = createRequestContext(req, this.config.tenantHeaderName);

        // 3. Authenticate request credentials
        const isAuthenticated = authenticateRequest(req, res, this.config);
        if (!isAuthenticated) {
          return;
        }

        // 4. Check tenant rate limit quota
        const allowed = this.rateLimiter.check(req, res);
        if (!allowed) {
          return;
        }

        // 5. Dispatch to matched route handler
        await this.router.handle(req, res);
      } catch (err) {
        handleError(err, res, req.context?.requestId || "unknown");
      } finally {
        this.inFlightRequests -= 1;
      }
    });
  }

  /**
   * Starts listening for inbound HTTP requests.
   */
  public async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.httpServer.once("error", reject);
      this.httpServer.listen(this.config.gatewayPort, this.config.gatewayHost, () => {
        defaultLogger.info("Gateway server started", {
          host: this.config.gatewayHost,
          port: this.config.gatewayPort,
          env: this.config.nodeEnv,
        });
        resolve();
      });
    });
  }

  /**
   * Returns current count of in-flight active requests.
   */
  public getActiveRequests(): number {
    return this.inFlightRequests;
  }

  /**
   * Accessor for underlying Node.js Server instance.
   */
  public getHttpServer(): Server {
    return this.httpServer;
  }

  /**
   * Closes underlying server socket.
   */
  public async close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.httpServer.close((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}
