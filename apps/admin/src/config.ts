/**
 * @file apps/admin/src/config.ts
 * @description Strongly typed environment configuration for the Operator Control Plane service.
 * @module apps/admin/config
 */

import dotenv from "dotenv";

// Load environment variables from .env if present
dotenv.config();

/**
 * Immutable configuration schema for the Admin control plane microservice.
 */
export interface AdminConfig {
  readonly host: string;
  readonly port: number;
  readonly operatorJwtSecret: string;
  readonly adminApiKey: string;
  readonly corsAllowedOrigins: readonly string[];
  readonly nodeEnv: string;
  readonly shutdownTimeoutMs: number;
  readonly apiKeyHeaderName: string;
  readonly adminApiKeyHeaderName: string;
  readonly authHeaderName: string;
  readonly tenantHeaderName: string;
  readonly requestIdHeaderName: string;
}

/**
 * Parses, validates, and freezes runtime configuration for the Admin service.
 *
 * @returns Frozen AdminConfig instance with safe defaults
 */
export function loadAdminConfig(): AdminConfig {
  // Default to port 4005 to isolate control plane from gateway (4000) and orchestrator (4004)
  const port = parseInt(process.env.ADMIN_PORT || "4005", 10);
  const shutdownTimeoutMs = parseInt(process.env.SHUTDOWN_TIMEOUT_MS || "5000", 10);

  const rawOrigins = process.env.ADMIN_CORS_ORIGINS || "*";
  const corsAllowedOrigins = Object.freeze(
    rawOrigins
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
  );

  return Object.freeze({
    host: process.env.ADMIN_HOST || "0.0.0.0",
    port: Number.isNaN(port) ? 4005 : port,
    operatorJwtSecret:
      process.env.OPERATOR_JWT_SECRET || "orchestrai-operator-jwt-secret-default-key",
    adminApiKey: process.env.ADMIN_API_KEY || "orchestrai-admin-api-key-default",
    corsAllowedOrigins,
    nodeEnv: process.env.NODE_ENV || "development",
    shutdownTimeoutMs: Number.isNaN(shutdownTimeoutMs) ? 5000 : shutdownTimeoutMs,
    apiKeyHeaderName: process.env.API_KEY_HEADER_NAME || "x-api-key",
    adminApiKeyHeaderName: process.env.ADMIN_API_KEY_HEADER_NAME || "x-admin-api-key",
    authHeaderName: process.env.AUTH_HEADER_NAME || "authorization",
    tenantHeaderName: process.env.TENANT_HEADER_NAME || "x-tenant-id",
    requestIdHeaderName: process.env.REQUEST_ID_HEADER_NAME || "x-request-id",
  });
}
