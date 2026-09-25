/**
 * @file apps/gateway/src/config/gateway-config.ts
 * @description Configuration loader parsing process.env into validated GatewayConfig.
 */

import path from "node:path";
import dotenv from "dotenv";
import { GatewayConfigSchema, type GatewayConfig } from "./gateway-config.schema";

/**
 * Loads and validates gateway environment configuration from process.env and .env files.
 *
 * @returns Validated GatewayConfig object
 */
export function loadGatewayConfig(): GatewayConfig {
  // Load root environment file first, then app-specific .env overrides
  dotenv.config({ path: path.resolve(process.cwd(), "../../.env") });
  dotenv.config({ path: path.resolve(process.cwd(), ".env"), override: true });

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
    databaseUrl: process.env.DATABASE_URL,
    dbPoolMax: process.env.DB_POOL_MAX,
    dbPoolIdleTimeoutMs: process.env.DB_POOL_IDLE_TIMEOUT_MS,
    dbPoolConnectionTimeoutMs: process.env.DB_POOL_CONNECTION_TIMEOUT_MS,
    tokenExpirationHours: process.env.TOKEN_EXPIRATION_HOURS,
    resetTokenExpirationMinutes: process.env.RESET_TOKEN_EXPIRATION_MINUTES,
    corsOrigin: cors,
    corsAllowedOrigins: cors,
    tenantHeaderName: process.env.TENANT_HEADER_NAME || "x-tenant-id",
    apiKeyHeaderName: process.env.API_KEY_HEADER_NAME || "x-api-key",
    authHeaderName: process.env.AUTH_HEADER_NAME || "authorization",
    requestIdHeaderName: process.env.REQUEST_ID_HEADER_NAME || "x-request-id",
    signatureHeaderName: process.env.SIGNATURE_HEADER_NAME || "x-signature",
    timestampHeaderName: process.env.TIMESTAMP_HEADER_NAME || "x-timestamp",
    clientIdHeaderName: process.env.CLIENT_ID_HEADER_NAME || "x-client-id",
    rateLimitWindowMs: process.env.RATE_LIMIT_WINDOW_MS,
    rateLimitMaxRequests: process.env.RATE_LIMIT_MAX_REQUESTS,
    shutdownTimeoutMs: process.env.SHUTDOWN_TIMEOUT_MS,
    defaultModelProvider: process.env.DEFAULT_MODEL_PROVIDER || "ollama",
    defaultModelName: process.env.DEFAULT_MODEL_NAME || "qwen2.5:7b",
    defaultAgentTemperature: process.env.DEFAULT_AGENT_TEMPERATURE,
    defaultMaxSteps: process.env.DEFAULT_MAX_AGENT_STEPS,
  });
}
