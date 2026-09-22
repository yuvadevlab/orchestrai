/**
 * @file apps/gateway/src/config/gateway-config.schema.ts
 * @description Zod validation schema for gateway server configuration and environment variables.
 */

import { z } from "zod";

/**
 * Zod schema validating gateway runtime configuration.
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
  gatewayApiKey: z.string().min(8).default("orchestrai-dev-key-change-me"),
  /** Secret key used to verify and sign JWT bearer tokens */
  jwtSecret: z.string().min(8).default("super-secret-jwt-signing-key-for-dev"),
  /** Allowed CORS origin headers */
  corsOrigin: z.string().default("*"),
  corsAllowedOrigins: z.string().default("*"),
  /** Name of tenant identifier header */
  tenantHeaderName: z.string().default("x-tenant-id"),
  /** Time window in milliseconds for rate limiting */
  rateLimitWindowMs: z.coerce.number().int().positive().default(60000),
  /** Maximum allowed requests per IP/key per time window */
  rateLimitMaxRequests: z.coerce.number().int().positive().default(120),
  /** Graceful shutdown drain timeout in milliseconds */
  shutdownTimeoutMs: z.coerce.number().int().positive().default(10000),
});

/**
 * Inferred type representing validated gateway configuration.
 */
export type GatewayConfig = z.infer<typeof GatewayConfigSchema>;
