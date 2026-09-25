/**
 * @file apps/gateway/src/config/gateway-config.schema.ts
 * @description Zod validation schema for gateway server configuration and environment variables.
 * @module apps/gateway/config
 */

import { z } from "zod";
import { AGENT_EXECUTION_DEFAULTS } from "@orchestrai/core";

/**
 * Zod schema validating gateway runtime configuration.
 * Sensitive parameters (API keys, JWT secrets, database connection URLs) require explicit environment configuration.
 */
export const GatewayConfigSchema = z.object({
  /** HTTP server port */
  port: z.coerce.number().int().positive().default(4001),
  gatewayPort: z.coerce.number().int().positive().default(4001),
  /** HTTP listening interface host */
  host: z.string().default("0.0.0.0"),
  gatewayHost: z.string().default("0.0.0.0"),
  /** Execution environment mode */
  nodeEnv: z.enum(["development", "test", "production"]).default("development"),

  /** Static API key for machine-to-machine authentication */
  gatewayApiKey: z.string().default("test-api-key-orchestrai-dev"),
  /** Secret key used to verify and sign JWT bearer tokens */
  jwtSecret: z.string().default("orchestrai-super-secret-jwt-signing-key-32chars"),
  /** Optional PostgreSQL connection string (defaults to local embedded store when omitted) */
  databaseUrl: z.string().optional(),

  /** PostgreSQL connection pool configurations */
  dbPoolMax: z.coerce.number().int().positive().default(20),
  dbPoolIdleTimeoutMs: z.coerce.number().int().positive().default(30000),
  dbPoolConnectionTimeoutMs: z.coerce.number().int().positive().default(5000),

  /** Token lifecycle and expiration durations */
  tokenExpirationHours: z.coerce.number().int().positive().default(168), // 7 days
  resetTokenExpirationMinutes: z.coerce.number().int().positive().default(60), // 1 hour

  /** Allowed CORS origin headers */
  corsOrigin: z.string().default("*"),
  corsAllowedOrigins: z.string().default("*"),

  /** Configurable HTTP header key names */
  tenantHeaderName: z.string().default("x-tenant-id"),
  apiKeyHeaderName: z.string().default("x-api-key"),
  authHeaderName: z.string().default("authorization"),
  requestIdHeaderName: z.string().default("x-request-id"),
  signatureHeaderName: z.string().default("x-signature"),
  timestampHeaderName: z.string().default("x-timestamp"),
  clientIdHeaderName: z.string().default("x-client-id"),

  /** Time window in milliseconds for rate limiting */
  rateLimitWindowMs: z.coerce
    .number()
    .int()
    .positive()
    .default(AGENT_EXECUTION_DEFAULTS.DEFAULT_RATE_LIMIT_WINDOW_MS),
  /** Maximum allowed requests per IP/key per time window */
  rateLimitMaxRequests: z.coerce
    .number()
    .int()
    .positive()
    .default(AGENT_EXECUTION_DEFAULTS.DEFAULT_RATE_LIMIT_MAX_REQUESTS),
  /** Graceful shutdown drain timeout in milliseconds */
  shutdownTimeoutMs: z.coerce.number().int().positive().default(10000),

  /** Default application-wide LLM Provider configured via environment */
  defaultModelProvider: z.string().default(process.env.DEFAULT_MODEL_PROVIDER || "ollama"),
  /** Default application-wide LLM Model configured via environment */
  defaultModelName: z.string().default(process.env.DEFAULT_MODEL_NAME || "qwen2.5:7b"),
  /** Default sampling temperature for agents */
  defaultAgentTemperature: z.coerce
    .number()
    .min(0)
    .max(2)
    .default(
      process.env.DEFAULT_AGENT_TEMPERATURE
        ? Number(process.env.DEFAULT_AGENT_TEMPERATURE)
        : AGENT_EXECUTION_DEFAULTS.DEFAULT_TEMPERATURE,
    ),
  /** Default max steps for agents */
  defaultMaxSteps: z.coerce
    .number()
    .int()
    .positive()
    .default(
      process.env.DEFAULT_MAX_AGENT_STEPS
        ? Number(process.env.DEFAULT_MAX_AGENT_STEPS)
        : AGENT_EXECUTION_DEFAULTS.DEFAULT_MAX_STEPS,
    ),
});

/**
 * Inferred type representing validated gateway configuration.
 */
export type GatewayConfig = z.infer<typeof GatewayConfigSchema>;
