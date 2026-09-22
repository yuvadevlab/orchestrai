/**
 * @file apps/gateway/src/config/gateway-config.ts
 * @description Configuration loader parsing process.env into validated GatewayConfig.
 */

import dotenv from "dotenv";
import { GatewayConfigSchema, type GatewayConfig } from "./gateway-config.schema";

/**
 * Loads and validates gateway environment configuration from process.env and .env files.
 *
 * @returns Validated GatewayConfig object
 */
export function loadGatewayConfig(): GatewayConfig {
  // Load local environment overrides if present
  dotenv.config();

  const port = process.env.GATEWAY_PORT || 4001;
  const host = process.env.GATEWAY_HOST || "0.0.0.0";
  const cors = process.env.CORS_ALLOWED_ORIGINS || process.env.CORS_ORIGIN || "*";

  return GatewayConfigSchema.parse({
    port,
    gatewayPort: port,
    host,
    gatewayHost: host,
    nodeEnv: process.env.NODE_ENV,
    gatewayApiKey: process.env.GATEWAY_API_KEY,
    jwtSecret: process.env.JWT_SECRET,
    corsOrigin: cors,
    corsAllowedOrigins: cors,
    tenantHeaderName: process.env.TENANT_HEADER_NAME || "x-tenant-id",
    rateLimitWindowMs: process.env.RATE_LIMIT_WINDOW_MS,
    rateLimitMaxRequests: process.env.RATE_LIMIT_MAX_REQUESTS,
    shutdownTimeoutMs: process.env.SHUTDOWN_TIMEOUT_MS,
  });
}
